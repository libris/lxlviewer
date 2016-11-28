<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import ProcessedLabel from './processedlabel';
import ItemEntity from './item-entity';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-embedded',
  props: {
    item: {},
    key: '',
    index: Number,
    isLocked: false,
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
    getChip() {
      const chip = DisplayUtil.getChip(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab, this.settings.vocabPfx
      );
      return chip;
    },
    getCard() {
      const card = DisplayUtil.getCard(
        this.linkedItem,
        this.display,
        this.editorData.linked,
        this.vocab,
        this.settings.vocabPfx
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
  },
  ready() {
  },
  methods: {
    removeThis() {
      console.log('Removethis called');
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        this.$parent.removeById(this.item['@id']);
      } else if (_.isPlainObject(holder)) {
        this.$parent.removeKey(this.key);
      } else {
        this.$parent.emptyValue();
      }
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
    <i v-if="!isLocked" class="fa fa-times chip-action" v-on:click="removeThis"></i>
    <strong>{{ item['@type'] | labelByLang | capitalize }}</strong>
    <ul>
      <li v-for="(k,v) in item" v-if="k !== '@type'">
        <span class="item-label">{{k | labelByLang | capitalize }}:</span>
        <input v-model="v" v-if="!isObject(v)"></input>
        <item-entity :key="k" :item="v" v-if="isObject(v)"></item-entity>
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
@import './variables.less';

.item-embedded {
  ul {
    padding: 0px;
    list-style: none;
  }
  width: 100%;
  padding: 10px;
  border: 1px dashed @gray;
  margin: 0px 0px 1em 0px;
  .chip-action {
    float: right;
  }
  .item-label {
    display: block;
  }
}

</style>
