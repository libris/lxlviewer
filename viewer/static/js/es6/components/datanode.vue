<script>
/*
  The datanode component is responsible for a specific key value pair.
  It's responsible for its own data, and dispatches all changes to the form component.
*/
import * as _ from 'lodash';
import EntityAdder from './entityadder';
import ItemEntity from './item-entity';
import ItemEmbedded from './item-embedded';
import ItemEnumeration from './item-enumeration';
import ItemValue from './item-value';
import ItemLocal from './item-local';
import { mixin as clickaway } from 'vue-clickaway';
import * as VocabUtil from '../utils/vocab';
import * as LayoutUtil from '../utils/layout';
import * as MathUtil from '../utils/math';
import LodashProxiesMixin from './mixins/lodash-proxies-mixin';
import { getVocabulary, getVocabularyProperties, getForcedListTerms, getSettings, getStatus, getEditorData } from '../vuex/getters';
import { changeStatus } from '../vuex/actions';

export default {
  name: 'data-node',
  mixins: [clickaway, LodashProxiesMixin],
  props: [
    'parentKey',
    'parentIndex',
    'parentPath',
    'key',
    'value',
    'isLocked',
    'allow-local',
    'embedded',
    'is-removable',
    'isInner',
    'showActionButtons',
    'entityType',
  ],
  data() {
    return {
      activeModal: false,
      removeHover: false,
      foundChip: false,
      removed: false,
      removeConfirmation: false,
      possibleValues: [],
      uniqueIds: [],
    };
  },
  vuex: {
    actions: {
      changeStatus,
    },
    getters: {
      vocab: getVocabulary,
      vocabProperties: getVocabularyProperties,
      forcedListTerms: getForcedListTerms,
      settings: getSettings,
      status: getStatus,
      editorData: getEditorData,
    },
  },
  components: {
    'item-entity': ItemEntity,
    'item-value': ItemValue,
    'item-embedded': ItemEmbedded,
    'item-enumeration': ItemEnumeration,
    'item-local': ItemLocal,
    'entity-adder': EntityAdder,
  },
  watch: {
    'arrayLength': function (newVal, oldVal) {
      if (newVal > oldVal) {
        this.$broadcast('focus-new-item', newVal-1);
      }
    },
  },
  computed: {
    arrayLength() {
      return this.valueAsArray.length;
    },
    valueIsArray() {
      return _.isArray(this.value);
    },
    locked() {
      if (this.settings.lockedProperties.indexOf(this.key) !== -1) {
        return true;
      }
      return this.isLocked;
    },
    isObjectArray() {
      return _.isPlainObject(this.valueAsArray[0]);
    },
    hasRescriction() {
      if (this.restrictionOnProp && this.restrictionOnProp.length > 0) {
         VocabUtil.getEnumerations(this.entityType, this.key, this.vocab, this.settings.vocabPfx).then((result) => {
           for (const value of result) {
             this.$dispatch('add-linked', value);
             this.possibleValues.push(value);
           }
         });
         return true;
      }
      return false;
    },
    restrictionOnProp() {
      const restr = VocabUtil.getEnumerationKeys(this.entityType, this.key, this.vocab, this.settings.vocabPfx);
      return restr;
    },
    propAllowsLocal() {
      if (this.settings.disallowLocal.indexOf(this.key) === -1) {
        return true;
      }
      return false;
    },
    linkedIds() {
      const ids = [];
      for (const obj of this.valueAsArray) {
        if (obj['@id']) {
          ids.push(obj['@id']);
        }
      }
      return ids;
    },
    keyAsVocabProperty() {
      return VocabUtil.getTermObject(this.key, this.vocab, this.settings.vocabPfx);
    },
    propertyComment() {
      if (this.keyAsVocabProperty && this.keyAsVocabProperty.commentByLang) {
        if (this.keyAsVocabProperty.commentByLang[this.settings.language]) {
          return this.keyAsVocabProperty.commentByLang[this.settings.language];
        } else {
          return this.keyAsVocabProperty.commentByLang[0];
        }
      } else {
        return '';
      }
    },
    valueAsArray() {
      let valueArray = this.value;
      if (!_.isArray(this.value)) {
        valueArray = [this.value];
      }
      for (let i = 0; i < valueArray.length; i++) {
        if (_.isPlainObject(valueArray[i]) && !valueArray[i].hasOwnProperty('_uid')) {
          this.uniqueIds.push(MathUtil.getNewRandom(this.uniqueIds));
          valueArray[i]._uid = this.uniqueIds[this.uniqueIds.length-1];
        }
      }
      return valueArray;
    },
    getPath() {
      if (typeof this.parentPath !== 'undefined') {
        if (typeof this.parentKey !== 'undefined' && typeof this.parentIndex !== 'undefined') {
          return `${this.parentPath}.${this.key}`;
        }
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
      const expandKeys = this.settings.expandKeys;
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
    isRepeatable() {
      return this.forcedListTerms.indexOf(this.key) > -1;
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
    forcedToArray() {
      return this.forcedListTerms.indexOf(this.key) > -1;
    },
  },
  events: {
    'update-item'(index, value) {
      let modified = _.cloneDeep(this.value);
      if (_.isArray(modified)) {
        modified[index] = value;
      } else {
        modified = value;
      }
      this.updateValue(modified);
    },
    'remove-item'(index) {
      console.log("Remove item with index", index);
      let modified = _.cloneDeep(this.value);
      if (!_.isArray(modified)) {
        modified = [modified];
      }
      if (typeof index !== 'undefined' && index !== '') {
        modified.splice(index, 1);
      } else {
        modified = [];
      }
      if (modified.length === 1 && !this.forcedToArray) {
        modified = modified[0];
      }
      this.updateValue(modified);
    },
    'add-item'(value, replaces) {
      console.log("DataNode:"+ this.getPath +" - Adding", JSON.stringify(value));
      let insertedValue = {};
      if (value.hasOwnProperty('@id')) { // This is a linked item
        insertedValue = { '@id': value['@id'] };
        this.$dispatch('add-linked', value);
      } else {
        insertedValue = value;
      }
      let modified = [].concat(_.cloneDeep(this.value));
      if (typeof replaces !== 'undefined') {
        modified.splice(replaces, 1);
      }
      modified.push(insertedValue);
      if (modified.length === 1 && !this.forcedToArray) {
        modified = modified[0];
      }
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
          const scrollPos = this.$el.offsetTop - (windowHeight * 0.2);
          LayoutUtil.scrollTo(scrollPos, 1000, 'easeInOutQuad', () => {
            this.changeStatus('lastAdded', '');
          });
        }
      }, 300);
    });
  },
  methods: {
    updateValue(value) {
      this.$dispatch('update-value', this.getPath, value);
    },
    removeThis() {
      this.removeConfirmation = false;
      this.removed = true;
      setTimeout(() => {
        this.$dispatch('remove-field', this.getPath);
      }, 500);
    },
    getDatatype(o) {
      if (typeof o === 'undefined') {
        throw new Error('Cannot check data type of undefined object.');
      }
      if (this.isPlainObject(o) && !o.hasOwnProperty('@id') && !o.hasOwnProperty('@type')) {
        return 'error';
      }
      if (this.hasRescriction) {
        return 'enumeration';
      }
      if (this.isPlainObject(o) && this.isLinked(o)) {
      // if (this.isPlainObject(o) && this.isLinked(o) && o['@id'].indexOf(this.editorData.record['@id']) === -1) {
        return 'entity';
      }
      if (
        this.isPlainObject(o) &&
        (
        !this.isLinked(o)
        // || (this.isLinked(o) && o['@id'].indexOf(this.editorData.record['@id']) !== -1)
        )
      ) {
        return 'local';
      }
      if (!this.isPlainObject(o) && !this.isLinked(o)) {
        return 'value';
      }
    },
    isLinked(o) {
      if (typeof o === 'undefined') {
        throw new Error('Cannot check link status of undefined object.');
      }
      const recordId = this.editorData.record['@id'];
      if (o.hasOwnProperty('@id') && !o.hasOwnProperty('@type')) {
        if (o['@id'].indexOf(recordId) > -1) {
          return false;
        }
        return true;
      }
      return false;
    },
    isEmbedded(o) {
      const type = o['@type'];
      if (!type || typeof type === 'undefined') {
        return false;
      }
      return VocabUtil.isEmbedded(type, this.vocab, this.settings);
    },
    isChip(item) {
      if (((this.getDatatype(item) == 'entity') && !this.isExpandedType)) {
        this.foundChip = true;
        return true;
      }
      return false;
    },
    handleMouseLeave() {
      if (!this.isInner) {
        this.showActionButtons=false
      }
    },
  },
};
</script>

