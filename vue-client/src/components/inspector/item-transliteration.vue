<script>
import * as httpUtil from "../../utils/http";
import ItemMixin from '@/components/mixins/item-mixin';
import {cloneDeep, debounce, get, isArray} from "lodash-es";
import AutoSize from "autosize";

export default {
  name: "item-transliteration.vue",
  mixins: [ItemMixin],
  props: {
    fieldValue: {
      type: [String, Number],
      default: '',
    },
    isLocked: {
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
    readyForSave(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(newValue) {
      console.log('newValue', newValue);
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
    async requestTransliteration(sourceObj) {
      let trans;
      trans = httpUtil.post({
        url: `${this.settings.apiPath}/_transliterate`,
        token: this.user.token
      }, sourceObj)
        .then((result) => {
          console.log('result', result);
          return result;
        });
      return trans;
    },
    async transliterate() {
      const lastIndex = this.path.lastIndexOf('.')
      const lastProperty = this.parentPath.slice(lastIndex + 1);
      const parentsParent = this.parentPath.slice(0, lastIndex);
      let parentsParentValue = get(this.inspector.data, parentsParent);
      console.log('parentsParentValue', JSON.stringify(parentsParentValue));
      const byLangified = lastProperty.concat('ByLang');
      const langCode = "uk";
      const source = this.sourceValue;
      let result = await this.requestTransliteration({"langTag": langCode, "source": source});
      console.log(JSON.stringify({langCode, source}));
      parentsParentValue[byLangified] =  Object.assign({"uk": this.sourceValue}, result);

      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: parentsParent,
            value: parentsParentValue,
          },
        ],
        addToHistory: true,
      })
    },
  }

}
</script>

<template>
  <div class="ItemTransliteration js-value">
     <textarea class="ItemTransliteration-input js-itemValueInput"
               rows="1"
               v-model="textFieldValue"
               :aria-label="fieldKey | labelByLang"
               @focus="readyForSave(false)"
               @blur="update($event.target.value)"
               @keydown.exact="readyForSave(false)"
               @keydown.enter.prevent="handleEnter"
               v-if="!isLocked"
               ref="textarea"></textarea>
    <span class="ItemTransliteration-text"
          v-if="isLocked">{{fieldValue}}</span>
    <div class="ItemTransliteration-transItems">
      <i class="fa fa-language fa-fw action-button icon icon--sm ItemTransliteration-transIcon"
         tabindex="0"
         role="button"
         :aria-label="'Romanize' | translatePhrase"
         v-on:click="transliterate"
         v-tooltip.top="translate('Romanize')"
         @keyup.enter="transliterate">
      </i>
      <span class="ItemTransliteration-langLabel"
            tabindex="0"
            role="button"
            v-tooltip.top="translate('Byt språk för romanisering från: ukrainska')">
            {{ langCodes[0] }}
          </span>
    </div>
  </div>
</template>

<style lang="less">
.ItemTransliteration {
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
    border: 1px solid @grey-light;
    border-radius: 2px;
    padding: 2px 10px;
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

  &-transItems {
     display: flex;
     flex-direction: row;
     margin-left: 0.5rem;
   }

  &-langLabel {
    color: @text-brand-env;
    font-weight: bold;
    float: right;
    //position: relative;
    font-size: 0.8em;
    padding: 0.5rem 0.5rem 0.5rem 0;
  }
}

</style>
