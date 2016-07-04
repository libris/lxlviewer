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
  computed: {
    allowedProperties() {
      const props = [];
      const self = this;

      const vocabItems = this.vocab.descriptions;
      // Types defined on the item
      const types = [].concat(self.focus['@type']);
      // Find their base classes
      let classes = [];
      for (let t = 0; t < types.length; t++) {
        const c = VocabUtil.getClass(types[t], self.vocab, self.vocabPfx);
        classes.push(c);
        classes = classes.concat(VocabUtil.getBaseClasses(c, self.vocab, self.vocabPfx));
      }
      const classNames = [];
      for (let i = 0; i < classes.length; i++) {
        classNames.push(classes[i]['@id']);
      }
      // Get the properties
      for (let i = 0; i < vocabItems.length; i++) {
        if (vocabItems[i].hasOwnProperty('domainIncludes')) {
          for (let t = 0; t < vocabItems[i].domainIncludes.length; t++) {
            const prop = vocabItems[i];
            const type = vocabItems[i].domainIncludes[t]['@id'];
            if (
              classNames.indexOf(type) !== -1 &&
              props.filter((p) => p['@id'] === prop['@id']).length === 0
            ) {
              props.push(prop);
            }
          }
        }
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
      if (prop['@type'].indexOf('ObjectProperty') !== -1) {
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
    <field-adder :allowed="allowedProperties" :lang="lang"></field-adder>

  </div>
</template>
