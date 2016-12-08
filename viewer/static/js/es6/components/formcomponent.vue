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
    isWork() {
      return this.focus === 'work';
    },
    isInstance() {
      return this.focus === 'it';
    },
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
    changeState() {
      this.$dispatch('change-state', this.focus);
    },
  },
  components: {
    'data-node': DataNode,
    'field-adder': FieldAdder,
  },
};
</script>

<template>
  <div class="form-component" :class="{ 'locked': isLocked, 'work-state': isWork, 'instance-state': isInstance, 'focused-form-component': status.state === this.focus }">
    <div class="form-header" :class="{ 'work-state': isWork, 'instance-state': isInstance }">
      <span>{{ sortedFormData['@type'] | labelByLang | capitalize }}fält</span>
      <span v-if="isLocked" class="edit-locked" :class="{ 'work-state': isWork, 'instance-state': isInstance }" @click="changeState()"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Gå till verk</span>
    </div>
    <data-node v-for="(k,v) in sortedFormData" v-bind:class="{ 'locked': isLocked }" :is-locked="keyIsLocked(k)" :key="k" :value="v" :linked="linked" :focus="focus" :status="status"></data-node>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :focus="focus"></field-adder>
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
@import './variables.less';

.form-component {
  &.instance-state {
    >.data-node {
      background-color: @instance-field;
      &:nth-child(odd) {
        background-color: darken(@instance-field, 5%);
      }
    }
  }
  &.work-state {
    >.data-node {
      background-color: @work-field;
      &:nth-child(odd) {
        background-color: darken(@work-field, 5%);
      }
    }
  }

  .form-header {
    &.instance-state {
      background-color: @instance-background;
    }
    &.work-state {
      background-color: @work-background;
    }
    .edit-locked {
      font-size: 15px;
      float: right;
      cursor: pointer;
      margin-right: 10px;
      padding: 1px 4px;
      border-radius: 2px;
      transition: all ease 0.1s;
      &:hover {
        transform: scale(0.98);
      }
      i {
        margin-left: 2px;
      }
    }
    font-weight: bold;
    font-size: 18px;
    text-align: center;
    padding: 10px 0px;
    color: white;
  }
  margin: 40px 20px;

  &.locked {
    border-radius: 10px;
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