<template>
<div class="data-node" v-bind:class="{'column': embedded, 'rows': !embedded, 'highlight': isLastAdded, 'distinguish-removal': removeHover, 'removed': removed }" @mouseover="showActionButtons=true" @mouseleave="handleMouseLeave()">
  <div class="label" v-bind:class="{ 'locked': locked }">
    <div>
      <span v-show="key === '@id'">{{ 'ID' | translatePhrase | capitalize }}</span>
      <span v-show="key === '@type'">{{ 'Type' | translatePhrase | capitalize }}</span>
      <span v-show="key !== '@id' && key !== '@type'">{{ key | labelByLang | capitalize }}</span>
      <div v-if="propertyComment && !locked" class="comment-icon">
        <i class="fa fa-question-circle"></i>
        <div class="comment">{{ propertyComment }}</div>
      </div>
      <entity-adder v-if="!locked && isRepeatable && (isInner && !isEmptyObject)" :has-restriction="hasRescriction" :possible-values="possibleValues" :key="key" :already-added="linkedIds" :property-types="propertyTypes" :allow-local="allowLocal && propAllowsLocal" :show-action-buttons="showActionButtons" :active="activeModal" :is-placeholder="true" :value-list="valueAsArray"></entity-adder>
    </div>
    <div v-if="isInner" class="actions">
      <div class="action" v-show="!locked" :class="{'disabled': activeModal}">
        <i v-on:click="removeThis()" @mouseover="removeHover = true" @mouseout="removeHover = false" class="fa fa-times action-button action-remove"></i>
      </div>
    </div>
    <!-- {{ key | labelByLang | capitalize }} -->
  </div>
  <div class="value node-list">
    <pre class="path-code" v-show="status.isDev">{{getPath}}</pre>
    <ul v-if="isObjectArray">
      <li v-for="item in valueAsArray" :class="{ 'isChip': isChip(item)}" track-by="_uid">
        <div class="erroneous-object" v-if="getDatatype(item) == 'error'"><i class="fa fa-frown-o"></i> {{item | json}}</div>
        <item-enumeration v-if="getDatatype(item) == 'enumeration'" :is-locked="locked" :entity-type="entityType" :possible-values="possibleValues" :expanded="isExpandedType" :value="item" :key="key" :index="$index" :show-action-buttons="showActionButtons"></item-enumeration>
        <item-entity v-if="getDatatype(item) == 'entity'" :is-locked="locked" :expanded="isExpandedType" :item="item" :key="key" :index="$index"></item-entity>
        <item-local v-if="getDatatype(item) == 'local'" :is-locked="locked" :is-expanded-type="isExpandedType" :item="item" :key="key" :index="$index" :parent-path="getPath" :in-array="valueIsArray" :show-action-buttons="showActionButtons"></item-local>
        <item-embedded v-if="getDatatype(item) == 'embedded'" :is-locked="locked" :item="item" :key="key" :index="$index" :show-action-buttons="showActionButtons"></item-embedded>
      </li>
    </ul>
    <ul v-if="!isObjectArray">
      <li v-for="item in valueAsArray" :class="{ 'isChip': isChip(item)}" track-by="$index">
        <item-value v-if="getDatatype(item) == 'value'" :is-removable="!hasSingleValue" :is-locked="locked" :value="item" :key="key" :index="$index" :show-action-buttons="showActionButtons"></item-value>
      </li>
    </ul>
    <entity-adder class="action" v-if="!locked && (isRepeatable || isEmptyObject) && (!isInner || (isInner && isEmptyObject))" :has-restriction="hasRescriction" :possible-values="possibleValues" :key="key" :already-added="linkedIds" :property-types="propertyTypes" :allow-local="allowLocal && propAllowsLocal" :show-action-buttons="showActionButtons" :active="activeModal" :is-placeholder="false" :value-list="valueAsArray"></entity-adder>
  </div>
  <div v-if="!isInner" class="actions">
    <div class="action" v-show="!locked" :class="{'disabled': activeModal}">
      <i v-on:click="removeConfirmation = true" @mouseover="removeHover = true" @mouseout="removeHover = false" class="fa fa-trash-o action-button action-remove"></i>
    </div>
    <div class="confirm-remove-box" v-if="removeConfirmation" v-on-clickaway="removeConfirmation = false">
      <div v-on:click="removeThis(true)">
        {{"Remove" | translatePhrase}}
      </div>
    </div>
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
  outline: 2px solid transparent;
  transition: 6s ease;
  transition-property: outline, box-shadow;
  max-height: 200vh;
  overflow-y: auto;
  opacity: 1;
  &.removed {
    transition: 0.5s all ease;
    min-height: 0em;
    max-height: 0em;
    opacity: 0;
  }
  .erroneous-object {
    line-height: 1.6;
    display: inline-block;
    padding: 3px;
    border: 1px solid #ffa6a6;
    background-color: #fff1f1;
  }
  .path-code {
    padding: 1px 3px;
    margin: 0px;
    color: black;
  }
  .confirm-remove-box {
    position: absolute;
    line-height: 1.6;
    white-space: normal;
    div {
      background-color: @black;
      padding: 0.1em 0.5em;
      cursor: pointer;
      color: white;
      &:hover {
        background-color: @gray-dark;
      }
    }
    &::before {
      content: "";
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 0 5px 6px 5px;
      border-color: transparent transparent @black transparent;
      font-size: 0;
      line-height: 0;
      margin-left: 27px;
    }
  }
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
    box-shadow: inset 0px 0px 1em 0px @highlight-color;
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
    .comment-icon {
      display: inline-block;
      margin-left: 0.25em;
      .comment {
        z-index: @active-component-z;
        display: none;
        border-radius: 4px;
        position: absolute;
        background-color: @white;
        max-width: 300px;
        line-height: 1.6;
        border: 1px solid @gray-light;
        white-space: normal;
        padding: 0.5em;
        text-align: left;
      }
      &:hover {
        .comment {
          display: block;
        }
      }
    }
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
      overflow: hidden; // This is important because of the flex rules of entities
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
            > .remover {
              flex: 1 1 2em;
              text-align: center;
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
      .disabled {
        visibility: hidden;
      }
      .action-remove {
        padding: 10px;
      }
      .confirm-remove-box {
        transform: translate(12px, 18px);
      }
    }
  }
  &.column {
    flex-wrap: wrap;
    border: solid;
    border-color: rgba(0, 0, 0, 0.0) rgba(0, 0, 0, 0.0) rgba(196, 199, 202, 0.73) rgba(0, 0, 0, 0.0);
    border-width: 1px;
    padding-bottom: 4px;
    &:last-child {
      border-width: 0px;
    }
    >.label {
      min-width: 100%;
      justify-content: space-between;
      text-align: left;
      padding: 5px 0px 3px 0px;
      display: flex;
      > div {
        display: flex;
        > .action {
          cursor: pointer;
        }
      }
    }
    >.value {
      display: inline-block;
      flex: 1 1 100%;
      max-height: 50vh;
      overflow-y: auto;
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
              background-color: #f9f9f9;
              flex: 9 9 90%;
            }
            > .remover {
              flex: 1 1 2em;
              text-align: center;
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
