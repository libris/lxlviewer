<script>
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';
import AnonymousValue from './anonymousvalue';
import LinkedItem from './linkeditem';
import * as editUtil from '../utils/edit';
import * as VocabUtil from '../utils/vocab';

export default {
  name: 'data-node',
  props: ['key', 'value', 'vocab', 'vocab-pfx', 'label', 'linked'],
  components: {
    'processed-label': ProcessedLabel,
    'anonymous-value': AnonymousValue,
    'linked-item': LinkedItem,
  },
  computed: {
    propertyTypes: function () {
      return VocabUtil.getPropertyTypes(this.key, this.vocab, this.vocabPfx);
    }
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
      this.value = modified;
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
      <li v-for="v in value">
        <div v-if="isPlainObject(v) && v['@id']" class="node-linked">
          <linked-item :item="getLinked(v['@id'])" :key="key" :index="$index"></linked-item>
        </div>
        <div v-if="isPlainObject(v) && !v['@id']" class="node-anonymous">
          <anonymous-value :value="v" :key="key" :vocab="vocab" :linked="linked"></anonymous-value>
        </div>
        <div v-if="!isPlainObject(v)" class="node-input">
          <input v-el:input v-model="v" v-on:keyup="updateArray($index, v)"></input>
        </div>
      </li>
    </ul>
  </div>
  <div v-if="isPlainObject(value) && value['@id']" class="node-linked">
    <linked-item :item="getLinked(value['@id'])"></linked-item>
  </div>
  <div v-if="isPlainObject(value) && !value['@id']" class="node-anonymous">
    <anonymous-value :value="value" :linked="linked" :vocab="vocab"></anonymous-value>
  </div>
  <div v-if="!isArray(value) && !isPlainObject(value)" class="node-input">
    <input v-model="value" v-on:keyup="updateValue(value)"></input>
  </div>
</template>
