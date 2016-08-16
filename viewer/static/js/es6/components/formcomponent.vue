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
import * as VocabUtil from '../utils/vocab'

export default {
  props: {
    focus: {},
    vocab: {},
    linked: {},
    vocabPfx: {},
    lang: '',
  },
  computed: {
    allowedProperties() {
      return VocabUtil.getInheritedProperties(this.focus['@type'], this.vocab, this.vocabPfx);
    },
  },
  watch: {
    'focus': function(val, oldval) {
      this.$dispatch('focus-update', val, oldval);
    },
  },
  events: {
    'add-field': function (prop) {
      const newItem = {};
      const key = prop['@id'].replace(this.vocabPfx, '');
      if (prop['@type'] && prop['@type'].indexOf('ObjectProperty') !== -1) {
        newItem[key] = [];
      } else {
        newItem[key] = '';
      }
      this.focus = Object.assign({}, this.focus, newItem);
    },
    'add-item': function (key, item) {
      this.linked.push(item);
      const modified = this.focus;
      const newItem = { '@id': item['@id'] };
      modified[key].push(newItem);
      this.focus = Object.assign({}, this.focus, modified);
    },
    'remove-item': function (key, item) {
      const keyWithout = _.reject(this.focus[key], (o) => o === item);
      const modified = this.focus;
      modified[key] = keyWithout;
      this.focus = Object.assign({}, this.focus, modified);
    },
    'update-value': function (key, value) {
      this.focus[key] = value;
    },
    'add-anonymous': function (key, item) {
      const modified = this.focus;
      if (_.isArray(modified[key])) {
        modified[key].push(item);
      } else {
        modified[key] = item;
      }
      this.focus = Object.assign(this.focus, modified);
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
      <li v-for="(k, v) in focus" v-if="v !== null">
        <span class="label">
          <a href="/vocab/#{{k}}">{{ k | labelByLang | capitalize }}</a>
        </span>
        <span class="value">
          <data-node v-if="!isEmptyObject(v)" :key="k" :value="v" :linked="linked"></data-node>
          <link-adder v-if="isArray(v) || isEmptyObject(v)" :key="k" :vocab="vocab" :vocab-pfx="vocabPfx" :allow-anon="true"></link-adder>
        </span>
        <span class="delete" v-on:click="removeField(k)"><i class="fa fa-close"></i></span>
      </li>
    </ul>
    <field-adder :allowed="allowedProperties" :item="focus" :vocab-pfx="vocabPfx" :lang="lang"></field-adder>
  </div>
</template>
