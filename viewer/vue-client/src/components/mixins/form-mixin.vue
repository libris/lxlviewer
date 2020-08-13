<script>
import { cloneDeep, isArray, sortBy, each, groupBy } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as DisplayUtil from '@/utils/display';
import * as VocabUtil from '@/utils/vocab';
import * as StringUtil from '@/utils/string';

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
    isMainEntityForm() {
      return this.editingObject === 'mainEntity';
    },
    formType() {
      return this.formObj['@type'];
    },
    recordType() {
      return VocabUtil.getRecordType(this.formType, this.resources.vocab, this.resources.context);
    },
    showTypeChanger() {
      if (this.recordType === 'Work' || this.recordType === 'Instance' || this.isMainEntityForm) {
        return true;
      }
      return false;
    },
    filteredItem() {
      const fItem = cloneDeep(this.sortedFormData);
      if (this.showTypeChanger === false) {
        delete fItem['@type'];
      }
      delete fItem['@id'];
      delete fItem['@reverse'];
      delete fItem._uid;

      return fItem;
    },
    reverseItem() {
      return this.formObj['@reverse'];
    },
    reverseItemInForm() {
      // Disabled for the time being
      return {};
      // const reverseItem = cloneDeep(this.reverseItem);
      // const propsInMainForm = require('@/resources/json/displayGroups.json').reverse.mainForm;
      // const objToMainForm = {};
      // each(reverseItem, (item, key) => {
      //   if (propsInMainForm.indexOf(`@reverse/${key}`) > -1) {
      //     objToMainForm[`@reverse/${key}`] = item;
      //   }
      // });
      // return objToMainForm;
    },
    reverseItemSorted() {
      const reverseItem = cloneDeep(this.reverseItem);
      const propsInMainForm = require('@/resources/json/displayGroups.json').reverse.mainForm;
      for (let i = 0; i < propsInMainForm.length; i++) {
        const key = propsInMainForm[i].replace('@reverse/', '');
        if (reverseItem.hasOwnProperty(key)) {
          delete reverseItem[key];
        }
      }
      const reverseItemSorted = {};

      each(reverseItem, (item, key) => {
        let groupedReverseItems = {};

        // get label and add it to the object for sorting        
        item.map((obj) => {
          obj.label = this.getLabel(obj);
          return obj;
        });

        // sort aplphabetically
        item.sort((a, b) => a.label.localeCompare(b.label, 'sv'));

        // group by first letter
        groupedReverseItems = groupBy(item, i => i.label.substring(0, 1));

        // delete label
        Object.keys(groupedReverseItems).forEach((k) => {
          groupedReverseItems[k].forEach(v => delete v.label);
        });        

        reverseItemSorted[key] = {};
        reverseItemSorted[key].items = groupedReverseItems;
        reverseItemSorted[key].isGrouped = true;
        reverseItemSorted[key].totalItems = item.length;
      });

      return reverseItemSorted;
    },
    sortedFormData() {
      const formObj = cloneDeep(this.formObj);
      const formObjWithReverse = Object.assign(formObj, this.reverseItemInForm);
      const sortedForm = {};
      for (const property of this.sortedProperties) {
        const k = property;
        if (typeof formObjWithReverse[k] !== 'undefined' || formObjWithReverse[k] === '') {
          sortedForm[k] = formObjWithReverse[k];
        }
      }
      return sortedForm;
    },
    sortedProperties() {
      const propertyList = DisplayUtil.getSortedProperties(this.formType, this.formObj, this.settings, this.resources);

      if (this.showTypeChanger) {
        // move instanceOf field to top
        if (this.recordType === 'Instance') {
          propertyList.splice(1, 0, '@type');
        } else {
          propertyList.splice(0, 0, '@type');
        }
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
