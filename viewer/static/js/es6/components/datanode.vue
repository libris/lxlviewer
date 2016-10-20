<script>
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';
import AnonymousValue from './anonymousvalue';
import LinkedItem from './linkeditem';
import * as editUtil from '../utils/edit';
import * as VocabUtil from '../utils/vocab';
import { getVocabulary, getSettings } from '../vuex/getters';

export default {
  name: 'data-node',
  props: ['key', 'value', 'label', 'linked', 'isLocked'],
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
    }
  },
  components: {
    'processed-label': ProcessedLabel,
    'anonymous-value': AnonymousValue,
    'linked-item': LinkedItem,
  },
  computed: {
    propertyTypes: function () {
      return VocabUtil.getPropertyTypes(this.key, this.vocab, this.settings.vocabPfx);
    },
    valueByIdPresence: function () {
      const list = _.sortBy(this.value, [function(o) { return o['@id']; }]);
      return list;
    },
  },
  methods: {
    isMarc(key) {
      if (typeof key === 'undefined') {
        return false;
      }
      return (
        !!~key.indexOf('marc:') || !!~key.indexOf('_marc')
      );
    },
    updateValue(value) {
      this.$dispatch('update-value', this.key, value);
    },
    updateArray(index, value) {
      const object = this.$el;
      this.value.$set(index, value);
    },
    emptyValue() {
      this.$dispatch('update-value', this.key, {});
    },
    removeKey(key) {
      this.emptyValue();
    },
    getLinked(id) {
      return editUtil.getLinked(id, this.linked);
    },
    isEditable(key) {
      const tempNotEditable = [
        '@id',
        '@type',
        'controlNumber',
        'systemNumber',
        'created',
        'modified',
      ];
      return !~tempNotEditable.indexOf(key);
    },
    removeByIndex(index) {
      const modified = this.value;
      modified.splice(index, 1);
      this.updateValue(modified);
    },
    removeById(id) {
      let modified = this.value;
      modified = _.filter(this.value, function(n) {
        return n['@id'] !== id;
      });
      this.updateValue(modified);
    },
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    removeItem(key, value) {
      this.$dispatch('remove-item', key, value);
    },
  },
};
</script>

<template>
  <div v-if="isArray(value)">
    <ul>
      <li v-for="v in valueByIdPresence" v-bind:class="{'display-block': !v['@id'] }">
        <div v-if="isPlainObject(v) && v['@id']" class="node-linked">
          <linked-item :is-locked="isLocked" :item="getLinked(v['@id'])" :key="key" :index="$index"></linked-item>
        </div>
        <div v-if="isPlainObject(v) && !v['@id']" class="node-anonymous">
          <anonymous-value :is-locked="isLocked" :value="v" :key="key" :linked="linked"></anonymous-value>
        </div>
        <div v-if="!isPlainObject(v)" class="node-input">
          <input v-if="!isLocked" v-el:input v-model="v" v-on:keyup="updateArray($index, v)"></input>
          <span v-if="isLocked">{{v}}</span>
        </div>
      </li>
    </ul>
  </div>
  <div v-if="isPlainObject(value) && value['@id']" class="node-linked">
    <linked-item :is-locked="isLocked" :item="getLinked(value['@id'])"></linked-item>
  </div>
  <div v-if="isPlainObject(value) && !value['@id']" class="node-anonymous">
    <anonymous-value :is-locked="isLocked" :value="value" :linked="linked"></anonymous-value>
  </div>
  <div v-if="!isArray(value) && !isPlainObject(value)" class="node-input">
    <input v-if="!isLocked" v-model="value" v-on:keyup="updateValue(value)"></input>
    <span v-if="isLocked">{{value}}</span>
  </div>
</template>
