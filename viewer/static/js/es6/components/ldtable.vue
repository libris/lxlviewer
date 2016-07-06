<script>
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
  data() {
    return {
      allowedProperties: VocabUtil.getInheritedProperties(this.focus['@type'], this.vocab, this.vocabPfx),
    }
  },
  computed: {
    properties() {
      console.log("properties called");
      const props = this.allowedProperties;
      for (let i = 0; i < props.length; i++) {
        const pId = props[i].item['@id'].replace(this.vocabPfx, '');
        props[i].isAdded = (this.focus.hasOwnProperty(pId) && this.focus[pId] !== null);
      }
      return props;
    },
  },
  methods: {
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    removeItem(key, item) {
      const keyWithout = _.reject(this.focus[key], (o) => o === item);
      const modified = this.focus;
      modified[key] = keyWithout;
      this.focus = Object.assign({}, this.focus, modified);
    },
    addItem(key, item) {
      this.linked.push(item);
      const modified = this.focus;
      const newItem = { '@id': item['@id'] };
      modified[key].push(newItem);
      this.focus = Object.assign({}, this.focus, modified);
    },
    addAnonymous(key, item) {
      const modified = this.focus;
      if (_.isArray(modified[key])) {
        modified[key].push(item);
      } else {
        modified[key] = item;
      }
      this.focus = Object.assign(this.focus, modified);
    },
    isEmptyObject(value) {
      return (Object.keys(value).length === 0 && value !== '');
    },
    addField(prop) {
      const newItem = {};
      const key = prop['@id'].replace(this.vocabPfx, '');
      if (prop['@type'] && prop['@type'].indexOf('ObjectProperty') !== -1) {
        newItem[key] = [];
      } else {
        newItem[key] = '';
      }
      this.focus = Object.assign({}, this.focus, newItem);
    },
    removeField(prop) {
      this.updateValue(prop, null);
    },
    updateValue(key, value) {
      this.focus[key] = value;
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
  <div>
    <ul>
      <li v-for="(k, v) in focus" v-if="v !== null">
        <span class="label">
          <a href="/vocab/#{{k}}">{{ k | labelByLang | capitalize }}</a>
        </span>
        <span class="value">
          <data-node v-if="!isEmptyObject(v)" :key="k" :value="v" :linked="linked"></data-node>
          <link-adder v-if="isArray(v) || isEmptyObject(v)" :key="k" :vocab="vocab" :vocab-pfx="vocabPfx"></link-adder>
        </span>
        <span class="delete" v-on:click="removeField(k)"><i class="fa fa-close"></i></span>
      </li>
    </ul>
    <field-adder :allowed="properties" :lang="lang"></field-adder>

  </div>
</template>
