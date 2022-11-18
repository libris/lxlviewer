<script>
import {cloneDeep, debounce, get, isArray, isEmpty, isEqual} from 'lodash-es';
import AutoSize from 'autosize';
import ItemMixin from '@/components/mixins/item-mixin';
import LanguageMixin from '@/components/mixins/language-mixin';
import * as VocabUtil from "lxljs/vocab";
import EntityAdder from "./entity-adder";

export default {
  name: 'item-bylang.vue',
  mixins: [ItemMixin, LanguageMixin],
  props: {
    fieldValue: {
      type: [Object, String, Array],
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    'entity-adder': EntityAdder,
  },
  data() {
    return {
      entries: [],
      manualUpdate : false,
    };
  },
  watch: {
    isLocked(val) {
      if (!val) {
        this.initializeTextarea();
      }
    },
    fieldValue(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.updateViewForm();
      }
    },
    fieldOtherValue(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.updateViewForm();
      }
    },
    entries: {
      handler: debounce(function debounceUpdate(val) {
        if (this.manualUpdate) {
          this.update(val);
        } else {
          this.manualUpdate = true;
        }
      }, 1000),
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.isLocked) {
        this.initializeTextarea();
      }
      this.updateViewForm();
    });
  },
  computed: {
    fieldOtherValue() {
      if (this.isLangMap) {
        return this.prop;
      } else {
        return this.propByLang;
      }
    },
    isRepeatable() {
      return VocabUtil.propIsRepeatable(this.getPropKey(), this.resources.context);
    },
    removeIsAllowed() {
      return this.isRepeatable || !this.hasProp;
    }
  },
  methods: {
    setValueFromEntityAdder(fieldValue, eventArg) {
      let tag = eventArg.split('/').pop();
      this.addLangTag(tag.slice(0, -1), fieldValue);
    },
    addLangTag(tag, val) {
      //Make sure debounce is done
      setTimeout(async () => {
        this.manualUpdate = false;
        await this.toLangMap(tag, val);
        this.updateViewForm();
      }, 1000);
    },
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
    update(viewObjects) {
      // Update propByLang
      const byLangPath = this.getByLangPath();
      const oldLangMap = cloneDeep(get(this.inspector.data, byLangPath));
      const newLangMap = this.dataFormByLang(viewObjects);
      this.readyForSave(true);
      if (!isEqual(newLangMap,  oldLangMap)) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: byLangPath,
              value: newLangMap,
            },
          ],
          addToHistory: true,
        });
      }
      // Update prop
      const newData = this.dataForm(viewObjects);
      const oldData = cloneDeep(get(this.inspector.data, this.path));
      if (!isEqual(oldData,  newData) && !isEmpty(newData)) {
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.path,
              value: newData,
            },
          ],
          addToHistory: true,
        });
      }
    },
    updateViewForm() {
      let viewForm = [];
      this.fieldValue.forEach(value => {
        if (typeof value === 'string') {
          viewForm.push({tag: 'none', val: value});
        }
      })
      let fieldValue = this.fieldValue[0];
      if (typeof fieldValue === 'string') {
        Object.entries(this.propByLang).forEach(([key, value]) => {
          viewForm.push({tag: key, val: value});
        });
      } else if (typeof fieldValue === 'object') {
        Object.entries(fieldValue).forEach(([key, value]) => {
          viewForm.push({tag: key, val: value});
        });
      }

      this.entries = viewForm;
    },
    dataFormByLang(viewObjects) {
      const langMap = {};
      viewObjects.forEach((object) => {
        if (object.tag !== 'none') {
          langMap[object.tag] = object.val;
        }
      });
      return langMap;
    },
    dataForm(viewObjects) {
      const dataObjects = [];
      viewObjects.forEach((object) => {
        if (object.tag === 'none') {
          dataObjects.push(object.val);
        }
      });
      if (dataObjects.length === 1 && !this.isRepeatable) {
        return dataObjects.pop();
      } else {
        return dataObjects;
      }
    },
    async romanize(tag, val) {
      await this.transliterate(tag, val);
      this.manualUpdate = false;
      // this.updateViewForm();
    },
    async remove(tag, val) {
      await this.removeLanguageTag(tag, val);
      this.manualUpdate = false;
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
    <div class="ItemBylang-inputcontainer"
         v-for="entry in entries"
         v-if="!isLocked">
      <span class="ItemBylang-key">
        <textarea class="ItemBylang-input js-itemValueInput"
                  rows="1"
                  v-model="entry.val"
                  ref="textarea">
        </textarea>
      </span>
      <span class="ItemBylang-value">
        <span class="ItemBylang-pill"
        v-if="entry.tag !== 'none'">
          <span class="ItemBylang-pill-label">
            {{ mapLanguage(entry.tag) }}
          </span>
          <span class="ItemBylang-pill-removeButton" v-if="!isLocked">
            <i class="fa fa-times-circle icon icon--sm chip-icon"
               v-if="!isLocked && removeIsAllowed"
               role="button"
               tabindex="0"
               @click="remove(entry.tag, entry.val)"
               :aria-label="'Remove' | translatePhrase"
               @keyup.enter="remove(entry.tag, entry.val)"
               v-tooltip.top="translate('Remove')">
            </i>
            <i class="fa fa-times-circle icon icon--sm chip-icon is-disabled"
               v-if="!isLocked && !removeIsAllowed"></i>
          </span>
        </span>
        <i class="fa fa-language icon icon--sm ItemBylang-transIcon"
           tabindex="0"
           role="button"
           :aria-label="'Romanize' | translatePhrase"
           v-on:click="romanize(entry.tag, entry.val)"
           v-if="!isTransSchema(entry.tag) && entry.tag !== 'none'"
           v-tooltip.top="translate('Romanize')"
           @keyup.enter="romanize(entry.tag, entry.val)">
        </i>
         <i class="fa fa-language icon icon--sm ItemBylang-transIcon is-disabled"
            v-if="isTransSchema(entry.tag)">
         </i>
        <entity-adder class="Field-entityAdder ItemBylang-action"
                      ref="entityAdder"
                      v-if="entry.tag === 'none'"
                      :field-key="fieldKey"
                      :path="path"
                      :allow-local="false"
                      :all-search-types="['Language']"
                      :range="['Language']"
                      :range-full="['Language']"
                      :property-types="['ObjectProperty']"
                      :is-lang-tagger="true"
                      :icon-add="'fa-globe'"
                      @langTaggerEvent="setValueFromEntityAdder(entry.val, ...arguments)">
      </entity-adder>
      </span>
    </div>
    <div class="ItemBylang-textcontainer"
         v-for="entry in entries"
         v-if="isLocked">
      <div class="ItemBylang-key">
        <div class="ItemBylang-text">
          {{ entry.val }}
        </div>
      </div>
      <span class="ItemBylang-tags">
        <span class="ItemBylang-pill"
        v-if="entry.tag !== 'none'">
          <span class="ItemBylang-pill-label">
            {{ mapLanguage(entry.tag) }}
          </span>
        </span>
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

  &-inputcontainer {
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
    background: white;
  }

  &-textcontainer {
    display: grid;
    justify-items: start;
    align-items: center;
    column-gap: 5px;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto;
    grid-template-areas:
    "key tags";
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

  &-tags {
    grid-area: tags;
    justify-self: end;
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
    grid-template-columns: 1fr auto;
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
      text-overflow: ellipsis;
      grid-area: label;
      padding: 0 8px 0 8px
    }

    &-removeButton {
      width: 1.2em;
      height: 1.2em;
      line-height: 1.2em;
      grid-area: remove;
      padding-right: 20px;
    }
  }
}
</style>
