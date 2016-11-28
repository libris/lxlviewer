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
    allowAnon: true,
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
    getRange() {
      return VocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
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
    isEmbedded() {
      // Is the type of the item derived from StructuredValue?
      const embeddedTypes = ['StructuredValue', 'ProvisionActivity', 'Contribution'];
      const typeChain = VocabUtil.getBaseClassesFromArray(
        this.getRange,
        this.vocab,
        this.settings.vocabPfx
      );
      if (typeChain.length > 0) {
        for (const typeElement of embeddedTypes) {
          if (~typeChain.indexOf(`${this.settings.vocabPfx}${typeElement}`)) {
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
      this.openSearch();
    },
    addLinked(item) {
      this.$dispatch('add-item', this.key, item);
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
      this.$dispatch('add-anonymous', this.key, obj);
    },
    search(keyword) {
      const self = this;
      self.loading = true;
      this.getItems(keyword).then((result) => {
        self.searchResult = result;
      });
    },
    getItemAsChip(item) {
      return DisplayUtil.getChip(
        item,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings.vocabPfx
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
    getItems(keyword) {
      // TODO: Support asking for more items
      const searchKey = `${keyword}*`;

      const searchUrl = `/find.json?q=${searchKey}&@type=${this.getRange[0]}&limit=10`;
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
    <a class="add-entity-button" v-on:click="add()">
      <i class="fa fa-plus plus-icon" aria-hidden="true"></i>
    </a>
    <div class="search-box" v-show="searchOpen">
      <div class="stage-0" v-show="!chooseAnonymousType">
        <button v-on:click="goAnonymous">Lägg till oauktoriserad</button>
        eller
        Sök:
        <input v-model="keyword"></input>
        <hr>
        <ul class="search-result" v-show="searchResult.length > 0">
          <li v-for="item in searchResult" class="search-result-item" v-on:click="addLinked(item)">
            <span v-for="value in getItemAsChip(item)">
              {{value}}
            </span>
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
    background-color:@brand-primary;
    -moz-border-radius:28px;
    -webkit-border-radius:28px;
    border-radius:28px;
    border:1px solid @brand-primary;
    display:inline-block;
    cursor:pointer;
    color:#ffffff;
    font-family:Arial;
    font-size:10px;
    padding-right: 5px;
    padding-left: 5px;
    text-decoration:none;
    text-shadow:0px 1px 0px #2f6627;
      .plus-icon {
        vertical-align: middle;
      }
      &:hover {
        background-color:#00ad9c;
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
