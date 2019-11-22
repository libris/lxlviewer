<script>
import { merge, cloneDeep } from 'lodash-es';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';
import PanelComponent from '@/components/shared/panel-component';
import PanelSearchList from '@/components/search/panel-search-list';
import ModalPagination from '@/components/inspector/modal-pagination';
import EntitySummary from '../shared/entity-summary';
import FilterSelect from '@/components/shared/filter-select.vue';
import SummaryAction from './summary-action';
import LensMixin from '../mixins/lens-mixin';

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
        icon: 'chain',
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
      maxResults: 20,
      isCompact: false,
    };
  },
  props: {
    fieldKey: {
      type: String,
      default: '',
    },
    extractable: {
      type: Boolean,
      default: false,
    },
    extracting: {
      type: Boolean,
      default: false,
    },
    allSearchTypes: {
      type: Array,
      default: () => [],
    },
    allValuesFrom: {
      type: Array,
      default: () => [],
    },
    someValuesFrom: {
      type: Array,
      default: () => [],
    },
    range: {
      type: Array,
      default: () => [],
    },
    rangeFull: {
      type: Array,
      default: () => [],
    },
    itemInfo: {},
    index: {
      type: Number,
      default: 0,
    },
    copyTitle: {
      type: Boolean,
      default: false,
    },
    canCopyTitle: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
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
    isActive(value) {
      if (value) {
        this.show();
      } else {
        this.hide();
      }
    },
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'close-modals':
            this.hide();
            break;
          case 'focus-changed':
            this.hide();
            break;
          default:
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
    filterPlaceHolder() {
      if (this.someValuesFrom.length > 0) {
        return 'Suggested types';
      }
      return 'All types';
    },
    selectOptions() {
      const classTree = this.getClassTree;
      const options = [];

      for (let i = 0; i < classTree.length; i++) {
        const term = {};
        term.depth = classTree[i].depth;
        term.abstract = classTree[i].abstract;
        term.label = this.getFormattedSelectOption(classTree[i]);
        term.value = classTree[i].id;
        term.key = `${classTree[i].id}-${i}`;
        options.push(term);
      }
      return options;
    },
    priorityOptions() {
      const list = this.allValuesFrom.length > 1 ? this.allValuesFrom : this.someValuesFrom;
      return list;
    },
    displaySearchList() {
      return !this.loading && !this.extracting && this.keyword.length > 0 && this.searchResult.length > 0;
    },
    foundNoResult() {
      return !this.loading && this.searchResult.length === 0 && this.keyword.length > 0 && this.searchMade;
    },
    getClassTree() {
      let treeSource = this.range;
      if (this.allValuesFrom.length > 0) {
        treeSource = this.allValuesFrom;
      }
      const tree = treeSource.map(type => VocabUtil.getTree(
        type, 
        this.resources.vocab, 
        this.resources.context,
      ));
      return VocabUtil.flattenTree(
        tree,
        this.resources.vocab, 
        this.resources.context, 
        this.user.settings.language,
      );
    },
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
        this.resources.context,
      );
    },
    addPayload(item) {
      const updatedListItemSettings = merge({ payload: item }, cloneDeep(this.listItemSettings));
      return updatedListItemSettings;
    },
    setFilter($event, keyword) {
      let valuesArray = [];
      let values;

      if ($event.value !== null && typeof $event.value === 'object') {
        values = Object.assign({}, { value: $event.value });
        valuesArray = Object.values(values.value);
      } else {
        valuesArray.push($event.value);
      }
      
      this.currentSearchTypes = valuesArray;
      this.handleChange(keyword);
    },
    handleChange(value) {
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
    show() {
      this.resetSearch();
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'form-control', 
        value: 'close-modals',
      })
        .then(() => {
          this.$nextTick(() => {
            this.active = true;
            this.$nextTick(() => {
              if (this.itemInfo !== null) {
                const cleanedChipString = DisplayUtil.getItemLabel(this.itemInfo, this.resources.display, this.inspector.data.quoted, this.resources.vocab, this.settings, this.resources.context).replace(/#|_|•|\[|\]/g, ' ').replace(/  +/g, ' ');
                this.keyword = cleanedChipString;
                this.search();
              }
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
    },
    resetSearch() {
      this.keyword = '';
      this.searchMade = false;
      if (this.someValuesFrom.length > 0) {
        this.currentSearchTypes = this.someValuesFrom;
      } else {
        this.currentSearchTypes = this.allSearchTypes;
      }
      this.searchResult = [];
    },
    loadResults(result) {
      this.searchResult = result.items;
      this.totalItems = result.totalItems;
      this.loading = false;
    },
    go(n) {
      this.fetch(n);
    },
    fetch(pageNumber) {
      const self = this;
      self.currentPage = pageNumber;
      self.loading = true;
      this.getItems(this.keyword).then((result) => {
        self.loadResults(result);
      }, (error) => {
        console.log(error);
        self.loading = false;
      });
    },
    search() {
      const self = this;
      this.loading = true;
      this.typeArray = [].concat(this.currentSearchTypes);
      self.searchResult = [];
      self.searchMade = true;
      this.fetch(0);
    },
    getItems(keyword) {
      // TODO: Support asking for more items
      const typeArray = this.typeArray;
      let q = '';
      if (keyword === '') {
        q = '*';
      } else if (keyword.match(/[|~*+\-"]/)) {
        // User is using operators, accept their keyword as-is
        q = keyword;
      } else {
        // Add wildcard if user is not using operators
        q = `${keyword} | ${keyword}*`;
      }
      let searchUrl = `${this.settings.apiPath}/find.jsonld?q=${q}`;
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
      <panel-component class="SearchWindow-panel SearchWindowPanel"
        v-if="active"
        :title="'Link entity' | translatePhrase"
        @close="hide()">
        <template slot="panel-header-info">
          <div class="PanelComponent-headerInfo help-tooltip-container" 
            @mouseleave="showHelp = false">
            <i class="fa fa-question-circle icon icon--md" 
              @mouseenter="showHelp = true">
            </i>
            <div class="PanelComponent-headerInfoBox help-tooltip" v-show="showHelp">
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
              <div class="SearchWindow-inputContainer input-container form-group">
                <input 
                  class="SearchWindow-input SearchWindow-entity-search-keyword-input customInput"
                  v-model="keyword"
                  ref="input"
                  autofocus
                  :placeholder="'Search' | translatePhrase"
                  :aria-label="'Search' | translatePhrase">
              </div>
              <div class="SearchWindow-filterSearchContainer">
                <span class="SearchWindow-filterSearchLabel">{{ 'Show' | translatePhrase }}</span>
                <filter-select class="SearchWindow-filterSearchInput FilterSelect--openDown"
                  :class-name="'js-filterSelect'"
                  :custom-placeholder="filterPlaceHolder"
                  :options="{ tree: selectOptions, priority: priorityOptions }"
                  :options-all="allSearchTypes"
                  :options-all-suggested="someValuesFrom"
                  :is-filter="true"
                  v-on:filter-selected="setFilter($event, keyword)"></filter-select>
              </div>
            </div>
          </div>
        </template>

        <template slot="panel-body">
          <panel-search-list
            v-if="!loading"
            class="SearchWindow-resultListContainer"
            :results="searchResult"
            :is-compact="isCompact"
            icon="chain"
            text="Replace local entity"
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
            <p> {{ "Search for existing linked entities to replace your local entity" | translatePhrase }}.</p>
            <p v-if="itemInfo && extractable"> {{ "If you can't find an existing link, you can create one using your local entity below" | translatePhrase }}.</p>
          </div>
          <div class="PanelComponent-searchStatus" v-show="loading">
            <vue-simple-spinner size="large" :message="'Searching' | translatePhrase"></vue-simple-spinner>
          </div>
          <div class="PanelComponent-searchStatus" v-show="foundNoResult">
            <p>{{ "Your search gave no results" | translatePhrase }}.</p>
            <p v-if="itemInfo && extractable">{{ "Try again" | translatePhrase }} {{ "or create a link from your local data below" | translatePhrase }}.</p>
          </div>
          <div class="PanelComponent-searchStatus" v-show="extracting">
            <vue-simple-spinner size="large" :message="'Creating link' | translatePhrase"></vue-simple-spinner>
          </div>
        </template>
        <template slot="panel-footer">
          <div class="SearchWindow-resultControls" v-if="!loading && searchResult.length > 0" >
            <modal-pagination 
              @go="go" 
              :total-items="totalItems" 
              :max-per-page="maxResults"
              :current-page="currentPage"
            >
            </modal-pagination>
            <div class="SearchWindow-listTypes">
              <i class="fa fa-th-list icon icon--sm"
                role="button"
                @click="isCompact = false"
                @keyup.enter="isCompact = false"
                :class="{'icon--primary' : !isCompact}"
                :title="'Detailed view' | translatePhrase"
                tabindex="0"></i>
              <i class="fa fa-list icon icon--sm"
                role="button"
                @click="isCompact = true"
                @keyup.enter="isCompact = true"
                :class="{'icon--primary' : isCompact}"
                :title="'Compact view' | translatePhrase"
                tabindex="0"></i>
              </div>
            </div>
          <div class="SearchWindow-footerContainer" v-if="itemInfo && extractable">
            <p class="preview-entity-text uppercaseHeading">{{ "Create link from local entity" | translatePhrase }}:</p>
            <div class="SearchWindow-summaryContainer">
              <summary-action 
                :extracting="extracting"
                :options="localEntitySettings" 
                @action="extract()"></summary-action>
            <entity-summary 
              :action-settings="localEntitySettings" 
              :focus-data="itemInfo" 
              :should-link="false"
              :valueDisplayLimit=1></entity-summary>
            </div>
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

  &-input {
    color: @black;
  }


  &-filterSearchContainer {
    width: 100%;
    margin-top: 0.5em;
    text-align: right;
  }

  &-filterSearchLabel {

  }

  &-filterSearchInput {
    position: relative;
    width: 50%;
  }

  &-header {
    width: 100%;
    margin: 0 0 0.7em 0;
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

  &-footerContainer {
    display: flex;
    flex-direction: column;
    padding: 10px 15px;

    .EntitySummary {
      max-height: inherit;
      max-height: fit-content;
      overflow: auto;
      padding: 0 0 0 15px;
      border-left: 1px solid @gray-lighter;
      margin-left: 15px;
    }
  }

  &-summaryContainer {
    display: flex;
    flex-direction: row;
    border: 1px solid @gray-lighter;
    background: @white;
    border-radius: 4px;
    padding: 15px;
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
