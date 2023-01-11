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
        console.log('watch trigged')
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
        <language-entry
          v-model="entry.val"
          :val="entry.val"
          :tag="entry.tag"
          :is-locked="isLocked"
          :remove-is-allowed="removeIsAllowed"
          :uri="uriFor(entry.tag)"
          :label="getLabelFromCache(entry.tag)"
          :data="getDataFromCache(entry.tag)"
          :record-id="getRecordIdFromCache(entry.tag)"
          @romanize="romanize(entry.tag, entry.val)"
          @remove="remove(entry.tag, entry.val)"
          @removeval="removeVal(entry.tag, entry.val)"
          @addLangTag="setValueFromEntityAdder(...arguments, entry.val)">
          >
        </language-entry>
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


  &-text {
    word-break: break-word;
    position: relative;
  }

  &-root {
    display: inline-block;
    padding: 5px 5px 5px 0;
    width: 100%;
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

  &-popover > .trigger {
    max-width: 100%;
  }

  &-tags {
    grid-area: tags;
    justify-self: end;
  }


}
</style>
