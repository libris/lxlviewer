<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import Vue from 'vue';
import ProcessedLabel from './processedlabel';
import DataNode from './datanode';
import ItemEntity from './item-entity';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-embedded',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    focus: '',
    embedded: false,
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      formObj: {},
    };
  },
  computed: {
    filteredItem() {
      const filteredItem = Object.assign({}, this.item);
      delete filteredItem['@type'];
      return filteredItem;
    },
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types;
    },
  },
  created() {
    this.$options.components['data-node'] = Vue.extend(DataNode);
  },
  ready() {
  },
  methods: {
  },
  components: {
    'processed-label': ProcessedLabel,
    'item-entity': ItemEntity,
  },
};
</script>

<template>
  <div class="item-embedded">
    <i v-if="!isLocked" class="fa fa-trash chip-action" v-on:click="removeThis"></i>
    <span class="type"><a href="/vocab/#{{item['@type']}}">{{ item['@type'] | labelByLang | capitalize }}</a></span>
    <data-node v-for="(k,v) in filteredItem" :is-locked="isLocked" :is-removable="false" :embedded="true" :pkey="key" :pindex="index" :key="k" :value="v" :focus="focus"></data-node>
  </div>
</template>

<style lang="less" scoped>
@import './_variables.less';

.item-embedded {
  width: @col-value;
  padding: 5px;
  border: solid #ccc;
  border-width: 1px 1px 3px 1px;
  margin: 0px 0px 5px 0px;
  .type {
    text-transform: uppercase;
    font-weight: bold;
    a {
      text-decoration: none;
      cursor: help;
      color: @black;
    }
  }
  &:hover {
    .chip-action {
      opacity: 1;
    }
  }
  .chip-action {
    transition: opacity 0.25s ease;
    opacity: 0;
    float: right;
    cursor: pointer;
  }
  .item-label {
    display: block;
  }
}

</style>
