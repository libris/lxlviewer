<script>
import AutoSize from 'autosize';
import { isArray, debounce, cloneDeep, get } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as StringUtil from '@/utils/string';
import * as LayoutUtil from '@/utils/layout';
import TooltipComponent from '../shared/tooltip-component';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';

export default {
  name: 'item-value',
  mixins: [ItemMixin, LensMixin],
  props: {
    fieldValue: {
      type: String,
      default: '',
    },
    isUriType: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isRemovable: {
      type: Boolean,
      default: false,
    },
    showActionButtons: {
      type: Boolean,
      default: false,
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    isLocked(val) {
      if (!val) {
        this.initializeTextarea();
      }
    },
    isExpanded(val) {
      if (val) {
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
    ...mapGetters([
      'user',
    ]),
    value: {
      get() {
        if (this.fieldValue === null) {
          return [];
        }
        let valueArray = this.fieldValue;
        if (!isArray(this.fieldValue)) {
          valueArray = [this.fieldValue];
        }
        return valueArray;
      },
      set: debounce(function debounceUpdate(newValue) {
        this.update(newValue);
      }, 1000),
    },
    shouldLink() {
      return this.isUriType && this.fieldValue.startsWith('http');
    },
    newWindowText() {
      return StringUtil.getUiPhraseByLang('Opens in new window', this.user.settings.language);
    },
    shouldFocus() {
      const lastAdded = this.inspector.status.lastAdded;
      if (lastAdded === this.path || lastAdded === this.parentPath) {
        return true;
      }
      return false;
    },
    isLastAdded() {
      if (this.inspector.status.lastAdded === this.path) {
        return true;
      }
      return false;
    },
  },
  methods: {
    removeHighlight(event, active) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-value'));
        item.classList.add('is-removeable');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-value'));
        item.classList.remove('is-removeable');
      }
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(newValue) {
      const oldValue = cloneDeep(get(this.inspector.data, this.path));
      if (newValue !== oldValue) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.path,
              value: newValue,
            },
          ],
          addToHistory: true,
        });
      }
    },
    highLightLastAdded() {
      if (this.isLastAdded === true) {
        const element = this.$el;
        element.classList.add('is-lastAdded');
        LayoutUtil.scrollToElement(element, 1000, () => {
          setTimeout(() => {
            element.classList.remove('is-lastAdded');
            if (this.isLastAdded) {
              this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
            }
          }, 1000);
        });
      }
    },
    initializeTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.textarea;
        AutoSize(textarea);
        AutoSize.update(textarea);
      });
    },
    isEmpty() {
      return false;
    },
    addFocus() {
      this.$refs.textarea.focus();
    },
  },
  components: {
    'tooltip-component': TooltipComponent,
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.isLocked) {
        this.highLightLastAdded();
        this.initializeTextarea();
        if (!this.status.isNew && this.shouldFocus) {
          this.addFocus();
        }
      }
      return false;
    });
  },
};
</script>

<template>
  <div class="ItemValue js-value" 
    v-bind:class="{'is-locked': isLocked, 'unlocked': !isLocked, 'is-removed': removed}"
    :id="`formPath-${path}`">
    <textarea class="ItemValue-input js-itemValueInput" 
      rows="1" 
      v-model="value"
      :aria-label="fieldKey | labelByLang"
      @blur="update($event.target.value)"
      @keydown.enter.prevent="handleEnter"
      v-if="!isLocked"
      ref="textarea"></textarea>
    <span class="ItemValue-text"
      v-if="isLocked && !shouldLink">{{fieldValue}}</span>
    <a class="ItemValue-text"
      v-if="isLocked && shouldLink"
      :href="fieldValue" 
      target="_blank" 
      :title="`${fieldValue} (${newWindowText})`">
        {{fieldValue}} 
        <i class="fa fa-external-link" aria-hidden="true"></i>
    </a>
    <div class="ItemValue-remover"
      v-show="!isLocked && isRemovable"
      role="button"
      :aria-label="'Remove' | translatePhrase"
      v-on:click="removeThis()"
      @focus="removeHover = true, removeHighlight($event, true)"
      @blur="removeHover = false, removeHighlight($event, false)"
      @mouseover="removeHover = true, removeHighlight($event, true)"
      @mouseout="removeHover = false, removeHighlight($event, false)">
      <i class="fa fa-trash-o icon icon--sm">
        <tooltip-component
          :show-tooltip="removeHover"
          tooltip-text="Remove"></tooltip-component>
      </i>
    </div>
  </div>
</template>

<style lang="less">

.ItemValue {
  display: flex;
  flex: 1;
  flex-shrink: 0;
  margin-left: -5px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &-input {
    width: 100%;
    display: block;
    border: 1px solid @gray-light;
    border-radius: 2px;
    padding: 2px 10px;
    resize: none;
    transition: border .25s ease-out;

    &:focus {
      border: 1px solid @gray-dark;
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
    cursor: pointer;
    color: @gray;
    min-width: 20px;
    margin-left: 5px;


    &:hover {
      color: @black;
    }
  }

  &.is-removeable {
    background-color: @danger;
  }

  &.is-lastAdded {
    background-color: @add;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: pulse;
    animation-name: pulse;
  }
}
</style>
