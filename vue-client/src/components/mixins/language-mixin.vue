<script>
import {get, isArray} from 'lodash-es';
import * as httpUtil from "../../utils/http";

export default {
  props: {
    parentPath: {
      type: String,
      default: '',
    },
    byLangify: {},
  },
  data() {
    return {
      sourceValue: '',
      transliterated: [],
    }
  },
  computed: {
    path() {
      const parentValue = get(this.inspector.data, this.parentPath);
      if (isArray(parentValue)) {
        return `${this.parentPath}[${this.index}]`;
      }
      return `${this.parentPath}`;
    },
  },
  methods: {
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
    async transliterate(sourceValue) {     //Transliterates and byLangifies
      const lastIndex = this.path.lastIndexOf('.')
      const parentsParent = this.parentPath.slice(0, lastIndex);
      let parentsParentValue = get(this.inspector.data, parentsParent);

      let lastProperty = this.parentPath.slice(lastIndex + 1);

      if (this.byLangify) {
        const byLangified = lastProperty.concat('ByLang');
        delete parentsParentValue[lastProperty];
        lastProperty = byLangified;
      }

      const langCode = "uk";
      const source = sourceValue;
      let result = await this.requestTransliteration({"langTag": langCode, "source": source});

      parentsParentValue[lastProperty] =  Object.assign({"uk": source}, result);
      console.log("parentsParent", JSON.stringify(parentsParent));
      console.log("parentsParentValue", JSON.stringify(parentsParentValue));
      await this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: parentsParent,
            value: parentsParentValue,
          },
        ],
        addToHistory: true,
      })
      console.log("updated data", JSON.stringify(get(this.inspector.data, parentsParent)));
    },
    isTransSchema(tag) {
      //TODO: Make more robust
      return tag.includes('Latn-t');
    }
  },
};
</script>
