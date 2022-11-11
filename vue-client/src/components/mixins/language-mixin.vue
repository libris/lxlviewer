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
    deLangifiedObj() {
      return get(this.inspector.data, this.deLangifiedPath);
    },
    byLangifiedPath() {
      return this.path.concat('ByLang');
    },
    byLangifiedObj() {
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
    hasDelangified() {
      return typeof this.deLangifiedObj !== 'undefined';
    },
    hasByLangified() {
      return !isEmpty(this.byLangifiedObj);
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
    getDeLangifiedPath() {
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
      const languageMap = this.byLangifiedObj;
      let updatePath = this.getByLangPath();
      let updateValue = languageMap;
      let taggedValue = languageMap[tag];
      delete languageMap[tag];
      if (isEmpty(languageMap)) { // De-langify
        const lastIndex = this.path.lastIndexOf('.');
        const parentsParent = this.parentPath.slice(0, lastIndex);
        const parentsParentValue = get(this.inspector.data, parentsParent);
        updatePath = this.getDeLangifiedPath();
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
        updateAtDelangified = this.deLangifiedObj.push(taggedValue);
      }
      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: this.getDeLangifiedPath(),
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
      if (this.hasByLangified()) {
        Object.assign(this.byLangifiedObj, { [tag]: sourceValue });
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
      const langMap = this.byLangifiedObj;
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
