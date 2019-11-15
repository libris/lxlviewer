<script>
/*
  The field component is responsible for a specific key value pair.
  It's responsible for its own data, and dispatches all changes to the form component.
*/
import { isArray, isPlainObject, isObject, cloneDeep, get } from 'lodash-es';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';
import EntityAdder from './entity-adder';
import ItemEntity from './item-entity';
import ItemValue from './item-value';
import ItemLocal from './item-local';
import ItemError from './item-error';
import ItemVocab from './item-vocab';
import ItemType from './item-type';
import ItemSibling from './item-sibling';
import ItemBoolean from './item-boolean';
import TooltipComponent from '../shared/tooltip-component';
import * as VocabUtil from '@/utils/vocab';
import * as LayoutUtil from '@/utils/layout';
import * as StringUtil from '@/utils/string';
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin';

export default {
  name: 'field',
  mixins: [clickaway, LodashProxiesMixin],
  props: {
    parentKey: {
      type: String,
      default: '',
    },
    parentIndex: {
      type: Number,
      default: 0,
    },
    parentPath: {
      type: String,
      default: '',
    },
    fieldKey: {
      type: String,
      default: '',
    },
    fieldValue: {
      type: [Object, String, Array, Boolean, Number],
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isDistinguished: {
      type: Boolean,
      default: false,
    },
    asColumns: {
      default: true,
      type: Boolean,
    },
    isInner: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      default: '',
    },
    showActionButtons: {
      type: Boolean,
      default: false,
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
    expandChildren: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeModal: false,
      shouldShowActionButtons: false,
      removeHover: false,
      pasteHover: false,
      foundChip: false,
      removed: false,
      uniqueIds: [],      
    };
  },
  components: {
    ItemType,
    'item-entity': ItemEntity,
    'item-value': ItemValue,
    'item-local': ItemLocal,
    'item-sibling': ItemSibling,
    'item-error': ItemError,
    'item-vocab': ItemVocab,
    'item-boolean': ItemBoolean,
    'entity-adder': EntityAdder,
    'tooltip-component': TooltipComponent,
  },
  watch: {
  },
  computed: {
    isRemovable() {
      if (this.fieldKey !== '@type') {
        return true;
      }
      return false;
    },
    warningOnField() {
      if (this.fieldKey === '@type') {
        return 'Warning on field';
      }
      return null;
    },
    failedValidations() {
      const failedValidations = [];
      if (this.user.settings.appTech === false) {
        return failedValidations;
      }

      if (this.keyAsVocabProperty === null || typeof this.keyAsVocabProperty === 'undefined') {
        failedValidations.push({
          text: 'The property is not recognized',
          hint: this.fieldKey,
        });
      }

      if (!this.isRepeatable && isArray(this.fieldValue) && this.fieldValue.length > 1) {
        failedValidations.push({
          text: 'The property is not repeatable',
          hint: this.fieldKey,
        });
      }

      if (failedValidations.length > 0) {
        this.$store.dispatch('setValidation', { path: this.path, validates: false, reasons: failedValidations });
      } else {
        this.$store.dispatch('setValidation', { path: this.path, validates: true });
      }
      return failedValidations;
    },
    clipboardHasValidObject() {
      if (this.clipboardValue === null) {
        return false;
      }
      return this.rangeFull.indexOf(this.clipboardValue['@type']) > -1;
    },
    clipboardValue() {
      return this.userStorage.copyClipboard;
    },
    someValuesFrom() {
      return VocabUtil.getRestrictions('someValuesFrom', this.entityType, this.fieldKey, this.resources.vocab, this.resources.context);
    },
    allValuesFrom() {
      return VocabUtil.getRestrictions('allValuesFrom', this.entityType, this.fieldKey, this.resources.vocab, this.resources.context);
    },
    range() {
      const fetchedRange = VocabUtil.getRange(
        this.fieldKey, 
        this.resources.vocab, 
        this.resources.context, 
        this.resources.vocabClasses,
      ).map(item => StringUtil.getCompactUri(item, this.resources.context));
      return fetchedRange;
    },
    rangeFull() {
      const fetchedRange = VocabUtil.getRangeFull(
        this.fieldKey, 
        this.resources.vocab, 
        this.resources.context, 
        this.resources.vocabClasses,
      ).map(item => StringUtil.getCompactUri(item, this.resources.context));
      return fetchedRange;
    },
    allSearchTypes() {
      if (this.allValuesFrom.length > 0) {
        return this.allValuesFrom;
      }
      return this.someValuesFrom.concat(this.range);
    },
    archType() {
      return VocabUtil.getRecordType(
        this.entityType, 
        this.resources.vocab, 
        this.resources.context,
      );
    },
    entityTypeArchLabel() {
      if (this.archType === 'Instance') {
        return 'Instance type';
      } else if (this.archType === 'Work') {
        return 'Work type';
      } else if (this.archType === 'Agent') {
        return 'Agent type';
      } else if (this.archType === 'Concept') {
        return 'Concept type';
      }
      return 'Type';
    },
    actionButtonsShown() {
      if (this.shouldShowActionButtons || this.showActionButtons) {
        return true;
      } 
      return false;
    },
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
      'userStorage',
    ]),
    warnBeforeRemove() {
      return this.inspector.status.focus === 'record';
    },
    arrayLength() {
      return this.valueAsArray.length;
    },
    valueIsArray() {
      return isArray(this.fieldValue);
    },
    locked() {
      if (this.settings.lockedProperties.indexOf(this.fieldKey) !== -1) {
        return true;
      }
      return this.isLocked;
    },
    isObjectArray() {
      return isPlainObject(this.valueAsArray[0]);
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
        if (this.keyAsVocabProperty.commentByLang[this.user.settings.language]) {
          return this.keyAsVocabProperty.commentByLang[this.user.settings.language];
        } 
        return this.keyAsVocabProperty.commentByLang[0];
      } 
      return '';
    },
    valueAsArray() {
      if (this.fieldValue === null) {
        return [];
      }
      let valueArray = this.fieldValue;
      if (!isArray(this.fieldValue)) {
        valueArray = [this.fieldValue];
      }
      return valueArray;
    },
    isUriType() {
      return VocabUtil.getContextValue(this.fieldKey, '@id', this.resources.context) === 'uri';
    },
    path() {
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
        this.resources.context,
      );
    },
    isCompositional() {
      if (this.keyAsVocabProperty && this.keyAsVocabProperty.hasOwnProperty('category')) {
        if (this.keyAsVocabProperty.category['@id'] === 'https://id.kb.se/vocab/compositional') {
          return true;
        }
      }
      return false;
    },
    hasSingleValue() {
      if (!isArray(this.fieldValue) || this.fieldValue.length === 1) {
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
      if (!isObject(value)) {
        return false;
      }
      const bEmpty = (Object.keys(value).length === 0);
      return bEmpty;
    },
    isLastAdded() {
      if (this.inspector.status.lastAdded === this.path) {
        return true;
      }
      return false;
    },
    embellished() {
      const embellished = this.inspector.status.embellished;
      if (embellished.length > 0) {
        return embellished.some(el => el.path === this.path);
      } return false;
    },
    forcedToArray() {
      return this.forcedListTerms.indexOf(this.fieldKey) > -1;
    },
    isLinkedInstanceOf() {      
      if (this.fieldKey === 'instanceOf' && this.parentPath === "mainEntity") {        
        if (this.fieldValue['@id'].split('#')[0] !== this.inspector.data.record['@id']) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    pasteClipboardItem() {
      const obj = this.clipboardValue;
      let currentValue = cloneDeep(get(this.inspector.data, this.path));
      if (currentValue === null) {
        currentValue = obj;
      } else if (!isArray(currentValue)) {
        currentValue = [currentValue];
        currentValue.push(obj);
      } else if (typeof obj.length !== 'undefined' && isArray(obj)) {
        obj.forEach((subObj) => {
          currentValue.push(subObj);
        });
      } else {
        currentValue.push(obj);
      }
      let index = '';
      if (currentValue.length) {
        index = `[${currentValue.length - 1}]`;
      }
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'lastAdded', 
        value: `${this.path}${index}`,
      });
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.path}`,
            value: currentValue,
          },
        ],
        addToHistory: true,
      });
      const userStorage = cloneDeep(this.userStorage);
      userStorage.copyClipboard = null;
      this.$store.dispatch('setUserStorage', userStorage);
    },
    actionHighlight(active, event) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.add('is-marked');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.remove('is-marked');
      }
    },
    removeHighlight(active, event) {
      if (active) {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.add('is-removeable');
      } else {
        let item = event.target;
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.remove('is-removeable');
      }
    },
    removeThis() {
      let approved = true;
      if (this.warnBeforeRemove) {
        const confString = `${StringUtil.getUiPhraseByLang('Are you sure you want to remove the field', this.user.settings.language)} "${StringUtil.getLabelByLang(this.fieldKey, this.user.settings.language, this.resources.vocab, this.resources.context)}"?`;
        approved = window.confirm(confString);
      }
      if (approved) {
        this.removed = true;
        const parentData = cloneDeep(get(this.inspector.data, this.parentPath));
        delete parentData[this.fieldKey];
        setTimeout(() => {
          this.$store.dispatch('updateInspectorData', {
            changeList: [
              {
                path: this.parentPath,
                value: parentData,
              },
            ],
            addToHistory: true,
          });
        }, 500);
      }
    },
    getDatatype(o) {
      if (typeof o === 'undefined') {
        throw new Error('Cannot check data type of undefined object.');
      }
      if (this.isPlainObject(o) && !o.hasOwnProperty('@id') && !o.hasOwnProperty('@type')) {
        return 'error';
      }
      if (typeof o === 'boolean') {
        return 'boolean';
      }      
      if (this.fieldKey === '@type' ||  VocabUtil.getContextValue(this.fieldKey, '@type', this.resources.context) === '@vocab') {
        return 'vocab';
      }
      if (this.isPlainObject(o) && o.hasOwnProperty('@id') && this.isInGraph(o)) {
        return 'sibling';
      }
      if (this.isPlainObject(o) && this.isLinked(o)) {
        return 'entity';
      }
      if (this.isPlainObject(o) && !this.isLinked(o)) {
        return 'local';
      }
      if (!this.isPlainObject(o) && !this.isLinked(o)) {
        return 'value';
      }
      return 'error';
    },
    isLinked(o) {
      if (o === null) {
        return false;
      }
      if (typeof o === 'undefined') {
        throw new Error('Cannot check link status of undefined object.');
      }
      if (o.hasOwnProperty('@id') && !o.hasOwnProperty('@type')) {        
        return true;
      }
      return false;
    },
    isInGraph(o) {
      const data = this.inspector.data;
      for (const point in data) {
        if (data[point] !== null) {
          if (data[point]['@id'] === o['@id']) {
            return true;
          }
        }
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
      if (this.getDatatype(item) === 'entity') {
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
        this.shouldShowActionButtons = false;
      }
    },
    highLightLastAdded() {
      if (this.isLastAdded === true) {
        if (this.fieldValue === null || (isArray(this.fieldValue) && this.fieldValue.length === 0)) {
          const entityAdder = this.$refs.entityAdder;
          this.$nextTick(() => {
            if (entityAdder.$refs.adderFocusElement) {
              LayoutUtil.enableTabbing();
              entityAdder.$refs.adderFocusElement.focus();
            }
          });
        }
        const element = this.$el;
        LayoutUtil.ensureInViewport(element).then(() => {
          setTimeout(() => {
            if (this.isLastAdded) {
              this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
            }
          }, 1000);
        });
      }
    },
  },
  beforeDestroy() {
    this.$store.dispatch('setValidation', { path: this.path, validates: true });
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.fieldKey === '_uid') {
          throw new Error('A datanode component has been added for a _uid key, which should never happen.');
        }
        this.highLightLastAdded();
      }, 300);
    });
  },
};
</script>

<template>
  <li class="Field js-field" 
    :id="`formPath-${path}`"
    v-bind:class="{
      'Field--inner': !asColumns,
      'is-lastAdded': isLastAdded, 
      'is-removed': removed,
      'is-highlighted': embellished,
      'has-failed-validations': failedValidations.length > 0,
      'is-distinguished': isDistinguished,
      'is-linked': isLinkedInstanceOf, 
    }" 
    @mouseover="handleMouseEnter()" 
    @mouseleave="handleMouseLeave()">

    <div class="Field-labelContainer" 
      :class="{'is-wide': inspector.status.editing || user.settings.appTech, 'is-hovered': shouldShowActionButtons}"
      v-if="!isInner" >
      <div class="Field-labelWrapper">
        <div v-if="this.inspector.status.editing" class="Field-actions">
          <div class="Field-action Field-remove" 
            v-show="!locked && isRemovable" 
            :class="{'disabled': activeModal}">
            <i class="fa fa-trash-o fa-fw action-button icon icon--sm"
              role="button"
              :aria-label="'Remove' | translatePhrase"
              tabindex="0"
              v-on:click="removeThis(true)"
              @keyup.enter="removeThis(true)"
              @focus="removeHover = true, removeHighlight(true, $event)" 
              @blur="removeHover = false, removeHighlight(false, $event)"
              @mouseover="removeHover = true, removeHighlight(true, $event)" 
              @mouseout="removeHover = false, removeHighlight(false, $event)">
              <tooltip-component 
                :show-tooltip="removeHover" 
                tooltip-text="Remove"></tooltip-component>
            </i>
          </div>
          <entity-adder class="Field-entityAdder Field-action"
            v-if="!locked && (isRepeatable || isEmptyObject)" 
            ref="entityAdder"
            :field-key="fieldKey" 
            :path="path"
            :already-added="linkedIds" 
            :compositional="isCompositional" 
            :entity-type="entityType" 
            :range-full="rangeFull"
            :range="range"
            :all-values-from="allValuesFrom"
            :some-values-from="someValuesFrom"
            :all-search-types="allSearchTypes"
            :property-types="propertyTypes" 
            :show-action-buttons="actionButtonsShown" 
            :active="activeModal" 
            :is-placeholder="false" 
            :value-list="valueAsArray">
          </entity-adder>
          <div v-else class="Field-action placeholder"></div> 

          <div class="Field-comment" v-if="propertyComment && !locked" >
            <i class="fa fa-question-circle fa-fw icon icon--sm"></i>
            <span class="Field-commentText">{{ propertyComment }}</span>
          </div>
          <div v-else class="Field-action placeholder"></div> 

          <div class="Field-action Field-clipboardPaster"
            v-if="!locked && (isRepeatable || isEmptyObject) && clipboardHasValidObject" 
            ref="clipboardPaster">
            <i tabindex="0" class="fa fa-paste fa-fw action-button icon icon--sm"
              role="button"
              :aria-label="'Paste entity' | translatePhrase"
              @click="pasteClipboardItem"
              @keyup.enter="pasteClipboardItem"
              @focus="pasteHover = true, actionHighlight(true, $event)" 
              @blur="pasteHover = false, actionHighlight(false, $event)"
              @mouseover="pasteHover = true, actionHighlight(true, $event)" 
              @mouseout="pasteHover = false, actionHighlight(false, $event)">
              <tooltip-component 
                :show-tooltip="pasteHover" 
                tooltip-text="Paste entity"></tooltip-component>
            </i>
          </div>
        </div>
        <div class="Field-label uppercaseHeading" v-bind:class="{ 'is-locked': locked }">
          <span v-show="fieldKey === '@id'">{{ 'ID' | translatePhrase | capitalize }}</span>
          <span v-show="fieldKey === '@type'">{{ entityTypeArchLabel | translatePhrase | capitalize }}</span>
          <span v-show="fieldKey !== '@id' && fieldKey !== '@type'" 
            :title="fieldKey">{{ fieldKey | labelByLang | capitalize }}</span>    
        </div>
      </div>
      <code class="path-code" v-show="user.settings.appTech && !isInner">{{path}}</code>
    </div>
    <div class="Field-label uppercaseHeading" v-if="isInner" v-bind:class="{ 'is-locked': locked }">
      <span v-show="fieldKey === '@id'">{{ 'ID' | translatePhrase | capitalize }}</span>
      <span v-show="fieldKey === '@type'">{{ entityTypeArchLabel | translatePhrase | capitalize }}</span>
      <span v-show="fieldKey !== '@id' && fieldKey !== '@type'" 
        :title="fieldKey">{{ fieldKey | labelByLang | capitalize }}</span>

      <!-- Is inner -->
      <div class="Field-actions is-nested">
        <div class="Field-action Field-comment" v-if="propertyComment && !locked" >
          <i class="fa fa-question-circle fa-fw icon icon--sm"></i>
          <span class="Field-commentText">{{ propertyComment }}</span>
        </div>
        <entity-adder class="Field-action Field-entityAdder"
          v-if="!locked && (isRepeatable || isEmptyObject)" 
          ref="entityAdder"
          :field-key="fieldKey" 
          :path="path" 
          :already-added="linkedIds" 
          :compositional="isCompositional" 
          :entity-type="entityType" 
          :range-full="rangeFull"
          :range="range"
          :all-values-from="allValuesFrom"
          :some-values-from="someValuesFrom"
          :all-search-types="allSearchTypes"
          :property-types="propertyTypes" 
          :show-action-buttons="actionButtonsShown" 
          :active="activeModal" 
          :is-placeholder="true" 
          :value-list="valueAsArray">
        </entity-adder>

        <div class="Field-action Field-remove" 
          v-show="!locked && isRemovable" 
          :class="{'disabled': activeModal}">
          <i class="fa fa-trash-o fa-fw action-button icon icon--sm"
            tabindex="0"
            role="button"
            :aria-label="'Remove' | translatePhrase"
            v-on:click="removeThis(true)"
            @keyup.enter="removeThis(true)"
            @focus="removeHover = true, removeHighlight(true, $event)" 
            @blur="removeHover = false, removeHighlight(false, $event)" 
            @mouseover="removeHover = true, removeHighlight(true, $event)" 
            @mouseout="removeHover = false, removeHighlight(false, $event)"  >
            <tooltip-component
              :show-tooltip="removeHover" 
              tooltip-text="Remove"></tooltip-component>
          </i>
        </div>

        <div class="Field-action Field-clipboardPaster"
          v-if="!locked && (isRepeatable || isEmptyObject) && clipboardHasValidObject" 
          ref="clipboardPaster">
          <i tabindex="0" class="fa fa-paste fa-fw action-button icon icon--sm"
            role="button"
            :aria-label="'Paste entity' | translatePhrase"
            @click="pasteClipboardItem"
            @keyup.enter="pasteClipboardItem"
            @focus="pasteHover = true, actionHighlight(true, $event)" 
            @blur="pasteHover = false, actionHighlight(false, $event)"
            @mouseover="pasteHover = true, actionHighlight(true, $event)" 
            @mouseout="pasteHover = false, actionHighlight(false, $event)">
            <tooltip-component 
              :show-tooltip="pasteHover" 
              tooltip-text="Paste entity"></tooltip-component>
          </i>
        </div>
      </div>
      <!-- {{ key | labelByLang | capitalize }} -->
    </div>

    <pre class="path-code" v-show="user.settings.appTech && isInner">{{path}}</pre>
    
    <div class="Field-content FieldContent"
    :class="{ 'is-locked': locked}"
    v-if="fieldKey === '@type'">
      <div class="Field-contentItem" 
        v-for="(item, index) in valueAsArray" 
        :key="index"
        v-bind:class="{'is-entityContent': getDatatype(item) == 'entity'}">
        <item-type
          :is-locked="locked" 
          :field-key="fieldKey" 
          :field-value="fieldValue" 
          :entity-type="entityType" 
          :parent-path="path" />
      </div>
    </div>

    <div class="Field-content FieldContent" 
      v-bind:class="{ 'is-locked': locked}"
      v-if="fieldKey !== '@type' && isObjectArray">
      <div class="Field-contentItem" 
        v-for="(item, index) in valueAsArray" 
        :key="index"
        v-bind:class="{'is-entityContent': getDatatype(item) == 'entity' && !isLinkedInstanceOf}">

        <item-error 
          v-if="getDatatype(item) == 'error'" 
          :field-key="fieldKey" 
          :parent-path="path"
          :index="index" 
          :item="item"></item-error>

        <!-- Other linked resources -->
        <item-vocab
          v-if="getDatatype(item) == 'vocab'" 
          :as-dropdown="fieldKey !== 'encodingLevel'"
          :is-locked="locked" 
          :field-key="fieldKey" 
          :parent-range="rangeFull"
          :value="item" 
          :entity-type="entityType" 
          :index="index" 
          :parent-path="path"></item-vocab>

        <!-- Other linked entities -->
        <item-entity 
          v-if="getDatatype(item) == 'entity'" 
          :is-locked="locked" 
          :is-distinguished="isDistinguished"
          :item="item" 
          :field-key="fieldKey" 
          :index="index" 
          :parent-path="path"></item-entity>

        <!-- Not linked, local child objects -->
        <item-local
          :data-parent="path"
          v-if="getDatatype(item) == 'local'" 
          :is-locked="locked" 
          :entity-type="entityType" 
          :is-compositional="isCompositional"
          :all-values-from="allValuesFrom"
          :some-values-from="someValuesFrom"
          :all-search-types="allSearchTypes"
          :range="range"
          :range-full="rangeFull"
          :item="item" 
          :field-key="fieldKey" 
          :index="index" 
          :parent-path="path" 
          :in-array="valueIsArray" 
          :should-expand="expandChildren || embellished"
          :show-action-buttons="actionButtonsShown"></item-local>

        <item-sibling
          v-if="getDatatype(item) == 'sibling'"
          :id="item['@id']"
          :is-locked="locked"
          :field-key="fieldKey"
          :entity-type="entityType"
          :is-compositional="isCompositional"
          :all-values-from="allValuesFrom"
          :some-values-from="someValuesFrom"
          :all-search-types="allSearchTypes"
          :range="range"
          :range-full="rangeFull"
          :index="index"
          :in-array="valueIsArray"
          :show-action-buttons="actionButtonsShown"
          :should-expand="expandChildren || embellished"
          :parent-path="path"></item-sibling>
      </div>
      <portal-target :name="`typeSelect-${path}`" />
    </div>

    <div class="Field-content is-endOfTree js-endOfTree" 
      v-bind:class="{ 'is-locked': locked }"
      v-if="fieldKey !== '@type' && !isObjectArray">
      <div class="Field-contentItem" 
        v-for="(item, index) in valueAsArray" 
        :key="index">

        <!-- Other linked resources -->
        <item-vocab 
          v-if="getDatatype(item) == 'vocab'" 
          :as-dropdown="fieldKey !== 'encodingLevel'"
          :is-locked="locked" :field-key="fieldKey" 
          :field-value="item" 
          :entity-type="entityType" 
          :index="index" 
          :parent-path="path"></item-vocab>

        <!-- Boolean value -->
        <item-boolean
          v-if="getDatatype(item) == 'boolean'" 
          :is-locked="locked" 
          :field-key="fieldKey" 
          :field-value="item" 
          :entity-type="entityType" 
          :index="index" 
          :parent-path="path"></item-boolean>

        <!-- Not linked, local child strings -->
        <item-value 
          v-if="getDatatype(item) == 'value'" 
          :is-last-added="isLastAdded"
          :is-removable="!hasSingleValue" 
          :is-locked="locked" 
          :is-uri-type="isUriType"
          :field-value="item" 
          :field-key="fieldKey" 
          :index="index" 
          :parent-path="path" 
          :show-action-buttons="actionButtonsShown"
          :is-expanded="isExpanded"></item-value>
      </div>
      <portal-target :name="`typeSelect-${path}`" />
    </div>
  </li>
</template>

<style lang="less">

.Field {
  border-bottom: 1px solid;
  border-color: @form-border;
  border-color: @form-border-alt;
  width: 100%;
  flex-direction: row;
  opacity: 1;
  position: relative;
  transition: background-color .3s ease;

  &.has-failed-validations {
    outline: 1px dotted red;
  }

  &.is-marked {
    background-color: @add;
  }

  &.is-removeable {
    background-color: @remove;
  }

  &.is-lastAdded {
    background-color: @add;
  }

  &.is-highlighted { // replace 'is-lastadded' & 'is-marked' with this class
    background-color: @highlight-color;
  }
  
  @media (min-width: 768px) {
    display: flex;
  }

  &--inner {
    border: 0;
    flex: 1 100%;
    margin: 0;
    padding: 5px 0 5px 0;
    border-radius: 4px;
    overflow: visible;
    display: block;

    &.is-marked {
      background-color: @add;
    }

    &.is-removeable {
      background-color: @remove;
    }

    &:before, 
    &:after {
      content: "";
      position: absolute;
      left: -13px;
    }

    &:before {
      border-top: 1px solid;
      border-top-color: @field-path;
      border-top-color: @field-path-alt;
      top: 16px;
      width: 14px;
      height: 2px;
    }

    &:after {
      border-left: 1px solid;
      border-left-color: @field-path;
      border-left-color: @field-path-alt;
      height: 100%;
      width: 2px;
      top: 0px;
    }

    &:last-child {
      &:after {
        height: 16px;
      }
    }
  }

    &-labelContainer {
    display: flex;
    flex: 0 0 225px;
    flex-direction: column;
    padding: 0.75em 1em 0.25em 1em;

    &.is-wide {
      flex-basis: 35%;
      max-width: 270px;

      @media screen and (max-width: @screen-sm) { 
        max-width: 100%;
      }
    }

    &.is-hovered * {
      z-index: 1;
    }

    pre {
      margin-top: 5px;
      max-width: 260px;
    }
  }

  &-labelWrapper {
    position: static;
    position: sticky;
    top: 55px;
    display: flex;
    justify-content: flex-end;
    flex-direction: row-reverse;
    min-height: 30px;

    @media (min-width: @screen-sm) {
      flex-direction: row;
    }
  }

  &-label {
    align-items: flex-start;
    justify-content: flex-end;
    position: relative;
    flex-grow: 1;
    word-break: break-word;
    -ms-word-break: break-all;
    hyphens: auto;

    &:after {
      border-left: 1px solid;
      border-color: @field-path;
      border-color: @field-path-alt;
      height: 100%;
      width: 0px;
      top: 0px;
    }

    &:last-child {
      &:after {
        height: 16px;
      }
    }

    .is-lastAdded & {
      -webkit-animation-duration: 2s;
      animation-duration: 2s;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
      -webkit-animation-name: fadeIn;
      animation-name: fadeIn;
    }

    .Field--inner & {
      flex: 1 100%;
      padding: 0 0 0 20px;
      text-align: left;
      justify-content: flex-start;
      display: flex;
      margin-bottom: 2px;
    }

    &:before {
      .Field--inner & {
        content: " ● ";
        color: @field-path;
        color: @field-path-alt;
        position: absolute;
        left: 0px;
        top: -1px;
      }
    } 

    @media (min-width: 768px) {
      text-align: right;
    }

    @media print and (max-width: 768px) {
      padding-bottom: 0;
    }
  }

  &-commentText {
    display: none;
    position: absolute;
    top: 20px;
    right: 0;
    left: 0;
    width: 200px;
    font-size: 12px;
    font-size: 1.2rem;
    line-height: 1.6;
    text-transform: none;
    transform: translate(-25%, 5px);
    padding: 10px;
    text-align: left;
    white-space: normal;
    color: @black;
    background-color: @white;
    border: 1px solid @gray-lighter;
    border-radius: 4px;
    box-shadow: @shadow-panel;
    z-index: 3;

    @media (max-width: @screen-sm) {
      transform: translate(-60%, 5px);
    }
  }

  &-comment, &-warning {
    width: 20px;
    position: relative;
    margin-right: 5px;

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
    padding: 0.25em 1em;
    max-width: 100%;
    width: 0;

    .Field--inner & {
      border: 0;
      padding: 0 0 0 10px;
      width: auto;
    }

    @media (min-width: 768px) {
      border-left: 1px solid;
      border-color: @form-border;
      border-color: @form-border-alt;
    }

    @media print and (max-width: 768px) {
      padding-top: 0;
    }
  }

  &-contentItem {
    display: flex;
    flex: 1;
    max-width: 100%;

    &.is-entityContent {
      display: inline-flex;
    }
  }

  &-actions {
    display: flex;
    flex-grow: 1;
    justify-content: initial;
  
    @media (max-width: @screen-sm) {
      justify-content: flex-start;
      flex-direction: row-reverse;
    }

    .disabled {
      visibility: hidden;
    }

    .confirm-remove-box {
      transform: translate(12px, 18px);
    }

    .Field--inner & {
      font-size: 16px;
      font-size: 1.6rem;
      margin: 0 0 0 10px;
      line-height: 1.4;
      
      @media (max-width: @screen-sm) {
        display: flex;
        justify-content: flex-end;
        flex-direction: row;
      }
    }
  }

  &-action {
    min-width:  20px;
    display: inline-block;
    margin-right: 5px;
  
  &.placeholder {
    width: 20px;
    display: none;

    @media (min-width: @screen-sm) {
      display: block;
    }
  }

    &:hover {
    }
  }

  .path-code {
    display: inline-block;
    word-break: break-all;
    overflow: hidden;
    background-color: #f0f0f0;
    padding: 0;
    color: #4f4f4f;
  }
}

.field {
  
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
}
</style>
