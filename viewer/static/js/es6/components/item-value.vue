<script>
import AutoSize from 'autosize';
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as DataUtil from '../utils/data';
import ProcessedLabel from './processedlabel';
import ItemMixin from './mixins/item-mixin';
import LensMixin from './mixins/lens-mixin';
import { getVocabulary, getDisplayDefinitions, getSettings, getEditorData } from '../vuex/getters';

export default {
  name: 'item-value',
  mixins: [ItemMixin, LensMixin],
  props: {
    value: '',
    key: '',
    index: Number,
    isLocked: false,
    isRemovable: false,
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
  watch: {
    isLocked(val) {
      if (!val) {
        this.initializeTextarea();
      }
    },
  },
  data() {
    return {
      inEdit: false,
      removeHover: false,
    };
  },
  computed: {
  },
  ready() {
    this.$nextTick(() => {
      this.initializeTextarea();
    });
  },
  methods: {
    valueChanged: _.debounce(function () {
      this.$dispatch('update-item', this.index, this.value);
    }, 1000),
    updateValue() {
      this.$dispatch('update-item', this.index, this.value);
    },
    handleEnter(e) {
      if (e.keyCode === 13) {
        e.target.blur();
        e.preventDefault();
        return false;
      }
    },
    initializeTextarea() {
      AutoSize(this.$el.querySelector('textarea'));
      AutoSize.update(this.$el.querySelector('textarea'));
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
  <div class="item-value" v-bind:class="{'locked': isLocked, 'unlocked': !isLocked, 'distinguish-removal': removeHover, 'removed': removed}">
    <textarea rows="1" v-model="value" @input="valueChanged()" @keydown="handleEnter" @blur="updateValue()" v-if="!isLocked"></textarea>
    <span v-if="isLocked">{{value}}</span>
    <div class="remover" v-show="!isLocked && isRemovable" v-on:click="removeThis()" @mouseover="removeHover = true" @mouseout="removeHover = false"><i class="fa fa-minus"></i></div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-value {
  border: solid 1px transparent;
  &.locked {
    line-height: 2;
    padding-left: 5px;
    span {
      word-break: break-word;
    }
  }
  &.removed {
    transition: all 0.5s ease;
    max-height: 0px;
    margin: 0px;
    border: none;
    overflow: hidden;
  }
  textarea {
    resize: none;
    color: #333333;
    padding: 2px 5px;
    width: 95%;
    border: 1px solid #d6d6d6;
    box-shadow: inset 0px 2px 0px 0px rgba(204, 204, 204, 0.35);
  }
  .remover {
    font-size: 12px;
    float: right;
    display: inline-block;
    padding: 3px;
    cursor: pointer;
  }
  &.unlocked {

  }
}

</style>
