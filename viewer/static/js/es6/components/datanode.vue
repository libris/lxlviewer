<script>
/*
  The datanode component is responsible for a specific key value pair.
  It's responsible for its own data, and dispatches all changes to the form component.
*/
import * as _ from 'lodash';
import EntityAdder from './entityadder';
import ItemEntity from './item-entity';
import ItemEmbedded from './item-embedded';
import ItemValue from './item-value';
import ItemLocal from './item-local';
import * as VocabUtil from '../utils/vocab';
import * as LayoutUtil from '../utils/layout';
import LodashProxiesMixin from './mixins/lodash-proxies-mixin';
import { getVocabulary, getSettings, getStatus, getEditorData } from '../vuex/getters';
import { changeStatus } from '../vuex/actions';

export default {
  name: 'data-node',
  mixins: [LodashProxiesMixin],
  props: [
    'parentKey',
    'parentIndex',
    'key',
    'value',
    'isLocked',
    'focus',
    'allow-local',
    'embedded',
    'is-removable',
    'isInner',
  ],
  data() {
    return {
      showActionButtons: false,
      activeModal: false,
      removeHover: false,
      foundChip: false,
    };
  },
  vuex: {
    actions: {
      changeStatus,
    },
    getters: {
      vocab: getVocabulary,
      settings: getSettings,
      status: getStatus,
      editorData: getEditorData,
    },
  },
  components: {
    'item-entity': ItemEntity,
    'item-value': ItemValue,
    'item-embedded': ItemEmbedded,
    'item-local': ItemLocal,
    'entity-adder': EntityAdder,
  },
  computed: {
    keyAsVocabProperty() {
      return VocabUtil.getClass(this.key, this.vocab, this.settings.vocabPfx);
    },
    valueAsArray() {
      if (_.isArray(this.value)) {
        return this.value;
      }
      return [this.value];
    },
    getPath() {
      if (typeof this.parentKey !== 'undefined' && typeof this.parentIndex !== 'undefined') {
        return `${this.parentKey}[${this.parentIndex}].${this.key}`;
      } else if (typeof this.parentKey !== 'undefined') {
        return `${this.parentKey}.${this.key}`;
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
    isExpandedType() {
      const expandKeys = [
        'instanceOf',
        'itemOf',
      ];
      return expandKeys.indexOf(this.key) !== -1;
    },
    hasSingleValue() {
      if (!_.isArray(this.value) || this.value.length === 1) {
        return true;
      }
      return false;
    },
    stackable() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    // TODO: Verify usage
    valueByIdPresence() {
      const list = _.sortBy(this.value, [(o) => (o['@id'])]);
      return list;
    },
    isRepeatable() {
      return this.propertyTypes.indexOf('FunctionalProperty') < 0;
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
      if (typeof modified === 'string' || modified instanceof String) {
        modified = [].concat(modified);
      }
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
    'toggle-modal'(active) {
      this.activeModal = active;
    },
  },
  ready() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.isLastAdded) {
          const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
          LayoutUtil.scrollTo(this.$el.offsetTop - (windowHeight * 0.5), 1000, 'easeInOutQuad', () => {
            this.changeStatus('lastAdded', '');
          });
        }
      }, 300);
    });
  },
  methods: {
    updateValue(value) {
      if (this.parentKey && this.parentIndex !== '') {
        const path = this.parentKey + '[' + this.parentIndex + ']' + '.' + this.key;
        this.$dispatch('update-value', path, value);
      } else if (this.parentKey) {
        const path = this.parentKey + '.' + this.key;
        this.$dispatch('update-value', path, value);
      } else {
        this.$dispatch('update-value', this.key, value);
      }
    },
    removeThis() {
      if (this.parentKey) {
        console.warn('Remove was called on an embedded field, this is not supported.');
        return false;
      }
      this.$dispatch('remove-field', this.key);
      // ModalUtil.confirmDialog(
      //   {
      //     sTitle: `Ta bort fältet "${pLabel}"?`,
      //     sContent: `Detta tar bort fältet "${pLabel}" och allt dess innehåll.`,
      //     sAccept: 'Ta bort',
      //     sReject: 'Avbryt',
      //     sType: 'danger',
      //   }
      // ).then(() => {
      //   // accepted by user
      //   this.$dispatch('remove-field', prop);
      // }, () => {
      //     // declined
      // });
    },
    getDatatype(o) {
      if (this.isPlainObject(o) && this.isLinked(o)) {
      // if (this.isPlainObject(o) && this.isLinked(o) && o['@id'].indexOf(this.editorData.record['@id']) === -1) {
        return 'entity';
      }
      if (
        this.isPlainObject(o) &&
        (
        !this.isLinked(o) && !this.isEmbedded(o)
        // || (this.isLinked(o) && o['@id'].indexOf(this.editorData.record['@id']) !== -1)
        )
      ) {
        return 'local';
      }
      if (this.isPlainObject(o) && !this.isLinked(o) && this.isEmbedded(o)) {
        return 'embedded';
      }
      if (!this.isPlainObject(o) && !this.isLinked(o)) {
        return 'value';
      }
    },
    isLinked(o) {
      return (o.hasOwnProperty('@id') && !o.hasOwnProperty('@type'));
    },
    isEmbedded(o) {
      const type = o['@type'];
      if (!type || typeof type === 'undefined') {
        return false;
      }
      return VocabUtil.isEmbedded(type, this.vocab, this.settings);
    },
    isChip(item) {
      if (((this.getDatatype(item) == 'entity' || this.getDatatype(item) == 'local') && !this.isExpandedType)) {
        this.foundChip = true;
        return true;
      }
      return false;
    },
  },
};
</script>

