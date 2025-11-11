<script>
import {mapActions, mapGetters} from 'vuex';
import {cloneDeep, each, get, isEmpty, unset} from 'lodash-es';
import {asFnurgelLink, capitalize, labelByLang, translatePhrase} from '@/utils/filters';
import TabMenu from '@/components/shared/tab-menu.vue';
import EntitySummary from '@/components/shared/entity-summary.vue';
import EntityForm from "@/components/inspector/entity-form.vue";
import RecordPicker from '@/components/care/record-picker.vue';
import * as RecordUtil from "@/utils/record.js";
import * as StringUtil from "../../../../lxljs/string.js";
import * as LxlDataUtil from "../../../../lxljs/data.js";
import * as DataUtil from "@/utils/data.js";
import {getChangeList} from "@/utils/enrich.js";
import MergeToolbar from "@/components/inspector/merge-toolbar.vue";
import * as HttpUtil from "@/utils/http.js";
import {
  CHANGE_SPEC_KEY,
  DEPRECATE_KEY,
  KEEP_KEY,
  SHOULD_UPDATE_TIMESTAMP_KEY,
} from "@/utils/bulk.js";
import ModalComponent from '@/components/shared/modal-component.vue';
import * as VocabUtil from "../../../../lxljs/vocab.js";
import * as DisplayUtil from "../../../../lxljs/display.js";
import Spinner from "@/components/shared/spinner.vue";

