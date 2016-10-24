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
    keyword: '',
    allowAnon: true,
  },
  components: {
    'processed-label': ProcessedLabel,
  },
  watch: {
    keyword(value, oldval) {
      if (value.length === 0 && oldval && oldval.length > 0) {
        this.hideHitlist();
      }
      if (/\S/.test(value)) {
        this.search(value);
      }
    },
  },
  computed: {
    range() {
      const propertyId = this.key;
      const range = VocabUtil.getRange(propertyId, this.vocab, this.settings.vocabPfx);
      return range;
    },
  },
  methods: {
    add(item) {
      this.$dispatch('add-item', this.key, item);
    },
    addAnonymous(type) {
      // TODO:  Sync with format and find out what kind of properties should be
      //        available on this level.

      // const typeObj = _.find(this.vocab.descriptions, { '@id': this.settings.vocabPfx + type });
      const obj = { '@type': type, label: '' };

      this.$dispatch('add-anonymous', this.key, obj);
    },
    search(searchkey) {
      const self = this;
      self.loading = true;
      this.getItems(searchkey).then((result) => {
        self.result = result;
        self.loading = false;
        self.hitlistOpened = true;
      });
    },
    show() {
      this.active = true;
      this.keyword = '';
    },
    hide() {
      this.hideHitlist();
      this.active = false;
    },
    hideHitlist() {
      this.hitlistOpened = false;
    },
    getItems(searchkey) {
      // TODO: Support asking for more items

      const searchUrl = `/find.json?q=${searchkey}&@type=${this.range[0]}&limit=10`;
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
<div class="field-controls">
  <div class="link-adder" v-on:click="show" v-on-clickaway="hide">
    <span class="add" v-show="!active">
      <i class="fa fa-plus-circle"></i> Lägg till länkad
    </span>
    <input v-show="active" type="text" v-model="keyword" debounce="500"></input>
    <br>
    <ul class="result" v-bind:class="{ 'active' : this.hitlistOpened }">
      <li v-if="result.length === 0">Inga resultat...</li>
      <li v-if="result.length > 0" v-for="item in result" track-by="$index">
        <span class="plabel"><processed-label :item="item"></processed-label></span>
        <span class="id"><a href="{{ item['@id'] }}" target="_blank">{{ item["@id"] }}</a></span>
        <span class="add"><a v-on:click="add(item)">Lägg till <i class="fa fa-plus-circle"></i></a></span>
      </li>
    </ul>
  </div>

  <div class="link-adder" v-if="allowAnon">
    <span class="add" v-for="type in range" v-show="!active" v-on:click="addAnonymous(type)">
      <i class="fa fa-plus-circle"></i> Lägg till {{type | labelByLang | lowercase}}
    </span>
  </div>
</div>
</template>
