<script>
import {get, isArray, isEmpty} from 'lodash-es';
import * as httpUtil from "../../utils/http";

export default {
  props: {
    parentPath: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      sourceValue: '',
    }
  },
  computed: {
    languageMap() {
      return {'uk' : 'Ukrainska'};
    },
    path() {
      const parentValue = get(this.inspector.data, this.parentPath);
      if (isArray(parentValue)) {
        return `${this.parentPath}[${this.index}]`;
      }
      return `${this.parentPath}`;
    },
  },
  methods: {
    mapLanguage(tag) {
      const languageString = this.languageMap[tag]
      if (languageString) {
        return languageString;
      } else {
        return tag;
      }
    },
    async requestTransliteration(sourceObj) {
      let trans;
      trans = httpUtil.post({
        url: `${this.settings.apiPath}/_transliterate`,
        token: this.user.token
      }, sourceObj)
        .then((result) => {
          console.log('result', result);
          return result;
        });
      return trans;
    },
    async removeLanguageTag(tag, value) {
      let languageMap = get(this.inspector.data, this.parentPath);

      let updatePath = this.path;
      let updateValue = languageMap;
      delete languageMap[tag];

      if (isEmpty(languageMap)) { //De-langify
        const lastIndex = this.path.lastIndexOf('.')
        const parentsParent = this.parentPath.slice(0, lastIndex);
        let parentsParentValue = get(this.inspector.data, parentsParent);
        let lastProperty = this.parentPath.slice(lastIndex + 1);
        updatePath = this.path.substring(0, this.path.indexOf("ByLang"));
        updateValue = value;
        delete parentsParentValue[lastProperty];
      }

      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: updatePath,
            value: updateValue,
          },
        ],
        addToHistory: true,
      })
    },
    async byLangify(tag, sourceValue) {
      const lastIndex = this.path.lastIndexOf('.')
      const parentsParent = this.parentPath.slice(0, lastIndex);
      let parentsParentValue = get(this.inspector.data, parentsParent);
      let lastProperty = this.parentPath.slice(lastIndex + 1);
      const byLangified = lastProperty.concat('ByLang');
      delete parentsParentValue[lastProperty];
      parentsParentValue[byLangified] =  { [tag] : sourceValue };

      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: parentsParent,
            value: parentsParentValue,
          },
        ],
        addToHistory: true,
      })
    },
    async transliterate(tag, sourceValue) {
      let result = await this.requestTransliteration({"langTag": tag, "source": sourceValue});
      let languageMap = get(this.inspector.data, this.parentPath);
      const updateValue = Object.assign(languageMap, result);
      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: this.parentPath,
            value: updateValue,
          },
        ],
        addToHistory: true,
      })
    },
    isTransSchema(tag) {
      //TODO: Make more robust
      return tag.includes('Latn-t');
    }
  },
};
</script>
