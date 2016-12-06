<script>
import * as _ from 'lodash';
import ProcessedLabel from './processedlabel';
import ItemEntity from './item-entity';
import ItemEmbedded from './item-embedded';
import ItemValue from './item-value';
import ItemAnonymous from './item-anonymous';
import * as VocabUtil from '../utils/vocab';
import { getVocabulary, getSettings } from '../vuex/getters';

export default {
  name: 'data-node',
  props: ['pkey', 'pindex', 'key', 'value', 'label', 'linked', 'isLocked', 'focus', 'status'],
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
      VocabUtil.getPropertyTypes(
        this.key,
        this.vocab,
        this.settings.vocabPfx
      );
    },
    valueByIdPresence() {
      const list = _.sortBy(this.value, [(o) => (o['@id'])]);
      return list;
    },
  },
  events: {
    'update-entity'(key, index, obj) {
      if (typeof index !== 'undefined') {
        this.value.$set(index, obj);
      } else {
        this.value.$set(obj);
      }
    },
    'update-item-value'(value) {
      this.updateValue(value);
    },
    'remove-item'(value) {
      console.log("dn:remove-item was called", value);
      const modified = Object.assign({}, this.value);
      if (_.isArray(modified)) {
        // Find item in the array and splice it..
        _.remove(modified, (item) => {
          if (_.isEqual(value, item)) {
            return true;
          }
          return false;
        });
        this.updateValue(modified);
      } else {
        this.updateValue([]);
      }
    },
  },
  methods: {
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
    emptyValue() {
      this.$dispatch('update-value', this.key, {});
    },
    removeKey() {
      this.emptyValue();
    },
    removeByIndex(index) {
      const modified = this.value;
      modified.splice(index, 1);
      this.updateValue(modified);
    },
    removeById(id) {
      let modified = this.value;
      modified = _.filter(this.value, (n) => (n['@id'] !== id));
      this.updateValue(modified);
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
      const typeChain = VocabUtil.getBaseClasses(type, this.vocab, this.settings.vocabPfx);
      if (typeChain.length > 0) {
        for (const typeElement of embeddedTypes) {
          if (~typeChain.indexOf(`${this.settings.vocabPfx}${typeElement}`)) {
            return true;
          }
        }
      }
      return false;
    },
    removeItem(key, value) {
      this.$dispatch('remove-item', key, value);
    },
  },
};
</script>

<template>
  <div v-if="isArray(value)" class="node-list">
    <pre v-show="status.isDev">{{getPath}}</pre>
    <ul>
      <li v-for="item in value" track-by="$index">
        <item-entity v-if="isPlainObject(item) && isLinked(item)" :is-locked="isLocked" :status="status" :focus="focus" :item="item" :key="key" :index="$index"></item-entity>
        <item-anonymous v-if="isPlainObject(item) && !isLinked(item) && !isEmbedded(item)" :is-locked="isLocked" :status="status" :focus="focus" :item="item" :key="key" :index="$index"></item-anonymous>
        <item-embedded v-if="isPlainObject(item) && !isLinked(item) && isEmbedded(item)" :is-locked="isLocked" :status="status" :focus="focus" :item="item" :key="key" :index="$index"></item-embedded>
        <item-value v-if="!isPlainObject(item) && !isLinked(item)" :is-locked="isLocked" :status="status" :focus="focus" :value="item" :key="key" :index="$index"></item-value>
      </li>
    </ul>
  </div>
  <div v-if="!isArray(value)" class="node-object">
    <pre v-show="status.isDev">{{getPath}}</pre>
    <item-entity v-if="isPlainObject(value) && isLinked(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key"></item-entity>
    <item-anonymous v-if="isPlainObject(value) && !isLinked(value) && !isEmbedded(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key" :index="$index"></item-anonymous>
    <item-embedded v-if="isPlainObject(value) && !isLinked(value) && isEmbedded(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key"></item-embedded>
    <item-value v-if="!isPlainObject(value) && !isLinked(value)" :is-locked="isLocked" :status="status" :focus="focus" :value="value" :key="key"></item-value>
  </div>
</template>

<style lang="less">
@import './variables.less';

.node-list {
  >ul {
    padding-left: 0;
    li {
      list-style: none;
      display: inline;
      &.linked {
        //TODO: Check if linked => display:inline-block
      }
    }
  }
}

</style>