export default {
  name: 'MergeEntities',
  props: {
    flagged: {
      type: Array
    },
    enrichStep: {
      type: Boolean,
      default: true,
    },
    editStep: {
      type: Boolean,
      default: false,
    },
    sourcePickerLabel: {
      type: String,
      default: '',
    },
    targetPickerLabel: {
      type: String,
      default: '',
    },
    sourceTopLabel: {
      type: String,
      default: '',
    },
    targetTopLabel: {
      type: String,
      default: '',
    },
    targetLocked: {
      type: Boolean,
      default: false,
    }
  },
  components: {
    Spinner,
    'merge-toolbar': MergeToolbar,
    'record-picker': RecordPicker,
    'entity-form': EntityForm,
    'tab-menu': TabMenu,
    'entity-summary': EntitySummary,
    'modal-component': ModalComponent,
  },
  data() {
    return {
      selected: [],
      formFocus: 'mainEntity',
      targetETag: null,
      targetId: null,
      sourceId: null,
      recordSuccessfullySaved: false,
      showConfirmMergeModal: false,
      numberOfReverseLinks: 0,
      loadingRecords: false,
    };
  },
  computed: {
    ...mapGetters([
      'directoryCare',
      'enrichment',
      'settings',
      'inspector',
      'user',
      'resources',
      'status',
      'templates'
    ]),
    bothRecordsLoaded() {
      return this.sourceLoaded && this.targetLoaded;
    },
    anyRecordSelected() {
      return !!(this.directoryCare.mergeSourceId || this.directoryCare.mergeTargetId);
    },
    bothRecordsSelected() {
      return !isEmpty(this.directoryCare.mergeSourceId) && !isEmpty(this.directoryCare.mergeTargetId);
    },
    mismatchingTypes() {
      if (this.bothRecordsLoaded) {
        const targetType = this.inspector.data.mainEntity['@type'];
        const sourceType = this.source.mainEntity['@type'];
        const matching = (
          VocabUtil.isSubClassOf(targetType, sourceType, this.resources.vocab, this.resources.context)
          || VocabUtil.isSubClassOf(sourceType, targetType, this.resources.vocab, this.resources.context)
        );
        return !matching;
      }
      return false;
    },
    isAllSelected() {
      if (this.sourceLoaded) {
      const noOfSelectable = Object.keys(this.sourceSelectable).length;
      if (this.formFocus === 'mainEntity') {
        return noOfSelectable === this.selectedForMainEntity.length;
      } else if (this.formFocus === 'record') {
        return noOfSelectable === this.selectedForRecord.length;
      } else {
        return false;
      }
      } else {
        return undefined;
      }
    },
    selectedForMainEntity() {
      return this.inspector.status.selected.filter(s => s.path.startsWith('mainEntity.'));
    },
    selectedForRecord() {
      return this.inspector.status.selected.filter(s => s.path.startsWith('record.'));
    },
    entityType() {
      return VocabUtil.getRecordType(
        this.source['mainEntity']['@type'],
        this.resources.vocab,
        this.resources.context,
      );
    },
    isNonInstanceType() {
      return this.entityType !== 'Instance';
    },
    recordType() {
      if (this.sourceLoaded) {
        return this.source['mainEntity']['@type'];
      } else {
        return undefined;
      }
    },
    formTabs() {
      return [
        { id: 'mainEntity', text: labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' },
      ];
    },
    sourceSelectable() {
      if (this.sourceLoaded) {
        return Object.fromEntries(Object.entries(this.source[this.formFocus]).filter(([k]) => !k.startsWith('@')));
      } else {
        return undefined;
      }
    },
    sourceLoaded() {
      return this.enrichment.data.source !== null;
    },
    targetLoaded() {
      return this.enrichment.data.target !== null;
    },
    source() {
      if (this.sourceLoaded) {
        return this.enrichment.data.source;
    } else {
        return undefined;
      }
    },
    target() {
      return this.inspector.data[this.formFocus];
    },
    sourceNumberOfHoldings() {
      if (this.source['mainEntity']['@reverse']) {
        return this.source['mainEntity']['@reverse'].itemOf.length || 0;
      }
      return 0;
    },
  },
  emits: ['cancel', 'mismatchingTypes'],
  methods: {
    translatePhrase,
    labelByLang,
    capitalize,
    ...mapActions([
      'setEnrichmentTarget',
      'setEnrichmentChanges',
      'setEnrichmentSource'
    ]),
    loadingContent(value) {
      this.loadingRecords = value;
    },
    removeEnrichedHighlight() {
      if (this.inspector.status.enriched.length) {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'enriched',
          value: [],
        });
      }
    },
    switchRecords() {
      const switchObj = {
        mergeSourceId: this.directoryCare.mergeTargetId,
        mergeTargetId: this.directoryCare.mergeSourceId
      };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...switchObj });
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'selected',
        value: [],
      });
    },
    resetCachedChanges() {
      this.setEnrichmentChanges(null);
    },
    setFocus(focus) {
      this.formFocus = focus;
    },
    selectAllForFocused() {
      let selected = this.inspector.status.selected.filter(s => !s.path.startsWith(this.formFocus));
      Object.keys(this.sourceSelectable).forEach(k => {
        selected = [...selected, {path: `${this.formFocus}.${k}`, value: {}}];
      })
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'selected',
        value: selected,
      });
      this.applyFromSource();
    },
    clearAllSelected() {
      if (!isEmpty(this.inspector.status.selected)) {
        this.setSelectedAndApply([])
      }
    },
    setSelectedAndApply(selectedToKeep) {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'selected',
        value: selectedToKeep,
      });
      this.applyFromSource();
    },
    clearSelectedForFocused() {
      let keep = [];
      if (this.formFocus === 'mainEntity') {
        keep = this.inspector.status.selected.filter(s => s.path.startsWith('record'))
      } else if (this.formFocus === 'record') {
        keep = this.inspector.status.selected.filter(s => s.path.startsWith('mainEntity.'))
      }
      this.setSelectedAndApply(keep);
    },
    toggleSelected() {
      if (this.isAllSelected) {
        this.clearSelectedForFocused();
      } else {
        this.selectAllForFocused();
      }
    },
    run() {
      this.openConfirmMergeModal();
    },
    openConfirmMergeModal() {
      this.showConfirmMergeModal = true;
    },
    closeConfirmMergeModal() {
      this.showConfirmMergeModal = false;
    },
    doMerge() {
      this.createMergeBulkChangeAndSave();
      this.showConfirmMergeModal = false;
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
      //TODO: remove source from flagged?
      //TODO: set bulkchange Status.Ready
    },
    getNumberOfReverseLinks() {
      const query = {
        _limit: 0,
        _sort: `_sortKeyByLang.${this.user.settings.language || 'sv'}`,
        o: this.directoryCare.mergeSourceId
      };

      HttpUtil.getRelatedRecords(query, this.settings.apiPath)
        .then((response) => {
          this.numberOfReverseLinks = response.totalItems;
        }, (error) => {
          console.log('Error checking for relations', error);
        });
      
      return 0;
    },
    fetchId(id, fetchingSource = false) {
      if (id !== null) {
        const fixedId = RecordUtil.extractFnurgel(id);
        const fetchUrl = `${this.settings.apiPath}/${fixedId}/data.jsonld`;
        fetch(fetchUrl).then((response) => {
          if (response.status === 200) {
            if (!fetchingSource) {
              this.targetETag = response.headers.get('ETag');
            }
            return response.json();
          } if (response.status === 404 || response.status === 410) {
            this.$store.dispatch('pushNotification', {
              type: 'danger',
              message: `${StringUtil.getUiPhraseByLang('The record was not found', this.user.settings.language, this.resources.i18n)}. ${response.status} ${response.statusText}`,
            });
          } else {
            this.$store.dispatch('pushNotification', {
              type: 'danger',
              message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}. ${response.status} ${response.statusText}`,
            });
          }
          return false;
        }, (error) => {
          this.$store.dispatch('pushNotification', {
            type: 'danger',
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}. ${error}`,
          });
        }).then((result) => {
          if (typeof result !== 'undefined') {
            const data = LxlDataUtil.splitJson(result);
            if (fetchingSource) {
              this.setEnrichmentSource(data);
              this.onFetchFinished();
            } else {
              this.$store.dispatch('setInspectorData', data);
              this.setEnrichmentTarget(data);
              this.removeEnrichedHighlight();
              this.$store.dispatch('setOriginalData', data);
              this.onFetchFinished(data);
            }
          }
        });
      } else {
        throw new Error('Failed to prepare data for detailed enrichment.');
      }
    },
    onFetchFinished(data) {
      DataUtil.fetchMissingLinkedToQuoted(data, this.$store);
      this.applyFromSource(); // To populate everything with no properties selected
      this.loadingContent(false);
      if (this.bothRecordsSelected) {
        this.$emit('mismatchingTypes', this.mismatchingTypes);
      }
    },
    applyFromSource() {
      if (this.bothRecordsLoaded) {
        const originalDataPreservedQuoted = {
          ...this.inspector.originalData,
          quoted: this.inspector.data.quoted
        };
        this.$store.dispatch('setInspectorData', originalDataPreservedQuoted);
        this.$store.dispatch('flushChangeHistory');
        this.removeEnrichedHighlight();
        let source = cloneDeep(this.enrichment.data.source);
        each(this.settings.keysToClear.duplication, (property) => {
          unset(source, property);
        });
        this.applyFieldsFromSource(source);
      }
    },
    applyFieldsFromSource(source) {
      const baseRecordData = cloneDeep(this.inspector.data);
      // This part checks if the template should include the work or not (to not overwrite a link)
      if (baseRecordData.mainEntity.hasOwnProperty('instanceOf')) {
        const baseRecordWork = baseRecordData.mainEntity.instanceOf;
        if (Object.keys(baseRecordWork).length === 1 && baseRecordWork.hasOwnProperty('@id')) {
          delete source.mainEntity.instanceOf;
        }
      }
      let changeList;
      if (!this.enrichment.data.changes) {
        changeList = [
          ...getChangeList(source, baseRecordData, ['mainEntity'], ['mainEntity'], this.resources.context),
          ...getChangeList(source, baseRecordData, ['record'], ['record'], this.resources.context)
        ];
        changeList.forEach((change) => {
          DataUtil.fetchMissingLinkedToQuoted(change.value, this.$store);
        });
        if (!isEmpty(changeList)) {
          this.setEnrichmentChanges(changeList)
        }
      } else {
        changeList = this.enrichment.data.changes;
      }

      const changesToBeApplied = changeList.filter(a =>
        this.inspector.status.selected.some(b => a.path.startsWith(b.path))
      );

      if (changesToBeApplied.length !== 0) {
        this.$store.dispatch('updateInspectorData', {
          changeList: changesToBeApplied,
          addToHistory: false,
        });
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'enriched',
          value: changesToBeApplied,
        })
      }
    },
    createMergeBulkChangeAndSave() {
      const mergeBulkChange = this.getMergeBulkChange();
      this.recordSuccessfullySaved = false;
      try {
        const target = DataUtil.getMergedItems(
          DataUtil.normalizeBeforeSave(cloneDeep(this.inspector.data.record)),
          DataUtil.normalizeBeforeSave(this.inspector.data.mainEntity),
          DataUtil.normalizeBeforeSave(this.inspector.data.work),
        );
        this.saveTargetRecord(target).then(() => {
            if (this.recordSuccessfullySaved) {
              this.saveNewBulkChange(mergeBulkChange);
              this.$router.push({path: asFnurgelLink(this.inspector.data.record['@id'])});
            }
            this.$store.dispatch('setInspectorStatusValue', {property: 'saving', value: false});
          }
        );
      } catch (e) {
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        const errorMessage = `${StringUtil.getUiPhraseByLang(e.message, this.user.settings.language, this.resources.i18n)}`;
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        return;
      }
    },
    getMergeBulkChange() {
      const mt = this.templates.combined.bulk.find(t => t['@id'] === 'merge');
      const mBulkChange = RecordUtil.prepareDuplicateFor(mt.value, this.user, []);
      const label = DisplayUtil.getItemLabel(
        this.inspector.data.mainEntity,
        this.resources,
        this.inspector.data.quoted,
        this.settings,
      );
      mBulkChange['@graph'][1]['label'] = `Slå ihop: ${label} ${this.getDateString()}`;
      mBulkChange['@graph'][1][CHANGE_SPEC_KEY][DEPRECATE_KEY] = { '@id' : this.directoryCare.mergeSourceId };
      mBulkChange['@graph'][1][CHANGE_SPEC_KEY][KEEP_KEY] = { '@id' : this.directoryCare.mergeTargetId };
      mBulkChange['@graph'][1][SHOULD_UPDATE_TIMESTAMP_KEY] = true;
      return mBulkChange;
    },
    getDateString() {
      const date = new Date();
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    },
    async saveNewBulkChange(obj) {
      try {
        this.createBulkChange(obj);
      } catch (error) {
        console.error(error);
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error}`,
        });
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
      }
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });
    },
    createBulkChange(obj) {
      this.doCreateBulkChange(HttpUtil.post, obj, { url: `${this.settings.apiPath}/data` });
    },
    doCreateBulkChange(requestMethod, obj, opts) {
      requestMethod({
        url: opts.url,
        ETag: opts.ETag,
        activeSigel: this.user.settings.activeSigel,
        token: this.user.token,
      }, obj).then(() => {
        console.log('Bulk change saved!')
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
      }, (error) => {
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        let errorMessage = '';
        switch (error.status) {
          case 412:
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource has been modified by another user', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            break;
          case 409:
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource already exists', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            break;
          case 401:
            localStorage.removeItem('lastPath');
            errorMessage = `${StringUtil.getUiPhraseByLang('Your login has expired', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger',
              message: `${errorBase}. ${errorMessage}.`,
              sticky: true,
              link: {
                to: this.$store.getters.oauth2Client.token.getUri(),
                title: `${StringUtil.getUiPhraseByLang('Log in', this.user.settings.language, this.resources.i18n)}`,
                newTab: true,
                external: true,
              } });
            break;
          default:
            console.error(error);
            errorMessage = `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.status}: ${StringUtil.getUiPhraseByLang(error.statusText, this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
        }
      });
    },
    async saveTargetRecord(obj) {
      try {
        await this.update(this.inspector.data.record['@id'], obj, this.targetETag);
      } catch (error) {
        console.error(error);
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error}`,
        });
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
      }
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });
    },
    update(url, obj, ETag) {
      return this.doSaveTarget(HttpUtil.put, obj, { url, ETag });
    },
    doSaveTarget(requestMethod, obj, opts) {
      return requestMethod({
        url: opts.url,
        ETag: opts.ETag,
        activeSigel: this.user.settings.activeSigel,
        token: this.user.token,
      }, obj).then(() => {
        const msgKey = 'was saved';
        const type = get(obj, ['@graph', 1, '@type'], '');

        setTimeout(() => {
          this.$store.dispatch('pushNotification', {
            type: 'success',
            message: `${labelByLang(type)} ${StringUtil.getUiPhraseByLang(msgKey, this.user.settings.language, this.resources.i18n)}!`,
          });
        }, 10);
        this.recordSuccessfullySaved = true;
        console.log('Saved record with id:', this.targetId);
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
      }, (error) => {
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        let errorMessage = '';
        switch (error.status) {
          case 412:
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource has been modified by another user', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            break;
          case 409:
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource already exists', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            break;
          case 401:
            localStorage.removeItem('lastPath');
            errorMessage = `${StringUtil.getUiPhraseByLang('Your login has expired', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger',
              message: `${errorBase}. ${errorMessage}.`,
              sticky: true,
              link: {
                to: this.$store.getters.oauth2Client.token.getUri(),
                title: `${StringUtil.getUiPhraseByLang('Log in', this.user.settings.language, this.resources.i18n)}`,
                newTab: true,
                external: true,
              } });
            break;
          default:
            console.error(error);
            errorMessage = `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.status}: ${StringUtil.getUiPhraseByLang(error.statusText, this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
        }
      });
    },

  },
  watch: {
    'directoryCare.mergeTargetId'(id) {
      if (id !== null) {
        this.clearAllSelected();
        this.resetCachedChanges();
        this.loadingContent(true);
        this.targetId = RecordUtil.extractFnurgel(id);
        this.fetchId(this.targetId);
      }
    },
    'directoryCare.mergeSourceId'(id) {
      if (id !== null) {
        this.getNumberOfReverseLinks();
        this.clearAllSelected();
        this.resetCachedChanges();
        this.loadingContent(true);
        this.sourceId = RecordUtil.extractFnurgel(id);
        this.fetchId(this.sourceId, true);
      }
    },
    'inspector.event'(val) {
      // Live update on field label click
      if (val.name === 'apply-source' && this.bothRecordsLoaded) {
        this.applyFromSource();
      }
    },
    editStep(val) {
      if (val) {
        this.$nextTick(() => {
          this.$store.dispatch('pushInspectorEvent', {
            name: 'form-control',
            value: 'collapse-item',
          })
        });
      }
    }
  },
  mounted() {
    this.resetCachedChanges();
    this.clearAllSelected();
  },

};
</script>

