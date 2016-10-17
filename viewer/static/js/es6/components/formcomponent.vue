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
import { syncPost } from '../vuex/actions';
import { getVocabulary, getSettings } from '../vuex/getters';

export default {
  vuex: {
    actions: {
      sync: syncPost,
    },
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
    }
  },
  props: {
    focus: {},
    linked: {},
    isLocked: false,
  },
  computed: {
    allowedProperties() {
      return VocabUtil.getInheritedProperties(this.focus['@type'], this.vocab, this.settings.vocabPfx);
    },
  },
  watch: {
    'focus': function(val, oldval) {
      // this.$dispatch('focus-update', val, oldval);
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
      this.$dispatch('check-changes');
    },
    'add-item': function (key, item) {
      this.linked.push(item);
      const modified = this.focus;
      const newItem = { '@id': item['@id'] };
      modified[key].push(newItem);
      this.focus = Object.assign({}, this.focus, modified);
      this.$dispatch('check-changes');
    },
    'remove-item': function (key, item) {
      const keyWithout = _.reject(this.focus[key], (o) => o === item);
      const modified = this.focus;
      modified[key] = keyWithout;
      this.focus = Object.assign({}, this.focus, modified);
      this.$dispatch('check-changes');
    },
    'update-value': function (key, value) {
      this.focus[key] = value;
      this.$dispatch('check-changes');
    },
    'add-anonymous': function (key, item) {
      const modified = this.focus;
      if (_.isArray(modified[key])) {
        modified[key].push(item);
      } else if (!this.isEmptyObject(modified[key])) {
        modified[key] = [modified[key], item];
      } else {
        modified[key] = item;
      }
      this.focus = Object.assign(this.focus, modified);
      this.$dispatch('check-changes');
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
      <li v-for="(k, v) in focus" v-if="v !== null" v-bind:class="{ 'locked': isLocked }">
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
    <field-adder v-if="!isLocked" :allowed="allowedProperties" :item="focus" :vocab-pfx="vocabPfx"></field-adder>
  </div>
</template>
