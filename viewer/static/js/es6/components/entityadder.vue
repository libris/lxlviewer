<script>
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as LayoutUtil from '../utils/layout';
import ProcessedLabel from './processedlabel';
import ToolTipComponent from './tooltip-component';
import { mixin as clickaway } from 'vue-clickaway';
import { changeStatus, changeNotification } from '../vuex/actions';
import { getVocabulary, getSettings, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [clickaway],
  data() {
    return {
      searchOpen: false,
      searchResult: {},
      keyword: '',
      chooseAnonymousType: false,
      active: false,
      showToolTip: false,
    };
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
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
    focus: '',
    allowAnon: true,
    propertyTypes: [],
  },
  events: {
    'close-modals'() {
      this.closeSearch();
    },
  },
  components: {
    'tooltip-component': ToolTipComponent,
  },
  watch: {
    keyword(value) {
      if (value) {
        this.search(value);
      }
    },
  },
  computed: {
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'it';
    },
    getRange() {
      return VocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
    },
    onlyEmbedded() {
      const range = this.getRange;
      for (const prop of range) {
        if (!VocabUtil.isEmbedded(prop, this.vocab, this.settings)) {
          return false;
        }
      }
      return true;
    },
    canRecieveObjects() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    isLiteral() {
      // TODO: Verify usage
      if (this.getRange.length > 0) {
        for (const rangeElement of this.getRange) {
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
    add() {
      if (this.canRecieveObjects) {
        this.show();
      } else {
        this.$dispatch('add-item', '');
      }
    },
    show() {
      LayoutUtil.scrollLock(true);
      this.active = true;
      setTimeout(() => { // TODO: Solve this by setting focus after window has been rendered.
        document.getElementById('test').focus();
      }, 1);
      this.changeStatus('keybindState', 'entity-adder');
    },
    hide() {
      if (!this.active) return;
      this.active = false;
      LayoutUtil.scrollLock(false);
      this.changeStatus('keybindState', 'overview');
    },
    addLinked(item) {
      this.$dispatch('add-item', item);
      this.changeNotification('color', 'green');
      this.changeNotification('message', `Lade till "${this.getItemLabel(item)}"`);
      this.closeSearch();
    },
    goAnonymous() {
      const range = this.getRange;
      if (range.length > 1) {
        this.chooseAnonymousType = true;
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
      this.chooseAnonymousType = false;
      this.hide();
    },
    addEmpty(type) {
      this.closeSearch();
      const obj = this.getEmptyForm(type);
      this.$dispatch('add-item', obj);
    },
    search(keyword) {
      const self = this;
      self.loading = true;
      this.getItems(keyword, this.getRange).then((result) => {
        self.searchResult = result;
      });
    },
    getItemLabel(item) {
      return DisplayUtil.getItemLabel(
        item,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
    },
    getItemAsChip(item) {
      return DisplayUtil.getChip(
        item,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
    },
    getItemAsCard(item) {
      return DisplayUtil.getCard(
        item,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
    },
    getEmptyForm(type) {
      console.log('Type', type);
      const formObj = { '@type': type };
      let inputKeys = DisplayUtil.getProperties(type, 'cards', this.display, this.settings);
      if (inputKeys.length === 0) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          type,
          this.vocab,
          this.settings.vocabPfx
        );
        console.log('baseClasses for', type, 'is', JSON.stringify(baseClasses));
        for (const baseClass of baseClasses) {
          inputKeys = DisplayUtil.getProperties(
            baseClass.replace(this.settings.vocabPfx, ''),
            'cards',
            this.display,
            this.settings
          );
          if (inputKeys.length > 0) {
            break;
          }
        }
        if (inputKeys.length === 0) {
          inputKeys = DisplayUtil.getProperties('Resource', 'cards', this.display, this.settings);
        }
        console.log(inputKeys);
      }
      inputKeys = ['@type'].concat(inputKeys);
      for (const inputKey of inputKeys) {
        if (inputKey === '@type') {
          formObj[inputKey] = type;
        } else {
          formObj[inputKey] = '';
        }
      }
      console.log('Form obj', JSON.stringify(formObj));
      return formObj;
    },
    getItems(keyword, typeArray) {
      // TODO: Support asking for more items
      const searchKey = `${keyword}*`;
      let searchUrl = `/find?q=${searchKey}`;
      if (typeof typeArray !== 'undefined' && typeArray.length > 0) {
        searchUrl += '&';
        for (const type of typeArray) {
          searchUrl += `@type=${type}`;
        }
      }
      searchUrl += '&_limit=10';
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
<span class="entity-adder">
  <a class="action-button add-entity-button" v-on:click="add()" @mouseenter="showToolTip=true" @mouseleave="showToolTip=false">
    <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
  </a>
  <tooltip-component :show-tooltip="showToolTip" :tooltiptext="key"></tooltip-component>
  <div class="window" v-if="active">
    <div class="header">
      <span class="title">
        Lägg till entitet
      </span>
      <span class="windowControl">
        <i v-on:click="hide" class="fa fa-close"></i>
      </span>
    </div>
    <div class="body">
      <div class="stage-0" v-show="!chooseAnonymousType">
        <div class="search-header">
          <div class="search">
            Sök:
            <input v-model="keyword"></input>
          </div>
          <div class="anonymous" v-show="allowAnon">
            <button v-on:click="goAnonymous">Lägg till oauktoriserad</button>
          </div>
        </div>
        <div class="search-result">
          <ul class="search-result-list" v-show="searchResult.length === 0">
            <li class="search-result-no-items">
            Inga resultat...
            </li>
          </ul>
          <ul class="search-result-list" v-show="searchResult.length > 0">
            <li v-for="item in searchResult" track-by="$index" class="search-result-item" v-on:click="addLinked(item)">
              {{ getItemLabel(item) }}
            </li>
          </ul>
        </div>
      </div>
      <div class="stage-1" v-show="chooseAnonymousType">
        <button v-on:click="addEmpty(type)" v-for="type in getRange">{{ type }}</button>
      </div>
    </div>
  </div>
</span>
</template>

<style lang="less">
@import './_variables.less';

.entity-adder {
  opacity: 1;
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
      .search-header {
        width: 100%;
        height: 40px;
        padding: 5px;
        border: solid #ccc;
        border-width: 0px 0px 1px 0px;
        background-color: darken(@neutral-color, 4%);
        .anonymous {
          float: left;
          width: 50%;
          text-align: right;
        }
        .search {
          float: left;
          width: 50%;
        }
      }
      .search-result {
        overflow-y: scroll;
        height: 328px;
        .search-result-list {
          width: 100%;
          padding: 0px;
          list-style-type: none;
          li {
            padding: 5px;
          }
          .search-result-item {
            &:nth-child(even) {
              background-color: darken(@neutral-color, 2%);
            }
            cursor: pointer;
            border: solid #ccc;
            border-width: 0px 0px 1px 0px;
            &:hover {
              background-color: darken(white, 5%);
            }
          }
        }
      }
    }
  }
  .add-entity-button {
    background-color: @brand-primary;
    color: @white;
    border-radius:28px;
    display:inline-block;
    cursor:pointer;
    font-family:Arial;
    font-size:10px;
    padding-right: 5px;
    padding-left: 5px;
    text-decoration:none;
    .plus-icon {
      vertical-align: middle;
    }
    &:hover {
      background-color: lighten(@brand-primary, 5%);
    }
    &:active {
      position:relative;
      top:1px;
    }
  }
}

</style>
