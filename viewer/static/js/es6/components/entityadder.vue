<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import ProcessedLabel from './processedlabel';
import { mixin as clickaway } from 'vue-clickaway';
import { getVocabulary, getSettings } from '../vuex/getters';


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
    };
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
    }
  },
  props: {
    key: '',
    allowAnon: true,
  },
  components: {
    'processed-label': ProcessedLabel,
  },
  watch: {
    keyword(value, oldval) {
      this.search(value);
    },
  },
  computed: {
    getRange() {
      return VocabUtil.getRange(this.key, this.vocab, this.settings.vocabPfx);
    },
    isResource() {
      if (this.getRange.length === 1) {
        const baseClasses = VocabUtil.getBaseClassesFromArray(this.getRange, this.vocab, this.settings.vocabPfx);
        console.log(baseClasses);
        return true;
      } else {
        return false;
      }
    },
  },
  ready() {
    this.searchOpen = false;
  },
  methods: {
    add() {
      if (this.isResource) {
        this.openSearch();
      } else {
        this.$dispatch('add-item', this.key, item);
      }
    },
    addLinked(item) {
      this.$dispatch('add-item', this.key, item);
      this.closeSearch();
    },
    openSearch() {
      this.keyword = '';
      this.searchOpen = true;
    },
    closeSearch() {
      this.searchOpen = false;
      this.keyword = '';
    },
    addEmptyEntity() {
      this.$dispatch('add-item', this.key, {});
    },
    addAnonymous(type) {
      // TODO:  Sync with format and find out what kind of properties should be
      //        available on this level.

      // const typeObj = _.find(this.vocab.descriptions, { '@id': this.settings.vocabPfx + type });
      const obj = { '@type': type, label: '' };

      this.$dispatch('add-anonymous', this.key, obj);
    },
    search(keyword) {
      const self = this;
      self.loading = true;
      this.getItems(keyword).then((result) => {
        self.searchResult = result;
      });
    },
    getItems(searchkey) {
      // TODO: Support asking for more items

      const searchUrl = `/find.json?q=${searchkey}&@type=${this.getRange[0]}&limit=10`;
      // console.log(searchUrl);
      return new Promise((resolve, reject) => {
        httpUtil.get({url:searchUrl, accept:'application/ld+json'}).then((response) => {
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
      Sök:
      <input v-model="keyword"></input>
      <hr>
      <ul class="search-result" v-show="searchResult.length > 0">
        <li v-for="item in searchResult" class="search-result-item" v-on:click="addLinked(item)">
          {{ item['@id'] }}
        </li>
      </ul>
    </div>
</span>
</template>

<style lang="less">
@import '../../../less/main_libris.less';

.entity-adder {
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
