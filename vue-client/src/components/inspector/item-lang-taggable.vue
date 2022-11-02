<script>
import AutoSize from 'autosize';
import { cloneDeep, debounce, get } from 'lodash-es';
import ItemMixin from '@/components/mixins/item-mixin';
import LanguageMixin from '@/components/mixins/language-mixin';

export default {
  name: 'item-lang-taggable.vue',
  mixins: [ItemMixin, LanguageMixin],
  props: {
    fieldValue: {
      type: [String, Number],
      default: '',
    },
  },
  computed: {
    textFieldValue: {
      get() {
        return this.fieldValue;
      },
      set: debounce(function debounceUpdate(newValue) {
        this.update(newValue);
      }, 1000),
    },
  },
  methods: {
    readyForSave(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    transformToLanguageMap(tag, val) {
      //Make sure debounce is done
      setTimeout(() => {  this.byLangify(tag, val); }, 1000);
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(newValue) {
      const oldValue = cloneDeep(get(this.inspector.data, this.path));

      this.readyForSave(true);
      if (newValue !== oldValue) {
        console.log('newValue != oldvalue:', newValue);
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
    initializeTextarea() {
      this.$nextTick(() => {
        const textarea = this.$refs.textarea;
        AutoSize(textarea);
        AutoSize.update(textarea);
      });
    },
  },
};
</script>

<template>
  <div class="ItemTransliterable js-value">
     <span class="ItemTransliterable-list">
       <span class="ItemTransliterable-row">
     <textarea class="ItemTransliterable-input js-itemValueInput"
               rows="1"
               v-model="textFieldValue"
               :aria-label="fieldKey | labelByLang"
               @focus="readyForSave(false)"
               @blur="update($event.target.value)"
               @keydown.exact="readyForSave(false)"
               @keydown.enter.prevent="handleEnter"
               ref="textarea"></textarea>
    <div class="ItemTransliterable-transItems">
      <i class="fa fa-globe fa-fw action-button icon icon-sm ItemTransliterable-transIcon"
         tabindex="0"
         role="button"
         @click="transformToLanguageMap('uk', textFieldValue)"
         v-tooltip.top="translate('Välj språk')"
         @keyup.enter="transformToLanguageMap('uk', textFieldValue)">
          </i>
    </div>
         </span>
    </span>
  </div>
</template>

<style lang="less">
.ItemTransliterable {
  display: flex;
  flex: 1;
  position: relative;
  width: 100%;
  flex-shrink: 0;
  margin-left: -5px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &-input {
    grid-area: input;
    width: 100%;
    border: none;
    display: block;
    padding: 2px 10px;
    resize: none;
  }

  &-text {
    word-break: break-word;
    position: relative;
  }
  &-transIcon {
    grid-area: action;
   }

  &-keyvalue {
    display: flex;
    flex-direction: row;
  }

  &-transItems {
     display: flex;
     flex-direction: row;
     margin-left: 0.5rem;
   }

  &-list {
    position: relative;
    width: 100%;
  }
  &-row {
    display: grid;
    justify-items: start;
    align-items: center;
    grid-template-columns: 1fr auto;
    grid-template-areas:
    "input action";
    border: 1px solid @grey-light;
    border-radius: 2px;
    transition: border .25s ease-out;
    background: white;
    &:focus {
      border: 1px solid @grey-dark;
    }
  }
}
</style>
