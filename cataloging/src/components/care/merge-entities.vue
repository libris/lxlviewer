<script>
import {mapActions, mapGetters} from 'vuex';
import {cloneDeep, each, get, isEmpty, unset} from 'lodash-es';
import {capitalize, labelByLang, translatePhrase} from '@/utils/filters';
import TabMenu from '@/components/shared/tab-menu.vue';
import EntitySummary from '@/components/shared/entity-summary.vue';
import EntityForm from "@/components/inspector/entity-form.vue";
import toolbar from "@/components/inspector/toolbar.vue";
import RecordPicker from '@/components/care/record-picker.vue';
import * as RecordUtil from "@/utils/record.js";
import * as StringUtil from "../../../../lxljs/string.js";
import * as LxlDataUtil from "../../../../lxljs/data.js";
import * as DataUtil from "@/utils/data.js";
import {getChangeList} from "@/utils/enrich.js";
import MergeToolbar from "@/components/inspector/merge-toolbar.vue";
import * as HttpUtil from "@/utils/http.js";

export default {
  name: 'MergeRecords',
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
    mergeStep: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'merge-toolbar': MergeToolbar,
    'record-picker': RecordPicker,
    EntityForm,
    'tab-menu': TabMenu,
    'entity-summary': EntitySummary,
  },
  data() {
    return {
      selected: [],
      formFocus: 'mainEntity',
      sourceLoaded: false,
      targetLoaded: false,
      targetETag: null,
      targetId: null
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
  },
  methods: {
    translatePhrase,
    labelByLang,
    capitalize,
    ...mapActions([
      'setEnrichmentResult',
      'setEnrichmentTarget',
      'setEnrichmentChanges',
      'setEnrichmentSource'
    ]),
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
      this.resetCachedChanges();
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'selected',
        value: [],
      });
    },
    resetCachedChanges() {
      this.setEnrichmentChanges(null);
    },
    close() {
      const mergeViewModal = this.inspector.status.mergeViewModal;
      mergeViewModal.open = false;
      this.resetCachedChanges();
      this.$store.dispatch('setInspectorStatusValue', { property: 'mergeViewModal', value: mergeViewModal });
    },
    cancel() {
      this.resetCachedChanges();
      this.close();
      this.$store.dispatch('setInspectorData', this.inspector.originalData);
      this.$store.dispatch('flushChangeHistory');
    },
    done() {
      this.resetCachedChanges();
      this.close();
    },
    setFocus(focus) {
      this.formFocus = focus;
    },
    selectAllForFocused() {
      let selected = this.inspector.status.selected;
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
    fetchId(id, fetchingSource=false) {
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
              DataUtil.fetchMissingLinkedToQuoted(data, this.$store);
              this.sourceLoaded = true;
              this.applyFromSource(); // To populate everything with nothing selected
              this.$store.dispatch('removeLoadingIndicator', 'Loading document');
            } else {
              this.$store.dispatch('setInspectorData', data);
              this.setEnrichmentTarget(data);
              this.removeEnrichedHighlight();
              this.$store.dispatch('setOriginalData', data);
              DataUtil.fetchMissingLinkedToQuoted(data, this.$store);
              this.targetLoaded = true;
              this.applyFromSource(); // To populate everything with nothing selected
              this.$store.dispatch('removeLoadingIndicator', 'Loading document');
            }
          }
        });
      } else {
        throw new Error('Failed to prepare data for detailed enrichment.');
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
        this.setEnrichmentChanges(changeList)
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
        });
      }
    },
    createMergeBulkChangeAndSave() {
      const mt = this.templates.combined.bulk.find(t => t['@id'] === 'merge');
      const mergeTemplate = RecordUtil.prepareDuplicateFor(mt.value, this.user, []);
      const label = 'ABC' + this.getDateString();
      mergeTemplate['@graph'][0]['label'] = label;
      let recordSuccessfullySaved = false;
      try {
        const target = DataUtil.getMergedItems(
          DataUtil.normalizeBeforeSave(cloneDeep(this.inspector.data.record)),
          DataUtil.normalizeBeforeSave(this.inspector.data.mainEntity),
          DataUtil.normalizeBeforeSave(this.inspector.data.work),
        );
        recordSuccessfullySaved = true;
        console.log('target', JSON.stringify(target));

      } catch (e) {
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        const errorMessage = `${StringUtil.getUiPhraseByLang(e.message, this.user.settings.language, this.resources.i18n)}`;
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        return;
      }

      if (recordSuccessfullySaved) {
        console.log('mergeTemplate', JSON.stringify(mergeTemplate));
        this.createBulkChange(mergeTemplate);
      }
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
        this.update(this.targetId, obj, this.targetETag);
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
      this.doSaveTarget(HttpUtil.put, obj, { url, ETag });
    },
    doSaveTarget(requestMethod, obj, opts) {
      requestMethod({
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

        console.log('Saved record with id:', this.targetId);
        this.$nextTick(() => {
          this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        });
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
        this.targetLoaded = false;
        this.$store.dispatch('pushLoadingIndicator', 'Loading document');
        this.targetId = RecordUtil.extractFnurgel(id);
        this.fetchId(this.targetId);
      }
    },
    'directoryCare.mergeSourceId'(id) {
      if (id !== null) {
        this.sourceLoaded = false;
        this.$store.dispatch('pushLoadingIndicator', 'Loading document');
        this.fetchId(RecordUtil.extractFnurgel(id), true);
      }
    },
    'inspector.event'(val) {
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
          });
        });
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.resetCachedChanges();
      this.clearAllSelected();
      this.sourceLoaded = false;
      this.targetLoaded = false;
    });
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
          label="entity to remove"
          top-label="Remove"
          :flaggedInstances="flagged"
          :expand="false">
        </record-picker>
        <div class="MergeView-separator" v-if="flagged.length > 0">
          <button
            class="btn btn-primary"
            @click="switchRecords"
            :disabled="!anyRecordSelected"
            :aria-label="translatePhrase('Switch place')">
            <i class="fa fa-fw fa-exchange" />
          </button>
        </div>
        <record-picker
          v-if="flagged.length > 0"
          name="mergeTargetId"
          opposite="mergeSourceId"
          label="entity to keep"
          top-label="Keep"
          :flaggedInstances="flagged" />
      </div>
      <div>
        <div v-if="bothRecordsSelected" class="MergeView-recordsContainer" :class="{ 'is-empty': !bothRecordsSelected }">
      <span class="iconCircle"><i class="fa fa-fw fa-hand-pointer-o"/></span>
      <span class="MergeView-description">
        {{translatePhrase('Select parts of the left record which should be copied to the right one.')}}
      </span>
      <div class="MergeView-fieldRow">
          <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus" />
      </div>
      <div>
        <button
          class="btn btn--md btn-light SelectAll-btn"
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
        <div class="MergeView-buttonContainer actionColumn">
        </div>
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
    </div>
    </div>

  <div v-if="editStep">
    <div
      ref="componentFocusTarget"
      class="toolbarColumn"
      :class="{ 'toolbarColumn': !status.panelOpen, 'col-md-5 col-md-offset-7': status.panelOpen }">
      <div class="Toolbar-placeholder" ref="ToolbarPlaceholder" />
      <div class="Toolbar-container">
        <merge-toolbar
          @createAndSave="createMergeBulkChangeAndSave"
        />
      </div>
      </div>
    <div class="inspectorColumn">
    <div class="MergeView-fieldRow ">
        <entity-summary
          class="header"
          :focus-data="this.inspector.data.mainEntity"
          :should-link="false"
          :exclude-components="[]" />
    </div>
      <div class="MergeView-recordsContainer">
        <div class="MergeView-fieldRow">
          <tab-menu @go="setFocus" :tabs="formTabs" :active="formFocus"/>
        </div>
        <div class="MergeView-fieldRow">
          <div class="entityForm">
            <entity-form
                :editing-object="formFocus"
                :key="formFocus"
                :is-active="true"
                :form-data="target"
                :locked="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
    <div v-if="mergeStep">
      <p>För instanser:
        * den här kommer tas bort
        * den här kommer behållas. Ev. ändringar kommer sparas.
        * Dessa 42 bestånd kommer länkas om till behåll.
      </p>
      <p>För koncept: den här kommer tas bort, den här kommer behållas + ändringar. All x Förekomster av * kommer länkas till.</p>
      <p>För verk: den här kommer tas bort, den här kommer behållas. All x Förekomster av * kommer länkas till.</p>
      <p>Ska det stå i en modal bara? När man klickar OK, kommer man till posten som behölls? Den modalen kan dyka upp när man
        trycker på slå-ihopknapp?
        Bulk-change:n kan sparas med ngt namn så den är sökbar för pros.
      </p>
    </div>
  </div>
