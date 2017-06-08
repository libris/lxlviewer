<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as RecordUtil from '../utils/record';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as DataUtil from '../utils/data';
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
    embedded: false,
    showActionButtons: false,
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
      expanded: false,
    };
  },
  computed: {
    isEmpty() {
      let foundValue = false;
      _.each(this.filteredItem, (v, k) => {
        if (v.length !== 0) {
          foundValue = true;
        }
      });
      return !foundValue;
    },
    filteredItem() {
      const emptyItem = RecordUtil.getEmptyForm(this.item['@type'], this.vocab, this.display, this.settings);
      const filteredItem = Object.assign(emptyItem, this.item);
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
    collapsedLabel() {
      const summary = this.getSummary;

      const infoArray = [].concat(summary.header, summary.sub, summary.info, summary.identifiers);
      const filteredArray =
        [].concat(summary.header, summary.sub, summary.info, summary.identifiers)
        .filter(item => {
          return (item.property !== '@type' && item.property !== 'error');
        });
      const label = this.getFormattedEntries(filteredArray).join(' | ');
      return label;
    },
  },
  created() {
    this.$options.components['data-node'] = Vue.extend(DataNode);
  },
  ready() {
    if (this.isEmpty && !this.isLocked) {
      this.expanded = true;
    }
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    }
  },
  components: {
    'processed-label': ProcessedLabel,
    'item-entity': ItemEntity,
  },
};
</script>

<template>
  <div class="item-embedded" :class="{'expanded': expanded, 'removed': removed}">
    <span>
      <i class="fa fa-chevron-right" :class="{'down': expanded}" @click="toggleExpanded()"></i>
      <span class="type"><a href="/vocab/#{{item['@type']}}">{{ item['@type'] | labelByLang | capitalize }}</a></span>
      <span class="collapsed-label" @click="toggleExpanded()"><span v-show="!expanded">{{collapsedLabel}}</span><span class="placeholder">.</span></span>
      <i v-if="!isLocked" class="fa fa-trash chip-action" :class="{'show-icon': showActionButtons}" v-on:click="removeThis(true)"></i>
    </span>
    <data-node v-show="expanded" v-for="(k,v) in filteredItem" v-show="!isLocked || v" :is-inner="true" :is-locked="isLocked" :allow-local="true" :is-removable="false" :embedded="true" :parent-key="key" :parent-index="index" :key="k" :value="v" :focus="focus" :show-action-buttons="showActionButtons"></data-node>
  </div>
</template>

<style lang="less" scoped>
@import './_variables.less';


</style>
