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
import * as VocabUtil from '../utils/vocab';
import { updateForm } from '../vuex/actions';
import { getVocabulary, getSettings, getEditorData } from '../vuex/getters';

export default {
  vuex: {
    actions: {
      updateForm,
    },
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      editorData: getEditorData,
    }
  },
  props: {
    focus: '',
    linked: {},
    isLocked: false,
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
      this.$dispatch('update-value', prop, null);
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
    <ul>
      <li v-for="(k, v) in formData" v-if="v !== null" v-bind:class="{ 'locked': isLocked }">
        <span class="label">
          <a href="/vocab/#{{k}}">{{ k | labelByLang | capitalize }}</a>
        </span>
        <span class="value">
          <data-node v-if="!isEmptyObject(v)" :is-locked="isLocked" :key="k" :value="v" :linked="linked"></data-node>
        </span>
        <span class="action">
          <entity-adder v-if="!isLocked && (isRepeatable(k) || isEmptyObject(v))" :key="k"></entity-adder>
        </span>
      </li>
    </ul>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :item="focus"></field-adder>
    <div id="result" v-if="!isLocked">
      <h2 v-on:click="showJson = !showJson">JSON
      </h2>
      <i class="fa" v-bind:class="{'fa-chevron-right': !showJson, 'fa-chevron-down': showJson}"></i>
      <div v-show="showJson">
      <h3>Record</h3>
      <textarea :value="formData | json" @input="updateFromTextarea">
      </textarea>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@gray-lighter: #e0e6e9;
@gray-darker: #595d61;
@neutral-color: #ffffff;
@node-bg: #fafafa;

// Column widths
@col-label: 200px;
@col-value: 670px;
@col-action: 200px;

.form-component {
  padding: 20px;
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
      padding: 5px 0px;
      list-style: none;
      width: 100%;
      background-color: @node-bg;
      &:nth-child(odd) {
        background-color: darken(@node-bg, 2%);
      }
      &:hover {
        >.action {
          opacity: 1;
        }
      }
      border: solid;
      border-width: 1px 0px 1px 0px;
      border-top-color: white;
      border-bottom-color: @gray-lighter;
      >.action {
        display: inline-block;
        float: left;
        width: @col-action;
        transition: opacity ease 0.2s;
        opacity: 0;
        padding-left: 10px;
        margin-right: 25px;
      }
      >.label {
        float: left;
        display: inline-block;
        width: @col-label;
        text-align: right;
        vertical-align: top;
        line-height: 2.5;
        color: @gray-darker;
        a {
          cursor: help;
          text-decoration: none;
          color: #949a9e;
          line-height: 12px;
          font-weight: normal;
          border-bottom: dashed transparent 1px;
          display: inline-block;
          &:hover {
            text-decoration: none;
            border-bottom: 1px dashed;
          }
        }
      }
      >.value {
        float: left;
        width: @col-value;
        display: inline-block;
        padding: 5px 15px 0px 0px;
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
    width: 420px;
  }
  .node-linked {
    margin: 0px 15px 0px 0px;
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
