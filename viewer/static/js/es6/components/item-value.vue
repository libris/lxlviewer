<script>
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as EditUtil from '../utils/edit';
import ProcessedLabel from './processedlabel';
import ItemMixin from './mixins/item-mixin';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-value',
  mixins: [ItemMixin],
  props: {
    value: '',
    key: '',
    index: Number,
    isLocked: false,
    isRemovable: false,
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
  },
  ready() {
  },
  methods: {
    valueChanged() {
      this.$dispatch('update-item', this.index, this.value);
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
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
    <div class="remover" v-show="!isLocked && isRemovable" v-on:click="removeThis()"><i class="fa fa-trash"></i></div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-value {
  width: 95%;
  input {
    color: @black;
    padding: 2px 5px;
    width: 90%;
    border-radius: 5px;
    border: none;
    box-shadow: inset 0px 0px 5px 0px rgba(0, 0, 0, 0.45);
  }
  .remover {
    margin-left: 1em;
    display: inline-block;
    opacity: 0;
    cursor: pointer;
    transition: opacity 0.5s ease;
  }
  &:hover {
    .remover {
      opacity: 1;
    }
  }
}

</style>
