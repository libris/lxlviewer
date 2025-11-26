<script>
import { cloneDeep, debounce, get, isEmpty, isEqual, partition } from 'lodash-es';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import * as HttpUtil from '@/utils/http';
import ItemMixin from '@/components/mixins/item-mixin.vue';
import LanguageMixin from '@/components/mixins/language-mixin.vue';
import LanguageEntry from './language-entry.vue';

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
    isFirstField: {
      type: Boolean,
      default: false,
    },
    diff: {
      type: Object,
      default: null,
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
    isEnrichmentSource: {
      type: Boolean,
      default: true,
    }
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
    fieldOtherValue(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.updateViewForm();
      }
    },
    entries: {
      handler: debounce(function debounceUpdate(val) {
        this.update(val);
      }, 400),
      deep: true,
    },
    cache() {
      const sizeSnapshot = this.cacheSize;
      setTimeout(() => {
        if (sizeSnapshot === this.cacheSize && !this.isHistoryView()) {
          this.entries = this.sortByTags(this.entries);
        }
      }, 200);
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
      return this.diff.removed.some((r) => isEqual(r.path, this.path));
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
    cacheSize() {
      return Object.keys(this.cache).length;
    },
    uiLanguageTags() {
      return [...this.settings.availableUserSettings.languages].map((lang) => lang.value);
    },
    currentUiLanguage() {
      return this.settings.language;
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
                const label = DisplayUtil.getItemLabel(
                  data,
                  this.resources,
                  this.inspector.data.quoted,
                  this.settings,
                );
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
      this.updateViewForm();
    },
    addLangTag(tag, val) {
      // Make sure debounce is done
      setTimeout(() => {
        this.toLangMap(tag, val);
        this.updateLangCache(tag);
      }, 400);
    },
    readyForSave(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'readyForSave', value: value });
    },
    handleEnter(e) {
      e.target.blur();
      return false;
    },
    update(viewObjects) {
      if (this.isHistoryView() || this.isLocked) {
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
      if (this.path.includes('ByLang')) {
        return;
      }
      const newData = this.dataForm(viewObjects);
      const oldData = cloneDeep(get(this.inspector.data, this.path));
      if (!isEqual(oldData, newData)) {
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
            [].concat(value).forEach((v) => {
              viewForm.push({ tag: key, val: v, id: `${key}-${idCounter}` });
              idCounter++;
            });
          }
        });
      } else if (typeof fieldValue === 'object') {
        Object.entries(fieldValue).forEach(([key, value]) => {
          [].concat(value).forEach((v) => {
            viewForm.push({ tag: key, val: v, id: `${key}-${idCounter}` });
            idCounter++;
          });
        });
      }
      this.entries = this.isHistoryView() ? viewForm : this.sortByTags(viewForm);
    },
    sortByTags(entries) {
      const untagged = entries.filter((entry) => entry.tag === 'none');
      if (entries.length === untagged.length) {
        return entries;
      }

      const transformedTagged = entries.filter((entry) => entry.tag.includes('-t-'));
      const otherTagged = entries.filter((entry) => !entry.tag.includes('-t-') && entry.tag !== 'none');
      const [uiLangs, other] = partition(otherTagged, (entry) => this.uiLanguageTags.includes(entry.tag));

      const compare = (a, b) => {
        const labelA = this.getLabelFromCache(a.tag);
        const labelB = this.getLabelFromCache(b.tag);
        if (labelA < labelB) {
          return -1;
        }
        if (labelB < labelA) {
          return 1;
        }
        return 0;
      };

      uiLangs.sort(compare);
      transformedTagged.sort(compare);
      other.sort(compare);
      untagged.sort(compare);

      uiLangs.sort((a, b) => {
        if (a.tag === this.currentUiLanguage) {
          return -1;
        }
        if (b.tag === this.currentUiLanguage) {
          return 1;
        }
        return 0;
      });

      return [...transformedTagged, ...uiLangs, ...other, ...untagged];
    },
    dataFormByLang(viewObjects) {
      const langMap = {};
      viewObjects.forEach((object) => {
        if (object.tag !== 'none') {
          if (langMap.hasOwnProperty(object.tag)) {
            langMap[object.tag] = [].concat(langMap[object.tag], object.val);
          } else {
            langMap[object.tag] = object.val;
          }
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
            this.addToLangMap(tag, result);
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
        :tag="entry.tag"
        :id="entry.id"
        :is-locked="isLocked"
        :is-first-field="isFirstField"
        :remove-is-allowed="removeIsAllowed"
        :uri="uriFor(entry.tag)"
        :label="getLabelFromCache(entry.tag)"
        :data="getDataFromCache(entry.tag)"
        :record-id="getRecordIdFromCache(entry.tag)"
        :diff="diff"
        :item-path="getParentPath()"
        :is-expanded="isExpanded"
        :is-enrichment-source="isEnrichmentSource"
        @romanize="romanize(entry.tag, entry.val)"
        @remove="remove(entry.tag, entry.val)"
        @removeval="removeVal(entry.tag, entry.val)"
        @addLangTag="(tag) => setValueFromEntityAdder(tag, entry.val)"
        @addToCache="updateLangCache(entry.tag)"
        @update="update(entries)" />
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
    width: 100%;
  }

  &-popover > .trigger {
    max-width: 100%;
  }
}
</style>
