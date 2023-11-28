<script>
import { mapGetters } from 'vuex';
import { cloneDeep, get, isEmpty, isObject } from 'lodash-es';
import { getContextValue } from 'lxljs/vocab';
import * as VocabUtil from 'lxljs/vocab';
import * as httpUtil from '@/utils/http';

export default {
  props: {
    parentPath: {
      type: String,
      default: '',
    },
    fieldKey: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      sourceValue: '',
    };
  },
  computed: {
    ...mapGetters([
      'supportedTags',
    ]),
    path() {
      return `${this.parentPath}`;
    },
    deLangifiedPath() {
      return this.path.substring(0, this.path.indexOf('ByLang'));
    },
    prop() {
      const prop = get(this.inspector.data, this.getPropPath());
      if (typeof prop === 'undefined') {
        return this.isRepeatable ? [] : '';
      }
      return prop;
    },
    byLangifiedPath() {
      return this.path.concat('ByLang');
    },
    propByLang() {
      const langMap = get(this.inspector.data, this.getByLangPath());
      return typeof langMap !== 'undefined' ? langMap : {};
    },
    isRepeatable() {
      return VocabUtil.propIsRepeatable(this.getPropKey(), this.resources.context);
    },
    isRepeatableOrArray() {
      return this.isRepeatable || Array.isArray(this.prop);
    },
    isLangMap() {
      return getContextValue(this.fieldKey, '@container', this.resources.context) === '@language';
    },
    hasProp() {
      return typeof get(this.inspector.data, this.propPath) !== 'undefined';
    },
    propPath() {
      return this.isLangMap ? this.deLangifiedPath : this.path;
    },
    hasByLang() {
      return !isEmpty(this.propByLang);
    },
  },
  methods: {
    getByLangKey() {
      return this.isLangMap ? this.fieldKey : this.fieldKey.concat('ByLang');
    },
    getPropKey() {
      return this.isLangMap ? this.fieldKey.substring(0, this.fieldKey.indexOf('ByLang')) : this.fieldKey;
    },
    getByLangPath() {
      return this.isLangMap ? this.path : this.byLangifiedPath;
    },
    getPropPath() {
      return this.isLangMap ? this.deLangifiedPath : this.path;
    },
    requestTransliteration(sourceObj) {
      return httpUtil.post({
        url: `${this.settings.apiPath}/_transliterate`,
        token: this.user.token,
      }, sourceObj)
        .then((result) => result);
    },
    removeLanguageTag(tag, value) {
      const languageMap = this.propByLang;
      let updatePath = this.getByLangPath();
      let updateValue = languageMap;
      let taggedValue = languageMap[tag];
      if (Array.isArray(taggedValue)) {
        taggedValue = taggedValue.splice(taggedValue.indexOf(value), 1);
      } else {
        delete languageMap[tag];
      }
      const delangify = isEmpty(languageMap);
      if (delangify) { // De-langify
        const lastIndex = this.path.lastIndexOf('.');
        const parentPath = this.path.slice(0, lastIndex);
        const parentValue = cloneDeep(get(this.inspector.data, parentPath));
        let updatedProp;
        if (this.isRepeatable) {
          updatedProp = this.prop;
          updatedProp.push(taggedValue);
        } else {
          updatedProp = value;
        }
        parentValue[this.getPropKey()] = updatedProp;
        delete parentValue[this.getByLangKey()];
        updatePath = parentPath;
        updateValue = parentValue;
      }
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: updatePath,
            value: updateValue,
          },
        ],
        addToHistory: true,
      });
      if (!delangify) {
        let updateProp = taggedValue;
        if (this.isRepeatable) {
          updateProp = [].concat(this.prop, taggedValue);
        }
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.getPropPath(),
              value: updateProp,
            },
          ],
          addToHistory: true,
        });
      }
    },
    removeValue(tag, value) {
      let updateValue;
      let updatePath;
      if (tag !== 'none') {
        const languageMap = this.propByLang;
        let taggedValue = languageMap[tag];
        if (Array.isArray(taggedValue)) {
          taggedValue = taggedValue.splice(taggedValue.indexOf(value), 1);
        } else {
          delete languageMap[tag];
        }
        updateValue = languageMap;
        updatePath = this.getByLangPath();
        if (isEmpty(languageMap)) {
          const lastIndex = this.path.lastIndexOf('.');
          const parentPath = this.path.slice(0, lastIndex);
          const parentValue = cloneDeep(get(this.inspector.data, parentPath));
          delete parentValue[this.getByLangKey()];
          updatePath = parentPath;
          updateValue = parentValue;
        }
      } else {
        // isRepeatableOrArray is used to allow for removal of properties that are not allowed to have
        // multiple values but still do, e.g. after uploading a bad JSON-LD file.
        if (this.isRepeatableOrArray) {
          updateValue = this.prop;
          updatePath = this.getPropPath();
          updateValue.splice(updateValue.indexOf(value), 1);
        }
        if (isEmpty(updateValue) || !this.isRepeatableOrArray) {
          const lastIndex = this.path.lastIndexOf('.');
          const parentPath = this.path.slice(0, lastIndex);
          const parentValue = cloneDeep(get(this.inspector.data, parentPath));
          delete parentValue[this.getPropKey()];
          updateValue = parentValue;
          updatePath = parentPath;
        }
      }

      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: updatePath,
            value: updateValue,
          },
        ],
        addToHistory: true,
      });
    },
    toLangMap(tag, sourceValue) {
      const lastIndex = this.path.lastIndexOf('.');
      const parentsPath = this.path.slice(0, lastIndex);
      const parent = cloneDeep(get(this.inspector.data, parentsPath));
      if (Array.isArray(this.prop)) {
        const prop = parent[this.getPropKey()];
        prop.splice(this.prop.indexOf(sourceValue), 1);
        if (isEmpty(prop)) {
          delete parent[this.getPropKey()];
        }
      } else {
        delete parent[this.getPropKey()];
      }
      // Commit removal
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: parentsPath,
            value: parent,
          },
        ],
        addToHistory: true,
      });
      let updateValue;
      let updatePath;
      if (this.hasByLang) {
        updatePath = this.getByLangPath();
        if (this.propByLang.hasOwnProperty(tag) && this.isRepeatable) {
          updateValue = Object.assign(this.propByLang, { [tag]: [].concat(this.propByLang[tag], sourceValue) });
        } else {
          updateValue = Object.assign(this.propByLang, { [tag]: sourceValue });
        }
      } else {
        parent[this.getByLangKey()] = { [tag]: sourceValue };
        updateValue = parent;
        updatePath = parentsPath;
      }
      // Commit additions
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: updatePath,
            value: updateValue,
          },
        ],
        addToHistory: true,
      });
    },
    transliterate(tag, sourceValue) {
      return this.requestTransliteration({ langTag: tag, source: sourceValue }).then((res) => {
        if (isObject(res)) {
          return Object.keys(res).length < 5 ? res : {};
        }
        return {};
      });
    },
    addEmpty() {
      // Is for some reason different from this.isRepeatable()
      const isRepeatable = VocabUtil.propIsRepeatable(this.getPropKey(), this.resources.context);
      if (this.hasProp && isRepeatable) {
        let updateVal = this.prop;
        if (Array.isArray(updateVal)) {
          updateVal.push('');
        } else {
          updateVal = [].concat(updateVal, '');
        }
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'lastAdded',
          value: `${this.getPropPath()}[${updateVal.length - 1}]`,
        });
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.getPropPath(),
              value: updateVal,
            },
          ],
          addToHistory: true,
        });
      } else {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'lastAdded',
          value: `${this.getPropPath()}[0]`,
        });
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: this.getPropPath(),
              value: isRepeatable ? [''] : '',
            },
          ],
          addToHistory: true,
        });
      }
    },
    addToLangMap(tag, obj) {
      let updateValue;
      if (this.propByLang.hasOwnProperty(tag) && this.isRepeatable) {
        updateValue = Object.assign(this.propByLang, { [tag]: [].concat(this.propByLang[tag], obj[tag]) });
      } else {
        updateValue = Object.assign(this.propByLang, obj);
      }
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: this.getByLangPath(),
            value: updateValue,
          },
        ],
        addToHistory: true,
      });
    },
    isTransSchema(tag) {
      return this.supportedTags.includes(tag);
    },
  },
};
</script>