<template>
<div class="data-node" v-bind:class="{'column': embedded, 'rows': !embedded, 'highlight': isLastAdded, 'distinguish-removal': removeHover }" @mouseover="showActionButtons=true" @mouseleave="showActionButtons=false">
  <div class="label" v-bind:class="{ 'locked': isLocked }">
    <a href="/vocab/#{{key}}">{{ key | labelByLang | capitalize }}</a>
    <!-- {{ key | labelByLang | capitalize }} -->
  </div>
  <div class="value node-list">
    <pre v-show="status.isDev">{{getPath}}</pre>
    <ul>
      <li v-for="item in valueAsArray" :class="{ 'isChip': isChip(item)}" track-by="$index">
        <item-entity v-if="getDatatype(item) == 'entity'" :is-locked="isLocked" :expanded="isExpandedType" :focus="focus" :item="item" :key="key" :index="$index"></item-entity>
        <item-local v-if="getDatatype(item) == 'local'" :is-locked="isLocked" :focus="focus" :item="item" :key="key" :index="$index"></item-local>
        <item-embedded v-if="getDatatype(item) == 'embedded'" :is-locked="isLocked" :focus="focus" :item="item" :key="key" :index="$index"></item-embedded>
        <item-value v-if="getDatatype(item) == 'value'" :is-removable="!hasSingleValue" :is-locked="isLocked" :focus="focus" :value="item" :key="key" :index="$index"></item-value>
      </li>
      <li :class="{ 'isChip': foundChip}">
        <entity-adder class="action" v-if="!isLocked && (isRepeatable || isEmptyObject)" :key="key" :focus="focus" :property-types="propertyTypes" :allow-local="allowLocal" :show-action-buttons="showActionButtons" :active="activeModal" :is-inner="isInner" :is-chip="foundChip"></entity-adder>
      </li>
    </ul>

  </div>
  <div class="actions">
    <div class="action" v-if="!isLocked && isRemovable" :class="{'shown-button': showActionButtons, 'hidden-button': !showActionButtons, 'disabled': activeModal}"><i v-on:click="removeThis()" @mouseover="removeHover = true" @mouseout="removeHover = false" class="fa fa-trash fa-lg action-button action-remove"></i></div>
  </div>
</div>
</template>

<style lang="less">
@import './_variables.less';

.data-node {
  width: 100%;
  min-height: 3em;
  display: flex;
  flex-direction: row;
  box-shadow: inset 0px 0px 1em 0px transparent;
  transition: 3s ease;
  transition-property: outline;
  outline: 2px solid transparent;
  .node-list {
    line-height: 0;
    > ul {
      margin-bottom: 0px;
      padding: 0px;
      > li {
        margin-bottom: 2px;
        &:last-of-type {
          margin-bottom: auto;
        }
        > * > * {
          line-height: 1.6;
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
    a {
      color: @black;
      text-decoration: none;
      &:hover {
        cursor: help;
      }
    }
    font-size: 1.2rem;
    color: @black;
    font-weight: normal;
  }
  .value {
  }
  .shown-button {
    opacity: 1;
  }
  .hidden-button {
    opacity: 0;
  }
  >.actions .action-button {
    transition: opacity 0.25s ease;
    transition-delay: 0.1s;
    cursor: pointer;
    .action {
      cursor: pointer;
    }
  }
  &.rows {
    border: solid;
    border-color: transparent;
    border-bottom-color: #d8d8d8;
    border-top-color: #f3f3f3;
    border-width: 1px;
    background-color: #f2f2f2;
    &:nth-child(odd) {
      background-color: #ededed;
    }
    >.label {
      order: 1;
      flex: 0 0 @col-label;
      display: flex;
      text-align: right;
      align-items: flex-start;
      justify-content: flex-end;
      line-height: 2.6;
      border: 1px solid #e4e2e2;
      border-width: 0px 1px 0px 0px;
      border-radius: 0px;
      overflow: hidden;
      a {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    >.value {
      order: 2;
      flex: 1 1 0px;
      padding: 5px;
      border: 1px solid #e4e2e2;
      border-width: 0px 1px 0px 0px;
      > * {
        display: inline-block;
      }
      > ul {
        width: 100%;
        list-style: none;
        padding: 0px;
        > li {
          display: block;
          .item-value {
            width: 100%;
            display: flex;
            > textarea {
              flex: 9 9 90%;
            }
            > div {
              flex: 1 1 10%;
            }
          }
          &.isChip {
            display: inline-block;
            float: left;
          }
          .item-value {
            > textarea {
              width: 100%;
            }
          }
        }
      }
    }
    >.actions {
      order: 3;
      flex: 0 0 @col-action;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-left: -5px;
      > div {

      }
      > span {
      }
      .disabled {
        visibility: hidden;
      }
      .action-remove {
        padding: 10px;
      }
    }
  }
  &.column {
    flex-wrap: wrap;
    border: solid rgba(196, 199, 202, 0.73);
    border-width: 0px 0px 1px 0px;
    padding-bottom: 4px;
    &:last-child {
      border-width: 0px;
    }
    >.label {
      flex: 0 1 100%;
      text-align: left;
      padding: 5px 0px 3px 0px;
    }
    >.value {
      display: inline-block;
      flex: 1 1 100%;
      > ul {
        width: 100%;
        list-style: none;
        padding: 0px;
        > li {
          &.isChip {
            display: inline-block;
          }
          .item-value {
            width: 100%;
            display: flex;
            > textarea {
              flex: 9 9 90%;
            }
            > div {
              flex: 1 1 10%;
            }
          }
        }
        > li {
          display: block;
          .item-value {
            > textarea {
              width: 100%;
            }
          }
        }
      }
    }
    >.actions {
      display: inline-block;
      flex: 0 0 10%;
      > * {
        display: inline-block;
      }
    }
  }
  align-content: stretch;
}

</style>
