<script>
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
    valueByIdPresence() {
      const list = _.sortBy(this.value, [(o) => (o['@id'])]);
      return list;
    },
    isLastAdded() {
      if (this.status.lastAdded === this.getPath) {
        return true;
      }
      return false;
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
  ready() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.isLastAdded) {
          const position = this.$el.offsetTop - (0.75 * window.innerHeight);
          this.scrollTo(document.scrollingElement, position, 600, 600, () => {
            this.$dispatch('update-last-added', '');
          });
        }
      }, 300);
    });
  },
  methods: {
    scrollTo(element, to, timeLeft, duration, callback) {
      let durationThreshold = 10;
      if (timeLeft <= 1) {
        callback();
        return;
      } else if (timeLeft < (duration / 2)) {
        durationThreshold = timeLeft / (duration / 20);
      }

      const difference = to - element.scrollTop;
      const perTick = difference / timeLeft * durationThreshold;
      setTimeout(() => {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        this.scrollTo(element, to, timeLeft - durationThreshold, duration, callback);
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
<div class="data-node" v-bind:class="{'column': embedded, 'rows': !embedded, 'highlight': isLastAdded }">
  <div class="label" v-bind:class="{ 'locked': isLocked }">
    <!-- <a href="/vocab/#{{property}}">{{ property | labelByLang | capitalize }}</a> -->
    {{ key | labelByLang | capitalize }}
  </div>
  <div v-if="isArray(value)" class="value node-list">
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
  <div v-if="!isArray(value)" class="value node-object">
    <pre v-show="status.isDev">{{getPath}}</pre>
    <item-entity v-if="isPlainObject(value) && isLinked(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key"></item-entity>
    <item-anonymous v-if="isPlainObject(value) && !isLinked(value) && !isEmbedded(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key" :index="$index"></item-anonymous>
    <item-embedded v-if="isPlainObject(value) && !isLinked(value) && isEmbedded(value)" :is-locked="isLocked" :status="status" :focus="focus" :item="value" :key="key"></item-embedded>
    <item-value v-if="!isPlainObject(value) && !isLinked(value)" :is-locked="isLocked" :status="status" :focus="focus" :value="value" :key="key"></item-value>
  </div>
  <div class="actions" v-if="!isLocked">
    <entity-adder class="action" v-if="!isLocked && (isRepeatable || isEmptyObject)" :key="key" :focus="focus"></entity-adder>
    <div class="action action-remove" v-if="!isLocked" class="delete" v-on:click="removeField(k)"><i class="fa fa-trash"></i></div>
  </div>
</div>
</template>

<style lang="less">
@import './variables.less';

.data-node {
  width: 100%;
  display: flex;
  flex-direction: row;
  outline: 2px solid transparent;
  transition: outline 3s ease;
  > .node-list > ul > li {
    display: inline-block;
  }
  &.highlight {
    outline: 2px solid @highlight-color;
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
      > * {
        display: inline;
      }
    }
  }
  &.column {
    flex-wrap: wrap;
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
