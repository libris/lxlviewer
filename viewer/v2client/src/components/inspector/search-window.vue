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
import ModalComponent from '@/components/shared/modal-component';
import ToolTipComponent from '../shared/tooltip-component';
import EntitySearchList from '../search/entity-search-list';
import EntitySummary from '../shared/entity-summary';
import SummaryActionButton from './summary-action-button';
import LensMixin from '../mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';

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
      }
    };
  },
  props: {
    active: false,
    fieldKey: '',
    extracting: false,
    itemInfo: {},
    index: 0,
    copyTitle: false,
    canCopyTitle: false,
    entityType: '',
  },
  components: {
    'entity-search-list': EntitySearchList,
    'entity-summary': EntitySummary,
    'summary-action-button': SummaryActionButton,
    'modal-component': ModalComponent,
  },
  watch: {
    keyword(value) {
      this.handleChange(value);
    },
    copyTitle(value) {
      this.$dispatch('set-copy-title', value);
    },
    active(value, oldvalue) {
      if (value && !oldvalue) {
        this.resetWindow();
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
      const fetchedRange = VocabUtil.getRange(this.entityType, this.fieldKey, this.resources.vocab, this.settings.vocabPfx, this.resources.context)
        .map(item => item.replace(this.settings.vocabPfx, ''));
      return fetchedRange;
    },
    getFullRange() {
      return VocabUtil.getFullRange(this.entityType, this.fieldKey, this.resources.vocab, this.settings.vocabPfx, this.resources.context, this.resources.vocabClasses);
    },
    allSearchTypes() {
      const types = this.getFullRange;
      const typeArray = [];
      for (const type of types) {
        typeArray.push(type.replace(this.settings.vocabPfx, ''));
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
        return VocabUtil.getTree(type, this.resources.vocab, this.settings.vocabPfx, this.resources.context);
      });
      return VocabUtil.flattenTree(tree, this.resources.vocab, this.settings.vocabPfx, this.resources.context, this.settings.language);
    },
  },
  ready() {
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
    resetWindow() {
      this.copyTitle = false;
    },
    handleChange(value) {
      this.setSearching();
      this.searchMade = false;
      let searchPhrase = value;
      if (value) {
        setTimeout(() => {
          if (this.keyword === value) {
            this.search(searchPhrase);
          }
        }, this.debounceTimer);
      } else {
        this.searchResult = {};
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
      LayoutUtil.scrollLock(true);
      this.active = true;
      this.changeStatus('keybindState', 'entity-adder');
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
    },
    search(keyword) {
      const self = this;
      self.searchResult = {};
      this.getItems(keyword, [].concat(this.currentSearchTypes)).then((result) => {
        setTimeout(() => {
          self.searchResult = result;
          self.loading = false;
          self.searchMade = true;
        }, 500);
      }, (error) => {
        self.loading = false;
      });
    },
    getItems(keyword, typeArray) {
      // TODO: Support asking for more items
      const searchKey = keyword !== '*' ? `${keyword}*` : keyword;
      let searchUrl = `${this.settings.apiPath}/find.json?q=${searchKey}`;
      if (typeof typeArray !== 'undefined' && typeArray.length > 0) {
        for (const type of typeArray) {
          searchUrl += `&@type=${type}`;
        }
      }
      searchUrl += '&_limit=40';

      return new Promise((resolve, reject) => {
        HttpUtil.get({ url: searchUrl, contentType: 'text/plain' }).then((response) => {
          resolve(response.items);
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
    <modal-component
      :title="'Link entity' | translatePhrase"
      v-if="active"
      @close="hide()"
      class="SearchWindow-modal"
    >
      <template slot="modal-body">
          <div class="search-header">
            <span>{{ "Search" | translatePhrase }}</span>
            <div class="search">
              <!--<input class="entity-search-keyword-input" v-model="keyword" @input="setSearching()"></input>-->
              <div class="input-container">
                <input
                  v-model="keyword"
                  class="entity-search-keyword-input"
                  autofocus
                >
                <select v-model="currentSearchTypes" @change="handleChange(keyword)">
                  <option :value="getRange">{{"All types" | translatePhrase}}</option>
                  <option v-for="term in getClassTree" :key="term.id" :value="term.id" v-html="getFormattedSelectOption(term, settings, resources.vocab, resources.context)"></option>
                </select>
              </div>
              <div class="help-tooltip-container" @mouseleave="showHelp = false">
                <i class="fa fa-question-circle-o" @mouseenter="showHelp = true"></i>
                <div class="help-tooltip" v-if="showHelp">
                  <div class="section">
                    <div class="section-header">
                      {{"Step" | translatePhrase}} 1: {{"Search for existing linked entities" | translatePhrase}}
                    </div>
                    <div class="section-content"></div>
                  </div>
                  <div class="section">
                    <div class="section-header">
                      {{"Step" | translatePhrase}} 2: {{"Identify and replace" | translatePhrase}}
                    </div>
                    <div class="section-content">
                      {{"If you identify a matching linked entity, click it to replace the local entity with it" | translatePhrase}}
                    </div>
                  </div>
                  <div class="section">
                    <div class="section-header">
                      {{"Create and link entity" | translatePhrase}}
                    </div>
                    <div class="section-content">
                      {{"If no matching linked entity is found you can create and link. This will create a linked entity containing the information in the entity chosen for linking" | translatePhrase}}
                    </div>
                  </div>
                </div>
              </div>
              <div class="controls">
              </div>
            </div>
            <div class="extract-controls">
              <span class="preview-entity-text">{{ "Your new entity" | translatePhrase }}:</span>
              <div class="copy-title" v-if="canCopyTitle">
                <label><input type="checkbox" name="copyTitle" v-model="copyTitle" /> {{ "Copy title from" | translatePhrase }} {{this.editorData.mainEntity['@type'] | labelByLang}}</label>
              </div>
            </div>
            <div class="summary-container">
              <entity-summary :action-settings="localEntitySettings" :focus-data="itemInfo" :lines="4"></entity-summary>
              <summary-action-button v-show="!extracting" :options="localEntitySettings" @action="extract()"></summary-action-button>
            </div>
          </div>
          <div class="result-list-container">
            <div v-show="displaySearchList" class="search-result">
              <div v-for="item in searchResult" :key="item['@id']" class="search-item">
                <div class="entity-summary-container">
                  <entity-summary :focus-data="item" :lines="4"></entity-summary>
                </div>
                <summary-action-button :options="addPayload(item)" @action="replaceWith(item)"></summary-action-button>
              </div>
            </div>
            <div v-show="extracting || keyword.length === 0 || loading || foundNoResult" class="search-status-container">
              <div class="search-status">
                <span v-show="keyword.length === 0 && !extracting"><span>{{ "Search for existing linked entities" | translatePhrase }}...</span></span>
                <span v-show="loading"><i class="fa fa-circle-o-notch fa-spin"></i><span>{{ "Searching" | translatePhrase }}...</span></span>
                <span v-show="foundNoResult"><span>{{ "No results" | translatePhrase }}<br>{{"Search again or" | translatePhrase}} {{"Create and link entity" | translatePhrase}}</span></span>
                <span v-show="extracting"><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i><span>{{ "Creating link" | translatePhrase }}</span></span>
              </div>
            </div>
          </div>
      </template>
    </modal-component>
  </div>
</template>

<style lang="less">

.SearchWindow {
  &-modal {
    .ModalComponent-body {
      width: 100%;
      background-color: white;
      border: 1px solid #ccc;
      padding: 0px;
      button {
        font-size: 12px;
      }
      .result-list-container {
        overflow-y: auto;
        height: 60%;
        .search-result {
          .search-item {
            border: solid #777;
            margin: 4px;
            border-width: 1px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .entity-summary-container {
              max-width: 80%;
            }
          }
        }
        .search-status-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          .search-status {
            font-size: 2em;
            text-align: center;
            > span {
              display: flex;
              align-items: center;
              justify-content: center;
              i {
                font-size: 8rem;
              }
              > span {
                margin: 0 0.5em;
              }
            }
          }
        }
      }
      .search-header {
        width: 100%;
        padding: 0.5em 1em;
        border: solid #ccc;
        border-width: 0px 0px 1px 0px;
        background-color: darken(@neutral-color, 4%);
        > span {
        font-weight: bold;
        }
        .summary-container {
          border: 1px solid #888;
          background: @white;
          margin: 0.2em 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .extract-controls {
          padding: 0.5em 0 0 0;
          .preview-entity-text {
            font-weight: bold;
          }
          .copy-title {
            float: right;
            label {
              margin: 0;
              font-weight: normal;
            }
          }
        }
        .search {
          display: flex;
          align-items: center;
          .input-container {
            display: flex;
            border: 2px solid @gray;
            border-radius: 0.2em;
            flex: 60% 0 0;
            background: @white;
            padding: 0.5em;
            > select {
              max-width: 50%;
              padding: 0.2em 0.5em;
              margin: 0 0.3em;
              border-radius: 0.3em;
              border: 0px;
              outline: none;
              background: @brand-primary;
              color: @white;
              cursor: pointer;
              font-weight: bold;
            }
            > input {
              width: 100%;
              border: none;
              outline: none;
            }
          }
          .help-tooltip-container {
            margin-left: 0.5em;
            display: inline-block;
            .help-tooltip {
              max-width: 40%;
              position: absolute;
              background-color: #fff;
              border: 1px solid #ccc;
              padding: 5px;
              border-radius: 3px;
              font-size: 1.2rem;
              .section {
                font-size: 1.4rem;
                .section-header {
                  font-weight: bold;
                }
                .section-content {
                  margin: 0 0 5px 5px;
                }
              }
            }
          }
        }
        .controls {
          display: flex;
          flex-grow: 1;
          justify-content: flex-end;
          button, select {
            &:hover {
              background: lighten(@brand-primary, 5%);
            }
            &:active {
              background: darken(@brand-primary, 5%);
            }
            cursor: pointer;
            padding: 0.5em 1em;
            background: @brand-primary;
            border: none;
            border-radius: 2px;
            color: @white;
            font-weight: bold;
            font-size: 12px;
          }
        }
      }
    }
  }
}

</style>
