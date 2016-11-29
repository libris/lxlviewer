<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import * as _ from 'lodash';
import EntityAdder from './entityadder';
import FieldAdder from './fieldadder';
import DataNode from './datanode';
import * as ModalUtil from '../utils/modals';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import { updateForm } from '../vuex/actions';
import { getVocabulary, getSettings, getEditorData, getDisplayDefinitions } from '../vuex/getters';

export default {
  vuex: {
    actions: {
      updateForm,
    },
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
      display: getDisplayDefinitions,
    },
  },
  props: {
    focus: '',
    linked: {},
    locked: false,
    status: {},
  },
  data() {
    return {
      showJson: false,
    };
  },
  computed: {
    isLocked() {
      if (this.locked || this.status.state !== this.focus) {
        return true;
      }
      return false;
    },
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.formData;
      const allowed = VocabUtil.getPropertiesFromArray(
        formObj['@type'],
        this.vocab,
        this.settings.vocabPfx
      );

      // Add the "added" property
      for (const element of allowed) {
        const oId = element.item['@id'].replace(settings.vocabPfx, '');
        element.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      }

      return allowed;
    },
    formData() {
      return this.editorData[this.focus];
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
        this.display
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
            this.display
          );
          if (propertyList.length > 0) {
            break;
          }
        }
        if (propertyList.length === 0) {
          propertyList = DisplayUtil.getProperties(
            'Resource',
            'chips',
            this.display
          );
        }
      }
      _.each(formObj, (v, k) => {
        if (!propertyList.includes(k)) {
          propertyList.push(k);
        }
      });
      return propertyList;
    },
  },
  events: {
    'add-field'(prop) {
      const newItem = {};
      const key = prop['@id'].replace(this.settings.vocabPfx, '');
      if (prop['@type'] && prop['@type'].indexOf('ObjectProperty') !== -1) {
        newItem[key] = [];
      } else {
        newItem[key] = '';
      }
      const merged = Object.assign({}, this.formData, newItem);
      this.updateForm(this.focus, merged);
    },
    'remove-field'(prop) {
      const modifiedData = Object.assign({}, this.formData);
      delete modifiedData[prop];
      this.updateForm(this.focus, modifiedData);
    },
    'add-item'(key, item) {
      this.linked.push(item);
      const modified = this.formData;
      const newItem = { '@id': item['@id'] };
      modified[key].push(newItem);
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'remove-item'(key, item) {
      const keyWithout = _.reject(this.formData[key], (o) => o === item);
      const modified = this.formData;
      modified[key] = keyWithout;
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'update-value'(key, value) {
      const modified = this.formData;
      const path = key;
      _.update(modified, path, () => {
        return (_.isArray(value) ? value : []).concat(value);
      });
      const basekey = key.split('.')[0];
      console.log(basekey, 'changed to', _.get(modified, basekey));
      const merged = Object.assign({}, modified);
      this.updateForm(this.focus, merged);
    },
    'add-anonymous'(key, item) {
      const modified = this.formData;
      if (_.isArray(modified[key])) {
        modified[key].push(item);
      } else if (!this.isEmptyObject(modified[key])) {
        modified[key] = [modified[key], item];
      } else {
        modified[key] = item;
      }
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
  },
  methods: {
    isArray(o) {
      return _.isArray(o);
    },
    keyIsLocked(key) {
      return (this.isLocked || key === '@id' || key === '@type');
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    isEmptyObject(value) {
      if (typeof value === 'undefined') {
        return true;
      }
      if (!_.isObject(value)) {
        return false;
      }
      const bEmpty = (Object.keys(value).length === 0);
      return bEmpty;
    },
    removeField(prop) {
      const pLabel = VocabUtil.getLabelByLang(
        prop,
        this.settings.lang,
        this.vocab,
        this.settings.vocabPfx
      );
      ModalUtil.confirmDialog(
        {
          sTitle: `Ta bort fältet "${pLabel}"?`,
          sContent: `Detta tar bort fältet "${pLabel}" och allt dess innehåll.`,
          sAccept: 'Ta bort',
          sReject: 'Avbryt',
          sType: 'danger',
        }
      ).then(() => {
        // accepted by user
        this.$dispatch('remove-field', prop);
      }, () => {
          // declined
      });
    },
    isRepeatable(property) {
      const types = VocabUtil.getPropertyTypes(
        property,
        this.vocab,
        this.settings.vocabPfx
      );
      return types.indexOf('FunctionalProperty') < 0;
    },
    updateFromTextarea(e) {
      this.updateForm(this.focus, JSON.parse(e.target.value));
    },
  },
  components: {
    'data-node': DataNode,
    'entity-adder': EntityAdder,
    'field-adder': FieldAdder,
  },
};
</script>

<template>
  <div class="form-component" v-bind:class="{ 'locked': locked }">
    <div class="form-header">- {{ sortedFormData['@type'] | labelByLang | capitalize }} -</div>
    <ul>
      <li v-for="(k,v) in sortedFormData" v-bind:class="{ 'locked': isLocked }">
        <div class="label">
          <!-- <a href="/vocab/#{{property}}">{{ property | labelByLang | capitalize }}</a> -->
          {{ k | labelByLang | capitalize }}
        </div>
        <div class="value">
          <data-node :is-locked="keyIsLocked(k)" :key="k" :value="v" :linked="linked"></data-node>
        </div>
        <div class="actions">
          <div class="action action-remove" v-if="!keyIsLocked(k)" class="delete" v-on:click="removeField(k)"><i class="fa fa-trash"></i></div>
          <entity-adder class="action" v-if="!keyIsLocked(k) && (isRepeatable(k) || isEmptyObject(v))" :key="k"></entity-adder>
        </div>
      </li>
    </ul>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :item="focus"></field-adder>
    <div id="result" v-if="status.isDev">
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
@import './variables.less';
@node-bg: #fafafa;

// Column widths
@col-label: 200px;
@col-value: 620px;
@col-action: 250px;

.form-component {
  border: 1px solid @brand-primary;
  padding-bottom: 10px;
  .form-header {
    background-color: @brand-primary;
    font-weight: bold;
    color: @neutral-color;
    text-align: center;
  }
  margin: 20px;
  &.locked {
    background-color: darken(@neutral-color, 10%);
    > ul > li {
      margin: 0px;
    }
  }
  >ul {
    padding-left: 0px;
    >li {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 5px 0px;
      list-style: none;
      width: 100%;
      background-color: @node-bg;
      border: solid @node-bg;
      border-width: 1px 0px;
      transition: border-color 0.25s ease;
      transition-delay: 0.2s;
      &:nth-child(odd) {
        background-color: darken(@node-bg, 2%);
      }
      &:hover {
        border-color: #c5c3c3;
        >.actions {
          opacity: 1;
        }
      }
      >.actions {
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        width: @col-action;
        transition: opacity ease 0.2s;
        transition-delay: 0.2s;
        opacity: 0;
        margin-right: 6px;
        margin-left: 10px;
        .action {
          cursor: pointer;
          &:hover {

          }
        }
        .action-remove {
          padding-right: 5px;
          padding-left: 5px;
          border: 1px solid;
          border-color: transparent;
          border-radius: 28px;
          transition: border-color 0.25s ease;
          &:hover {
            border-color: @brand-danger;
          }
        }
      }
      >.label {
        width: @col-label;
        text-align: right;
        line-height: 2.5;
        color: @gray-dark;
        font-weight: normal;
        line-height: 12px;
        a {
          cursor: help;
          text-decoration: none;
          color: @gray-dark;
          line-height: 12px;
          font-weight: normal;
          border-bottom: dashed transparent 1px;
          vertical-align: middle;
          &:hover {
            text-decoration: none;
            border-bottom: 1px dashed;
          }
        }
      }
      >.value {
        float: left;
        width: @col-value;
        input {
          padding: 0px;
          width: 100%;
        }
      }
    }
  }
  .node-linked {
    > div.expanded {
      width: @col-value;
    }
  }
  .node-anonymous {
    width: 420px;
    clear: left;
  }
}

</style>
