<script>
/*
  The field component is responsible for a specific key value pair.
  It's responsible for its own data, and dispatches all changes to the form component.
*/
import * as _ from 'lodash';
import EntityAdder from './entity-adder';
import ItemEntity from './item-entity';
import ItemValue from './item-value';
import ItemLocal from './item-local';
import ItemError from './item-error';
import ItemVocab from './item-vocab';
import ItemSibling from './item-sibling';
import TooltipComponent from '../shared/tooltip-component';
import { mixin as clickaway } from 'vue-clickaway';
import * as VocabUtil from '../../utils/vocab';
import * as LayoutUtil from '../../utils/layout';
import * as MathUtil from '../../utils/math';
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin';
import { mapGetters } from 'vuex';

export default {
  name: 'field',
  mixins: [clickaway, LodashProxiesMixin],
  props: {
    parentKey: '',
    parentIndex: '',
    parentPath: '',
    fieldKey: '',
    fieldValue: '',
    isLocked: '',
    asColumns: {
      default: true,
      type: Boolean,
    },
    isRemovable: '',
    isInner: '',
    entityType: '',
    showActionButtons: '',
  },
  data() {
    return {
      activeModal: false,
      shouldShowActionButtons: false,
      removeHover: false,
      foundChip: false,
      removed: false,
      uniqueIds: [],
    };
  },
  components: {
    'item-entity': ItemEntity,
    'item-value': ItemValue,
    'item-local': ItemLocal,
    'item-sibling': ItemSibling,
    'item-error': ItemError,
    'item-vocab': ItemVocab,
    'entity-adder': EntityAdder,
    'tooltip-component': TooltipComponent,
  },
  watch: {
  },
  computed: {
    actionButtonsShown() {
      if (this.shouldShowActionButtons || this.showActionButtons) {
        return true;
      } else {
        return false;
      }
    },
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    arrayLength() {
      return this.valueAsArray.length;
    },
    valueIsArray() {
      return _.isArray(this.fieldValue);
    },
    locked() {
      if (this.settings.lockedProperties.indexOf(this.fieldKey) !== -1) {
        return true;
      }
      return this.isLocked;
    },
    isObjectArray() {
      return _.isPlainObject(this.valueAsArray[0]);
    },
    linkedIds() {
      const ids = [];
      for (const obj of this.valueAsArray) {
        if (obj && obj['@id']) {
          ids.push(obj['@id']);
        }
      }
      return ids;
    },
    keyAsVocabProperty() {
      if (this.key === '_uid') {
        return null;
      }
      return VocabUtil.getTermObject(this.fieldKey, this.resources.vocab, this.resources.context);
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
      if (this.fieldValue === null) {
        return [];
      }
      let valueArray = this.fieldValue;
      if (!_.isArray(this.fieldValue)) {
        valueArray = [this.fieldValue];
      }

      return valueArray;
    },
    getPath() {
      if (typeof this.parentPath !== 'undefined') {
        if (typeof this.parentKey !== 'undefined' && typeof this.parentIndex !== 'undefined') {
          return `${this.parentPath}.${this.fieldKey}`;
        }
      }
      return `${this.parentPath}.${this.fieldKey}`;
    },
    isChild() {
     if (this.parentPath !== 'mainEntity') {
       return true;
     }
     return false;
    },
    propertyTypes() {
      return VocabUtil.getPropertyTypes(
        this.fieldKey,
        this.resources.vocab,
        this.resources.context
      );
    },
    hasSingleValue() {
      if (!_.isArray(this.fieldValue) || this.fieldValue.length === 1) {
        return true;
      }
      return false;
    },
    stackable() {
      return (this.propertyTypes.indexOf('DatatypeProperty') === -1);
    },
    isRepeatable() {
      return VocabUtil.propIsRepeatable(this.fieldKey, this.resources.context);
    },
    isEmptyObject() {
      const value = this.fieldValue;
      if (value === null) {
        return true;
      }
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
      if (this.inspector.status.lastAdded === this.getPath) {
        return true;
      }
      return false;
    },
    forcedToArray() {
      return this.forcedListTerms.indexOf(this.fieldKey) > -1;
    },
  },
  events: {
    'update-item'(index, value) {
      let modified = _.cloneDeep(this.fieldValue);
      if (_.isArray(modified)) {
        modified[index] = value;
      } else {
        modified = value;
      }
      this.updateValue(modified);
    },
    'remove-item'(index) {
      console.log("Remove item with index", index);
      let modified = _.cloneDeep(this.fieldValue);
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
      let modified = [].concat(_.cloneDeep(this.fieldValue));
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
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.fieldKey === '_uid') {
          throw new Error('A datanode component has been added for a _uid key, which should never happen.');
        }
        if (this.isLastAdded === true) {
          let element = this.$el;
          let topOfElement = LayoutUtil.getPosition(element).y;
          if (topOfElement > 0) {
            const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
            const scrollPos = LayoutUtil.getPosition(this.$el).y - (windowHeight * 0.2);
            LayoutUtil.scrollTo(scrollPos, 1000, 'easeInOutQuad', () => {
              this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
            });
          } else {
            this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
          }
        }
      }, 300);
    });
  },
  methods: {
    highlightItem(event) {
      let item = event.target;
      while ((item = item.parentElement) && !item.classList.contains('js-field'));
       item.classList.add('is-affected');
    },
    unHighlightItem(event) {
      let item = event.target;
      while ((item = item.parentElement) && !item.classList.contains('js-field'));
      item.classList.remove('is-affected');
    },
    updateValue(value) {
      this.$dispatch('update-value', this.getPath, value);
    },
    removeThis() {
      this.removed = true;
      const parentData = _.cloneDeep(_.get(this.inspector.data, this.parentPath));
      delete parentData[this.fieldKey];
      setTimeout(() => {
        this.$store.dispatch('updateInspectorData', {
          path: this.parentPath,
          value: parentData,
          addToHistory: true,
        });
        this.$store.dispatch('setInspectorStatusValue', { 
          property: 'unsavedChanges', 
          value: true 
        });
      }, 500);
    },
    getDatatype(o) {
      if (typeof o === 'undefined') {
        throw new Error('Cannot check data type of undefined object.');
      }
      if (this.isPlainObject(o) && !o.hasOwnProperty('@id') && !o.hasOwnProperty('@type')) {
        return 'error';
      }
      // if (this.isPlainObject(o) && o['@id'] && o['@id'].indexOf('#work') > -1) {
      //   return 'error';
      // }
      if (VocabUtil.getContextValue(this.fieldKey, '@type', this.resources.context) === '@vocab') {
        return 'vocab';
      }
      if (this.isPlainObject(o) && this.isLinked(o)) {
      // if (this.isPlainObject(o) && this.isLinked(o) && o['@id'].indexOf(this.editorData.record['@id']) === -1) {
        return 'entity';
      }
      if (
        this.isPlainObject(o) && o.hasOwnProperty('@id') && o['@id'].indexOf(this.inspector.data.record['@id']) > -1
      ) {
        return 'sibling';
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
      if (o === null) {
        return false;
      }
      if (typeof o === 'undefined') {
        throw new Error('Cannot check link status of undefined object.');
      }
      const recordId = this.inspector.data.record['@id'];
      if (o.hasOwnProperty('@id') && !o.hasOwnProperty('@type')) {
        if (o['@id'] === this.inspector.data.mainEntity['@id']) {
          return true;
        }
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
      return VocabUtil.isEmbedded(type, this.resources.vocab, this.settings);
    },
    isChip(item) {
      if (this.getDatatype(item) == 'entity') {
        this.foundChip = true;
        return true;
      }
      return false;
    },
    handleMouseEnter() {
      this.shouldShowActionButtons = true;
    },
    handleMouseLeave() {
      if (!this.isInner) {
        this.shouldShowActionButtons=false
      }
    },
  },
};
</script>

<template>
  <li class="Field js-field" 
    :id="`field-${getPath}`" 
    v-bind:class="{'Field--inner': !asColumns, 'highlight': isLastAdded, 'removed': removed}" 
    @mouseover="handleMouseEnter()" 
    @mouseleave="handleMouseLeave()">
    
    <div class="Field-label" v-bind:class="{ 'is-locked': locked }">
      <span v-show="fieldKey === '@id'">{{ 'ID' | translatePhrase | capitalize }}</span>
      <span v-show="fieldKey === '@type'">{{ 'Type' | translatePhrase | capitalize }}</span>
      <span v-show="fieldKey !== '@id' && fieldKey !== '@type'" 
        :title="fieldKey">{{ fieldKey | labelByLang | capitalize }}</span>

      <div class="Field-comment" v-if="propertyComment && !locked" >
        <i class="fa fa-question-circle Field-commentIcon"></i>
        <span class="Field-commentText">{{ propertyComment }}</span>
      </div>
    
      <div v-if="!isInner" class="Field-actions">
        <entity-adder  class="Field-entityAdder Field-action"
          v-show="!locked && (isRepeatable || isEmptyObject)" 
          :field-key="fieldKey" 
          :already-added="linkedIds" 
          :entity-type="entityType" 
          :property-types="propertyTypes" 
          :show-action-buttons="actionButtonsShown" 
          :active="activeModal" 
          :is-placeholder="false" 
          :value-list="valueAsArray" 
          :path="getPath"></entity-adder>
        <div class="Field-action Field-remove" 
          v-show="!locked" 
          :class="{'disabled': activeModal}">
          <i class="fa fa-trash-o action-button"
            v-on:click="removeThis(true)"
            @mouseover="removeHover = true, highlightItem($event)" 
            @mouseout="removeHover = false, unHighlightItem($event)">
            <tooltip-component 
              :show-tooltip="removeHover" 
              tooltip-text="Remove" 
              translation="translatePhrase"></tooltip-component>
          </i>
        </div>
      </div>

      <!-- Is inner -->
      <div v-if="isInner" class="Field-actions is-nested">
        <entity-adder class="Field-action Field-entityAdder"
          v-show="!locked && (isRepeatable || isEmptyObject)" 
          :field-key="fieldKey" 
          :path="getPath" 
          :already-added="linkedIds" 
          :entity-type="entityType" 
          :property-types="propertyTypes" 
          :show-action-buttons="actionButtonsShown" 
          :active="activeModal" 
          :is-placeholder="true" 
          :value-list="valueAsArray"></entity-adder>
        <div class="Field-action Field-remove" 
          v-show="!locked" 
          :class="{'disabled': activeModal}">
          <i class="fa fa-trash-o action-button"
            tabindex="0"
            v-on:click="removeThis(true)"
            @keyup.enter="removeThis(true)"
            @mouseover="removeHover = true, highlightItem($event)" 
            @mouseout="removeHover = false, unHighlightItem($event)"  >
            <tooltip-component translation="translatePhrase"
              :show-tooltip="removeHover" 
              tooltip-text="Remove"></tooltip-component>
          </i>
        </div>
      </div>
      <!-- {{ key | labelByLang | capitalize }} -->
    </div>

    <pre class="path-code" v-show="user.settings.appTech">{{getPath}}</pre>
      
    <div class="Field-content FieldContent is-value" 
      v-bind:class="{ 'is-locked': locked }"
      v-if="isObjectArray">
      <div class="Field-contentItem" 
        v-for="(item, index) in valueAsArray" 
        :key="index" >
        <item-error 
          v-if="getDatatype(item) == 'error'" 
          :item="item"></item-error>

        <!-- Other linked resources -->
        <item-vocab
          v-if="getDatatype(item) == 'vocab'" 
          :is-locked="locked" 
          :field-key="fieldKey" 
          :value="item" 
          :entity-type="entityType" 
          :index="index" 
          :parent-path="getPath"></item-vocab>

        <!-- Other linked entities -->
        <item-entity 
          v-if="getDatatype(item) == 'entity'" 
          :is-locked="locked" 
          :item="item" 
          :field-key="fieldKey" 
          :index="index" 
          :parent-path="getPath"></item-entity>

        <!-- Not linked, local child objects -->
        <item-local
          :data-parent="getPath"
          v-if="getDatatype(item) == 'local'" 
          :is-locked="locked" 
          :entity-type="entityType" 
          :item="item" 
          :field-key="fieldKey" 
          :index="index" 
          :parent-path="getPath" 
          :in-array="valueIsArray" 
          :show-action-buttons="actionButtonsShown"></item-local>

        <item-sibling
          v-if="getDatatype(item) == 'sibling'"
          :id="item['@id']"
          :is-locked="locked"
          :field-key="fieldKey"
          :entity-type="entityType"
          :index="index"
          :in-array="valueIsArray"
          :show-action-buttons="actionButtonsShown"
          :parent-path="getPath"></item-sibling>
      </div>
    </div>

    <div class="Field-content is-value is-endOfTree js-endOfTree" 
      v-bind:class="{ 'is-locked': locked }"
      v-if="!isObjectArray">
      <div class="Field-contentItem" 
        v-for="(item, index) in valueAsArray" 
        :key="index">

        <!-- Other linked resources -->
        <item-vocab 
          v-if="getDatatype(item) == 'vocab'" 
          :is-locked="locked" :field-key="fieldKey" 
          :field-value="item" 
          :entity-type="entityType" 
          :index="index" 
          :parent-path="getPath"></item-vocab>

        <!-- Not linked, local child strings -->
        <item-value 
          v-if="getDatatype(item) == 'value'" 
          :is-removable="!hasSingleValue" 
          :is-locked="locked" 
          :field-value="item" 
          :field-key="fieldKey" 
          :index="index" 
          :parent-path="getPath" 
          :show-action-buttons="actionButtonsShown"></item-value>
      </div>
    </div>
  </li>
</template>

<style lang="less">

.Field {
  border-bottom: 1px solid #d8d8d8;
  width: 100%;
  flex-direction: row;
  opacity: 1;
  position: relative;

  &.is-affected {
    outline: 2px solid @brand-primary;
  }

  @media (min-width: 768px) {
    display: flex;
  }

  &--inner {
    border: 0;
    flex: 1 100%;
    margin: 0;
    padding: 5px 0;
    overflow: visible;
    max-height: auto;
    display: inline-block;

    &.is-affected {
      //border: 2px solid @brand-primary;
      outline: 2px solid @brand-primary;
    }

    &:before, 
    &:after {
      content: "";
      position: absolute;
      left: -13px;
    }

    &:before {
      border-top: 1px solid #666666;
      top: 16px;
      width: 15px;
      height: 0;
    }

    &:after {
      border-left: 1px solid #666666;
      height: 100%;
      width: 0px;
      top: 0px;
    }

    &:last-child {
      &:after {
        height: 16px;
      }
    }
  }

  &-label {
    flex: 0 0 @col-label;
    align-items: flex-start;
    justify-content: flex-end;
    // line-height: 2.6;
    font-size: 20px;
    font-size: 2.0rem;
    font-weight: 700;
    line-height: 1.4;
    padding: 20px;
    position: relative;

    &:after {
      border-left: 1px solid #666666;
      height: 100%;
      width: 0px;
      top: 0px;
    }

    &:last-child {
      &:after {
        height: 16px;
      }
    }
  }

  &-label {
    flex: 0 0 @col-label;
    align-items: flex-start;
    justify-content: flex-end;
    // line-height: 2.6;
    font-size: 20px;
    font-size: 2.0rem;
    font-weight: 700;
    line-height: 1.4;
    padding: 20px;
    position: relative;

    .Field--inner & {
      flex: 1 100%;
      padding: 0 0 0 20px;
      text-align: left;
      font-weight: 700;
      font-size: 16px;
      font-size: 1.6rem;
      justify-content: flex-start;
      display: flex;
    }

    &:before {
      .Field--inner & {
        content: " ● ";
        color: #666666;
        position: absolute;
        left: 0px;
        top: -1px;
      }
    } 

    @media (min-width: 768px) {
      font-weight: normal;
      font-size: 16px;
      font-size: 1.6rem;
      text-align: right;
      padding: 20px;
    }
  }

  &-commentText {
    background-color: @white;
    border-radius: 4px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
    display: none;
    font-size: 12px;
    font-size: 1.2rem;
    width: 200px;
    line-height: 1.6;
    transform: translate(-89%, 5px);
    padding: 5px;
    position: absolute;
    text-align: left;
    top: 20px;
    right: 0;
    left: 0;
    white-space: normal;
    z-index: 3;
  }

  &-comment {
    display: inline;
    margin-left: 2px;
    position: relative;

    &:hover {
      .Field-commentText {
        display: inline;
        font-weight: normal;
      }
    }
  }

  &-content {
    flex: 1 100%;
    margin: 0;
    padding: 20px;

    .Field--inner & {
      border: 0;
      padding: 0 0 0 20px;
    }

     @media (min-width: 768px) {
      border-left: 1px solid #d8d8d8;
    }
  }

  &-contentItem {
    display: flex;
    flex: 1;
  }

  &-actions {
    font-size: 20px;
    font-size: 2.0rem;
    line-height: 1;
    margin: 10px 0 0;
    position: relative;

    .disabled {
      visibility: hidden;
    }

    .confirm-remove-box {
      transform: translate(12px, 18px);
    }

    .Field--inner & {
      display: inline-block;
      font-size: 16px;
      font-size: 1.6rem;
      margin: 0 0 0 5px;
      line-height: 1.4;
    }
  }

  &-action {
    display: inline-block;
    margin: 0 0 0 5px;
    transition: opacity 0.25s ease;
    transition-delay: 0.1s;
    cursor: pointer;
    color: @gray-dark;

    &:hover {
      color: @black;
    }
  }
}

.field {

  &.removed {
    transition: 0.5s all ease;
    min-height: 0em;
    max-height: 0em;
    opacity: 0;
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

  }
  .node-list {
    line-height: 0;
    .chip-container > .chip {
      line-height: 1.5;
    }
    > ul {
      margin-bottom: 0px;
      padding: 0px;
      > li {
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

  .shown-button {
    opacity: 1;
  }
 

  &.rows {
    flex-wrap: wrap;
    border: solid;
    border-width: 0px;
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
      max-height: 400vh;
      > ul {
        width: 100%;
        list-style: none;
        padding: 0px 1% 0px 1%;
        > li {
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
        }
        > li {
          display: block;
          &.inline {
            display: inline-block;
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
