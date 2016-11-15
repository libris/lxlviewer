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
  },
  methods: {
    add(item) {
      this.$dispatch('add-item', this.key, item);
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
<div class="entity-adder">
    <span class="add" v-on:click="addEmptyEntity(key)">
      <i class="fa fa-plus-circle"></i> Lägg till
    </span>
</div>
</template>

<style lang="less">
@import '../../../less/main_libris.less';

.entity-adder {

}

</style>
