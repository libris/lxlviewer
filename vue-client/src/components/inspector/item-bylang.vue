<script>
import { cloneDeep, debounce, get, isEmpty, isEqual } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import ItemMixin from '@/components/mixins/item-mixin';
import LanguageMixin from '@/components/mixins/language-mixin';
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
      default: null,
    },
  },
  components: {
    'language-entry': LanguageEntry,
  },
  data() {
    return {
      entries: [],
    };
  },
  watch: {
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
      this.updateViewForm();
    });
  },
  computed: {
    fieldOtherValue() {
      if (this.isLangMap) {
        return this.prop;
      } 
      return this.propByLang;
    },
    diffRemoved() {
      if (this.diff == null) return false;
      return this.diff.removed.some(r => isEqual(r.path, this.path));
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
    getParentPath() {
      return this.parentPath;
    },
    updateLangCache(tag) {
      if (!this.cache[tag]) {
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
    setValueFromEntityAdder(langTag, fieldValue) {
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
          viewForm.push({ tag: 'none', val: value, id: `none-${idCounter}` }); // idCounter <=> index in item-mixin.vue
          idCounter++;
        }
      });
      const fieldValue = this.fieldValue[0];
      if (typeof fieldValue === 'string') {
        Object.entries(this.propByLang).forEach(([key, value]) => {
          if (!this.isHistoryView()) {
            viewForm.push({ tag: key, val: value, id: `${key}-${idCounter}` });
          }
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
  },
};
</script>

<template>
  <div class="ItemBylang-root">
    <div v-for="entry in entries" :key="entry.id">
      <language-entry
        v-model="entry.val"
        :val="entry.val"
        :tag="entry.tag"
        :id="entry.id"
        :is-locked="isLocked"
        :remove-is-allowed="removeIsAllowed"
        :uri="uriFor(entry.tag)"
        :label="getLabelFromCache(entry.tag)"
        :data="getDataFromCache(entry.tag)"
        :record-id="getRecordIdFromCache(entry.tag)"
        :diff="diff"
        :item-path="getParentPath()"
        @romanize="romanize(entry.tag, entry.val)"
        @remove="remove(entry.tag, entry.val)"
        @removeval="removeVal(entry.tag, entry.val)"
        @addLangTag="setValueFromEntityAdder(...arguments, entry.val)"
        @addToCache="updateLangCache(entry.tag)">
      </language-entry>
    </div>
  </div>
</template>

<style lang="less">
.ItemBylang {
  width: 100%;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &-root {
    display: inline-block;
    padding-right: 5px;
    width: 100%;
  }

  &-popover > .trigger {
    max-width: 100%;
  }
}
</style>