<template>
  <div class="MergeView">
    <div v-if="enrichStep">
      <div class="MergeView-mergeRow ">
        <record-picker
          name="mergeSourceId"
          opposite="mergeTargetId"
          :label="sourcePickerLabel"
          :top-label="sourceTopLabel"
          :flaggedInstances="flagged"
        >
        </record-picker>
        <div class="MergeView-separator" v-if="flagged.length > 0 && !targetLocked">
          <button
            class="btn btn-primary"
            @click="switchRecords"
            :disabled="!anyRecordSelected"
            :aria-label="translatePhrase('Switch place')">
            <i class="fa fa-fw fa-exchange" />
          </button>
        </div>
        <record-picker
          v-if="!targetLocked"
          name="mergeTargetId"
          opposite="mergeSourceId"
          :label="targetPickerLabel"
          :top-label="targetTopLabel"
          :flaggedInstances="flagged"
          :locked="targetLocked"
        />
        <record-picker
          v-if="targetLocked"
          name="mergeTargetId"
          opposite="mergeSourceId"
          :label="targetPickerLabel"
          :top-label="targetTopLabel"
          :flaggedInstances="[inspector.data.mainEntity]"
          :locked="targetLocked"
        />
      </div>
      <div>
        <div v-if="bothRecordsSelected" class="MergeView-recordsContainer"
             :class="{ 'is-empty': !bothRecordsSelected }">
          <div class="MergeView-descriptionContainer" v-if="!mismatchingTypes">
            <div class="iconCircle"><i class="fa fa-fw fa-hand-pointer-o"/></div>
            <div class="MergeView-description">
              {{ translatePhrase('Select parts of the left record which should be copied to the right one.') }}
            </div>
          </div>
          <div class="MergeView-descriptionContainer" v-if="mismatchingTypes && !loadingRecords">
            <div class="iconCircle"><i class="fa fa-fw fa-exclamation"/></div>
            <div class="MergeView-description">
              {{ translatePhrase('To be able to enrich, the selected entities need to be of the same type.') }}
            </div>
          </div>
          <div v-if="!this.loadingRecords && !mismatchingTypes">
          <div class="MergeView-fieldRow">
            <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus"/>
          </div>
          <div>
            <button
              class="btn btn--md btn-light"
              @click="toggleSelected">
              <i class="fa fa-fw fa-square-o" v-show="!isAllSelected"/>
              <i class="fa fa-fw fa-check-square-o" v-show="isAllSelected"/>
              {{ isAllSelected ? translatePhrase('Unmark all') : translatePhrase('Mark all') }}
            </button>
          </div>

          <div class="MergeView-mergeRow">
            <div class="entityForm">
              <entity-form v-if="bothRecordsLoaded"
                           :editing-object="formFocus"
                           :key="formFocus"
                           :is-active="true"
                           :form-data="source[this.formFocus]"
                           :locked="true"
                           :hide-top-level-properties="['@type']"
                           :hide-top-level-field-names="false"
                           :is-source="true"
              />
            </div>
            <div class="MergeView-entitySeparator"></div>
            <div class="entityForm">
              <entity-form v-if="bothRecordsLoaded"
                           :editing-object="formFocus"
                           :key="formFocus"
                           :is-active="true"
                           :form-data="target"
                           :locked="true"
                           :hide-top-level-properties="['@type']"
                           :hide-top-level-field-names="false"
              />
            </div>
          </div>
        </div>
          <div class="MergeView-spinner" v-if="loadingRecords">
            <Spinner size="2x" :message="translatePhrase('Loading')" />
          </div>
        </div>

    </div>
    </div>
    <div v-if="editStep">
    <div
      class="col-12 col-sm-12"
      :class="{ 'col-md-1 col-md-offset-11': !status.panelOpen, 'col-md-5 col-md-offset-7': status.panelOpen }">
      <div class="Toolbar-placeholder" ref="ToolbarPlaceholder" />
      <div class="Toolbar-container">
        <merge-toolbar
          @openConfirmMergeModal="openConfirmMergeModal"
          @cancel="this.$emit('cancel');"
        />
      </div>
    </div>
    <div class="col-sm-12" :class="{ 'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen }">
      <div class="MergeView-descriptionContainer withBottomPadding">
        <div class="iconCircle"><i class="fa fa-fw fa-pencil"/></div>
        <div class="MergeView-description">
          {{ translatePhrase('Add any final changes for the entity to keep.') }}
        </div>
      </div>
      <div>
        <entity-summary
          class="header"
          :focus-data="this.inspector.data.mainEntity"
          :should-link="false"
        />
      </div>
      <div class="MergeView-recordsContainer">
        <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus"/>
        <entity-form
          :editing-object="formFocus"
          :key="formFocus"
          :is-active="true"
          :form-data="target"
          :locked="false"
        />
      </div>
    </div>

    <modal-component
      :title="'Confirm run'"
      :width="'600px'"
      @close="closeConfirmMergeModal"
      v-if="showConfirmMergeModal">
      <template #modal-header>
        <div class="Modal-header">
          <header>
            {{ translatePhrase('Confirm merge') }}
          </header>
        </div>
      </template>
      <template #modal-body>
        <div class="Modal-body">
          <div>
            <div class="MergeView-modalText">
              <p>• {{ translatePhrase('Entity with ID') }} <strong> {{ sourceId }}</strong> {{ translatePhrase('will') }} <em>{{ translatePhrase('be removed') }}</em>. </p>
              <p>• {{ translatePhrase('Entity with ID') }} <strong> {{ targetId }}</strong> {{ translatePhrase('will') }} <em>{{ translatePhrase('be kept') }}</em> {{ translatePhrase('and will be saved with any changes that have been made.') }}</p>
              <p v-if="sourceNumberOfHoldings !== 0">• <strong>{{ sourceNumberOfHoldings }}</strong> {{ translatePhrase('holdings will be re-linked to') }} <strong>{{ targetId }}</strong>.</p>
              <p v-if="isNonInstanceType && numberOfReverseLinks !== 0">• <strong>{{ numberOfReverseLinks }}</strong> {{ translatePhrase('links will be pointed to') }} <strong>{{ targetId }}</strong>.</p>
            </div>
          </div>
          <div class="Modal-buttonContainer">
            <button class="btn btn-primary btn--md" @click="doMerge()">
              {{ translatePhrase('Continue') }}</button>
            <button class="btn btn-info btn--md" @click="closeConfirmMergeModal()">{{ translatePhrase('Cancel') }}</button>
          </div>
        </div>
      </template>
    </modal-component>
  </div>
  </div>
