<script>
import * as DisplayUtil from '@/utils/display';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import { cloneDeep, each, includes, remove, isArray, sortBy } from 'lodash-es';
import { mapGetters } from 'vuex';

export default {
  props: {
    isMainEntityForm: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
    };
  },
  methods: {
  },
  events: {
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    formType() {
      return this.formObj['@type'];
    },
    recordType() {
      return VocabUtil.getRecordType(this.formType, this.resources.vocab, this.resources.context);
    },
    showTypeChanger() {
      if (typeof this.item !== 'undefined' && this.inspector.data.work && this.item['@id'] === this.inspector.data.work['@id']) {
        return true;
      }
      if (this.isMainEntityForm === false || this.isHolding || this.recordType === 'Concept') {
        return false;
      }
      return true;
    },
    filteredItem() {
      const fItem = cloneDeep(this.sortedFormData);
      if (this.showTypeChanger === false) {
        delete fItem['@type'];
      }
      delete fItem['@id'];
      delete fItem._uid;
      return fItem;
    },
    sortedFormData() {
      const sortedForm = {};
      for (const property of this.sortedProperties) {
        const k = property;
        if (typeof this.formObj[k] !== 'undefined' || this.formObj[k] === '') {
          sortedForm[k] = this.formObj[k];
        }
      }
      return sortedForm;
    },
    sortedProperties() {
      const formObj = this.formObj;
      let propertyList = DisplayUtil.getDisplayProperties(
        this.formType,
        this.resources.display,
        this.resources.vocab,
        this.settings,
        this.resources.context,
        'full',
      );
      each(formObj, (v, k) => {
        if (!includes(propertyList, k)) {
          propertyList.push(k);
        }
      });
      remove(propertyList, k => (this.settings.hiddenProperties.indexOf(k) !== -1));
      if (this.showTypeChanger) {
        propertyList = ['@type'].concat(propertyList);
      }
      return propertyList;
    },
    allowed() {
      return VocabUtil.getPropertiesFromArray(
        this.formObj['@type'],
        this.resources.vocabClasses,
        this.resources.vocabProperties,
        this.resources.context,
      );
    },
    allowedProperties() {
      const formObj = this.formObj;
      const allowed = this.allowed;
      const language = this.user.settings.language;
      // Add the "added" property
      for (const element of allowed) {
        const oId = StringUtil.getCompactUri(element.item['@id'], this.resources.context);
        element.added = formObj.hasOwnProperty(oId);
      }
      const extendedAllowed = allowed.map((property) => {
        const labelByLang = property.item.labelByLang;
        const prefLabelByLang = property.item.prefLabelByLang;
        if (typeof labelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = (typeof labelByLang[language] !== 'undefined') ? labelByLang[language] : labelByLang.en;
          // If several labels are present, use the first one
          if (isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label,
          };
        } if (typeof prefLabelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = (typeof prefLabelByLang[language] !== 'undefined') ? prefLabelByLang[language] : prefLabelByLang.en;
          // If several labels are present, use the first one
          if (isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label,
          };
        } 
        // If no label, use @id as label
        return {
          added: property.added,
          item: property.item,
          label: property.item['@id'],
        };
      });
      const sortedAllowed = sortBy(extendedAllowed, (prop) => {
        if (prop.label) {
          return prop.label.toLowerCase();
        } 
        return prop.item['@id'];
      });
      return sortedAllowed;
    },
  },
  watch: {
  },
};
</script>
