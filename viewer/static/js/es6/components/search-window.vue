<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as LayoutUtil from '../utils/layout';
import * as RecordUtil from '../utils/record';
import * as StringUtil from '../utils/string';
import * as CombinedTemplates from '../templates/combinedTemplates.json';
import * as StructuredValueTemplates from '../templates/structuredValueTemplates.json';
import ProcessedLabel from './processedlabel';
import ToolTipComponent from './tooltip-component';
import EntitySearchList from './entity-search-list';
import EntitySummary from './entity-summary';
import LensMixin from './mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { changeStatus, changeNotification } from '../vuex/actions';
import { getVocabulary, getVocabularyClasses, getVocabularyProperties, getSettings, getDisplayDefinitions, getEditorData } from '../vuex/getters';

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
      rangeInfo: false,
      searchMade: false,
      currentSearchTypes: this.allSearchTypes,
    };
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
      vocabProperties: getVocabularyProperties,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
    actions: {
      changeStatus,
      changeNotification,
    },
  },
  props: {
    active: false,
    key: '',
    extracting: false,
    itemInfo: {},
    index: 0,
  },
  events: {
  },
  components: {
    'entity-search-list': EntitySearchList,
    'entity-summary': EntitySummary,
  },
  watch: {
    keyword(value) {
      this.searchMade = false;
      let searchPhrase = value;
      if (value) {
        if (value.indexOf(':') > -1) {
          const searchParts = value.split(':');
          searchPhrase = searchParts[1];
          this.currentSearchTypes = [searchParts[0]];
        } else {
          this.currentSearchTypes = this.getRange;
        }
        setTimeout(() => {
          if (this.keyword === value) {
            this.search(searchPhrase);
          }
        }, this.debounceTimer);
      } else {
        this.searchResult = {};
      }
    },
  },
  computed: {
    getRange() {
      const fetchedRange = VocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx)
        .map(item => item.replace(this.settings.vocabPfx, ''));
      return fetchedRange;
    },
    getFullRange() {
      return VocabUtil.getFullRange(this.key, this.vocab, this.settings.vocabPfx);
    },
    allSearchTypes() {
      const types = this.getFullRange;
      const typeArray = [];
      for (const type of types) {
        typeArray.push(type.replace(this.settings.vocabPfx, ''));
      }
      return typeArray;
    },
  },
  ready() {
  },
  methods: {
    setSearching() {
      if (this.keyword === '') {
        this.loading = false;
      } else {
        this.loading = true;
      }
    },
    doExtract() {
      this.$dispatch('extract-item');
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
      this.getItems(keyword, this.currentSearchTypes).then((result) => {
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
      const searchKey = `${keyword}*`;
      let searchUrl = `/find?q=${searchKey}`;
      if (typeof typeArray !== 'undefined' && typeArray.length > 0) {
        for (const type of typeArray) {
          searchUrl += `&@type=${type}`;
        }
      }
      searchUrl += '&_limit=40';
      return new Promise((resolve, reject) => {
        httpUtil.get({ url: searchUrl, accept: 'application/ld+json' }).then((response) => {
          resolve(response.items);
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
    replaceLocal(item) {
      this.$dispatch('add-item', item, this.index);
      this.hide();
    },
  },
};
</script>

<template>
  <div class="search-window">
    <div class="window" v-if="active">
      <div class="header">
        <span class="title">
          {{ "Link entity" | translatePhrase }}
        </span>
        <span class="windowControl">
          <i v-on:click="hide" class="fa fa-close"></i>
        </span>
      </div>
      <div class="body">
        <div class="content-container">
          <div class="search-header">
            <span>{{ "Search" | translatePhrase }}</span>
            <div class="search">
              <!--<input class="entity-search-keyword-input" v-model="keyword" @input="setSearching()"></input>-->
              <div class="input-container">
                <input
                  list="allowedTypes"
                  v-model="keyword"
                  @input="setSearching()"
                  class="entity-search-keyword-input"
                  autofocus
                >
              </div>
              <datalist id="allowedTypes">
                <option v-for="range in getFullRange" :value="`${range.replace(settings.vocabPfx, '')}:`">{{range | labelByLang}}:</option>
              </datalist>
              <div class="range-info-container" v-if="getFullRange.length > 0" @mouseleave="rangeInfo = false">
                <i class="fa fa-info-circle" @mouseenter="rangeInfo = true"></i>
                <div class="range-info" v-if="rangeInfo">
                  {{ "Allowed types" | translatePhrase }}:
                  <br>
                  <span v-for="range in getFullRange" class="range">
                    - {{range | labelByLang}}
                  </span>
                </div>
              </div>
              <div class="controls">
                <button class="acceptExtractButton" v-on:click="doExtract" v-show="!extracting">
                  <i class="fa fa-share-square-o"></i>
                  {{ "Extract entity" | translatePhrase }}
                </button>
              </div>
            </div>
            <div class="summary-container">
              <entity-summary :focus-data="itemInfo" :lines="4"></entity-summary>
            </div>
          </div>
          <div class="result-list-container">
            <div v-show="!extracting">
              <div v-if="!loading && keyword.length === 0" class="search-status">{{ "Search for matching records" | translatePhrase }}...</div>
              <div v-if="loading" class="search-status"><i class="fa fa-circle-o-notch fa-spin"></i><span>{{ "Searching" | translatePhrase }}...</span></div>
              <div v-if="!loading && searchResult.length === 0 && keyword.length > 0 && searchMade" class="search-status">
                <span>{{ "No results" | translatePhrase }}...</span>
              </div>
            </div>
            <div v-show="extracting" class="search-status"><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i><span>{{ "Extracting" | translatePhrase }}</span></div>
            <div v-show="!loading && keyword.length > 0" class="search-result">
              <div v-for="item in searchResult" class="search-item">
                <entity-summary @click="replaceLocal(item)" :focus-data="item" :lines="4"></entity-summary>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.search-window {
  .window {
    .window-mixin();
    .body {
      width: 100%;
      background-color: white;
      border: 1px solid #ccc;
      padding: 0px;
      button {
        font-size: 12px;
      }
      .content-container {
        height: 100%;
        .result-list-container {
          overflow-y: auto;
          height: 70%;
          .search-result {
            .search-item {
              border: solid #777;
              margin: 4px;
              border-width: 1px;
              cursor: pointer;
              transition: all 0.1s ease;
              &:hover {
                background: darken(@white, 5%);
                .header {
                  color: darken(@brand-primary, 5%);
                }
              }
              .header {
                color: @brand-primary;
              }
            }
          }
          .search-status {
            padding: 10px;
            padding-top: 25%;
            font-size: 2em;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            > span {
              padding: 0 1em;
            }
            > i {
              font-size: 8rem;
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
            margin: 0.5em 0;
          }
          .search {
            display: flex;
            align-items: center;
            .input-container {
              padding: 0.2em 0.5em;
              border: 2px solid #aaa;
              border-radius: 0.2em;
              background: #fff;
              > input {
                border: none;
                outline: none;
              }
            }
            .range-info-container {
              margin-left: 0.5em;
              display: inline-block;
              .range-info {
                position: absolute;
                background-color: #fff;
                border: 1px solid #ccc;
                padding: 5px;
                border-radius: 3px;
                font-size: 1.2rem;
                .range {
                  display: block;
                  font-size: 1.4rem;
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
                background: lighten(#ccc, 5%);
                color: lighten(#444, 5%);
              }
              &:active {
                background: darken(#ccc, 5%);
                color: darken(#444, 5%);
              }
              cursor: pointer;
              padding: 0.5em 1em;
              color: #444;
              border: none;
              border-radius: 2px;
              background: #ccc;
              font-weight: bold;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

</style>
