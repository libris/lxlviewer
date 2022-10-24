<script>
import ItemMixin from '@/components/mixins/item-mixin';
import LanguageMixin from '@/components/mixins/language-mixin';
import {cloneDeep, debounce, get} from "lodash-es";
import AutoSize from "autosize";

export default {
  name: "item-transliterable.vue",
  mixins: [ItemMixin, LanguageMixin],
  props: {
    fieldValue: {
      type: [String, Number],
      default: '',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    byLangify: {
      type: Boolean,
      default: true,
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
      sourceValue: '',
    }
  },
  computed: {
    textFieldValue: {
      get() {
        return this.fieldValue;
      },
      set: debounce(function debounceUpdate(newValue) {
        this.sourceValue = newValue;
        this.update(newValue);
      }, 1000),
    },
    langCodes() {
      //  First need to get available language codes
      //  We can mock this to start with
      //  get these via find API later (id.kb.se yadayada find?type=LanguageForm&_limit=2000)
      return ['uk', 'kk'];
    },
  },
  methods: {
    romanize(source) {
      this.transliterate(source);
    },
    readyForSave(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(newValue) {
      const oldValue = cloneDeep(get(this.inspector.data, this.path));

      this.readyForSave(true);
      if (newValue !== oldValue) {
        console.log('newValue != oldvalue:', newValue)
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
  }
}
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
               v-if="!isLocked"
               ref="textarea"></textarea>
    <div class="ItemTransliterable-transItems">
      <i class="fa fa-language fa-fw action-button icon icon--sm ItemTransliterable-transIcon"
         tabindex="0"
         role="button"
         :aria-label="'Romanize' | translatePhrase"
         v-on:click="romanize(sourceValue)"
         v-tooltip.top="translate('Romanize')"
         @keyup.enter="romanize(sourceValue)">
      </i>
      <span class="ItemTransliterable-langLabel"
            tabindex="0"
            role="button"
            v-tooltip.top="translate('Byt språk för romanisering från: ukrainska')">
            {{ langCodes[0] }}
          </span>
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
    width: 100%;
    display: block;
    border: 1px solid @grey-light;
    border-radius: 2px;
    padding: 2px 10px;
    margin-bottom: 7px;

    resize: none;
    transition: border .25s ease-out;

    &:focus {
      border: 1px solid @grey-dark;
    }
  }

  &-text {
    word-break: break-word;
    position: relative;
  }
  &-transIcon {
   //position: relative;
   //top: 0.9rem;
     padding: 0.7rem 0.5rem 0.5rem 0;
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

  &-transliterated {

  }

  &-list {
    position: relative;
    width: 100%;
  }
  &-row {
    display: flex;
    flex-direction: row;
  }

  &-langLabel {
    color: @text-brand-env;
    font-weight: bold;
    float: right;
    font-size: 0.8em;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  }
}

</style>
