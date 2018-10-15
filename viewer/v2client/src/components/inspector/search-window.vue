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
import PanelSearchList from '@/components/search/panel-search-list';
import ModalPagination from '@/components/inspector/modal-pagination';
import ToolTipComponent from '../shared/tooltip-component';
import EntitySummary from '../shared/entity-summary';
import FilterSelect from '@/components/shared/filter-select.vue';
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
        icon: null,
        show: true,
        inspectAction: false,
      },
      listItemSettings: {
        text: 'Replace local entity',
        styling: 'brand',
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
    'panel-search-list': PanelSearchList,
    'entity-summary': EntitySummary,
    'summary-action': SummaryAction,
    'panel-component': PanelComponent,
    'modal-pagination': ModalPagination,
    'filter-select': FilterSelect,
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
    selectOptions() {
      const classTree = this.getClassTree;
      let options = [];

      for (let i = 0; i < classTree.length; i++) {
        let term = {};

        term.label = this.getFormattedSelectOption(classTree[i]);
        term.value = classTree[i].id;
        term.key = `${classTree[i].id}-${i}`;

        options.push(term);
      }

      return options;
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
    getFormattedSelectOption(term) {
      return DisplayUtil.getFormattedSelectOption(
        term, 
        this.settings, 
        this.resources.vocab, 
        this.resources.context
      );
    },
    addPayload(item) {
      const updatedListItemSettings = _.merge({payload: item}, _.cloneDeep(this.listItemSettings));
      return updatedListItemSettings;
    },
    setFilter($event, keyword) {
      let valuesArray = [];
      let values;

      if ($event['value'] !== null && typeof $event['value'] === 'object') {
        values = Object.assign({}, { ['value'] : $event['value']});
        valuesArray = Object.values(values.value)
      } else {
        valuesArray.push($event['value']);
      }
      
      this.currentSearchTypes = valuesArray;
      this.handleChange(keyword);
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
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'form-control', 
        value: 'close-modals'
      })
      .then(() => {
        this.$nextTick(() => {
          this.active = true;
          this.$nextTick(() => {
            // this.$store.dispatch('setStatusValue', { 
            //   property: 'keybindState', 
            //   value: 'entity-adder' 
            // });
            if (this.$refs.input) {
              this.$refs.input.focus();
            }
          });
        });
      });
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      this.$parent.closeExtractDialog();
      // this.$store.dispatch('setStatusValue', { 
      //   property: 'keybindState', 
      //   value: 'overview' 
      // });
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
      searchUrl = encodeURI(searchUrl);
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
    <portal to="sidebar" v-if="active">
    <panel-component class="SearchWindow-panel"
      v-if="active"
      :title="'Link entity' | translatePhrase"
      @close="hide()">
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
            <div class="copy-title" v-if="canCopyTitle">
              <label>
                <input type="checkbox" name="copyTitle" v-model="copyTitle" /> 
                {{ "Copy title from" | translatePhrase }} {{this.editorData.mainEntity['@type'] | labelByLang}}
              </label>
            </div>
          </div>
          <div class="SearchWindow-search search">
            <div class="SearchWindow-inputContainer input-container form-group panel">
              <input 
                class="SearchWindow-input SearchWindow-entity-search-keyword-input customInput form-control"
                v-model="keyword"
                ref="input"
                autofocus
                :placeholder="'Search' | translatePhrase">
              <filter-select class="EntityAdder-filterSearchInput FilterSelect--insideInput"
                :class-name="'js-filterSelect'"
                :custom-placeholder="'All types:'"
                :options="selectOptions"
                :options-all="getRange"
                :is-filter="true"
                :options-selected="''"
                v-on:filter-selected="setFilter($event, keyword)"></filter-select>
            </div>
          </div>
        </div>
      </template>

      <template slot="panel-body">
        <panel-search-list
          class="SearchWindow-resultListContainer"
          :results="searchResult"
          :is-compact="isCompact"
          icon="fa-chain"
          :has-action="true"
          @use-item="replaceWith"
        />
        <!-- <div class="SearchWindow-resultListContainer">
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
        </div> -->
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
      <template slot="panel-footer">
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
        <div class="SearchWindow-summaryContainer">
            <p class="preview-entity-text uppercaseHeading">{{ "Your new entity" | translatePhrase }}:</p>

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
      </template>
    </panel-component>
    </portal>
  </div>
</template>

<style lang="less">

.SearchWindow {
  &-entitySummary {
    max-width: 100%;
    padding: 0;
    margin-bottom: 15px;

    .EntitySummary-title {
      font-size: 18px;
      font-size: 1.8rem;
    }

    .is-compact & {
      width: 60%;
      margin-bottom: 0;
    }
  }

  &-header {
    width: 100%;
    margin: 0 0 10px 0;
  }

  &-inputContainer {
    width: 100%;
    display: flex;
    position: relative;
    margin-bottom: 0;
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
    align-items: baseline;
    margin: 0 10px;
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
    border-top: 1px solid @gray-lighter;
    padding: 10px;

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
