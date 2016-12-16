<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import ProcessedLabel from './processedlabel';
import { mixin as clickaway } from 'vue-clickaway';
import { getVocabulary, getSettings, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  mixins: [clickaway],
  data() {
    return {
      result: [],
      hitlistOpened: false,
      active: false,
      searchOpen: false,
      searchResult: {},
      keyword: '',
      chooseAnonymousType: false,
    };
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  props: {
    key: '',
    focus: '',
    allowAnon: true,
    propertyTypes: [],
  },
  components: {
    'processed-label': ProcessedLabel,
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
    canRecieveObjects() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    isLiteral() {
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
        this.openSearch();
      } else {
        this.$dispatch('add-item', '');
      }
    },
    addLinked(item) {
      this.$dispatch('add-item', item);
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
    getItemAsChip(item) {
      return DisplayUtil.getChip(
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
      let inputKeys = DisplayUtil.getProperties(type, 'cards', this.display);
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
            this.display
          );
          if (inputKeys.length > 0) {
            break;
          }
        }
        if (inputKeys.length === 0) {
          inputKeys = DisplayUtil.getProperties('Resource', 'cards', this.display);
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
      console.log('typeArray', typeArray);
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
<span class="entity-adder" v-on-clickaway="closeSearch">
    <a class="add-entity-button" v-on:click="add()" :class="{ 'work-state': isWork, 'instance-state': isInstance }">
      <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
    </a>
    <div class="search-box" v-show="searchOpen">
      <div class="stage-0" v-show="!chooseAnonymousType">
        <div v-show="allowAnon">
          <button v-on:click="goAnonymous">Lägg till oauktoriserad</button>
        </div>
        Sök:
        <input v-model="keyword"></input>
        <hr>
        <ul class="search-result" v-show="searchResult.length > 0">
          <li v-for="item in searchResult" track-by="$index" class="search-result-item" v-on:click="addLinked(item)">
            {{ getItemAsChip(item) }}
          </li>
        </ul>
      </div>
      <div class="stage-1" v-show="chooseAnonymousType">
        <button v-on:click="addEmpty(type)" v-for="type in getRange">{{ type }}</button>
      </div>
    </div>
</span>
</template>

<style lang="less">
@import './variables.less';

.entity-adder {
  opacity: 1;
  .add-entity-button {
    &.instance-state {
      color: @instance-text;
      background-color: @instance-background;
    }
    &.work-state {
      color: @work-text;
      background-color: @work-background;
    }
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
      &.instance-state {
        background-color: @instance-hover;
      }
      &.work-state {
        background-color: @work-hover;
      }
    }
    &:active {
      position:relative;
      top:1px;
    }
  }
  .search-box {
    width: 200px;
    background-color: white;
    border: 1px solid #ccc;
    padding: 4px;
    button {
      font-size: 12px;
    }
    .search-result {
      list-style-type: none;
      padding: 0px;
      .search-result-item {
        border: solid #ccc;
        border-width: 1px 0px 0px 0px;
        &:hover {
          background-color: darken(white, 5%);
        }
      }
    }
  }
}

</style>
