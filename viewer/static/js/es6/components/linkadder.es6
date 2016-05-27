import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import { mixin as clickaway } from 'vue-clickaway';
import ProcessedLabel from './processedlabel';


export default {
  mixins: [clickaway],
  template: '#link-adder',
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
    vocabPfx: '',
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
      const preferredVocab = 'kbv';
      const item = _.find(this.vocab.descriptions, { '@id': this.vocabPfx + this.key });
      const range = [];
      if (typeof item === 'undefined' || !item.hasOwnProperty('rangeIncludes')) {
        return [this.$parent.item['@type']];
      }
      for (let i = 0; i < item.rangeIncludes.length; i++) {
        range.push(item.rangeIncludes[i]['@id'].replace(this.vocabPfx, ''));
      }
      return range;
    },
  },
  methods: {
    add(item) {
      this.$parent.addItem(this.key, item);
    },
    addAnonymous(type) {
      // TODO:  Sync with format and find out what kind of properties should be
      //        available on this level.

      // const typeObj = _.find(this.vocab.descriptions, { '@id': this.vocabPfx + type });
      const obj = { '@type': type, label: '' };
      this.$parent.addAnonymous(this.key, obj);
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

      let domain = 'localhost';
      if(this.range.indexOf('Record') === '-1') {
        domain = '127.0.0.1';
      }

      const searchUrl = `http://${domain}:5000/find.json?q=${searchkey}&@type=${this.range[0]}&limit=10`;
      console.log(searchUrl);
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
