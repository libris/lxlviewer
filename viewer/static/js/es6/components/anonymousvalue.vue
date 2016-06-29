<script>
import * as _ from 'lodash';
import DataNode from './datanode';
import LinkedItem from './linkeditem';
import * as editUtil from '../utils/edit';

export default {
  props: {
    key: {},
    value: {},
    vocab: {},
    linked: {},
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
    getLinked(id) {
      return editUtil.getLinked(id, this.linked);
    },
  },
  components: {
    'data-node': DataNode,
    'linked-item': LinkedItem,
  },
};
</script>

<template>
  <li class="anonymous-value">
    <span class="class">{{value['@type'] | labelByLang }}</span>
    <i class="fa fa-close" v-on:click="removeThis()"></i>
    <ul>
      <li v-for="(k, v) in value" v-if="k !== '@type'">
        <small>{{k | labelByLang | capitalize}}</small><br>
        <input v-if="!isPlainObject(v)" v-model="v" debounce="250"></input>
        <!-- <data-node :value="v" :key="k" :index="index"></data-node> -->
        <linked-item v-else :item="getLinked(v['@id'])"></linked-item>
      </li>
    </ul>
  </li>
</template>
