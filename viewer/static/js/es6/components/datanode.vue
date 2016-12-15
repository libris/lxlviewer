<script>
/*
  The datanode component is responsible for a specific key value pair.
  It's responsible for its own data, and dispatches all changes to the form component.
*/
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';
import EntityAdder from './entityadder';
import ItemEntity from './item-entity';
import ItemEmbedded from './item-embedded';
import ItemValue from './item-value';
import ItemAnonymous from './item-anonymous';
import * as VocabUtil from '../utils/vocab';
import { getVocabulary, getSettings } from '../vuex/getters';

export default {
  name: 'data-node',
  props: [
    'pkey',
    'pindex',
    'key',
    'value',
    'label',
    'linked',
    'isLocked',
    'focus',
    'status',
    'allow-anon',
    'embedded',
    'is-removable',
  ],
  vuex: {
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
    },
  },
  components: {
    'processed-label': ProcessedLabel,
    'item-entity': ItemEntity,
    'item-value': ItemValue,
    'item-embedded': ItemEmbedded,
    'item-anonymous': ItemAnonymous,
    'entity-adder': EntityAdder,
  },
  computed: {
    getPath() {
      if (typeof this.pkey !== 'undefined' && typeof this.pindex !== 'undefined') {
        return `${this.pkey}[${this.pindex}].${this.key}`;
      } else if (typeof this.pkey !== 'undefined') {
        return `${this.pkey}.${this.key}`;
      }
      return `${this.key}`;
    },
    propertyTypes() {
      return VocabUtil.getPropertyTypes(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
    },
    hasSingleValue() {
      if (!_.isArray(this.value) || this.value.length === 1) {
        return true;
      } else {
        return false;
      }
    },
    stackable() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    valueByIdPresence() {
      const list = _.sortBy(this.value, [(o) => (o['@id'])]);
      return list;
    },
    isRepeatable() {
      const types = VocabUtil.getPropertyTypes(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
      return types.indexOf('FunctionalProperty') < 0;
    },
    isEmptyObject() {
      const value = this.value;
      if (typeof value === 'undefined') {
        return true;
      }
      if (!_.isObject(value)) {
        return false;
      }
      const bEmpty = (Object.keys(value).length === 0);
      return bEmpty;
    },
    isLastAdded() {
      if (this.status.lastAdded === this.getPath) {
        return true;
      }
      return false;
    },
  },
  events: {
    'update-item'(index, value) {
      let modified = _.cloneDeep(this.value);
      if (typeof index !== 'undefined' && index !== '') {
        modified[index] = value;
      } else {
        modified = value;
      }
      this.updateValue(modified);
    },
    'remove-item'(index) {
      let modified = _.cloneDeep(this.value);
      if (typeof index !== 'undefined' && index !== '') {
        modified.splice(index, 1);
      } else {
        modified = [];
      }
      this.updateValue(modified);
    },
    'add-item'(value) {
      console.log("DataNode:"+ this.getPath +" - Adding", JSON.stringify(value));
      let insertedValue = {};
      if (value.hasOwnProperty('@id')) { // This is a linked item
        insertedValue = { '@id': value['@id'] };
        this.$dispatch('add-linked', value);
      } else {
        insertedValue = value;
      }
      const modified = [].concat(_.cloneDeep(this.value));
      modified.push(insertedValue);
      this.updateValue(modified);
    },
  },
  ready() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.isLastAdded) {
          const position = this.$el.offsetTop - (0.25 * window.innerHeight);
          this.scrollTo(document.scrollingElement, position, 600, 600, Number.MAX_SAFE_INTEGER, () => {
            this.$dispatch('update-last-added', '');
          });
        }
      }, 300);
    });
  },
  methods: {
    scrollTo(element, to, timeLeft, duration, oldDiff, callback) {
      let durationThreshold = 10;
      const difference = to - element.scrollTop;
      const distanceFromBottom = element.offsetHeight - element.scrollTop - window.innerHeight;
      const userScrollInterrupt = Math.abs(difference) > Math.abs(oldDiff);
      if (userScrollInterrupt) {
        console.log(Math.abs(difference), Math.abs(oldDiff));
      }
      if (Math.abs(difference) <= 1 || distanceFromBottom === 0 || userScrollInterrupt) {
        callback();
        return;
      } else if (timeLeft < (duration / 2)) {
        durationThreshold = timeLeft / (duration / 20);
      }

      let perTick = difference / timeLeft * durationThreshold;
      setTimeout(() => {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        this.scrollTo(element, to, timeLeft - durationThreshold, duration, difference, callback);
      }, durationThreshold);
    },
    updateValue(value) {
      if (this.pkey && this.pindex !== '') {
        const path = this.pkey + '[' + this.pindex + ']' + '.' + this.key;
        this.$dispatch('update-value', path, value);
      } else if (this.pkey) {
        const path = this.pkey + '.' + this.key;
        this.$dispatch('update-value', path, value);
      } else {
        this.$dispatch('update-value', this.key, value);
      }
    },
    removeThis() {
      if (this.pkey) {
        console.warn('Remove was called on an embedded field, this is not supported.');
        return false;
      } else {
        this.$dispatch('remove-field', this.key);
      }
    },
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
    isLinked(o) {
      return (o.hasOwnProperty('@id') && !o.hasOwnProperty('@type'));
    },
    isEmbedded(o) {
      const type = o['@type'];
      if (typeof type === 'undefined') {
        return false;
      }
      // Is the type of the item derived from an "embedded" type?
      const embeddedTypes = this.settings.embeddedTypes;
      const typeChain = VocabUtil.getBaseClassesFromArray(type, this.vocab, this.settings.vocabPfx);
      if (typeChain.length > 0) {
        for (const typeElement of embeddedTypes) {
          if (~typeChain.indexOf(`${this.settings.vocabPfx}${typeElement}`)) {
            return true;
          }
        }
      }
      return false;
    },
  },
};
</script>

