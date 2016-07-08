<script>
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';
import AnonymousValue from './anonymousvalue';
import LinkedItem from './linkeditem';
import * as editUtil from '../utils/edit';

export default {
  name: 'data-node',
  props: ['key', 'value', 'vocab', 'label', 'linked'],
  components: {
    'processed-label': ProcessedLabel,
    'anonymous-value': AnonymousValue,
    'linked-item': LinkedItem,
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
      Vue.nextTick(() => {
        object.focus();
      });
    },
    emptyValue() {
      this.$dispatch('update-value', this.key, {});
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
        <div v-if="isPlainObject(v) && v['@id']">
          <linked-item :item="getLinked(v['@id'])" :index="$index"></linked-item>
        </div>
        <div v-if="isPlainObject(v) && !v['@id']">
          <anonymous-value :value="v" :key="key" :vocab="vocab" :linked="linked"></anonymous-value>
        </div>
        <div v-if="!isPlainObject(v)">
          <input v-el:input v-model="v" v-on:keyup="updateArray($index, v)"></input>
        </div>
      </li>
    </ul>
  </div>
  <div v-if="isPlainObject(value) && value['@id']">
    <linked-item :item="getLinked(value['@id'])"></linked-item>
  </div>
  <div v-if="isPlainObject(value) && !value['@id']">
    <anonymous-value :value="value" :linked="linked"></anonymous-value>
  </div>
  <div v-if="!isArray(value) && !isPlainObject(value)">
    <input v-model="value" v-on:keyup="updateValue(value)"></input>
  </div>
</template>
