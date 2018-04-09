<script>
import AutoSize from 'autosize';
import * as _ from 'lodash';
import * as httpUtil from '../../utils/http';
import * as VocabUtil from '../../utils/vocab';
import * as DisplayUtil from '../../utils/display';
import * as DataUtil from '../../utils/data';
import ProcessedLabel from '../shared/processedlabel';
import TooltipComponent from '../shared/tooltip-component';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';

export default {
  name: 'item-value',
  mixins: [ItemMixin, LensMixin],
  props: {
    fieldValue: '',
    fieldKey: '',
    index: Number,
    isLocked: false,
    isRemovable: false,
    showActionButtons: false,
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
    value: {
      get() {
        return this.fieldValue;
      },
      set: _.debounce(function(newValue) {
        this.$store.dispatch('updateInspectorData', {
          path: this.path,
          value: newValue,
          addToHistory: true,
        });
      }, 1000)
    }
  },
  ready() {
    this.$nextTick(() => {
      if (!this.status.isNew) {
        this.addFocus();
      }
      this.initializeTextarea();
    });
  },
  methods: {
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
      const children = this.$el.children;
      _.each(children, child => {
        if (child.className.indexOf('item-value-textarea') > -1) {
          child.focus();
        }
      });
    },
    removeFocus() {
      const children = this.$el.children;
      _.each(children, child => {
        if (child.className.indexOf('item-value-textarea') > -1) {
          child.blur();
        }
      });
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'tooltip-component': TooltipComponent,
  },
};
</script>

<template>
  <div class="ItemValue" v-bind:class="{'locked': isLocked, 'unlocked': !isLocked, 'distinguish-removal': removeHover, 'removed': removed}">
    <textarea class="item-value-textarea" rows="1" v-model="value" @keydown="handleEnter" v-if="!isLocked"></textarea>
    <span v-if="isLocked">{{fieldValue}}</span>
    <div class="remover" v-show="!isLocked && isRemovable" v-on:click="removeThis()" @mouseover="removeHover = true" @mouseout="removeHover = false">
      <i class="fa fa-minus">
        <tooltip-component :show-tooltip="removeHover" tooltip-text="Remove" translation="translatePhrase"></tooltip-component>
      </i>
    </div>
  </div>
</template>

<style lang="less">

.item-value {
  border: solid 1px transparent;
  line-height: 1.6;
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
