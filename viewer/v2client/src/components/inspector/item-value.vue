<script>
import AutoSize from 'autosize';
import * as _ from 'lodash';
import * as httpUtil from '../../utils/http';
import * as VocabUtil from '../../utils/vocab';
import * as DisplayUtil from '../../utils/display';
import * as DataUtil from '../../utils/data';
import * as StringUtil from '@/utils/string';
import ProcessedLabel from '../shared/processedlabel';
import TooltipComponent from '../shared/tooltip-component';
import ItemMixin from '../mixins/item-mixin';
import LensMixin from '../mixins/lens-mixin';
import { mapGetters } from 'vuex';

export default {
  name: 'item-value',
  mixins: [ItemMixin, LensMixin],
  props: {
    fieldValue: '',
    fieldKey: '',
    index: Number,
    isUriType: false,
    isLocked: false,
    isRemovable: false,
    showActionButtons: false,
    isExpanded: false,
    parentPath: false,
    gparentPath: false,
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
        if (!_.isArray(this.fieldValue)) {
          valueArray = [this.fieldValue];
        }
        return valueArray;
      },
      set: _.debounce(function(newValue) {
        this.update(newValue);
      }, 1000)
    },
    shouldLink() {
      return this.isUriType && this.fieldValue.startsWith('http');
    },
    newWindowText() {
      return StringUtil.getUiPhraseByLang('Opens in new window', this.user.settings.language);
    },
    shouldFocus() {
      let lastAdded = this.inspector.status.lastAdded;
      if (lastAdded === this.path || lastAdded === this.parentPath || lastAdded === this.gparentPath) {
        return true;
      }
      return false;
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.isLocked) {
        this.initializeTextarea();
        if (!this.status.isNew && this.shouldFocus) {
          this.addFocus();
        }
      }
    });
  },
  methods: {
    removeHighlight(active) {
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
      }
    },
    initializeTextarea() {
      this.$nextTick(() => {
        let textarea = this.$el.querySelector('textarea');
        AutoSize(textarea);
        AutoSize.update(textarea);
      })
    },
    isEmpty() {
      // TODO: Is the item empty?
      return false;
    },
    addFocus() {
      this.$refs.textarea.focus();
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'tooltip-component': TooltipComponent,
  },
};
</script>

<template>
  <div class="ItemValue js-value" v-bind:class="{'is-locked': isLocked, 'unlocked': !isLocked, 'is-removed': removed}">
    <textarea class="ItemValue-input js-itemValueInput"
      rows="1"
      v-model="value"
      @blur="update($event.target.value)"
      @keydown="handleKeys"
      v-if="!isLocked"
      ref="textarea"></textarea>
    <span class="ItemValue-text"
      v-if="isLocked && !shouldLink">{{fieldValue}}</span>
    <a class="ItemValue-text"
      v-if="isLocked && shouldLink"
      :href="fieldValue" target="_blank" :title="`${fieldValue} (${newWindowText})`">{{fieldValue}} <i class="fa fa-external-link" aria-hidden="true"></i></a>
    <div class="ItemValue-remover"
      v-show="!isLocked && isRemovable"
      v-on:click="removeThis()"
      @focus="removeHover = true, removeHighlight(true)"
      @blur="removeHover = false, removeHighlight(false)"
      @mouseover="removeHover = true, removeHighlight(true)"
      @mouseout="removeHover = false, removeHighlight(false)">
      <i class="fa fa-trash-o icon icon--sm">
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

  .is-lastAdded & {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-name: pulse;
    animation-name: pulse;
  }
}

</style>
