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
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-embedded',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    focus: '',
    status: {},
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
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
    linkedItem() {
      const obj = EditUtil.getLinked(
        this.item['@id'],
        this.editorData.linked
      );
      return obj;
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
    removeThis() {
      this.$dispatch('remove-item', this.index);
    },
    isObject(value) {
      return _.isObject(value);
    },
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
    <strong>{{ item['@type'] | labelByLang | capitalize }}</strong>
    <data-node v-for="(k,v) in filteredItem" :is-locked="isLocked" :is-removable="false" :embedded="true" :pkey="key" :pindex="index" :key="k" :value="v" :focus="focus" :linked="editorData.linked" :status="status"></data-node>
  </div>
</template>

<style lang="less" scoped>
@import './_variables.less';

.item-embedded {
  width: @col-value;
  padding: 10px;
  border: 2px dotted fadeout(@gray, 50%);
  border-radius: 5px;
  margin: 0px 0px 1em 0px;
  .chip-action {
    float: right;
    cursor: pointer;
  }
  .item-label {
    display: block;
  }
}

</style>
