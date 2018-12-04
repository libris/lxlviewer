<script>
import * as DataUtil from '@/utils/data';
import * as DisplayUtil from '@/utils/display';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';
import * as _ from 'lodash';
import { mapGetters } from 'vuex';

export default {
  props: {
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
    filteredItem() {
      const fItem = _.cloneDeep(this.sortedFormData);
      delete fItem['@type'];
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

      // Try to get properties from type of object
      // If none found, try baseClasses
      let propertyList = DisplayUtil.getProperties(
        this.formType,
        'full',
        this.resources.display,
      );
      if (propertyList.length === 0) { // If none were found, traverse up inheritance tree
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          this.formType,
          this.resources.vocab,
          this.resources.context,
        );
        for (const baseClass of baseClasses) {
          propertyList = DisplayUtil.getProperties(
            StringUtil.getCompactUri(baseClass, this.resources.context),
            'full',
            this.resources.display,
          );
          if (propertyList.length > 0) {
            break;
          }
        }
        if (propertyList.length === 0) {
          propertyList = DisplayUtil.getProperties(
            'Resource',
            'full',
            this.resources.display,
          );
        }
      }
      _.each(formObj, (v, k) => {
        if (!_.includes(propertyList, k)) {
          propertyList.push(k);
        }
      });
      _.remove(propertyList, k => (this.settings.hiddenProperties.indexOf(k) !== -1));
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
      const settings = this.settings;
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
          if (_.isArray(label)) {
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
          if (_.isArray(label)) {
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
      const sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
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
