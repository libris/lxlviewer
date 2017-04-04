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
    valueChanged() {
      this.$dispatch('update-item', this.index, this.value);
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
  <div class="item-value" v-bind:class="{'locked': isLocked, 'unlocked': !isLocked}">
  <!-- TODO: @input or @change? -->
    <textarea rows="1" v-model="value" @change="valueChanged()" v-if="!isLocked"></textarea>
    <span v-if="isLocked">{{value}}</span>
    <div class="remover" v-show="!isLocked && isRemovable" v-on:click="removeThis()"><i class="fa fa-trash"></i></div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.item-value {
  width: 480px;
  border: solid 1px transparent;
  &.locked {
    line-height: 2;
    span {
      word-break: break-word;
    }
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
    float: right;
    display: inline-block;
    opacity: 0;
    padding: 3px;
    cursor: pointer;
    transition: opacity 0.5s ease;
  }
  &.unlocked {
    padding: 3px;
    &:hover {
      border: 1px dashed #ccc;
      .remover {
        opacity: 1;
      }
    }
  }
}

</style>
