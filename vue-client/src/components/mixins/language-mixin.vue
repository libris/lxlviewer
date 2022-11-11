<script>
import { get, isArray, isEmpty } from 'lodash-es';
import * as httpUtil from '../../utils/http';
import { getContextValue } from 'lxljs/vocab';
import * as VocabUtil from "lxljs/vocab";

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
    languageMap() {
      return { uk: 'Ukrainska', sv: 'Svenska', de: 'Tyska', fr: 'Franska', en: 'Engelska' };
    },
    path() {
      const parentValue = get(this.inspector.data, this.parentPath);
      if (isArray(parentValue)) {
        return `${this.parentPath}[${this.index}]`;
      }
      return `${this.parentPath}`;
    },
    deLangifiedPath() {
      return this.path.substring(0, this.path.indexOf('ByLang'));
    },
    getProp() {
      const prop = get(this.inspector.data, this.getPropPath())
      return typeof prop !== 'undefined' ? prop : {};
    },
    byLangifiedPath() {
      return this.path.concat('ByLang');
    },
    propByLang() {
      const langMap = get(this.inspector.data, this.getByLangPath())
      return typeof langMap !== 'undefined' ? langMap : {};
    },
    isRepeatable() {
      return VocabUtil.propIsRepeatable(this.getPropKey(), this.resources.context);
    },

  },
  methods: {
    isLangMap() {
      return getContextValue(this.fieldKey, '@container', this.resources.context) === '@language';
    },
    hasProp() {
      return !isEmpty(this.getProp)
    },
    hasByLang() {
      return !isEmpty(this.propByLang);
    },
    mapLanguage(tag) {
      const languageString = this.languageMap[tag];
      return languageString || tag;
    },
    getByLangKey() {
      return this.isLangMap() ? this.fieldKey : this.fieldKey.concat('ByLang');
    },
    getPropKey() {
      return this.isLangMap() ? this.fieldKey.substring(0, this.fieldKey.indexOf('ByLang')) : this.fieldKey;
    },
    getByLangPath() {
      return this.isLangMap() ? this.path : this.byLangifiedPath;
    },
    getPropPath() {
      return this.isLangMap() ? this.deLangifiedPath : this.path;
    },
    async requestTransliteration(sourceObj) {
      return httpUtil.post({
        url: `${this.settings.apiPath}/_transliterate`,
        token: this.user.token,
      }, sourceObj)
        .then((result) => {
          return result;
        });
    },
    async removeLanguageTag(tag, value) {
      const languageMap = this.propByLang;
      let updatePath = this.getByLangPath();
      let updateValue = languageMap;
      let taggedValue = languageMap[tag];
      delete languageMap[tag];
      if (isEmpty(languageMap)) { // De-langify
        const lastIndex = this.path.lastIndexOf('.');
        const parentsParent = this.parentPath.slice(0, lastIndex);
        const parentsParentValue = get(this.inspector.data, parentsParent);
        updatePath = this.getPropPath();
        updateValue = value;
        delete parentsParentValue[this.fieldKey];
      }
      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: updatePath,
            value: updateValue,
          },
        ],
        addToHistory: true,
      });
      let updateAtDelangified = taggedValue;
      if (this.isRepeatable) {
        updateAtDelangified = this.getProp.push(taggedValue);
      }
      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: this.getPropPath(),
            value: updateAtDelangified,
          },
        ],
        addToHistory: true,
      });
    },
    async addToLangMap(tag, sourceValue) {
      const lastIndex = this.path.lastIndexOf('.');
      const parentsParent = this.parentPath.slice(0, lastIndex);
      const parentsParentValue = get(this.inspector.data, parentsParent);
      delete parentsParentValue[this.fieldKey];
      if (this.hasByLang()) {
        Object.assign(this.propByLang, { [tag]: sourceValue });
      } else {
        parentsParentValue[this.fieldKey.concat('ByLang')] = { [tag]: sourceValue };
      }
      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: parentsParent,
            value: parentsParentValue,
          },
        ],
        addToHistory: true,
      });
    },
    async transliterate(tag, sourceValue) {
      const result = await this.requestTransliteration({ langTag: tag, source: sourceValue });
      const langMap = this.propByLang;
      const updateValue = Object.assign(langMap, result);
      await this.$store.dispatch('updateInspectorData', {
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
      // TODO: Make more robust
      return tag.includes('Latn-t');
    },
  },
};
</script>
