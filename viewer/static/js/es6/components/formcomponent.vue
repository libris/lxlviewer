<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import * as _ from 'lodash';
import FieldAdder from './fieldadder';
import DataNode from './datanode';
import * as ModalUtil from '../utils/modals';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import { updateForm, changeStatus } from '../vuex/actions';
import { getSettings, getVocabulary, getVocabularyProperties, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  vuex: {
    actions: {
      updateForm,
      changeStatus,
    },
    getters: {
      vocab: getVocabulary,
      vocabProperties: getVocabularyProperties,
      settings: getSettings,
      editorData: getEditorData,
      display: getDisplayDefinitions,
      status: getStatus,
    },
  },
  props: {
    locked: false,
  },
  data() {
    return {
      showJson: false,
    };
  },
  computed: {
    isLocked() {
      if (this.locked) {
        return true;
      }
      return false;
    },
    specialProperties() {
      const props = [];
      for (const prop of this.settings.specialProperties) {
        if (this.editorData.mainEntity[prop]) {
          props.push(prop);
        }
      }
      return props;
    },
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.formData;
      const allowed = VocabUtil.getPropertiesFromArray(
        formObj['@type'],
        this.vocab,
        this.settings.vocabPfx, // LÄGG TILL LABEL I ALLOWED
        this.vocabProperties
      );
      // Add the "added" property
      for (const element of allowed) {
        const oId = element.item['@id'].replace(settings.vocabPfx, '');
        element.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      }

      const extendedAllowed = allowed.map(property => {
        const labelByLang = property.item.labelByLang;
        if (typeof labelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = ((typeof labelByLang[this.settings.language] !== 'undefined') ? labelByLang[this.settings.language] : labelByLang.en);
          // If several labels are present, use the first one
          if (_.isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label
          };
        } else {
          // If no label, use @id as label
          return {
            added: property.added,
            item: property.item,
            label: property.item['@id']
          };
        }
      });
      sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
        return prop.label.toLowerCase();
      });
      return sortedAllowed;
    },
    formData() {
      return this.editorData.mainEntity;
    },
    sortedFormData() {
      const sortedForm = {};
      for (const property of this.sortedProperties) {
        const k = property;
        if (this.formData[k] || this.formData[k] === '') {
          sortedForm[k] = this.formData[k];
        }
      }
      return sortedForm;
    },
    sortedProperties() {
      const formObj = this.formData;

      // Try to get properties from type of object
      // If none found, try baseClasses
      let propertyList = DisplayUtil.getProperties(
        formObj['@type'],
        'cards',
        this.display,
        this.settings
      );
      if (propertyList.length === 0) { // If none were found, traverse up inheritance tree
        const baseClasses = VocabUtil.getBaseClassesFromArray(
          formObj['@type'],
          this.vocab,
          this.settings.vocabPfx
        );
        for (const baseClass of baseClasses) {
          propertyList = DisplayUtil.getProperties(
            baseClass.replace(this.settings.vocabPfx, ''),
            'cards',
            this.display,
            this.settings
          );
          if (propertyList.length > 0) {
            break;
          }
        }
        if (propertyList.length === 0) {
          propertyList = DisplayUtil.getProperties(
            'Resource',
            'chips',
            this.display,
            this.settings
          );
        }
      }
      _.each(formObj, (v, k) => {
        if (!_.includes(propertyList, k)) {
          propertyList.push(k);
        }
      });

      _.remove(propertyList, (k) => {
        return (this.settings.specialProperties.indexOf(k) !== -1);
      });

      return propertyList;
    },
    dummyInstance() {
      return DisplayUtil.getItemLabel(
        this.editorData.mainEntity,
        this.display,
        this.editorData.quoted,
        this.vocab,
        this.settings
      );
    },
  },
  watch: {
  },
  events: {
    'add-field'(prop, path) {
      const key = prop['@id'].replace(this.settings.vocabPfx, '');
      const value = [];
      let modified = _.cloneDeep(this.formData);
      if (typeof path !== 'undefined') {
        _.set(modified, `${path}.${key}`, value);
      } else {
        const newItem = {};
        newItem[key] = value;
        modified = Object.assign({}, this.formData, newItem);
      }
      this.updateForm('mainEntity', modified);
    },
    'remove-field'(prop) {
      const modifiedData = Object.assign({}, this.formData);
      delete modifiedData[prop];
      this.updateForm('mainEntity', modifiedData);
    },
    'update-value'(path, value) {
      console.log("FormComp: - Updating " + path, 'to', JSON.stringify(value));
      const modified = _.cloneDeep(this.formData);

      _.set(modified, path, value);
      console.log("New value recieved for", path, "=", value);
      console.log(modified);
      this.changeStatus('removing', false);
      this.updateForm('mainEntity', modified);
    },
  },
  methods: {
    keyIsLocked(key) {
      return (this.isLocked || key === '@id' || key === '@type');
    },
    updateFromTextarea(e) {
      this.updateForm('mainEntity', JSON.parse(e.target.value));
    },
  },
  components: {
    'data-node': DataNode,
    'field-adder': FieldAdder,
  },
  ready() {
  }
};
</script>

<template>
  <div class="form-component focused-form-component" :class="{ 'locked': isLocked }">
    <data-node v-for="k in specialProperties" :key="k" :value="editorData.mainEntity[k]" :entity-type="editorData.mainEntity['@type']" is-locked="true"></data-node>
    <data-node v-for="(k,v) in sortedFormData" v-bind:class="{ 'locked': isLocked }"  :entity-type="editorData.mainEntity['@type']" :is-inner="false" :is-removable="true" :is-locked="keyIsLocked(k)" :key="k" :value="v" :allow-local="true"></data-node>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :inner="false"></field-adder>
    <div id="result" v-if="status.isDev && !isLocked">
      <div class="row">
      <pre class="col-md-6">
        SORTED

        {{sortedFormData | json}}
      </pre>
      <pre class="col-md-6">
        ORIGINAL

        {{formData | json}}
      </pre>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.form-component {
  margin: 20px 0px 0px;
  border: solid #ccc;
  border-width: 1px 0px 0px 0px;
  &.locked {
    > ul > li {
      margin: 0px;
    }
  }

  >ul {
    padding-left: 0px;
    margin: 0px;
    >li {
      color: black;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 5px 0px;
      list-style: none;
      width: 100%;
      box-shadow: none;
      transition: box-shadow ease-out 0.2s;

      &:hover:not(.locked) {
        >.actions {
          opacity: 1;
        }
      }

    }
  }
  .node-local {
    width: 420px;
    clear: left;
  }

  .dummy-reverse {
    display: flex;
    width: 100%;
    flex-direction: row;
    background-color: #f2f2f2;
    .label {
      color: black;
      order: 1;
      flex-basis: @col-label;
      display: flex;
      text-align: right;
      align-items: center;
      justify-content: flex-end;
      font-size: 1.2rem;
      color: #333333;
      font-weight: normal;
    }
    .value {
      order: 2;
      flex-basis: @col-value;
      padding: 5px;
      .dummy-chip {
        .chip-mixin(@brand-primary, #fff);
      }
    }
  }
}

</style>
