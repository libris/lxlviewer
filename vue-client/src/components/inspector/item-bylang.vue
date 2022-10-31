<script>
import { cloneDeep, debounce, get } from 'lodash-es';
import AutoSize from 'autosize';
import ItemMixin from '@/components/mixins/item-mixin';
import LanguageMixin from '@/components/mixins/language-mixin';

export default {
  name: 'item-bylang.vue',
  mixins: [ItemMixin, LanguageMixin],
  props: {
    fieldValue: {},
    isLocked: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      entries: [],
    };
  },
  watch: {
    isLocked(val) {
      if (!val) {
        this.initializeTextarea();
      }
    },
    entries: {
      handler: debounce(function debounceUpdate(val) {
        this.update(val);
      }, 1000),
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.isLocked) {
        this.initializeTextarea();
      }
      this.viewForm();
    });
  },
  methods: {
    addFocus() {
      this.$refs.textarea.focus({ preventScroll: true }); // Prevent scroll as we will handle this ourselves
    },
    readyForSave(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(newValue) {
      const oldLangMap = cloneDeep(get(this.inspector.data, this.path));
      const newLangMap = this.dataForm(newValue);
      this.readyForSave(true);
      if (newLangMap !== oldLangMap) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.path,
              value: newLangMap,
            },
          ],
          addToHistory: true,
        });
      }
    },
    viewForm() {
      const viewForm = [];
      Object.entries(this.fieldValue).forEach(([key, value]) => {
        viewForm.push({ tag: key, val: value });
      });
      this.entries = viewForm;
    },
    dataForm(viewObjects) {
      const langMap = {};
      viewObjects.forEach((object) => {
        langMap[object.tag] = object.val;
      });
      return langMap;
    },
    async romanize(tag, val) {
      await this.transliterate(tag, val);
      this.viewForm();
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
  <div class="ItemBylang-root">
          <div class="ItemBylang-container" v-for="entry in entries">
              <span class="ItemBylang-key">
                 <textarea class="ItemBylang-input js-itemValueInput"
                           rows="1"
                           v-model="entry.val"
                           v-if="!isLocked"
                           ref="textarea">
                </textarea>
              </span>
            <span class="ItemBylang-value">
              <span class="ItemBylang-pill">
                <span class="ItemBylang-pill-label">
                  {{ mapLanguage(entry.tag) }}
                </span>
                   <span class="ItemBylang-pill-removeButton" v-if="!isLocked">
                    <i class="fa fa-times-circle icon icon--sm chip-icon"
                       v-if="!isLocked"
                       role="button"
                       tabindex="0"
                       @click="removeLanguageTag(entry.tag, entry.val)"
                       :aria-label="'Remove' | translatePhrase"
                       @keyup.enter="removeLanguageTag(entry.tag, entry.val)"
                       v-tooltip.top="translate('Remove')">
                    </i>
                  </span>
             </span>
                <i class="fa fa-language icon icon--sm ItemBylang-transIcon"
                   tabindex="0"
                   role="button"
                   :aria-label="'Romanize' | translatePhrase"
                   v-on:click="romanize(entry.tag, entry.val)"
                   v-if="!isTransSchema(entry.tag)"
                   v-tooltip.top="translate('Romanize')"
                   @keyup.enter="romanize(entry.tag, entry.val)">
            </i>
              <i class="fa fa-language icon icon--sm ItemBylang-transIcon is-disabled"
                 v-if="isTransSchema(entry.tag)"></i>
              </span>
          </div>
  </div>
</template>

<style lang="less">
.ItemBylang {
  width: 100%;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &-input {
    border: none;
    resize: none;
    transition: border .25s ease-out;
    width: 100%;
    padding: 2px 10px;

  }

  &-text {
    word-break: break-word;
    position: relative;
  }

  &-transItems {
     display: flex;
     flex-direction: row;
     margin-left: 0.5rem;
   }

  &-root {
    display: inline-block;
    padding: 5px 5px 5px 0;
    width: 100%;
  }

  &-container {
    display: grid;
    justify-items: start;
    align-items: center;
    column-gap: 5px;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto;
    grid-template-areas:
    "key value";
    border: 1px solid @grey-light;
    border-radius: 2px;
    width: 100%;
    margin-top: 7px;
    margin-bottom: 7px;
  }

  &-action {
    grid-area: action;
  }

  &-key {
    &:focus {
      border: 1px solid @grey-dark;
    }
    place-self: center stretch;
    grid-area: key;
  }

  &-value {
    grid-area: value;
    display: grid;
    justify-self: end;
    grid-template-columns: 1fr 25px;
    grid-template-rows: auto;
    align-items: center;
    grid-template-areas:
    "pill action";
  }

  &-transIcon {
    margin-left: 0.5rem;
    padding-right: 0.5rem;
  }

  &-pill {
    display: grid;
    justify-items: start;
    align-items: center;
    grid-area: pill;
    grid-template-columns: 1fr 23px;
    grid-template-areas:
    "label remove";
    border-radius: 2em;
    min-width: 20px;
    height: 22px;
    color: #196f25;
    background-color: #D9EBDC;
    font-size: 13px;

    &-label {
      font-weight: 600;
      cursor: default;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      grid-area: label;
      padding: 0 5px 0 8px
    }

    &-removeButton {
      width: 1.2em;
      height: 1.2em;
      line-height: 1.2em;
      grid-area: remove;
      padding-right: 2px;
    }
  }
}


</style>
