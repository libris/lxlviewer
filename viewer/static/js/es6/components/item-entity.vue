<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import CardComponent from './card-component';
import ProcessedLabel from './processedlabel';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-entity',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    focus: '',
    status: {},
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
      inEdit: false,
      showCardInfo: false,
      searchResult: {},
      searchDelay: 2,
      formObj: {},
    };
  },
  computed: {
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
    linkedItem() {
      if (_.isArray(this.item) || !_.isObject(this.item)) {
        throw new Error('Item is not an object.');
      }
      return EditUtil.getLinked(
        this.item['@id'],
        this.editorData.linked
      );
    },
    getChip() {
      const chip = DisplayUtil.getChip(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings
      );
      return card;
    },
    embedded() {
      return this.isEmbedded(this.item['@type']);
    },
    getRange() {
      const types = VocabUtil.getRange(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types;
    },
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'it';
    },
  },
  ready() {
  },
  methods: {
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    isObject(obj) {
      return _.isObject(obj);
    },
    size(obj) {
      return _.size(obj);
    },
    isPretty(key, value) {
      return (this.isObject(value) || key === '@id');
    },
    removeThis() {
      this.$dispatch('remove-item', this.index);
    },
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'card-component': CardComponent,
  },
};
</script>

<template>
  <div class="item-entity" @mouseleave="showCardInfo=false">
    <div class="chip entity-chip" :class="{ 'locked': isLocked }" @mouseenter="showCardInfo=true">
      <span class="chip-label">
        {{getChip}}
      </span>
      <i class="chip-action fa fa-times" v-on:click="removeThis" v-if="!isLocked"></i>
    </div>
    <card-component :title="getChip" :item="getCard" :uri="item['@id']" :should-show="showCardInfo"></card-component>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-entity {
  .chip {
    .chip-mixin(@brand-primary, #fff);
  }
}

</style>