<template>
<div class="data-node" v-bind:class="{'column': embedded, 'rows': !embedded, 'highlight': isLastAdded }">
  <div class="label" v-bind:class="{ 'locked': isLocked }">
    <!-- <a href="/vocab/#{{property}}">{{ property | labelByLang | capitalize }}</a> -->
    {{ key | labelByLang | capitalize }}
  </div>
  <div v-if="isArray(value)" class="value node-list" v-bind:class="{'stackable': stackable}">
    <pre v-show="status.isDev">{{getPath}}</pre>
    <ul>
      <li v-for="item in value" track-by="$index">
        <item-entity v-if="isPlainObject(item) && isLinked(item)" :is-locked="isLocked" :status="status" :focus="focus" :item="item" :key="key" :index="$index"></item-entity>
        <item-anonymous v-if="isPlainObject(item) && !isLinked(item) && !isEmbedded(item)" :is-locked="isLocked" :status="status" :focus="focus" :item="item" :key="key" :index="$index"></item-anonymous>
        <item-embedded v-if="isPlainObject(item) && !isLinked(item) && isEmbedded(item)" :is-locked="isLocked" :status="status" :focus="focus" :item="item" :key="key" :index="$index"></item-embedded>
        <item-value v-if="!isPlainObject(item) && !isLinked(item)" :is-removable="!hasSingleValue" :is-locked="isLocked" :status="status" :focus="focus" :value="item" :key="key" :index="$index"></item-value>
      </li>
    </ul>
  </div>
  <div v-if="!isArray(value)" class="value node-object">
    <pre v-show="status.isDev">{{getPath}}</pre>
    <item-entity v-if="isPlainObject(value) && isLinked(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key"></item-entity>
    <item-anonymous v-if="isPlainObject(value) && !isLinked(value) && !isEmbedded(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key" :index="$index"></item-anonymous>
    <item-embedded v-if="isPlainObject(value) && !isLinked(value) && isEmbedded(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key"></item-embedded>
    <item-value v-if="!isPlainObject(value) && !isLinked(value)" :is-locked="isLocked" :is-removable="!hasSingleValue" :status="status" :focus="focus" :value="value" :key="key"></item-value>
  </div>
  <div class="actions" v-if="!isLocked">
    <entity-adder class="action" v-if="!isLocked && (isRepeatable || isEmptyObject)" :key="key" :focus="focus" :property-types="propertyTypes" :allow-anon="allowAnon"></entity-adder>
    <div class="action action-remove" v-if="!isLocked && isRemovable" class="delete" v-on:click="removeThis()"><i class="fa fa-trash"></i></div>
  </div>
</div>
</template>

<style lang="less">
@import './variables.less';

.data-node {
  width: 100%;
  display: flex;
  flex-direction: row;
  box-shadow: inset 0px 0px 1em 0px transparent;
  outline: 2px solid transparent;
  transition: 3s ease;
  transition-property: all;
  .node-list {
    > ul {
      margin-bottom: 0px;
      padding: 0px;
      > li {
        display: block;
        margin-bottom: 2px;
        &:last-of-type {
          margin-bottom: auto;
        }
      }
    }
    &.stackable {
      > ul > li {
        display: inline-block;
        margin-bottom: auto;
      }
    }
  }
  &.highlight {
    outline: 2px solid @highlight-color;
    box-shadow: inset 0px 0px 1em 0px gold;
  }
  .label {
    font-size: 1.2rem;
    color: @black;
    font-weight: normal;
  }
  .value {
  }
  &:hover {
    >.actions {
      opacity: 1;
    }
  }
  >.actions {
    opacity: 0;
    transition: opacity 0.5s ease;
    transition-delay: 0.2s;
  }
  &.rows {
    >.label {
      order: 1;
      flex-basis: @col-label;
      display: flex;
      text-align: right;
      align-items: center;
      justify-content: flex-end;
    }
    >.value {
      order: 2;
      flex-basis: @col-value;
      padding: 5px;
      > * {
        display: inline-block;
      }
      > ul {
        width: 100%;
        list-style: none;
        padding: 0px;
      }
    }
    >.actions {
      order: 3;
      flex-basis: @col-action;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      > * {
        display: inline;
        margin: 0px 5px;
      }
    }
  }
  &.column {
    flex-wrap: wrap;
    border: dashed @gray-light;
    border-width: 0px 0px 1px 0px;
    padding-bottom: 4px;
    >.label {
      flex: 0 1 100%;
      text-align: left;
      padding: 5px 0px;
    }
    >.value {
      display: inline-block;
      flex: 1 0 85%;
      flex-grow: 1;
    }
    >.actions {
      display: inline-block;
      flex: 1 0 15%;
      > * {
        display: inline-block;
      }
    }
  }
  align-content: stretch;
}

</style>
