<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import * as _ from 'lodash';
import LinkAdder from './linkadder';
import EntityAdder from './entityadder';
import FieldAdder from './fieldadder';
import DataNode from './datanode';
import LinkedItem from './linkeditem';
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
    }
  },
  props: {
    focus: '',
    linked: {},
    isLocked: false,
    status: {},
  },
  data() {
    return {
      showJson: false,
    }
  },
  computed: {
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.formData;
      let allowed = VocabUtil.getPropertiesFromArray(formObj['@type'], this.vocab, this.settings.vocabPfx);

      // Add the "added" property
      allowed = _.forEach(allowed, function(o) {
        const oId = o.item['@id'].replace(settings.vocabPfx, '');
        o.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      });

      return allowed;
    },
    formData() {
      return this.editorData[this.focus];
    },
    sortedProperties() {
      const formObj = this.formData;

      // Try to get properties from type of object
      // If none found, try baseClasses
      let propertyList = DisplayUtil.getProperties(formObj['@type'], 'cards', this.display);
      if (propertyList.length === 0) { // If none were found, traverse up inheritance tree
        const baseClasses = VocabUtil.getBaseClassesFromArray(formObj['@type'], this.vocab, this.settings.vocabPfx);
        for (let i = 0; i < baseClasses.length; i++) {
          propertyList = DisplayUtil.getProperties(baseClasses[i].replace(this.settings.vocabPfx, ''), 'cards', this.display);
          if (propertyList.length > 0) {
            break;
          }
        }
        if (propertyList.length === 0) {
          propertyList = getProperties('Resource', 'chips', displayDefs);
        }
      }

      _.each(formObj, function(v, k) {
        if(!propertyList.includes(k)){
          propertyList.push(k);
        }
      });
      _.remove(propertyList, function(x) {
        return _.isObject(x);
      });
      return propertyList;
    },
  },
  events: {
    'add-field': function (prop) {
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
    'add-item': function (key, item) {
      this.linked.push(item);
      const modified = this.formData;
      const newItem = { '@id': item['@id'] };
      modified[key].push(newItem);
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'remove-item': function (key, item) {
      const keyWithout = _.reject(this.formData[key], (o) => o === item);
      const modified = this.formData;
      modified[key] = keyWithout;
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'update-value': function (key, value) {
      const modified = this.formData;
      modified[key] = value;
      const merged = Object.assign({}, this.formData, modified);
      this.updateForm(this.focus, merged);
    },
    'add-anonymous': function (key, item) {
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
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    isEmptyObject(value) {
      return (Object.keys(value).length === 0 && value !== '');
    },
    removeField(prop) {
      const pLabel = VocabUtil.getLabelByLang(prop, this.settings.lang, this.vocab, this.settings.vocabPfx);
      ModalUtil.confirmDialog(
        {
          sTitle: `Ta bort fältet "${pLabel}"?`,
          sContent: `Detta tar bort fältet "${pLabel}" och allt dess innehåll.`,
          sAccept: 'Ta bort',
          sReject: 'Avbryt',
          sType: 'danger'
        }
      ).then(() => {
          // accepted by user
          this.$dispatch('update-value', prop, null);
        }, () => {
          // declined
        });
    },
    isRepeatable(property) {
      const types = VocabUtil.getPropertyTypes(property, this.vocab, this.settings.vocabPfx);
      return types.indexOf('FunctionalProperty') < 0;
    },
    updateFromTextarea(e) {
      this.updateForm(this.focus, JSON.parse(e.target.value));
    },
  },
  components: {
    'link-adder': LinkAdder,
    'data-node': DataNode,
    'linked-item': LinkedItem,
    'entity-adder': EntityAdder,
    'field-adder': FieldAdder,
  },
};
</script>

<template>
  <div class="form-component" v-bind:class="{ 'locked': isLocked }">
    <div class="form-header">- {{ focus }} -</div>
    <ul>
      <li v-for="property in sortedProperties" v-if="formData[property] !== null" v-bind:class="{ 'locked': isLocked }">
        <div class="label">
          <a href="/vocab/#{{property}}">{{ property | labelByLang | capitalize }}</a>
        </div>
        <div class="value">
          <data-node v-if="formData[property] && !isEmptyObject(formData[property])" :is-locked="isLocked" :key="property" :value="formData[property]" :linked="linked"></data-node>
        </div>
        <div class="actions">
          <div class="action" v-if="!isLocked" class="delete" v-on:click="removeField(property)"><i class="fa fa-trash fa-2x"></i></div>
          <entity-adder class="action" v-if="!isLocked && (isRepeatable(property) || isEmptyObject(formData[property]))" :key="property"></entity-adder>
          
        </div>
      </li>
    </ul>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :item="focus"></field-adder>
    <div id="result" v-if="status.isDev">
      <textarea :value="formData | json" @input="updateFromTextarea">
      </textarea>
    </div>
  </div>
</template>

<style lang="less">
@import '../../../less/main_libris.less';
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
      &:nth-child(odd) {
        background-color: darken(@node-bg, 2%);
      }
      &:hover {
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
        opacity: 0;
        margin-right: 6px;
        margin-left: 10px;
        .action {
          cursor: pointer;
          &:hover {

          }
        }
      }
      >.label {
        width: @col-label;
        text-align: right;
        line-height: 2.5;
        color: @gray-darker;
        a {
          cursor: help;
          text-decoration: none;
          color: #949a9e;
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
        > div {
          > ul > li {
            display: inline-block;
          }
        }
        input {
          padding: 0px;
          width: 100%;
        }
      }
    }
  }
  .node-input {
    width: 100%;
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
