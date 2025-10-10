<script>
/*
  The field component is responsible for a specific key value pair.
  It's responsible for its own data, and dispatches all changes to the form component.
*/
import { cloneDeep, differenceWith, get, isArray, isEqual, isObject, isPlainObject } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as DisplayUtil from 'lxljs/display';
import { getContextValue } from 'lxljs/vocab';
import * as LayoutUtil from '@/utils/layout';
import * as DataUtil from '@/utils/data';
import { translatePhrase, labelByLang, capitalize } from '@/utils/filters';
import protectedProps from '@/resources/json/protectedProperties.json';
import EntityAdder from './entity-adder.vue';
import ItemEntity from './item-entity.vue';
import ItemValue from './item-value.vue';
import ItemLocal from './item-local.vue';
import ItemError from './item-error.vue';
import ItemVocab from './item-vocab.vue';
import ItemType from './item-type.vue';
import ItemBoolean from './item-boolean.vue';
import ItemNumeric from './item-numeric.vue';
import ItemGrouped from './item-grouped.vue';
import ItemShelfControlNumber from './item-shelf-control-number.vue';
import ItemBylang from './item-bylang.vue';
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin.vue';
import LanguageMixin from '../mixins/language-mixin.vue';
import FieldMarker from "@/components/inspector/field-marker.vue";
import IdList from '@/components/care/id-list.vue';
import ModalComponent from "@/components/shared/modal-component.vue";
import {
  BulkContext,
  HAS_ID_KEY,
  MATCHING_MODE_KEY,
  SUBTYPES_TYPE,
  VALUE_FROM_KEY,
  ANY_TYPE
} from "@/utils/bulk.js";

