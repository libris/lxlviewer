<script>
import * as _ from 'lodash';
import LinkAdder from './linkadder';
import DataNode from './datanode';
import LinkedItem from './linkeditem';
import * as VocabUtil from '../utils/vocab'

export default {
  props: {
    focus: {},
    vocab: {},
    linked: {},
    vocabPfx: {},
  },
  computed: {
    allowedProperties() {
      const props = [];
      const vocabItems = this.vocab.descriptions;
      const self = this;

      function getBaseClasses(classObj) {
        let items = [];
        if (classObj && classObj.hasOwnProperty('subClassOf')) {
          for (let i = 0; i < classObj.subClassOf.length; i++) {
            const baseClassId = classObj.subClassOf[i]['@id'];
            const baseClass = VocabUtil.getClass(baseClassId, self.vocab, self.vocabPfx);
            if (
              baseClass &&
              baseClass.isDefinedBy &&
              baseClass.isDefinedBy['@id'] === self.vocabPfx
            ) {
              items = items.concat(getBaseClasses(baseClass));
              items.push(baseClass);
            }
          }
        }
        return items;
      }

      // Types defined on the item
      const types = [].concat(this.focus['@type']);

      // Find their base classes
      let classes = [];
      for (let t = 0; t < types.length; t++) {
        const c = VocabUtil.getClass(this.vocabPfx + types[t], self.vocab, self.vocabPfx);
        classes = classes.concat(getBaseClasses(c));
      }
      const classNames = [];
      for (let i = 0; i < types.length; i++) {
        classNames.push(`${this.vocabPfx}${types[i]}`);
      }
      for (let i = 0; i < classes.length; i++) {
        classNames.push(classes[i]['@id']);
      }
      // Get the properties
      for (let i = 0; i < vocabItems.length; i++) {
        if (vocabItems[i] && vocabItems[i].hasOwnProperty('domainIncludes')) {
          for (let t = 0; t < vocabItems[i].domainIncludes.length; t++) {
            const type = vocabItems[i].domainIncludes[t]['@id'];
            const prop = vocabItems[i];
            if (
              classNames.indexOf(type) !== -1 &&
              props.filter((p) => p['@id'] === prop['@id']).length === 0 &&
              !_.has(this.focus, prop['@id'].replace(this.vocabPfx, ''))
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
    isEmpty(value) {
      return Object.keys(value).length === 0;
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
    updateValue(key, value) {
      this.focus[key] = value;
    },
  },
  components: {
    'link-adder': LinkAdder,
    'data-node': DataNode,
    'linked-item': LinkedItem,
  },
};
</script>

<template>
  <div>
    <ul>
      <li v-for="(k, v) in focus">
        <span class="label">
          <a href="/vocab/#{{k}}">{{ k | labelByLang | capitalize }}</a>
        </span>
        <span class="value">
          <data-node v-if="!isEmpty(v)" :key="k" :value="v" :linked="linked"></data-node>
          <link-adder v-if="isArray(v) || isEmpty(v)" :key="k" :vocab="vocab" :vocab-pfx="vocabPfx"></link-adder>
        </span>
      </li>
    </ul>
    <div class="fieldAdder">
      <h3>Lägg till fält:</h3>
      <ul>
        <li v-for="prop in allowedProperties">
          <span class="fieldLabel" title="{{prop['@id'] | labelByLang | capitalize }}">
            {{prop['@id'] | labelByLang | capitalize }}
          </span>
          <span class="typeLabel" title="{{prop['@type']}}">{{prop['@type']}}</span>
          <span class="typeLabel" title="{{prop.note}}">{{prop.note}}</span>
          <a v-on:click="addField(prop)">Lägg till <i class="fa fa-plus-circle"></i></a>
        </li>
        <li v-if="allowedProperties.length === 0">Hittade inga möjliga fält att lägga till.</li>
      </ul>
    </div>
  </div>
</template>
