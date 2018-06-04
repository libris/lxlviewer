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
        if (this.fieldValue === null) {
          return [];
        }
        let valueArray = this.fieldValue;
        if (!_.isArray(this.fieldValue)) {
          valueArray = [this.fieldValue];
        }
        return valueArray;
      },
      set: _.debounce(function(newValue) {
        this.update(newValue);
      }, 1000)
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.status.isNew) {
        this.addFocus();
      }
      this.initializeTextarea();
    });
  },
  methods: {
    handleKeys(e) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'updating', value: true });
      if (e.keyCode === 13) { // Handle enter
        e.target.blur();
        e.preventDefault();
        return false;
      }
    },
    update(newValue) {
      const oldValue = _.cloneDeep(_.get(this.inspector.data, this.path));
      if (newValue !== oldValue) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.path,
              value: newValue,
            }
          ],
          addToHistory: true,
        });
        this.$store.dispatch('setInspectorStatusValue', { property: 'unsavedChanges', value: true });
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
        if (child.className.indexOf('js-itemValueInput') > -1) {
          child.focus();
        }
      });
    },
    removeFocus() {
      const children = this.$el.children;
      _.each(children, child => {
        if (child.className.indexOf('js-itemValueInput') > -1) {
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
  <div class="ItemValue" v-bind:class="{'is-locked': isLocked, 'unlocked': !isLocked, 'is-removed': removed}">
    <textarea class="ItemValue-input js-itemValueInput" 
      rows="1" 
      v-model="value" 
      @blur="update($event.target.value)"
      @keydown="handleKeys" 
      v-if="!isLocked"></textarea>
    <span class="ItemValue-text" 
      v-if="isLocked">{{fieldValue}}</span>
    <div class="ItemValue-remover" 
      v-show="!isLocked && isRemovable" 
      v-on:click="removeThis()" 
      @mouseover="removeHover = true" 
      @mouseout="removeHover = false">
      <i class="fa fa-minus">
        <tooltip-component 
          :show-tooltip="removeHover" 
          tooltip-text="Remove" 
          translation="translatePhrase"></tooltip-component>
      </i>
    </div>
  </div>
</template>

<style lang="less">

.ItemValue {
  display: flex;
  flex: 1;
  flex-shrink: 0;
  margin: 5px 0 5px 0;

  &-input {
    display: block;
    width: 100%;
    border: 1px solid @gray-dark;
    border-radius: 2px;
    padding: 2px 10px;
    resize: none;
    transition: border .25s ease-out;

    &:focus {
      border: 1px solid @black;
    }
  }

  &-text {
    word-break: break-word;
    position: relative;
  }

  &.is-removed {
    transition: all 0.5s ease;
    max-height: 0px;
    margin: 0px;
    border: none;
    overflow: hidden;
  }

  &-remover {
    font-size: 16px;
    font-size: 1.6rem;
    float: right;
    display: inline-block;
    padding: 3px;
    margin-left: 5px;
    cursor: pointer;
    color: @gray;

    &:hover {
      color: @black;
    }
  }
}

</style>
