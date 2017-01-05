<script>
import * as _ from 'lodash';
import * as VocabUtil from '../utils/vocab';
import * as EditUtil from '../utils/edit';
import CardComponent from './card-component';
import ProcessedLabel from './processedlabel';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-entity',
  mixins: [ItemMixin, LensMixin],
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
    focus: '',
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
    size(obj) {
      return _.size(obj);
    },
    isPretty(key, value) {
      return (this.isObject(value) || key === '@id');
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
