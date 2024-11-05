<script>
import { cloneDeep, isArray, sortBy, each, groupBy, get, castArray } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as DisplayUtil from 'lxljs/display';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import DisplayGroups from '@/resources/json/displayGroups.json';
import {getAllVocabProperties, getProperties, getRangeFull, getSubClassChain} from "lxljs/vocab.js";
import { ANY_TYPE } from "@/utils/bulk.js";

export default {
  props: {
    allSearchTypes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
    };
  },
  methods: {
    groupItem(item, key) {
      if (key === '@reverse/instanceOf') {
        // sort instances on publication.year
        const toInt = (s) => Number(s.replace(/[^0-9]/g, '')); // default 0
        item.forEach((obj) => {
          const publications = castArray(get(this.inspector.data.quoted, [obj['@id'], 'publication'], []));
          const primary = publications.find((p) => p['@type'] === 'PrimaryPublication');
          obj.year = toInt(get(primary, ['year'], ''));
        });
        item.sort((a, b) => b.year - a.year);
        item.forEach((obj) => delete obj.year);

        return { '': item };
      }

      let groupedItems = {};

      // get label and add it to the object for sorting
      item.map((obj) => {
        obj.label = this.getLabel(obj);
        return obj;
      });

      // sort alphabetically
      item.sort((a, b) => a.label.localeCompare(b.label, 'sv'));

      // group by first letter
      groupedItems = groupBy(item, (i) => i.label.substring(0, 1));

      // delete label
      Object.keys(groupedItems).forEach((k) => {
        groupedItems[k].forEach((v) => delete v.label);
      });

      return groupedItems;
    },
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
    acceptedTypes() {
      return this.getClassTree;
    },
    getClassTree() {
      let tree = [];
      if (this.allSearchTypes && this.allSearchTypes.length > 0) {
        tree = this.allSearchTypes.map((type) => VocabUtil.getTree(type, this.resources.vocab, this.resources.context));
      } else {
        const docType = VocabUtil.getRecordType(this.formType, this.resources.vocab, this.resources.context);
        tree = [docType].map((type) => VocabUtil.getTree(type, this.resources.vocab, this.resources.context));
      }
      const flattenedTree = VocabUtil.flattenTree(tree, this.resources.vocab, this.resources.context, this.settings.language);

      if (!this.isMainEntityForm && this.isBulkChange) {
        return [this.anyType, ...flattenedTree];
      } else {
        return flattenedTree;
      }
    },
    isMainEntityForm() {
      return this.editingObject === 'mainEntity';
    },
    anyType() {
      return { id: ANY_TYPE, sub: [], abstract : false, depth: 0, parentChainString: ANY_TYPE};
    },
    isBulkChange() {
      return this.$route.path.includes('bulkchanges');
    },
    formType() {
      return this.formObj['@type'];
    },
    recordType() {
      return VocabUtil.getRecordType(this.formType, this.resources.vocab, this.resources.context);
    },
    showTypeChanger() {
      if (this.settings.showTypeChangerFor.includes(this.recordType) || this.settings.showTypeChangerFor.includes(this.inClassAndProperty) || this.isMainEntityForm) {
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
      if (this.formObj != null && this.formObj.hasOwnProperty('@reverse')) {
        return this.formObj['@reverse'];
      }
      return null;
    },
    reverseItemInForm() {
      const reverseItem = cloneDeep(this.reverseItem);
      const propsInMainForm = DisplayGroups.reverse.mainForm;
      const objToMainForm = {};
      if (reverseItem) {
        each(reverseItem, (item, key) => {
          const currentKey = `@reverse/${key}`;

          if (propsInMainForm.indexOf(currentKey) > -1) {
            objToMainForm[currentKey] = {};
            objToMainForm[currentKey].items = this.groupItem(item, currentKey);
            objToMainForm[currentKey].isGrouped = true;
            objToMainForm[currentKey].totalItems = item.length;
          }
        });
      }
      return objToMainForm;
    },
    reverseItemStandalone() {
      const objToMainForm = {};
      const reverseItem = cloneDeep(this.reverseItem);
      if (typeof reverseItem === 'undefined') {
        return {};
      }
      const propsInMainForm = DisplayGroups.reverse.mainForm;
      const propsToHide = DisplayGroups.reverse.hidden;
      const propsToDelete = propsInMainForm.concat(propsToHide);

      for (let i = 0; i < propsToDelete.length; i++) {
        const key = propsToDelete[i].replace('@reverse/', '');
        if (reverseItem.hasOwnProperty(key)) {
          delete reverseItem[key];
        }
      }

      each(reverseItem, (item, key) => {
        const currentKey = `@reverse/${key}`;

        objToMainForm[currentKey] = {};
        objToMainForm[currentKey].items = this.groupItem(item, currentKey);
        objToMainForm[currentKey].isGrouped = true;
        objToMainForm[currentKey].totalItems = item.length;
      });
      return objToMainForm;
    },
    sortedFormData() {
      let formObj = cloneDeep(this.formObj);
      if (this.reverseItemInForm) {
        formObj = Object.assign(formObj, this.reverseItemInForm);
      }
      const sortedForm = {};

      for (const property of this.sortedProperties) {
        const k = property;
        if (typeof formObj[k] !== 'undefined' || formObj[k] === '') {
          sortedForm[k] = formObj[k];
        }
      }
      return sortedForm;
    },
    sortedProperties() {
      const propertyList = DisplayUtil.getSortedProperties(this.formType, this.formObj, this.settings, this.resources);

      if (this.showTypeChanger) {
        propertyList.splice(0, 0, '@type');
      }
      return propertyList;
    },
    allowed() {
      if (this.formType === ANY_TYPE) {
        return this.allVocabProperties;
      } else {
        return VocabUtil.getPropertiesFromArray(
          this.formObj['@type'],
          this.resources.vocabClasses,
          this.resources.vocabProperties,
          this.resources.context,
        );
      }
    },
    allVocabProperties() {
      return VocabUtil.getAllVocabProperties(this.resources.vocabProperties);
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
