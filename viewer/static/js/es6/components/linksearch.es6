import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import { mixin as clickaway } from 'vue-clickaway';


export default {
  mixins: [clickaway],
  template: '<div><div class="link-adder" v-on:click="show" v-on-clickaway="hide"><span class="add" v-show="!active"><i class="fa fa-plus-circle"></i> Lägg till</span><input v-show="active" type="text" v-model="keyword" debounce="500"></input><br><ul class="result" v-bind:class="{ \'active\' : this.hitlistOpened }"><li v-if="result.length === 0">Inga resultat...</li><li v-if="result.length > 0" v-for="item in result" track-by="$index"><span class="prefLabel">{{ item.prefLabel }}</span><span class="id"><a href="{{ item[\'@id\'] }}" target="_blank">{{ item["@id"] }}</a></span><span class="add"><a v-on:click="add(item)">Lägg till <i class="fa fa-plus-circle"></i></a></span></li></ul></div></div>',
  data() {
    return {
      result: [],
      hitlistOpened: false,
      active: false,
    };
  },
  props: {
    key: '',
    keyword: '',
    vocab: {},
  },
  watch: {
    keyword(value, oldval) {
      if (value.length === 0 && oldval && oldval.length > 0) {
        this.hideHitlist();
      }
      if (/\S/.test(value)) {
        this.search();
      }
    },
  },
  computed: {
    range() {
      const preferredVocab = 'kbv';
      const item = _.find(this.vocab.descriptions, { '@id': `${preferredVocab}:${this.key}` });
      const range = [];
      if (typeof item === 'undefined' || !item.hasOwnProperty('rangeIncludes')) {
        return [this.$parent.thing['@type']];
      }
      for (let i = 0; i < item.rangeIncludes.length; i++) {
        range.push(item.rangeIncludes[i]['@id']);
      }
      return range;
    },
  },
  methods: {
    add(item) {
      this.$parent.addItem(this.key, item);
    },
    search() {
      const self = this;
      self.loading = true;
      this.getItems().then((result) => {
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
    getItems() {
      const searchUrl = '/find.json?q=' + this.keyword + '&@type=' + this.range[0] + '&limit=10';
      return new Promise((resolve, reject) => {
        httpUtil.getContent(searchUrl, 'application/ld+json').then((response) => {
          resolve(JSON.parse(response).items);
        }, (error) => {
          reject('Error searching...', error);
        });
      });
    },
  },
};
