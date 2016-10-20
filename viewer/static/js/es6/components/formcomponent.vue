<script>
/*
  This component is responsible for the actual changes to the formdata.
  It recieves modification events from other components through $dispatch calls
  and makes changes to the bound 'focus' object accordingly.
*/

import * as _ from 'lodash';
import LinkAdder from './linkadder';
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
      let allowed = VocabUtil.getInheritedProperties(formObj['@type'], this.vocab, this.settings.vocabPfx);

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
    'field-adder': FieldAdder,
  },
};
</script>

<template>
  <div class="form-component">
    <ul>
      <li v-for="(k, v) in formData" v-if="v !== null" v-bind:class="{ 'locked': isLocked }">
        <span class="label">
          <a href="/vocab/#{{k}}">{{ k | labelByLang | capitalize }}</a>
        </span>
        <span class="value">
          <data-node v-if="!isEmptyObject(v)" :is-locked="isLocked" :key="k" :value="v" :linked="linked"></data-node>
          <link-adder v-if="!isLocked && (isRepeatable(k) || isEmptyObject(v))" :key="k" :allow-anon="true"></link-adder>
        </span>
        <span v-if="!isLocked" class="delete" v-on:click="removeField(k)"><i class="fa fa-close"></i></span>
      </li>
    </ul>
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :item="focus"></field-adder>
    <div id="result">
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