</template>

<style lang="less">

@actionCol: 2%;
@actionColMd: 4%;
@actionColSm: 6%;
@actionColXs: 8%;

@sourceCol: 35%;
@sourceColMd: 34%;
@sourceColSm: 33%;
@sourceColXs: 32%;

@targetCol: 63%;
@targetColMd: 62%;
@targetColSm: 61%;
@targetColXs: 60%;

@toolbarCol: 20%;
@inspectorCol: 85%;

.MergeView {
  padding: 2rem 0;

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

  &-dialog {
    background-color: @neutral-color;
    margin: 0 -1em;
    padding: 1.5rem 2.5rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    border: solid @grey-light;
    border-width: 1px 0px 0px 0px;
    button {
      margin-left: 1rem;
    }
    &.is-floating {
      position: absolute;
      bottom: 0px;
      left: 0;
      right: 0;
      margin: 0;
    }
  }

  &-table {
    width: 100%;
    td {
      vertical-align: top;
    }
    .Field {
      border-width: 1px;
    }
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
    &.is-empty {
      background-color: unset;
      border-color: transparent;
      height: 30vh;
    }
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
  &-rowContainer {
    width: 100%;
  }
  &-row {
    width: 100%;
    margin-bottom: 1rem;
  }
  &-fieldRow {
    width: 100%;
    display: flex;
    align-items: flex-start;
    .Field, .Field-content {
      border: 0;
    }
  }
  &-description {
    padding-left: 0.5rem;
  }
  &-resultField {
    border: 1px solid @grey-lighter;
    &.is-diff {
      @base-color: @brand-accent3;
      border-color: @base-color;
      background-color: hsl(hue(@base-color), saturation(@base-color), lightness(@base-color)+51);
    }
    &.is-new {
      @base-color: @brand-success;
      border: 1px solid;
      border-color: @base-color;
      background-color: hsl(hue(@base-color), saturation(@base-color)-25, lightness(@base-color)+55);
    }
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
  .sourceColumn {
    width: @sourceColXs;
    @media (min-width: 900px) {
      width: @sourceColSm;
    }
    @media (min-width: 1200px) {
      width: @sourceColMd;
    }
    @media (min-width: 1500px) {
      width: @sourceCol;
    }
  }

  .resultColumn {
    width: @targetCol;
    @media (min-width: 900px) {
      width: @targetColSm;
    }
    @media (min-width: 1200px) {
      width: @targetColMd;
    }
    @media (min-width: 1500px) {
      width: @targetCol;
    }
  }

  .entityForm {
    width: 100%;
  }

  .actionColumn {
    width: @actionColXs;
    @media (min-width: 900px) {
      width: @actionColSm;
    }
    @media (min-width: 1200px) {
      width: @actionColMd;
    }
    @media (min-width: 1500px) {
      width: @actionCol;
    }
  }

  .toolbarColumn {
    margin-left: 87%;
    width: @toolbarCol;
  }

  .toolbarColumn {
    margin-left: 87%;
    width: @toolbarCol;
  }

  .inspectorColumn {
    width: @inspectorCol;
  }

  &-sourceField {
    border: 1px solid @grey-lighter;
  }

  &-sourceField, &-resultField, &-buttonContainer {
    &.non-existing {
      background-color: @grey-lightest;
    }
    min-height: 2em;
    display: flex;
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

</style>