</template>

<style lang="less">

.MergeView {
  .header {
    border: 1px solid @grey-lighter;
    border-radius: 4px;
    background: @site-body-background
  }
  &-mergeRow {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media (max-width: @screen-sm) {
      flex-direction: column;
      align-items: center;
    }
  }

  &-separator {
    display: flex;
    align-items: baseline;
    margin: 80px 10px;
    justify-content: center;

    @media (max-width: @screen-sm) {
      margin: 10px;
    }
  }

  &-entitySeparator {
    margin: 0 1.8rem;
  }

  &-labelContainer {
    margin-bottom: 0.2rem;
    display: flex;
  }
  &-columnHeader {
    display: block;
  }

  &-recordsContainer {
    margin-top: 1em;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding: 2rem;
    margin-bottom: 1rem;
    &.is-empty {
      background-color: unset;
      border-color: transparent;
      height: 30vh;
    }
  }

  &-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 30vh;
  }

  &-summaryLabel {
    background-color: @grey-lighter;
    color: @grey-darker;
    padding: 0.15rem 0.5rem;
    font-size: 1.2rem;
    text-transform: uppercase;
    font-weight: 600;
    display: inline-block;
    border: 1px solid @grey-lighter;
  }
  &-summaryContainer {
    border: 1px solid @grey-lighter;
    background-color: @neutral-color;
  }

  &-fieldRow {
    width: 100%;
    display: flex;
    align-items: flex-start;
    .Field, .Field-content {
      border: 0;
    }
  }

  &-descriptionContainer {
    display: flex;
    align-items: center;
  }

  &-description {
    padding-left: 1rem;
  }

  .withBottomPadding {
    padding-bottom: 2rem;
  }

  .iconCircle {
    border: 1px solid @grey-lighter;
    border-radius: 1em;
    width: 2em;
    height: 2em;
    line-height: 2em;
    text-align: center;
    color: @brand-primary;
  }

  .entityForm {
    width: 100%;
  }

  &-sourceField {
    border: 1px solid @grey-lighter;
  }

  &-buttonContainer {
    padding: 0 1%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    .Field-action {
      background-color: @white;
      align-items: baseline;
      justify-content: center;
      display: flex;
      color: @brand-primary;
      i {
        color: @brand-primary;
      }
      font-weight: bold;
      font-size: 1.2rem;
      padding: 0.5rem;
      cursor: pointer;
      width: 100%;
      border: solid @grey-light;
      border-width: 1px;
      margin: -1px -4px 0px 0px;
    }
  }
}
.Modal {
  &-body {
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1em;
  }
  &-buttonContainerCol {
    display: grid;
    justify-content: center;

    margin: 10px 0;
    & > * {
      margin-right: 15px;
    }
  }

  &-buttonContainer {
    margin: 10px 0;
    & > * {
      margin-right: 15px;
    }
  }
}
</style>
