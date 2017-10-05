<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as LayoutUtil from '../utils/layout';
import * as RecordUtil from '../utils/record';
import * as StringUtil from '../utils/string';
import ProcessedLabel from './processedlabel';
import ToolTipComponent from './tooltip-component';
import EntitySearchList from './entity-search-list';
import LensMixin from './mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { changeStatus, changeNotification } from '../vuex/actions';
import { getVocabulary, getVocabularyClasses, getVocabularyProperties, getSettings, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [clickaway, LensMixin],
  data() {
    return {
      searchOpen: false,
      searchResult: {},
      keyword: '',
      loading: false,
      debounceTimer: 500,
      chooseLocalType: false,
      showToolTip: false,
      rangeInfo: false,
      selectedType: '',
      addEmbedded: (this.valueList.length === 0),
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
    key: '',
    allowLocal: true,
    propertyTypes: [],
    showActionButtons: false,
    active: false,
    isPlaceholder: false,
    isChip: false,
    alreadyAdded: [],
    valueList: [],
    possibleValues: [],
    hasRescriction: false,
  },
  events: {
    'close-modals'() {
      this.closeSearch();
      return true;
    },
    'add-entity'(item) {
      this.$dispatch('add-item', item);
      this.closeSearch();
    },
  },
  components: {
    'tooltip-component': ToolTipComponent,
    'entity-search-list': EntitySearchList,
  },
  watch: {
    valueList(newVal) {
      if (newVal.length === 0) {
        this.addEmbedded = true;
      } else {
        this.addEmbedded = false;
      }
    },
    keyword(value) {
      this.searchMade = false;
      let searchPhrase = value;
      if (value) {
        if (value.indexOf(':') > -1) {
          const searchParts = value.split(':');
          searchPhrase = searchParts[1];
          this.currentSearchTypes = [searchParts[0]];
        } else {
          this.currentSearchTypes = this.allSearchTypes;
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
    active(value) {
      this.$dispatch('toggle-modal', value);
    }
  },
  computed: {
    hasSingleRange() {
      return this.getFullRange.length === 1;
    },
    addLabel() {
      if (this.isLiteral) {
        return this.key;
      } else if (this.getRange.length === 1) {
        return this.getRange[0];
      } else if (this.getRange.length > 1) {
        return StringUtil.getUiPhraseByLang('entity', this.settings.language);
      }
      return this.key;
    },
    getRange() {
      const fetchedRange = VocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
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
    onlyEmbedded() {
      const range = this.getFullRange;
      for (const prop of range) {
        if (!VocabUtil.isEmbedded(prop, this.vocab, this.settings)) {
          return false;
        }
      }
      return true;
    },
    isEnumeration() {
      if (this.possibleValues && this.possibleValues.length > 0) {
        return true;
      }
      return false;
    },
    canRecieveObjects() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    isLiteral() {
      // TODO: Verify usage
      if (this.getFullRange.length > 0) {
        for (const rangeElement of this.getFullRange) {
          if (rangeElement.indexOf('Literal') > -1) {
            return true;
          }
        }
      }
      return false;
    },
  },
  ready() {
    this.searchOpen = false;
  },
  methods: {
    setSearching() {
      if (this.keyword === '') {
        this.loading = false;
      } else {
        this.loading = true;
      }
    },
    dismissTypeChooser() {
      if (this.valueList.length > 0) {
        this.addEmbedded = false;
        this.selectedType = '';
      }
    },
    add() {
      if (this.isEnumeration) {
        this.$dispatch('add-item', {'@id': ''});
      } else if (this.canRecieveObjects) {
        const range = this.getFullRange;
        if (range.length < 2 && this.onlyEmbedded) {
          this.addEmpty(range[0]);
        } else if (this.onlyEmbedded) {
          this.addEmbedded = true;
        } else {
          this.show();
        }
      } else {
        this.$dispatch('add-item', '');
      }
    },
    show() {
      LayoutUtil.scrollLock(true);
      this.active = true;
      this.$nextTick(() => {
        this.$el.querySelector('.entity-search-keyword-input').focus();
      });
      this.changeStatus('keybindState', 'entity-adder');
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
    },
    goLocal() {
      const range = this.getFullRange;
      if (range.length > 1) {
        this.chooseLocalType = true;
      } else {
        this.addEmpty(range[0]);
      }
    },
    openSearch() {
      this.keyword = '';
      this.searchOpen = true;
    },
    closeSearch() {
      this.searchOpen = false;
      this.keyword = '';
      this.searchResult = {};
      this.chooseLocalType = false;
      this.hide();
    },
    addEmpty(type) {
      this.closeSearch();
      let obj = {'@type': type};
      this.$dispatch('add-item', obj);
    },
    addType(type) {
      const idArray = type.split('/');
      this.addEmpty(idArray[idArray.length - 1]);
      this.dismissTypeChooser();
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
      // console.log(searchUrl);
      return new Promise((resolve, reject) => {
        httpUtil.get({ url: searchUrl, accept: 'application/ld+json' }).then((response) => {
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
<div class="entity-adder" :class="{'inner-adder': isPlaceholder, 'fill-width': addEmbedded}">
  <div v-if="isPlaceholder && !addEmbedded" v-on:click="add()" @mouseenter="showToolTip = true" @mouseleave="showToolTip = false">
    <span class="chip-label">
      <i class="fa fa-fw fa-plus plus-icon" aria-hidden="true">
        <tooltip-component :show-tooltip="showToolTip" tooltip-text="Add" translation="translatePhrase"></tooltip-component>  
      </i>
    </span>
  </div>
  <div v-if="!isPlaceholder && !addEmbedded" class="action-button add-entity-button" v-on:click="add()">
    <span class="chip-label">
      <i class="fa fa-fw fa-plus plus-icon" aria-hidden="true">
      </i>
    <span class="label-text">{{ addLabel | labelByLang | capitalize }}</span></span>
  </div>
  <div class="type-chooser" v-if="addEmbedded" v-on-clickaway="dismissTypeChooser">
    <select v-model="selectedType" @change="addType(selectedType, true)">
      <option disabled value="">{{"Choose type" | translatePhrase}}</option>
      <option v-for="rangeType in getFullRange" value="{{rangeType}}">{{rangeType | labelByLang}}</option>
    </select>
  </div>
  <div class="window" v-if="active">
    <div class="header">
      <span class="title">
        {{ "Add entity" | translatePhrase }} | {{ addLabel | labelByLang }}
      </span>
      <span class="windowControl">
        <i v-on:click="hide" class="fa fa-close"></i>
      </span>
    </div>
    <div class="body">
      <div class="stage-0">
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
              <button v-if="allowLocal && hasSingleRange" v-on:click="addEmpty(getFullRange[0])">{{ "Create local entity" | translatePhrase }} ({{ addLabel | labelByLang }})</button>
              <select v-model="selectedType" @change="addType(selectedType)" v-if="allowLocal && !hasSingleRange">
                <option disabled value="">{{ "Create local entity" | translatePhrase }} ({{ addLabel | labelByLang }})</option>
                <option v-for="rangeType in getFullRange" value="{{rangeType}}" label="{{rangeType | labelByLang}}">
              </select>
            </div>
          </div>
        </div>
        <div v-if="!loading && keyword.length === 0" class="search-status">{{ "Start writing to begin search" | translatePhrase }}...</div>
        <div v-if="loading" class="search-status">{{ "Searching" | translatePhrase }}...<br><i class="fa fa-circle-o-notch fa-spin"></i></div>
        <div v-if="!loading && searchResult.length === 0 && keyword.length > 0 && searchMade" class="search-status">
          {{ "No results" | translatePhrase }}...
        </div>
        <entity-search-list v-if="!loading && keyword.length > 0" :results="searchResult" :disabled-ids="alreadyAdded"></entity-search-list>
      </div>
    </div>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';

.entity-adder {
  .disabled {
    visibility: hidden;
  }
  &.fill-width {
    width: 100%;
  }
  &.inner-adder {
    cursor: pointer;
  }
  > .chip {
    .chip-mixin(transparent, @gray-darker);
    .label-text {
      display: inline-block;
    }
  }
  .type-chooser {
    text-align: center;
    padding: 5px;
    border: 2px solid #b2b2b2;
    > select {
      width: 100%;
    }
  }
  .add-entity-button {
    padding: 0.3em 0;
    opacity: 1;
    transition: opacity 0.5s ease;
    &.fade {
      opacity: 0;
    }
    cursor: pointer;
    .chip-label {
      color: @gray-dark;
    }
    &:hover {
      .chip-label {
        color: @gray-dark;
      }
    }
    .chip-action {

    }
  }
  .window {
    .window-mixin();
    .body {
      width: 100%;
      background-color: white;
      border: 1px solid #ccc;
      padding: 0px;
      overflow-y: scroll;
      .stage-1 {
        text-align: center;
      }
      button {
        font-size: 12px;
      }
      .search-result {
        padding-top: 50px;
        padding-bottom: 2em;
      }
      .search-header {
        position: absolute;
        width: 100%;
        padding: 0.5em 1em;
        border: solid #ccc;
        border-width: 0px 0px 1px 0px;
        background-color: darken(@neutral-color, 4%);
        z-index: @modal-z;
        > span {
         font-weight: bold;
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
      .search-status {
        padding: 10px;
        padding-top: 30%;
        font-size: 2em;
        text-align: center;
        > i {
          font-size: 8rem;
        }
      }
    }
  }

}

</style>
