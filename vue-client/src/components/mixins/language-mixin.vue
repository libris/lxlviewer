<script>
import { get, isEmpty } from 'lodash-es';
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
      return `${this.parentPath}`;
    },
    deLangifiedPath() {
      return this.path.substring(0, this.path.indexOf('ByLang'));
    },
    prop() {
      const prop = get(this.inspector.data, this.getPropPath())
      if (typeof prop === 'undefined') {
        return this.isRepeatable ? [] : '';
      } else {
        return prop;
      }
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
    mapLanguage(tag) {
      const languageString = this.languageMap[tag];
      return languageString || tag;
    },
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
    async requestTransliteration(sourceObj) {
      return httpUtil.post({
        url: `${this.settings.apiPath}/_transliterate`,
        token: this.user.token,
      }, sourceObj)
        .then((result) => {
          return result;
        });
    },
    removeLanguageTag(tag, value) {
      const languageMap = this.propByLang;
      let updatePath = this.getByLangPath();
      let updateValue = languageMap;
      let taggedValue = languageMap[tag];
      delete languageMap[tag];
      const delangify = isEmpty(languageMap);
      if (delangify) { // De-langify
        const lastIndex = this.path.lastIndexOf('.');
        const parentPath = this.path.slice(0, lastIndex);
        const parentValue = get(this.inspector.data, parentPath);
        updatePath = this.getPropPath();
        if (this.isRepeatable) {
          updateValue = this.prop;
          updateValue.push(taggedValue);
        } else {
          updateValue = value;
        }
        delete parentValue[this.getByLangKey()];
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
          updateProp = this.prop;
          updateProp.push(taggedValue);
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
    toLangMap(tag, sourceValue) {
      const lastIndex = this.path.lastIndexOf('.');
      const parentsPath = this.path.slice(0, lastIndex);
      const parent = get(this.inspector.data, parentsPath);
      if (this.isRepeatable) {
        this.prop.splice(this.prop.indexOf(sourceValue), 1);
        if (isEmpty(this.prop)) {
          delete parent[this.getPropKey()]
        }
      } else {
        delete parent[this.getPropKey()];
      }
      if (this.hasByLang) {
        this.addToLangMap({ [tag]: sourceValue })
      } else {
        parent[this.getByLangKey()] = { [tag]: sourceValue };
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path: parentsPath,
              value: parent,
            },
          ],
          addToHistory: true,
        });
      }
    },
    async transliterate(tag, sourceValue) {
      const result = await this.requestTransliteration({ langTag: tag, source: sourceValue });
      this.addToLangMap(result);
    },
    addEmpty() {
      let isRepeatable = VocabUtil.propIsRepeatable(this.getPropKey(), this.resources.context); //Is for some reason different from this.isRepeatable()
      if (this.hasProp && isRepeatable) {
        let updateVal = this.prop;
        updateVal.push('');
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
    addToLangMap(obj) {
      const updateValue = Object.assign(this.propByLang, obj);
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
      // TODO: Make more robust
      return tag.includes('Latn-t');
    },
  },
};
</script>