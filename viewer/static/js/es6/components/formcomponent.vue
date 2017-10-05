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
import { getSettings, getVocabulary, getForcedListTerms, getVocabularyProperties, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  vuex: {
    actions: {
      updateForm,
      changeStatus,
    },
    getters: {
      vocab: getVocabulary,
      vocabProperties: getVocabularyProperties,
      forcedListTerms: getForcedListTerms,
      settings: getSettings,
      editorData: getEditorData,
      display: getDisplayDefinitions,
      status: getStatus,
    },
  },
  props: {
    locked: false,
    editingObject: '',
    collapsed: false,
  },
  data() {
    return {
      showJson: false,
    };
  },
  computed: {
    isHolding() {
      return this.editorData[this.editingObject]['@type'] === 'Item';
    },
    isBib() {
      if (VocabUtil.isSubClassOf(this.editorData[this.editingObject]['@type'], 'Instance', this.vocab, this.settings.vocabPfx)) {
        return true;
      } else if (VocabUtil.isSubClassOf(this.editorData[this.editingObject]['@type'], 'Work', this.vocab, this.settings.vocabPfx)) {
        return true;
      } else if (VocabUtil.isSubClassOf(this.editorData[this.editingObject]['@type'], 'Agent', this.vocab, this.settings.vocabPfx)) {
        return true;
      } else if (VocabUtil.isSubClassOf(this.editorData[this.editingObject]['@type'], 'Concept', this.vocab, this.settings.vocabPfx)) {
        return true;
      }
      return false;
    },
    isLocked() {
      if (this.locked) {
        return true;
      }
      return false;
    },
    specialProperties() {
      const props = [];
      for (const prop of this.settings.specialProperties) {
        if (this.editorData[this.editingObject][prop]) {
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
        const prefLabelByLang = property.item.prefLabelByLang;
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
        } else if (typeof prefLabelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = ((typeof prefLabelByLang[this.settings.language] !== 'undefined') ? prefLabelByLang[this.settings.language] : prefLabelByLang.en);
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
      return this.editorData[this.editingObject];
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
  },
  watch: {
  },
  events: {
    'add-field'(prop, path) {
      const key = prop['@id'].replace(this.settings.vocabPfx, '');
      let value = [];
      if (prop['@type'] === 'DatatypeProperty') {
        if (this.forcedListTerms.indexOf(key) > -1) {
          value = [''];
        } else {
          value = '';
        }
      }
      let modified = _.cloneDeep(this.formData);
      if (typeof path !== 'undefined') {

        _.set(modified, `${path}.${key}`, value);
      } else {
        const newItem = {};
        newItem[key] = value;
        modified = Object.assign({}, this.formData, newItem);
      }
      this.updateForm(this.editingObject, modified, this.formData);
    },
    'remove-field'(path) {
      const modifiedData = _.cloneDeep(this.formData);
      _.unset(modifiedData, path);
      this.updateForm(this.editingObject, modifiedData, this.formData);
    },
    'update-value'(path, value) {
      console.log("FormComp: - Updating " + path, 'to', JSON.stringify(value));
      const modified = _.cloneDeep(this.formData);

      _.set(modified, path, value);
      console.log("New value recieved for", path, "=", value);
      console.log(modified);
      this.changeStatus('removing', false);
      this.updateForm(this.editingObject, modified, this.formData);
    },
  },
  methods: {
    keyIsLocked(key) {
      return (this.isLocked || key === '@id' || key === '@type');
    },
    updateFromTextarea(e) {
      this.updateForm(this.editingObject, JSON.parse(e.target.value), this.formData);
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
    <div class="data-node-container" v-bind:class="{'collapsed': collapsed }">
      <data-node v-for="(k,v) in sortedFormData" v-bind:class="{ 'locked': isLocked }" :entity-type="editorData[editingObject]['@type']" :is-inner="false" :is-removable="true" :is-locked="keyIsLocked(k)" :key="k" :value="v" :allow-local="true"></data-node>
      <field-adder v-if="!isLocked" :allowed="allowedProperties" :inner="false" :editing-object="editingObject"></field-adder>
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
    <div class="data-node-container-toggle" v-on:click="collapsed = !collapsed">{{ collapsed ? 'Show' : 'Hide' | translatePhrase }}
      <i class="fa fa-chevron-up" v-show="!collapsed"></i>
      <i class="fa fa-chevron-down" v-show="collapsed"></i>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.ribbon-mixin(@ribbon-color) {
  // padding: 0 10px 0 10px;
  // position: relative;
  // margin: 0 -10px 0 -10px;
  // box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  background-color: @ribbon-color;
  border: solid darken(@ribbon-color, 3%);
  border-width: 0px 0px 1px 0px;
  // border-radius: 0px 0px 2px 2px;
  // &:before {
  //   content: ' ';
  //   position: absolute;
  //   width: 0;
  //   height: 0;
  //   right: 0px;
  //   top: 100%;
  //   border-width: 5px 5px;
  //   border-style: solid;
  //   border-color: darken(@ribbon-color, 10%) transparent transparent darken(@ribbon-color, 10%);
  // }
  // &:after {
  //   content: ' ';
  //   position: absolute;
  //   width: 0;
  //   height: 0;
  //   left: 0px;
  //   top: 100%;
  //   border-width: 5px 5px;
  //   border-style: solid;
  //   border-color: darken(@ribbon-color, 10%) darken(@ribbon-color, 10%) transparent transparent;
  // }
}

.form-component {
  .form-label {
    color: @white;
    display: flex;
    justify-content: space-between;
    border-width: 0px 0px 1px 0px;
    > span {
      &.left-column {
        flex: 0 0 40%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 1em;
      }
      &.middle-column {
        flex: 0 0 20%;
        text-align: center;
        // text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4);
      }
      &.right-column {
        flex: 0 0 40%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 1em;
        code {
          color: #fff;
          padding: 0em 0.5em;
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
    }
    .type-label {
      font-size: 1.2em;
      font-weight: bold;
    }
    .new-indicator {
      font-size: 1em;
    }
    &.record-style {
      .ribbon-mixin(@gray);
    }
    &.bib-style {
      .ribbon-mixin(@bib-color);
    }
    &.holding-style {
      .ribbon-mixin(desaturate(darken(@holding-color, 10%), 10%));
    }
  }
  .data-node-container {
    border: solid #d8d8d8;
    margin: 0px;
    padding: 0px;
    border-width: 1px 0px 0px 0px;
    overflow: hidden;
    max-height: 500vh;
    transition: 2s ease max-height;
    &.collapsed {
      max-height: 0em;
      transition: 1s ease max-height;
    }
  }
  .data-node-container-toggle {
    text-align: center;
    font-weight: bold;
    font-size: 85%;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.5em;
  }
  box-shadow: @shadow-base;
  border: solid #ccc;
  border-width: 0px 1px 1px 1px;
  margin-bottom: 2em;
  background-color: #ededed;
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
