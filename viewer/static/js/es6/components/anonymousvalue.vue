<script>
import * as _ from 'lodash';
import DataNode from './datanode';
import LinkedItem from './linkeditem';
import LinkAdder from './linkadder';
import * as editUtil from '../utils/edit';
import { getVocabulary, getSettings } from '../vuex/getters';

export default {
  props: {
    key: {},
    value: {},
    linked: {},
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
    }
  },
  methods: {
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    removeThis() {
      const holder = this.$parent.value;
      if (_.isArray(holder)) {
        holder.$remove(this.value);
      } else {
        this.$parent.emptyValue();
      }
    },
    removeKey(key) {
      this.value[key] = null;
    },
    getLinked(id) {
      return editUtil.getLinked(id, this.linked);
    },
  },
  components: {
    'data-node': DataNode,
    'linked-item': LinkedItem,
    'link-adder': LinkAdder,
  },
};
</script>

<template>
  <li class="anonymous-value">
    <span class="class" v-if="value['@type']">{{value['@type'] | labelByLang }}</span>
    <span class="class unknown" v-if="!value['@type']">OKÄND TYP</span>
    <i class="fa fa-close" v-on:click="removeThis()"></i>
    <ul>
      <li v-for="(k, v) in value" v-if="k !== '@type'">
        <span class="label-horizontal">{{k | labelByLang | capitalize}}</span>
        <input v-if="v !== null && !isPlainObject(v)" v-model="v" debounce="250"></input>
        <linked-item v-if="v !== null && isPlainObject(v)" :key="k" :item="getLinked(v['@id'])"></linked-item>
        <link-adder v-if="v === null" :key="k" :allow-anon="false"></link-adder>
      </li>
    </ul>
  </li>
</template>