export default {
  name: 'field',
  mixins: [LodashProxiesMixin, LanguageMixin],
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
    parentAcceptedTypes: {
      type: Array,
      default: () => [],
    },
    fieldKey: {
      type: String,
      default: '',
    },
    overrideLabel: {
      type: String,
      default: null,
    },
    fieldValue: {
      type: [Object, String, Array, Boolean, Number],
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    showKey: {
      type: Boolean,
      default: true,
    },
    inEnrichment: {
      type: Boolean,
      default: false,
    },
    showDiffs: {
      type: Boolean,
      default: false,
    },
    isDiff: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFirstField: {
      type: Boolean,
      default: false,
    },
    oldValue: {
      type: [Array, String, Object],
      default: null,
    },
    diff: {
      type: Object,
      default: null,
    },
    isCard: {
      type: Boolean,
      default: false,
    },
    isInner: {
      type: Boolean,
      default: false,
    },
    isGrouped: {
      type: Boolean,
      default: false,
    },
    entityType: {
      type: String,
      default: '',
    },
    isExpanded: {
      type: Boolean,
      default: false,
    },
    expandChildren: {
      type: Boolean,
      default: false,
    },
    bulkContext: {
      type: String,
      default: BulkContext.None,
    },
    showEnriched: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      activeModal: false,
      removeHover: false,
      pasteHover: false,
      removed: false,
      uniqueIds: [],
      unlockedByUser: false,
      unlockModalOpen: false,
      protectedProps
    };
  },
  components: {
    FieldMarker,
    IdList,
    ItemType,
    'item-entity': ItemEntity,
    'item-value': ItemValue,
    'item-local': ItemLocal,
    'item-error': ItemError,
    'item-vocab': ItemVocab,
    'item-boolean': ItemBoolean,
    'item-numeric': ItemNumeric,
    'item-grouped': ItemGrouped,
    'item-shelf-control-number': ItemShelfControlNumber,
    'item-bylang': ItemBylang,
    'entity-adder': EntityAdder,
    'modal-component': ModalComponent,
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'record-control') {
        if (val.value === 'save-record' || val.value === 'save-record-done' || val.value === 'cancel') {
          this.unlockedByUser = false;
        }
      }
    },
  },
  computed: {
    diffAdded() {
      if (this.diff == null) return false;
      return this.diff.added.includes(this.path) && !this.diff.removed.includes(this.path);
    },
    diffRemoved() {
      if (this.diff == null) return false;
      return this.diff.removed.includes(this.path) && !this.diff.added.includes(this.path);
    },
    diffModified() {
      if (this.diff == null) return false;
      return this.diff.modified.includes(this.path);
    },
    isReverseProperty() {
      return this.fieldKey.indexOf('@reverse') > -1;
    },
    reverseProperty() {
      return this.isReverseProperty ? this.fieldKey.split('/').pop() : null;
    },
    isFieldDiff() {
      return this.isDiff && this.newDiffValues.length === 0;
    },
    isFieldNew() {
      return this.isNew && this.newDiffValues.length === 0;
    },
    newDiffValues() {
      if (this.showDiffs && isArray(this.fieldValue)) {
        if (this.containsOldValue === false) {
          return [];
        }
        const diff = differenceWith(this.fieldValue, this.oldValue, isEqual);
        return diff;
      }
      return [];
    },
    containsOldValue() {
      const oldValue = isArray(this.oldValue) ? this.oldValue : [this.oldValue];
      let oldFound = false;
      for (let i = 0; i < this.fieldValue.length; i++) {
        if (isEqual(this.fieldValue[i], oldValue[0])) {
          oldFound = true;
        }
      }
      return oldFound;
    },
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
      ).map((item) => StringUtil.getCompactUri(item, this.resources.context));
      return fetchedRange;
    },
    rangeFull() {
      const fetchedRange = VocabUtil.getRangeFull(
        this.fieldKey,
        this.resources.vocab,
        this.resources.context,
        this.resources.vocabClasses,
      ).map((item) => StringUtil.getCompactUri(item, this.resources.context));
      const unselectableTypes = Object.values(this.settings.extractableMappedTypes);
      return fetchedRange.filter((t) => !unselectableTypes.includes(t));
    },
    allSearchTypes() {
      if (this.allValuesFrom.length > 0) {
        return this.allValuesFrom;
      }
      return this.range;
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
      }
      if (this.archType === 'Work') {
        return 'Work type';
      }
      if (this.archType === 'Agent') {
        return 'Agent type';
      }
      if (this.archType === 'Concept') {
        return 'Concept type';
      }
      return 'Type';
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
    isProtected() {
      return this.settings.protectedProperties.indexOf(this.fieldKey) !== -1 ||
        this.settings.protectedProperties.some((p) => isEqual(p, this.path));
    },
    hasBackendValidationError() {
      return this.backendValidationError != null;
    },
    backendValidationError() {
      if (this.inspector.backendValidation.numberOfErrors > 0) {
        return this.inspector.backendValidation.errors[this.path];
      }
      return null;
    },
    arrayLength() {
      return this.valueAsArray.length;
    },
    valueIsArray() {
      return isArray(this.fieldValue);
    },
    locked() {
      if (this.inBulkChangeView && !this.isLocked) {
        if (this.settings.unlockableProperties.includes(this.fieldKey)) {
          return false;
        }
      }
      if (this.isProtected && !this.unlockedByUser) {
        return true;
      }
      if (this.settings.lockedProperties.indexOf(this.fieldKey) !== -1) {
        return true;
      }
      if (this.isReverseProperty) {
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
      if (this.fieldKey === '_uid') {
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
    firstInValueAsArray() {
      return typeof this.valueAsArray[0] || '';
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
    isLangMapWithPartner() {
      return this.isLangMap && this.hasProp;
    },
    isHidden() {
      return (this.isLangMapWithPartner && this.diff == null) || VocabUtil.propIsIndex(this.fieldKey, this.resources.context);
    },
    propertyTypes() {
      return VocabUtil.getPropertyTypes(
        this.fieldKey,
        this.resources.vocab,
        this.resources.context,
      );
    },
    isCompositional() {
      return VocabUtil.hasCategory(this.keyAsVocabProperty, 'compositional', this.resources);
    },
    isHistoryView() {
      return this.diff !== null;
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
        this.unlockedByUser = true;
        return true;
      }
      return false;
    },
    isLangTaggable() {
      return getContextValue(this.fieldKey.concat('ByLang'), '@container', this.resources.context) === '@language';
    },
    enriched() {
      const enriched = this.inspector.status.enriched;
      if (enriched.length > 0) {
        return enriched.some((el) => el.path === this.path);
      } return false;
    },
    enrichedChildren() {
      if (this.isLocked) return false;
      return this.inspector.status.enriched
        .filter((e) => !isEqual(e.path, this.path))
        .some((e) => e.path.includes(this.path));
    },
    fieldRdfType() {
      return DisplayUtil.rdfDisplayType(this.fieldKey, this.resources);
    },
    matchSubTypes() {
      if (this.bulkContext === BulkContext.MatchForm) {
        const data = get(this.inspector.data, this.parentPath);
        return typeof data[MATCHING_MODE_KEY] !== 'undefined' && data[MATCHING_MODE_KEY].includes(SUBTYPES_TYPE);
      } else {
        return false;
      }
    },
    inBulkChangeView() {
      return this.$route.path.includes('bulkchanges');
    },
    isBulkChangeMatchForm() {
      return this.bulkContext === BulkContext.MatchForm;
    },
    isAnyType() {
      return this.entityType === ANY_TYPE;
    }
  },
  methods: {
    HAS_ID_KEY() {
      return HAS_ID_KEY
    },
    VALUE_FROM_KEY() {
      return VALUE_FROM_KEY
    },
    translatePhrase,
    labelByLang,
    capitalize,
    onLabelClick() {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'field-label-clicked',
        value: this.path,
      });
    },
    pasteClipboardItem() {
      const obj = this.clipboardValue;
      DataUtil.fetchMissingLinkedToQuoted(obj, this.$store)
        .finally(() => this._pasteClipboardItem(obj));
    },
    _pasteClipboardItem(obj) {
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
    highlight(active, event, cssClass) {
      let item = event.target;
      if (active) {
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.add(cssClass);
      } else {
        while ((item = item.parentElement) && !item.classList.contains('js-field'));
        item.classList.remove(cssClass);
      }
    },
    openUnlockModal() {
      this.unlockModalOpen = true;
      setTimeout(() => {
        this.$refs.unlockButton.focus();
      }, 200);
    },
    unlockEdit() {
      this.unlockedByUser = true;
      this.closeUnlockModal();
    },
    closeUnlockModal() {
      this.unlockModalOpen = false;
    },
    removeThis() {
      let approved = true;
      if (this.warnBeforeRemove) {
        const confString = `${StringUtil.getUiPhraseByLang('Are you sure you want to remove the field', this.user.settings.language, this.resources.i18n)} 
        "${StringUtil.getLabelByLang(this.fieldKey, this.user.settings.language, this.resources)}"?`;
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
      if (this.isPlainObject(o) && o.hasOwnProperty('isGrouped')) {
        return 'grouped';
      }
      if (this.isIdList(o)) {
        return 'idList';
      }
      if (this.isPlainObject(o) && !o.hasOwnProperty('@id') && !o.hasOwnProperty('@type') && !this.isLangMap) {
        return 'error';
      }
      if (typeof o === 'boolean') {
        return 'boolean';
      }
      if (this.fieldKey === 'shelfControlNumber') {
        return 'shelfControlNumber';
      }
      if (this.isLangMap || this.isLangTaggable) {
        return 'language';
      }
      if (this.fieldKey === '@type' || VocabUtil.getContextValue(this.fieldKey, '@type', this.resources.context) === '@vocab') {
        return 'vocab';
      }
      if (this.isPlainObject(o) && (!this.isLinked(o) || this.isInlined(o))) {
        return 'local';
      }
      if (this.isPlainObject(o) && this.isLinked(o)) {
        return 'entity';
      }
      if (this.range && this.range.length > 0 && this.range.every((r) => Object.keys(VocabUtil.XSD_NUMERIC_TYPES).includes(r))) {
        return 'numeric';
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
      return o.hasOwnProperty('@id');
    },
    isIdList(o) {
      return o.hasOwnProperty(HAS_ID_KEY);
    },
    isInlined(o) {
      // FIXME
      return this.isLinked(o) && Object.keys(o).length > 1 && this.isCompositional && !this.isHistoryView;
    },
    isEmbedded(o) {
      const type = o['@type'];
      if (!type || typeof type === 'undefined') {
        return false;
      }
      return VocabUtil.isEmbedded(type, this.resources.vocab, this.settings);
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
    toggleMatchSubtypes() {
      let update = cloneDeep(get(this.inspector.data, this.parentPath))
      if (typeof update[MATCHING_MODE_KEY] !== 'undefined') {
        delete update[MATCHING_MODE_KEY];
      } else {
        update[MATCHING_MODE_KEY] = [SUBTYPES_TYPE];
      }
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: `${this.parentPath}`,
            value: update,
          },
        ],
        addToHistory: true,
      });
    },
    getModalTitle() {
      return protectedProps[this.fieldKey] ? protectedProps[this.fieldKey].title : protectedProps['default'].title;
    },
    getModalInfoText() {
      return protectedProps[this.fieldKey] ? protectedProps[this.fieldKey].infoText : protectedProps['default'].infoText;
    }
  },
  beforeUnmount() {
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
  <li
    class="Field js-field"
    :id="`formPath-${path}`"
    v-bind:class="{
      'Field--inner': isInner,
      'is-lastAdded': isLastAdded,
      'is-removed': removed,
      'is-diff-added': diffAdded,
      'is-diff-removed': diffRemoved,
      'is-diff-modified': diffModified,
      'is-locked': locked,
      'is-diff': isFieldDiff,
      'is-new': isFieldNew,
      'is-highlighted': enriched && showEnriched,
      'is-grouped': isGrouped,
    }"
    v-if="!this.isHidden">

    <div
      class="Field-labelContainer"
      :class="{ 'is-wide': inspector.status.editing || user.settings.appTech }"
      v-if="showKey && !isInner">
      <div class="Field-labelWrapper" :class="{ sticky: !diff }">
        <div v-if="!isLocked" class="Field-actions">

          <div
            class="Field-action Field-remove"
            v-show="!locked && isRemovable"
            :class="{ disabled: activeModal }">
            <i
              class="fa fa-trash-o fa-fw action-button icon icon--sm"
              role="button"
              :aria-label="translatePhrase('Remove')"
              tabindex="0"
              v-on:click="removeThis(true)"
              @keyup.enter="removeThis(true)"
              v-tooltip.top="translatePhrase('Remove')"
              @focus="removeHover = true, highlight(true, $event, 'is-removeable')"
              @blur="removeHover = false, highlight(false, $event, 'is-removeable')"
              @mouseover="removeHover = true, highlight(true, $event, 'is-removeable')"
              @mouseout="removeHover = false, highlight(false, $event, 'is-removeable')" />
          </div>
          <entity-adder
            class="Field-entityAdder Field-action"
            v-if="!locked && (isRepeatable || isEmptyObject || isLangMap)"
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
            :active="activeModal"
            :is-placeholder="false"
            :is-language="this.isLangMap || this.isLangTaggable"
            @addEmptyLanguageItem="addEmpty()"
            :value-list="valueAsArray"
            :bulk-context="bulkContext"
          />
          <div v-else class="Field-action placeholder" />

          <div class="Field-comment" v-if="propertyComment && !locked">
            <i class="fa fa-question-circle fa-fw icon icon--sm" />
            <span class="Field-commentText">{{ propertyComment }}</span>
          </div>
          <div v-else class="Field-action placeholder" />

          <div class="Field-action" v-if="isProtected && !unlockedByUser && !isLocked">
            <i class="fa fa-lock fa-fw icon icon--sm"
               tabindex="0"
               role="button"
               :aria-label="translatePhrase('Edit locked property')"
               v-on:click="openUnlockModal()"
               v-tooltip.top="translatePhrase('Edit locked property')"
               @keyup.enter="openUnlockModal()"
            />
          </div>
          <div class="Field-action" v-if="isProtected && unlockedByUser && !isLocked">
            <i class="fa fa-unlock-alt fa-fw icon icon--sm"
               tabindex="0"
            />
          </div>

          <div
            class="Field-action Field-clipboardPaster"
            v-if="!locked && (isRepeatable || isEmptyObject) && clipboardHasValidObject"
            ref="clipboardPaster">
            <i
              tabindex="0"
              class="fa fa-paste fa-fw action-button icon icon--sm"
              role="button"
              :aria-label="translatePhrase('Paste entity')"
              @click="pasteClipboardItem"
              @keyup.enter="pasteClipboardItem"
              v-tooltip.top="translatePhrase('Paste entity')"
              @focus="pasteHover = true, highlight(true, $event, 'is-marked')"
              @blur="pasteHover = false, highlight(false, $event, 'is-marked')"
              @mouseover="pasteHover = true, highlight(true, $event, 'is-marked')"
              @mouseout="pasteHover = false, highlight(false, $event, 'is-marked')" />
          </div>
        </div>
        <div class="Field-label-history-icon" v-if="diffRemoved">
          <i class="fa fa-trash-o icon--sm icon-removed" />
        </div>
        <div class="Field-label-history-icon" v-if="diffAdded">
          <i class="fa fa-plus-circle icon--sm icon-added" />
        </div>
        <div class="Field-label uppercaseHeading" v-bind:class="{ 'is-locked': locked }">
          <span v-if="!isLocked && hasBackendValidationError">
            <i class="fa fa-warning fa-fw icon--warn icon--sm"
               tabindex="0"
               :aria-label="translatePhrase(backendValidationError.description)"
               v-tooltip.top="translatePhrase(backendValidationError.description)"
            />
          </span>
          <span v-show="fieldKey === '@id'">{{ capitalize(translatePhrase('ID')) }}</span>
          <span v-show="fieldKey === '@type'">{{ capitalize(translatePhrase(entityTypeArchLabel)) }}</span>
          <span
            v-show="fieldKey !== '@id' && fieldKey !== '@type' && !diff"
            :title="fieldKey"
            @click="onLabelClick">
            {{ capitalize(labelByLang((fieldRdfType || overrideLabel || fieldKey))) }}
          </span>
          <span
            class="Field-navigateHistory"
            v-show="fieldKey !== '@id' && fieldKey !== '@type' && diff"
            @click="onLabelClick"
            v-tooltip.top="{ content: translatePhrase('Show latest change'), delay: { show: 300, hide: 0 } }">
            {{ capitalize(labelByLang((fieldRdfType || overrideLabel || fieldKey))) }}
          </span>
          <div class="Field-reverse uppercaseHeading--secondary" v-if="isReverseProperty && !isLocked">
            <span :title="fieldKey">{{ capitalize(translatePhrase('Incoming links')) }}</span>
            <div class="Field-comment">
              <i class="fa fa-question-circle-o icon icon--sm" />
              <span class="Field-commentText">{{ translatePhrase('Non editable incoming link') }}.
                <br />
                <a href="https://libris.kb.se/katalogisering/help/entity-search" target="_blank">{{ translatePhrase('Read more about incoming links') }}.</a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <code class="path-code" v-show="user.settings.appTech && !isInner">{{path}}</code>
    </div>
    <div class="Field-label uppercaseHeading" v-if="isInner" v-bind:class="{ 'is-locked': locked }">
      <span v-if="!isLocked && hasBackendValidationError">
        <i class="fa fa-warning fa-fw icon--warn icon--sm"
           tabindex="0"
           :aria-label="translatePhrase(backendValidationError.description)"
           v-tooltip.top="translatePhrase(backendValidationError.description)"
        />
      </span>
      <span v-show="fieldKey === '@id'">{{ capitalize(translatePhrase('ID')) }}</span>
      <span v-show="fieldKey === '@type'">{{ capitalize(translatePhrase(entityTypeArchLabel)) }}</span>
      <span v-show="fieldKey !== '@id' && fieldKey !== '@type' && !diff" :title="fieldKey" @click="onLabelClick">{{ capitalize(labelByLang(fieldKey)) }}</span>
      <span
        class="Field-navigateHistory"
        v-show="fieldKey !== '@id' && fieldKey !== '@type' && diff"
        @click="onLabelClick"
        v-tooltip.top="{ content: translatePhrase('Show latest change'), delay: { show: 300, hide: 0 } }">
        {{ capitalize(labelByLang(fieldKey)) }}
      </span>
      <!-- Is inner -->
      <div class="Field-actions is-nested">
        <div class="Field-action Field-comment" v-if="propertyComment && !locked">
          <i class="fa fa-question-circle fa-fw icon icon--sm" />
          <span class="Field-commentText">{{ propertyComment }}</span>
        </div>
        <entity-adder
          class="Field-action Field-entityAdder"
          v-if="!locked && (isRepeatable || isEmptyObject || isLangMap)"
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
          :active="activeModal"
          :is-placeholder="true"
          :is-language="this.isLangMap || this.isLangTaggable"
          @addEmptyLanguageItem="addEmpty()"
          :value-list="valueAsArray"
          :bulk-context="bulkContext"
        />

        <div
          class="Field-action Field-remove"
          v-show="!locked && isRemovable"
          :class="{ disabled: activeModal }">
          <i
            class="fa fa-trash-o fa-fw action-button icon icon--sm"
            tabindex="0"
            role="button"
            :aria-label="translatePhrase('Remove')"
            v-on:click="removeThis(true)"
            v-tooltip.top="translatePhrase('Remove')"
            @keyup.enter="removeThis(true)"
            @focus="removeHover = true, highlight(true, $event, 'is-removeable')"
            @blur="removeHover = false, highlight(false, $event, 'is-removeable')"
            @mouseover="removeHover = true, highlight(true, $event, 'is-removeable')"
            @mouseout="removeHover = false, highlight(false, $event, 'is-removeable')" />
        </div>

        <div class="Field-action" v-if="isProtected && !unlockedByUser && !isLocked">
          <i class="fa fa-lock fa-fw icon icon--sm"
             tabindex="0"
             role="button"
             :aria-label="translatePhrase('Edit locked property')"
             v-on:click="openUnlockModal()"
             v-tooltip.top="translatePhrase('Edit locked property')"
             @keyup.enter="openUnlockModal()"
            />
        </div>
        <div class="Field-action" v-if="isProtected && unlockedByUser && !isLocked">
          <i class="fa fa-unlock-alt fa-fw icon icon--sm"
             tabindex="0"
          />
        </div>

        <div
          class="Field-action Field-clipboardPaster"
          v-if="!locked && (isRepeatable || isEmptyObject) && clipboardHasValidObject"
          ref="clipboardPaster">
          <i
            tabindex="0"
            class="fa fa-paste fa-fw action-button icon icon--sm"
            role="button"
            :aria-label="translatePhrase('Paste entity')"
            @click="pasteClipboardItem"
            @keyup.enter="pasteClipboardItem"
            v-tooltip.top="translatePhrase('Paste entity')"
            @focus="pasteHover = true, highlight(true, $event, 'is-marked')"
            @blur="pasteHover = false, highlight(false, $event, 'is-marked')"
            @mouseover="pasteHover = true, highlight(true, $event, 'is-marked')"
            @mouseout="pasteHover = false, highlight(false, $event, 'is-marked')" />
        </div>
      </div>
      <div class="Field-history-icon" v-if="diffRemoved">
        <i class="fa fa-trash-o icon--sm icon-removed" />
      </div>
      <div class="Field-history-icon" v-if="diffAdded">
        <i class="fa fa-plus-circle icon--sm icon-added" />
      </div>
    </div>

    <pre class="path-code" v-show="user.settings.appTech && isInner">{{path}}</pre>

    <div
      class="Field-content FieldContent"
      :class="{ 'is-locked': locked }"
      v-if="fieldKey === '@type'">
      <div
        class="Field-contentItem"
        v-for="(item, index) in valueAsArray"
        :key="index"
        v-bind:class="{ 'is-entityContent': getDatatype(item) == 'entity' }">
        <item-type
          :is-locked="locked"
          :container-accepted-types="parentAcceptedTypes"
          :field-key="fieldKey"
          :field-value="item"
          :entity-type="entityType"
          :parent-path="path"/>
        <div class="Field-matchSubClasses" v-if="this.parentPath === 'mainEntity'
        && isBulkChangeMatchForm && !isAnyType">
        <span class="Field-matchSubClassesLabel">
          {{ translatePhrase('Match subtypes') }}
        </span>
          <span>
            <input
              type="checkbox"
              class="customCheckbox-input"
              :disabled="isLocked"
              :checked="matchSubTypes"
              @change="toggleMatchSubtypes"/>
            <span class="customCheckbox-icon"/>
          </span>
        </div>
      </div>
    </div>

    <div
      class="Field-content FieldContent"
      v-bind:class="{ 'is-locked': locked }"
      v-if="fieldKey !== '@type' && isObjectArray">
      <div class="Field-contentItem">

        <item-bylang
          v-if="getDatatype(firstInValueAsArray) == 'language'"
          :is-locked="locked"
          :is-first-field="isFirstField"
          :field-value="valueAsArray"
          :field-key="fieldKey"
          :parent-path="path"
          :diff="diff"
          :is-expanded="isExpanded" />
      </div>
      <div
        class="Field-contentItem"
        v-for="(item, index) in valueAsArray"
        :key="index"
        v-bind:class="{
          'is-entityContent': getDatatype(item) == 'entity' && !isCard,
          'is-new': newDiffValues.indexOf(item) > -1,
        }">

        <item-error
          v-if="getDatatype(item) == 'error'"
          :field-key="fieldKey"
          :parent-path="path"
          :index="index"
          :diff="diff"
          :item="item" />

        <id-list v-if="getDatatype(item) == 'idList'"
          :show-remove-button="isBulkChangeMatchForm && !isLocked"
          :id-list-link="item[HAS_ID_KEY()][VALUE_FROM_KEY()]['@id']"
          @remove-id-list="removeThis"
        />

        <item-grouped
          v-if="getDatatype(item) == 'grouped'"
          :field-key="fieldKey"
          :is-card="isCard"
          :entity-type="entityType"
          :parent-path="path"
          :index="index"
          :diff="diff"
          :item="item" />

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
          :diff="diff"
          :parent-path="path" />

        <!-- Other linked entities -->
        <item-entity
          v-if="getDatatype(item) == 'entity'"
          :is-locked="locked"
          :is-card="isCard"
          :is-expanded="isCard"
          :exclude-properties="isReverseProperty ? [reverseProperty] : []"
          :item="item"
          :field-key="fieldKey"
          :index="index"
          :diff="diff"
          :parent-path="path"
          :show-enriched="showEnriched"
        />

        <!-- Not linked, local child objects OR inlined linked objects-->
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
          :diff="diff"
          :should-expand="expandChildren || enrichedChildren"
          :bulk-context="bulkContext"
          :show-enriched="showEnriched"
        />
      </div>
      <portal-target :name="`typeSelect-${path}`" />
    </div>

    <div
      class="Field-content is-endOfTree js-endOfTree"
      v-bind:class="{ 'is-locked': locked }"
      v-if="fieldKey !== '@type' && !isObjectArray"
    >
      <div class="Field-contentItem">
        <item-bylang
          v-if="getDatatype(firstInValueAsArray) == 'language'"
          :is-locked="locked"
          :is-first-field="isFirstField"
          :field-value="valueAsArray"
          :field-key="fieldKey"
          :parent-path="path"
          :diff="diff"
          :is-expanded="isExpanded" />
      </div>

      <div
        class="Field-contentItem"
        v-for="(item, index) in valueAsArray"
        :key="index">

        <!-- Other linked resources -->
        <item-vocab
          v-if="getDatatype(item) == 'vocab'"
          :as-dropdown="fieldKey !== 'encodingLevel'"
          :is-locked="locked"
          :field-key="fieldKey"
          :field-value="item"
          :entity-type="entityType"
          :index="index"
          :diff="diff"
          :parent-path="path" />

        <!-- Boolean value -->
        <item-boolean
          v-if="getDatatype(item) == 'boolean'"
          :is-locked="locked"
          :field-key="fieldKey"
          :field-value="item"
          :entity-type="entityType"
          :index="index"
          :diff="diff"
          :parent-path="path" />

        <!-- Numeric value -->
        <item-numeric
          v-if="getDatatype(item) == 'numeric'"
          :is-locked="locked"
          :field-key="fieldKey"
          :field-value="item"
          :entity-type="entityType"
          :index="index"
          :diff="diff"
          :parent-path="path"
          :range="range" />

        <!-- Not linked, local child strings -->
        <item-value
          v-if="getDatatype(item) == 'value'"
          :is-removable="!hasSingleValue"
          :is-locked="locked"
          :is-uri-type="isUriType"
          :field-value="item"
          :field-key="fieldKey"
          :index="index"
          :parent-path="path"
          :diff="diff"
          :is-expanded="isExpanded" />

        <!-- shelfControlNumber -->
        <item-shelf-control-number
          v-if="getDatatype(item) == 'shelfControlNumber'"
          :is-locked="locked"
          :field-value="item"
          :field-key="fieldKey"
          :index="index"
          :diff="diff"
          :parent-path="path"
          :is-expanded="isExpanded" />

      </div>
      <portal-target :name="`typeSelect-${path}`" />
    </div>
    <modal-component
      :title="translatePhrase(this.getModalTitle())"
      modal-type="warning"
      class="ChangeTypeWarningModal"
      :width="'570px'"
      @close="closeUnlockModal()"
      v-if="unlockModalOpen"
    >
      <template #modal-body>
        <div class="ChangeTypeWarningModal-body">
          <p>
            {{translatePhrase(this.getModalInfoText())}}
          </p>

          <div class="ChangeTypeWarningModal-buttonContainer">
            <button class="btn btn-hollow btn--auto btn--md" @click="closeUnlockModal()">
              {{ translatePhrase('Cancel') }}
            </button>

            <button class="btn btn-warning btn--md" ref="unlockButton" @click="unlockEdit()">
              <i class="icon icon--white fa fa-unlock-alt" />
              {{ translatePhrase('Unlock') }}
            </button>
          </div>
        </div>
      </template>
    </modal-component>
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
    background-color: @form-mark;
  }

  &.is-removeable {
    background-color: @form-remove;
  }

  &.is-lastAdded {
    background-color: @form-add;
  }

  &.has-no-diff {
    opacity: 0.4;
  }

  &.is-diff {
    background-color: transparent;
  }

  &.is-new {
    @base-color: @brand-success;
    border: 1px solid;
    border-color: @base-color;
    background-color: hsl(hue(@base-color), 50%, 95%);
  }

  &.is-diff-added {
    @base-color: @form-add;
    border: 1px solid;
    border-color: @brand-primary;
    background-color: @base-color;
  }

  &.is-diff-removed {
    @base-color: @remove;
    border: 1px dashed;
    border-color: @base-color;
    background-color: @form-remove;
  }

  &.is-diff-modified {
    @base-color: @brand-primary-orange;
    border: 1px dashed;
    border-color: @base-color;
    background-color: @form-modified;
  }

  .icon-removed {
    transform: translateY(-5%);
    color: @remove;
  }

  .icon-added {
    position: relative;
    color: #428BCAFF; // @brand-primary base.
  }

  &.is-highlighted { // replace 'is-lastadded' & 'is-marked' with this class
    background-color: @form-highlight;
  }

  &.is-grouped {
    border-width: 0;
  }

  @media (min-width: 768px) {
    display: flex;
  }

  &--inner {
    border: 1px solid transparent;
    flex: 1 100%;
    margin: 0;
    margin-top: -2px;
    padding: 5px 0 5px 0;
    border-radius: 4px;
    overflow: visible;
    display: block;

    .icon-hover();

    &.is-locked:not(.is-new),
    .Field--inner & {
      box-shadow: none;
    }

    &.is-marked {
      background-color: @form-mark;
    }

    &.is-removeable {
      background-color: @form-remove;
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

  &-enrichmentButtonContainer {
    display: flex;
    flex-basis: 7%;
    padding: 0.75em 1em 0.25em 1em;
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

    .Field.is-grouped & {
      padding: 0.75em 0 0.25em 0;
      max-width: none;
      flex-basis: 1.5rem;
    }

    .icon-hover();

    pre {
      margin-top: 5px;
      max-width: 260px;
    }
  }

  &-labelWrapper {
    position: static;
    top: 55px;
    display: flex;
    justify-content: flex-end;
    flex-direction: row-reverse;
    min-height: 30px;

    &:hover {
      z-index: 1;
    }

    @media (min-width: @screen-sm) {
      flex-direction: row;
    }

    &.sticky {
      position: sticky;
    }

    @media (min-width: @screen-md) {
      top: 75px;
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

    .Field.is-grouped & {
      text-align: left;
    }

    &:before {
      .Field--inner & {
        content: " ● ";
        color: @field-path;
        color: @field-path-alt;
        position: absolute;
        left: 0px;
        top: 0px;
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
    border: 1px solid @grey-lighter;
    border-radius: 4px;
    box-shadow: @shadow-panel;
    z-index: 1;

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
    margin: 0;
    padding: 0.25em 1em;
    max-width: 100%;

    .Field--inner & {
      border: 0;
      padding: 0 0 0 10px;
      width: auto;
    }

    @media (min-width: 768px) {
      flex: 1 auto;
      width: 0;
      border-left: 1px solid;
      border-color: @form-border;
      border-color: @form-border-alt;
    }

    @media print and (max-width: 768px) {
      padding-top: 0;
    }

    .Field.is-grouped & {
      border-width: 0;
    }
  }

  &-contentItem {
    display: flex;
    flex: 1;
    max-width: 100%;

    &.is-new {
      @base-color: @brand-success;
      border: 1px solid;
      border-color: @base-color;
      background-color: hsl(hue(@base-color), 50%, 95%);
    }
    &.is-entityContent {
      display: inline-flex;
      &.is-new {
        padding: 0.25em;
        margin-right: 0.5em;
      }
    }
  }

  &-matchSubClasses {
    display: flex;
    font-size: 12px;
    align-items: center;
  }

  &-matchSubClassesLabel {
    margin-right: 4px;
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
  }

  &-reverse {
    .Field-comment {
      display: inline-block;
      min-height: 30px;
      width: auto;
      margin-right: 0;
    }
  }

  &-history-icon {
    padding: 0 10px;
    margin-left: auto;
    margin-right: 0;
    display: block;
  }

  &-label-history-icon {
    padding-right: 0.3em;
  }

  .path-code {
    display: inline-block;
    word-break: break-all;
    overflow: hidden;
    background-color: #f0f0f0;
    padding: 0;
    color: #4f4f4f;
  }

  &-navigateHistory {
    cursor: pointer;
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
