<script>
import { cloneDeep, debounce, get, isEmpty, isEqual } from 'lodash-es';
import AutoSize from 'autosize';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import ItemMixin from '@/components/mixins/item-mixin';
import LanguageMixin from '@/components/mixins/language-mixin';
import EntityAdder from './entity-adder';
import * as HttpUtil from '../../utils/http';
import LanguageEntry from './language-entry';

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
    diff: {
      type: Object,
      default: null
    }
  },
  components: {
    'language-entry': LanguageEntry,
    'entity-adder': EntityAdder,
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
    fieldValue(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.updateViewForm();
      }
    },
    fieldOtherValue() {
      this.updateViewForm();
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
      this.updateViewForm();
      this.updateLangCache('');
    });
  },
  computed: {
    fieldOtherValue() {
      if (this.isLangMap) {
        return this.prop;
      } 
      return this.propByLang;
    },
    isRepeatable() {
      return VocabUtil.propIsRepeatable(this.getPropKey(), this.resources.context);
    },
    removeIsAllowed() {
      return this.isRepeatable || !this.hasProp;
    },
    cache() {
      return this.inspector.languageCache;
    },
  },
  methods: {
    isHistoryView() {
      return this.diff !== null;
    },
    updateLangCache(langTag) {
      const updateFrom = langTag === '' ? Object.keys(this.propByLang) : [langTag];
      for (const tag of updateFrom) {
        HttpUtil.getDocument(`${this.settings.idPath}/i18n/lang/${tag}`, 'application/ld+json', false).then((result) => {
          const allData = result.data;
          if (allData) {
            const graph = allData['@graph'];
            const id = graph[0]['@id'];
            HttpUtil.getDocument(`${id}/data.jsonld?lens=card`).then((res) => {
              const data = res.data;
              if (data) {
                const label = DisplayUtil.getItemLabel(data,
                  this.resources,
                  this.inspector.data.quoted,
                  this.settings);
                const obj = {};
                obj[tag] = { label: label, data: graph[1], recordId: id };
                this.$store.dispatch('addToLanguageCache', obj);
              } else {
                console.log('Missing i18n/lang/tag for', tag);
              }
            });
          }
        });
      }
    },
    setValueFromEntityAdder(fieldValue, langTag) {
      this.addLangTag(langTag, fieldValue);
    },
    addLangTag(tag, val) {
      // Make sure debounce is done
      setTimeout(() => {
        this.toLangMap(tag, val);
        this.updateLangCache(tag);
      }, 1000);
    },
    readyForSave(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(viewObjects) {
      if (this.isHistoryView()) {
        return;
      }

      // Update propByLang
      const byLangPath = this.getByLangPath();
      const oldLangMap = cloneDeep(get(this.inspector.data, byLangPath));
      const newLangMap = this.dataFormByLang(viewObjects);
      this.readyForSave(true);
      if (!isEqual(newLangMap, oldLangMap) && !isEmpty(newLangMap)) {
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
      if (!isEqual(oldData, newData) && !isEmpty(newData)) {
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
      const viewForm = [];
      let idCounter = 0;
      this.fieldValue.forEach((value) => {
        if (typeof value === 'string') {
          viewForm.push({ tag: 'none', val: value, id: `none-${idCounter}` });
          idCounter++;
        }
      });
      const fieldValue = this.fieldValue[0];
      if (typeof fieldValue === 'string') {
        Object.entries(this.propByLang).forEach(([key, value]) => {
          viewForm.push({ tag: key, val: value, id: `${key}-${idCounter}` });
          idCounter++;
        });
      } else if (typeof fieldValue === 'object') {
        Object.entries(fieldValue).forEach(([key, value]) => {
          viewForm.push({ tag: key, val: value, id: `${key}-${idCounter}` });
          idCounter++;
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
      } 
      return dataObjects;
    },
    romanize(langTag, val) {
      // Make sure debounce is done
      setTimeout(() => {
        this.transliterate(langTag, val).then((result) => {
          for (const tag of Object.keys(result)) {
            this.addToLangMap(result);
            this.updateLangCache(tag);
          }
          this.updateViewForm();
        });
      }, 1000);
    },
    remove(tag, val) {
      this.removeLanguageTag(tag, val);
    },
    removeVal(tag, val) {
      this.removeValue(tag, val);
    },
    uriFor(tag) {
      return `${this.settings.idPath}/i18n/lang/${tag}`;
    },
    getDataFromCache(tag) {
      const languageCache = this.cache;
      return languageCache[tag] ? languageCache[tag].data : null;
    },
    getLabelFromCache(tag) {
      const languageCache = this.cache;
      return languageCache[tag] ? languageCache[tag].label : tag;
    },
    getRecordIdFromCache(tag) {
      const languageCache = this.cache;
      return languageCache[tag] ? languageCache[tag].recordId : '';
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
    <div v-if="!isLocked">
      <div v-for="entry in entries" :key="entry.id">
        <div class="ItemBylang-inputcontainer">
          <span class="ItemBylang-key">
            <textarea class="ItemBylang-input js-itemValueInput"
              rows="1"
              v-model="entry.val">
            </textarea>
          </span>
          <span class="ItemBylang-value">
            <language-entry v-if="entry.tag !== 'none'"
              :tag="entry.tag"
              :is-locked="isLocked"
              :remove-is-allowed="removeIsAllowed"
              :uri="uriFor(entry.tag)"
              :label="getLabelFromCache(entry.tag)"
              :data="getDataFromCache(entry.tag)"
              :record-id="getRecordIdFromCache(entry.tag)"
              @remove="remove(entry.tag, entry.val)">
            </language-entry>
            <span class="ItemBylang-actions">
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
              <span class="ItemBylang-remover"
                tabindex="0"
                v-show="!isLocked"
                role="button"
                :aria-label="'Remove' | translatePhrase"
                v-on:click="removeVal(entry.tag, entry.val)"
                @keyup.enter="removeVal(entry.tag, entry.val)"
                v-tooltip.top="translate('Remove')">
                <i class="fa fa-trash-o icon icon--sm"></i>
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
    <div v-if="isLocked">
      <div class="ItemBylang-textcontainer"
           v-for="entry in entries" :key="entry.id">
        <div class="ItemBylang-key">
          <div class="ItemBylang-text">
            {{ entry.val }}
          </div>
        </div>
        <span class="ItemBylang-tags">
          <language-entry v-if="entry.tag !== 'none'"
            :tag="entry.tag"
            :is-locked="isLocked"
            :uri="uriFor(entry.tag)"
            :label="getLabelFromCache(entry.tag)"
            :data="getDataFromCache(entry.tag)"
            :record-id="getRecordIdFromCache(entry.tag)">
          </language-entry>
        </span>
      </div>
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
    &:focus-within {
      border: 1px solid @grey-dark;
    }
  }

  &-textcontainer {
    display: grid;
    justify-items: start;
    align-items: center;
    column-gap: 5px;
    grid-template-columns: 3fr 1fr;
    grid-template-rows: auto;
    grid-template-areas:
    "key tags";
    width: 100%;
    margin-top: 7px;
    margin-bottom: 7px;
  }

  &-actions {
    grid-area: actions;
    align-items: center;
    column-gap: 5px;
    display: grid;
    grid-template-areas:
    "action remover";
    margin-right: 1rem;


    &-action {
      grid-area: action;
      margin-left: 1rem;
    }
    &-remover {
      grid-area: remover;
      margin-left: 1rem;
    }
  }

  &-key {
    place-self: center stretch;
    grid-area: key;
  }

  &-value {
    grid-area: value;
    display: grid;
    justify-self: end;
    column-gap: 5px;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto;
    align-items: center;
    grid-template-areas:
    "pill actions";
  }

  &-popover > .trigger {
    max-width: 100%;
  }

  &-tags {
    grid-area: tags;
    justify-self: end;
  }

  &-transIcon {
    grid-area: action;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}
</style>
