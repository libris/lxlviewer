<script>
import * as _ from 'lodash';
import * as HttpUtil from '@/utils/http';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as LayoutUtil from '@/utils/layout';
import * as RecordUtil from '@/utils/record';
import * as StringUtil from '@/utils/string';
import * as CombinedTemplates from '@/resources/json/combinedTemplates.json';
import * as StructuredValueTemplates from '@/resources/json/structuredValueTemplates.json';
import ProcessedLabel from '../shared/processedlabel';
import PanelComponent from '@/components/shared/panel-component';
import ModalPagination from '@/components/inspector/modal-pagination';
import ToolTipComponent from '../shared/tooltip-component';
import EntitySearchList from '../search/entity-search-list';
import EntitySummary from '../shared/entity-summary';
import SummaryAction from './summary-action';
import LensMixin from '../mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'search-window',
  mixins: [clickaway, LensMixin],
  data() {
    return {
      searchResult: {},
      searchDelay: 2,
      extractDialogActive: false,
      keyword: '',
      loading: false,
      debounceTimer: 500,
      showHelp: false,
      searchMade: false,
      currentSearchTypes: [],
      localEntitySettings: {
        text: 'Create and link entity',
        styling: 'brand',
        event: 'extract-item',
        show: true,
        inspectAction: false,
      },
      listItemSettings: {
        text: 'Replace local entity',
        styling: 'brand',
        event: 'replace-local',
        show: true,
        inspectAction: true,
      },
      active: false,
      currentPage: 0,
      numberOfPages: 0,
      maxResults: 20,
      isCompact: false,
    };
  },
  props: {
    fieldKey: '',
    extracting: false,
    itemInfo: {},
    index: 0,
    copyTitle: false,
    canCopyTitle: false,
    entityType: '',
    isActive: false,
  },
  components: {
    'entity-search-list': EntitySearchList,
    'entity-summary': EntitySummary,
    'summary-action': SummaryAction,
    'panel-component': PanelComponent,
    'modal-pagination': ModalPagination,
    'vue-simple-spinner': VueSimpleSpinner,
  },
  watch: {
    keyword(value) {
      this.handleChange(value);
    },
    copyTitle(value) {
      this.$dispatch('set-copy-title', value);
    },
    isActive(value, oldvalue) {
      if(value) {
        this.show();
      } else {
        this.hide();
      }
    },
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch(val.value) {
          case 'close-modals':
            this.hide();
            return true;
            break;
          default:
            return;
        }
      }
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    getRange() {
      const fetchedRange = VocabUtil.getRange(this.entityType, this.fieldKey, this.resources.vocab, this.resources.context)
        .map(item => StringUtil.getCompactUri(item, this.resources.context));
      return fetchedRange;
    },
    getFullRange() {
      return VocabUtil.getFullRange(this.entityType, this.fieldKey, this.resources.vocab, this.resources.context, this.resources.vocabClasses);
    },
    allSearchTypes() {
      const types = this.getFullRange;
      const typeArray = [];
      for (const type of types) {
        typeArray.push(StringUtil.getCompactUri(type, this.resources.context));
      }
      return typeArray;
    },
    displaySearchList() {
      return !this.loading && !this.extracting && this.keyword.length > 0 && this.searchResult.length > 0;
    },
    foundNoResult() {
      return !this.loading && this.searchResult.length === 0 && this.keyword.length > 0 && this.searchMade;
    },
    getClassTree() {
      const tree = this.getRange.map(type => {
        return VocabUtil.getTree(type, this.resources.vocab, this.resources.context);
      });
      return VocabUtil.flattenTree(tree, this.resources.vocab, this.resources.context, this.settings.language);
    },
  },
  mounted() {
    this.currentSearchTypes = this.getRange;
  },
  methods: {
    replaceWith(obj) {
      this.$emit('replace-with', obj);
    },
    extract() {
      this.$emit('extract');
    },
    getFormattedSelectOption(term, settings, vocab, context) {
      return DisplayUtil.getFormattedSelectOption(term, settings, vocab, context);
    },
    addPayload(item) {
      const updatedListItemSettings = _.merge({payload: item}, _.cloneDeep(this.listItemSettings));
      return updatedListItemSettings;
    },
    handleChange(value) {
      this.setSearching();
      this.searchMade = false;
      if (value) {
        setTimeout(() => {
          if (this.keyword === value) {
            this.search();
          }
        }, this.debounceTimer);
      } else {
        this.searchResult = [];
      }
    },
    setSearching() {
      if (this.keyword === '') {
        this.loading = false;
      } else {
        this.loading = true;
      }
    },
    show() {
      this.resetSearch();
      this.active = true;
      this.$nextTick(() => {
        this.$el.querySelector('.SearchWindowentity-search-keyword-input').focus();
      });
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'entity-adder' 
      });
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      this.$parent.closeExtractDialog();
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'overview' 
      });
    },
    resetSearch() {
      this.keyword = '';
      this.currentSearchTypes = this.getRange;
      this.searchResult = [];
    },
    loadResults(result) {
      this.searchResult = result.items;
      this.numberOfPages = Math.floor(result.totalItems/this.maxResults);
      this.loading = false;
    },
    go(n) {
      if (n >= 0 && n <= this.numberOfPages && n !== this.currentPage) {
        this.fetch(n);
      }
    },
    fetch(pageNumber) {
      const self = this;
      const totalItems = self.searchResult.length;
      self.currentPage = pageNumber;
      self.loading = true;
      this.getItems(this.keyword).then((result) => {
        self.loadResults(result);
      }, (error) => {
        self.loading = false;
      });
    },
    search() {
      const self = this;
      this.typeArray = [].concat(this.currentSearchTypes);
      self.searchResult = [];
      self.searchMade = true;
      this.fetch(0);
    },
    getItems(keyword) {
      // TODO: Support asking for more items
      const typeArray = this.typeArray;
      const searchKey = keyword !== '*' ? `${keyword}*` : keyword;
      let searchUrl = `${this.settings.apiPath}/find.json?q=${searchKey}`;
      if (typeof typeArray !== 'undefined' && typeArray.length > 0) {
        for (const type of typeArray) {
          searchUrl += `&@type=${type}`;
        }
      }
      const offset = this.currentPage * this.maxResults;
      searchUrl += `&_limit=${this.maxResults}&_offset=${offset}`;
      return new Promise((resolve, reject) => {
        fetch(searchUrl).then((response) => {
          resolve(response.json());
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
  },
};
</script>

<template>
  <div class="SearchWindow">
    <panel-component
      :title="'Link entity' | translatePhrase"
      v-if="active"
      @close="hide()"
      class="SearchWindow-panel">
      <template slot="panel-header-info">
        <div class="PanelComponent-headerInfo help-tooltip-container" 
          @mouseleave="showHelp = false">
          <i class="fa fa-question-circle icon icon--md" 
            @mouseenter="showHelp = true">
          </i>
          <div class="PanelComponent-headerInfoBox help-tooltip" v-if="showHelp">
            <div>
              <p class="header">
                {{"Step" | translatePhrase}} 1: {{"Search for existing linked entities" | translatePhrase}}
              </p>
            </div>
            <div>
              <p class="header">
                {{"Step" | translatePhrase}} 2: {{"Identify and replace" | translatePhrase}}
              </p>
              <p>
                {{"If you identify a matching linked entity, click it to replace the local entity with it" | translatePhrase}}.
              </p>
            </div>
            <div>
              <p class="header">
                {{"Create and link entity" | translatePhrase}}
              </p>
              <p>
                {{"If no matching linked entity is found you can create and link. This will create a linked entity containing the information in the entity chosen for linking" | translatePhrase}}.
              </p>
            </div>
          </div>
        </div>
      </template>
      <template slot="panel-header-extra">
        <div class="SearchWindow-header search-header">
          <div class="SearchWindow-extractControls">
            <p class="preview-entity-text capitalHeading--gray">{{ "Your new entity" | translatePhrase }}:</p>
            <div class="copy-title" v-if="canCopyTitle">
              <label>
                <input type="checkbox" name="copyTitle" v-model="copyTitle" /> 
                {{ "Copy title from" | translatePhrase }} {{this.editorData.mainEntity['@type'] | labelByLang}}
              </label>
            </div>
          </div>
          <div class="SearchWindow-summaryContainer">
            <entity-summary 
              :action-settings="localEntitySettings" 
              :focus-data="itemInfo" 
              :lines="4"
              :should-link="false"></entity-summary>
            <summary-action 
              v-show="!extracting" 
              :options="localEntitySettings" 
              @action="extract()"></summary-action>
          </div>
          <div class="SearchWindow-search search">
            <div class="SearchWindow-inputContainer input-container form-group panel">
              <input 
                class="SearchWindow-input SearchWindowentity-search-keyword-input customInput form-control"
                v-model="keyword"
                autofocus
                :placeholder="'Search' | translatePhrase">
              <select 
                v-model="currentSearchTypes" 
                @change="handleChange(keyword)"
                class="customSelect">
                <option :value="getRange">{{"All types" | translatePhrase}}</option>
                <option 
                  v-for="term in getClassTree" 
                  :key="term.parentChainString" 
                  :value="term.id" 
                  v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"></option>
              </select>
            </div>
          </div>
          <div class="SearchWindow-resultControls" v-if="!loading && searchResult.length > 0" >
            <modal-pagination 
              @go="go" 
              :numberOfPages="numberOfPages" 
              :currentPage="currentPage">
            </modal-pagination>
            <div class="SearchWindow-listTypes">
              <i class="fa fa-th-list icon icon--sm"
                @click="isCompact = false"
                @keyup.enter="isCompact = false"
                :class="{'icon--primary' : !isCompact}"
                :title="'Detailed view' | translatePhrase"
                tabindex="0"></i>
              <i class="fa fa-list icon icon--sm"
                @click="isCompact = true"
                @keyup.enter="isCompact = true"
                :class="{'icon--primary' : isCompact}"
                :title="'Compact view' | translatePhrase"
                tabindex="0"></i>
            </div>
          </div>
        </div>
      </template>

      <template slot="panel-body">
        <div class="SearchWindow-resultListContainer">
          <ul v-show="displaySearchList" class="SearchWindow-resultList">
            <li class="PanelComponent-listItem SearchWindow-resultItem"
              :class="{'is-compact' : isCompact}"
              v-for="item in searchResult" 
              :key="item['@id']" >
              <entity-summary class="SearchWindow-entitySummary"
                :focus-data="item" 
                :lines="4" 
                :should-open-tab="true"
                :isCompact="isCompact"></entity-summary>
              <summary-action class="SearchWindow-listItemControls" :options="addPayload(item)" @action="replaceWith(item)"></summary-action>
            </li>
          </ul>
        </div>
        <div class="PanelComponent-searchStatus" v-show="keyword.length === 0 && !extracting">
          {{ "Search for existing linked entities" | translatePhrase }}...
        </div>
        <div class="PanelComponent-searchStatus" v-show="loading">
          <vue-simple-spinner size="large" :message="'Searching' | translatePhrase"></vue-simple-spinner>
        </div>
        <div class="PanelComponent-searchStatus" v-show="foundNoResult">
          <p>{{ "No results" | translatePhrase }}</p>
          <p>{{"Search again or" | translatePhrase}} {{"Create and link entity" | translatePhrase}}</p>
        </div>
        <div class="PanelComponent-searchStatus" v-show="extracting">
          <vue-simple-spinner size="large" :message="'Creating link' | translatePhrase"></vue-simple-spinner>
        </div>
      </template>
    </panel-component>
  </div>
</template>

<style lang="less">

.SearchWindow {
  &-entitySummary {
    max-width: 100%;
    padding: 0;
    margin-bottom: 15px;

    .is-compact & {
      width: 60%;
      margin-bottom: 0;
    }
  }

  &-help {
  }

  &-helpText {
  }

  &-header {
    width: 100%;
  }

  &-search {
  }

  &-inputContainer {
    width: 100%;
    display: flex;

    > select {
      position: absolute;
      right: 0;
      margin: 6px 25px;
      max-width: 200px;
    }
  }

  &-input {
  }

  &-extractControls {
    .preview-entity-text {
    }

    .copy-title {
      float: right;
      label {
        margin: 0;
        font-weight: normal;
      }
    }
  }

  &-resultControls {
    display: flex;
    justify-content: space-between;
  }

  &-listTypes {
    display: flex;
    justify-content: space-between;
    height: 20px;
    height: fit-content;
    width: 45px;
  }

  &-summaryContainer {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;

    .EntitySummary {
      background: @white;
      border-radius: 4px;
      margin-bottom: 10px;
      border: 1px solid @gray-lighter;
      max-height: inherit;
      max-height: fit-content;
      resize: vertical;
      overflow: auto;
    }
  }

  &-panel {
  }

  &-resultListContainer {
    overflow-y: scroll;
    flex: 1 1 auto;
  }

  &-resultList {
    padding: 0; // Make sure last item is fully visible
  }

  &-resultItem {
    flex-direction: column;
    align-items: flex-start;

    &.is-compact {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 10px 15px;
    }
  }

  &-listItemControls {
    display: flex;
    justify-content: flex-start;
    width: 100%;

    .is-compact & {
      width: 150px;
    }
  }

  &-searchStatusContainer {
  }

  &-searchStatus {
  }
}

</style>
