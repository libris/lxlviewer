<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import ProcessedLabel from './processedlabel';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-value',
  props: {
    value: '',
    key: '',
    index: Number,
    isLocked: false,
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
    };
  },
  computed: {
    // TODO: Refactor computed
    json() {
      return JSON.stringify(this.item);
    },
  },
  ready() {
  },
  methods: {
    valueChanged() {
      this.$dispatch('update-item-value', this.value);
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    isObject(obj) {
      return _.isObject(obj);
    },
    removeThis() {
      // TODO: Refactor data-binding so child component does not use parent-methods directly
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
    addFocus() {
      this.focused = true;
    },
    removeFocus() {
      this.focused = false;
    },
  },
  components: {
    'processed-label': ProcessedLabel,
  },
};
</script>

<template>
  <div class="item-value">
  <!-- TODO: @input or @change? -->
    <input v-model="value" @change="valueChanged()" v-show="!isLocked"></input>
    <span v-show="isLocked">{{value}}</span>
  </div>
</template>

<style lang="less">
@import './variables.less';

.item-value {
  width: 95%;
  input {
    padding: 2px 5px;
    width: 100%;
    border-radius: 5px;
    border: none;
    box-shadow: inset 0px 0px 5px 0px rgba(0, 0, 0, 0.45);
  }
}

</style>
