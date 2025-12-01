<script>
import {cloneDeep, each, get, unset, isEqual, isEmpty} from 'lodash-es';
import { mapGetters, mapActions } from 'vuex';
import * as LxlDataUtil from 'lxljs/data';
import * as StringUtil from 'lxljs/string';
import * as VocabUtil from 'lxljs/vocab';
import * as DisplayUtil from 'lxljs/display';
import * as DataUtil from '@/utils/data';
import * as HttpUtil from '@/utils/http';
import * as RecordUtil from '@/utils/record';
import { checkAutoShelfControlNumber } from '@/utils/shelfmark';
import { translatePhrase, labelByLang } from '@/utils/filters';
import EntityForm from '@/components/inspector/entity-form.vue';
import Toolbar from '@/components/inspector/toolbar.vue';
import DetailedEnrichment from '@/components/care/detailed-enrichment.vue';
import EntityChangelog from '@/components/inspector/entity-changelog.vue';
import EntityHeader from '@/components/inspector/entity-header.vue';
import Breadcrumb from '@/components/inspector/breadcrumb.vue';
import ModalComponent from '@/components/shared/modal-component.vue';
import MarcPreview from '@/components/inspector/marc-preview.vue';
import TabMenu from '@/components/shared/tab-menu.vue';
import ValidationSummary from '@/components/inspector/validation-summary.vue';
import FullscreenPanel from '@/components/shared/fullscreen-panel.vue';
import VersionHistory from '@/components/inspector/version-history.vue';
import { getChangeList } from "@/utils/enrich.js";
import EnrichWrapper from "@/components/care/enrich-wrapper.vue";

export default {
  name: 'Inspector',
  beforeRouteLeave(to, from, next) {
    if (from.meta && (from.params.fnurgel === to.params.fnurgel)) {
      // copy breadcrumbs from/to history view
      to.meta = { ...from.meta };
    }
    if (this.shouldWarnOnUnload()) {
      const confString = StringUtil.getUiPhraseByLang(
        'You have unsaved changes. Do you want to leave the page?',
        this.user.settings.language,
        this.resources.i18n,
      );
      const answer = window.confirm(confString); // eslint-disable-line no-alert
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  beforeRouteUpdate(to, from, next) {
    if (from.meta) {
      to.meta = { ...from.meta };
    }
    if (this.shouldWarnOnUnload()) {
      const confString = StringUtil.getUiPhraseByLang(
        'You have unsaved changes. Do you want to leave the page?',
        this.user.settings.language,
        this.resources.i18n,
      );
      const answer = window.confirm(confString); // eslint-disable-line no-alert
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },
  data() {
    return {
      documentId: null,
      documentETag: null,
      etagMap: {},
      inlinedIds: [],
      documentTitle: null,
      recordLoaded: false,
      modalOpen: false,
      removeInProgress: false,
      saveQueued: null,
      loadFailure: null,
      marcPreview: {
        data: null,
        active: false,
        error: null,
      },
      enrichFromIdModal: {
        open: false,
        inputValue: '',
        detailed: false,
      },
    };
  },
  emits: ['ready'],
  methods: {
    translatePhrase,
    labelByLang,
    ...mapActions([
      'setEnrichmentSource',
      'setEnrichmentTarget',
      'setEnrichmentChanges'
    ]),
    replaceData(data) {
      this.$store.dispatch('setInspectorData', data);
    },
    openDetailedEnrichmentModal() {
      const detailedEnrichmentModal = this.inspector.status.detailedEnrichmentModal;
      detailedEnrichmentModal.open = true;
      this.$store.dispatch('setInspectorStatusValue', { property: 'detailedEnrichmentModal', value: detailedEnrichmentModal });
    },
    closeDetailedEnrichmentModal() {
      const detailedEnrichmentModal = this.inspector.status.detailedEnrichmentModal;
      detailedEnrichmentModal.open = false;
      this.$store.dispatch('setInspectorStatusValue', { property: 'detailedEnrichmentModal', value: detailedEnrichmentModal });
    },
    closeEnrichFromSelectionModal() {
      const modal = this.inspector.status.enrichFromSelection;
      modal.open = false;
      this.$store.dispatch('setInspectorData', this.inspector.originalData);
      this.$store.dispatch('flushChangeHistory');
      this.setEnrichmentChanges(null);
      this.$store.dispatch('setInspectorStatusValue', { property: 'enrichFromSelection', value: modal });
    },
    applyOverride(data) {
      this.$store.dispatch('setInspectorData', data);
      this.$store.dispatch('pushNotification', {
        type: 'success',
        message: `${StringUtil.getUiPhraseByLang('Form updated, don\'t forget to save', this.user.settings.language, this.resources.i18n)}`,
      });
    },
    shouldWarnOnUnload() {
      return (
        (this.$route.name === 'Inspector' || this.$route.name === 'NewDocument')
        && this.inspector.status.editing
        && this.unsavedChanges
        && !this.inspector.status.saving
      );
    },
    initializeWarnBeforeUnload() {
      window.addEventListener('beforeunload', (e) => {
        if (this.shouldWarnOnUnload()) {
          const confirmationMessage = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to leave the page?', this.user.settings.language, this.resources.i18n);
          (e || window.event).returnValue = confirmationMessage; // Gecko + IE
          return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
        }
        return undefined;
      });
    },
    initJsonOutput() {
      window.getJsonOutput = () => {
        const obj = this.getPackagedItem();
        console.log('%c ------------ JSON START --------------- ', 'background: #009788; color: #fff;');
        console.log(JSON.stringify(obj));
        console.log('%c ------------- JSON END ---------------- ', 'background: #009788; color: #fff;', new Date());
      };
      return true;
    },
    initToolbarFloat() {
      const toolbarPlaceholderEl = this.$refs.ToolbarPlaceholder;
      const toolbarTestEl = this.$refs.ToolbarTest;
      const width = typeof toolbarPlaceholderEl !== 'undefined' ? toolbarPlaceholderEl.clientWidth : 65;
      if (typeof toolbarTestEl !== 'undefined') {
        toolbarTestEl.style.width = `${width}px`;
      }
    },
    toggleEnrichFromIdModal(open = true, detailed = false) {
      if (open) {
        this.enrichFromIdModal.inputValue = '';
        this.enrichFromIdModal.open = true;
        this.enrichFromIdModal.detailed = detailed;
        this.$nextTick(() => {
          this.$refs.EnrichFromIdModalInput.focus();
        });
      } else {
        this.enrichFromIdModal.open = false;
      }
    },
    openMarcPreview() {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'form-control',
        value: 'close-modals',
      })
        .then(() => {
          this.marcPreview.active = true;
          RecordUtil.convertToMarc(this.inspector.data, this.settings, this.user).then((result) => {
            this.marcPreview.data = result;
          }, (error) => {
            this.marcPreview.data = null;
            this.marcPreview.error = error;
          });
        });
    },
    fetchDocument() {
      const fetchUrl = `${this.settings.apiPath}/${this.documentId}/data.jsonld`;

      fetch(fetchUrl).then((response) => {
        if (response.status === 200) {
          this.documentETag = response.headers.get('ETag');
          return response.json();
        } if (response.status === 404 || response.status === 410) {
          this.loadFailure = {
            status: response.status,
          };
          this.$store.dispatch('removeLoadingIndicator', 'Loading document');
        } else {
          this.$store.dispatch('pushNotification', {
            type: 'danger',
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}. ${response.status} ${response.statusText}`,
          });
          this.$store.dispatch('removeLoadingIndicator', 'Loading document');
        }
        return null;
      }, (error) => {
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)}. ${error}`,
        });
      }).then((result) => {
        if (typeof result !== 'undefined') {
          const splitFetched = LxlDataUtil.splitJson(result);

          this.inlinedIds = RecordUtil.getLinkedIdsToBeInlined(splitFetched, this.resources);
          if (this.inlinedIds.length > 0) {
            HttpUtil.fetchPlainEtags(this.inlinedIds).then((etagMap) => {
              console.log('Inlined document etags:', etagMap);
              this.etagMap = etagMap;
            });

            RecordUtil.moveFromQuotedToMain(splitFetched, this.inlinedIds, this.resources);
          }

          this.$store.dispatch('setInspectorData', splitFetched);
          this.onRecordLoaded();
        }
      });
    },
    initializeRecord() {
      this.documentETag = null; // Reset this
      this.etagMap = {};
      this.inlinedIds = [];
      this.marcPreview.active = false;
      this.$store.dispatch('pushLoadingIndicator', 'Loading document');
      this.recordLoaded = false;
      this.$store.dispatch('flushChangeHistory');
      this.$store.dispatch('flushExtractItemsOnSave');
      this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: 'mainEntity' });

      if (this.$route.name === 'Inspector' || this.$route.name === 'DocumentHistory') {
        console.log('Initializing view for existing document');
        this.documentId = this.$route.params.fnurgel;
        this.loadDocument();
      } else {
        console.log('Initializing view for new document');
        this.loadNewDocument();
      }
    },
    confirmApplyRecordAsTemplate(detailed = false) {
      this.enrichFromIdModal.open = false;
      const id = this.enrichFromIdModal.inputValue;
      if (detailed) {
        this.prepareDetailedEnrichment(id);
      } else if (id.length > 0) {
        this.applyRecordAsTemplate(id, this.enrichFromIdModal.detailed);
      }
    },
    openEnrichFromSelectionModal() {
      this.setEnrichmentTarget(this.inspector.data);
      const enrichFromSelection = this.inspector.status.enrichFromSelection;
      enrichFromSelection.open = true;
      this.$store.dispatch('setInspectorStatusValue', { property: 'enrichFromSelection', value: enrichFromSelection });
    },
    prepareDetailedEnrichment(id = null) {
      if (id !== null) {
        const fixedId = RecordUtil.extractFnurgel(id);
        const fetchUrl = `${this.settings.apiPath}/${fixedId}/data.jsonld`;
        fetch(fetchUrl).then((response) => {
          if (response.status === 200) {
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
            const source = LxlDataUtil.splitJson(result);
            this.applyAsDetailedEnrichment(source);
          }
        });
      } else {
        throw new Error('Failed to prepare data for detailed enrichment.');
      }
    },
    applyAsDetailedEnrichment(data) {
      this.setEnrichmentTarget(this.inspector.data);
      this.setEnrichmentSource(data);
      this.openDetailedEnrichmentModal();
    },
    applyRecordAsTemplate(id) {
      const fixedId = RecordUtil.extractFnurgel(id);
      const fetchUrl = `${this.settings.apiPath}/${fixedId}/data.jsonld`;
      fetch(fetchUrl).then((response) => {
        if (response.status === 200) {
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
          const splitFetched = LxlDataUtil.splitJson(result);
          const templateJson = RecordUtil.prepareDuplicateFor(splitFetched, this.user, this.settings.keysToClear.duplication);
          const template = LxlDataUtil.splitJson(templateJson);
          this.applyFieldsFromTemplate(template);
        }
      });
    },
    applyFieldsFromTemplate(template) {
      const baseRecordType = this.inspector.data.mainEntity['@type'];
      const tempRecordType = template.mainEntity['@type'];
      const matching = (
        VocabUtil.isSubClassOf(tempRecordType, baseRecordType, this.resources.vocab, this.resources.context)
        || VocabUtil.isSubClassOf(baseRecordType, tempRecordType, this.resources.vocab, this.resources.context)
      );
      if (matching === false) {
        const baseRecordLabel = StringUtil.getLabelByLang(baseRecordType, this.user.settings.language, this.resources);
        const tempRecordLabel = StringUtil.getLabelByLang(tempRecordType, this.user.settings.language, this.resources);
        const errorBase = `${StringUtil.getUiPhraseByLang('The types do not match', this.user.settings.language, this.resources.i18n)}`;
        const errorMessage = `"${tempRecordLabel}" ${StringUtil.getUiPhraseByLang('is not compatible with', this.user.settings.language, this.resources.i18n)} "${baseRecordLabel}"`;
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}! ${errorMessage}` });
        return;
      }

      const baseRecordData = cloneDeep(this.inspector.data);

      // This part checks if the template should include the work or not (to not overwrite a link)
      if (baseRecordData.mainEntity.hasOwnProperty('instanceOf')) {
        const baseRecordWork = baseRecordData.mainEntity.instanceOf;
        if (Object.keys(baseRecordWork).length === 1 && baseRecordWork.hasOwnProperty('@id')) {
          delete template.mainEntity.instanceOf;
        }
      }
      let changeList;
      if (!this.enrichment.data.changes) {
        changeList = [
          ...getChangeList(template, baseRecordData, ['mainEntity'], ['mainEntity'], this.resources.context),
          ...getChangeList(template, baseRecordData, ['record'], ['record'], this.resources.context)
        ];
        changeList.forEach((change) => {
          DataUtil.fetchMissingLinkedToQuoted(change.value, this.$store);
        });
      } else {
        changeList = this.enrichment.data.changes;
      }

      if (changeList.length !== 0) {
        this.$store.dispatch('updateInspectorData', {
          changeList: changeList,
          addToHistory: false,
        });
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'enriched',
          value: changeList,
        });
        this.$store.dispatch('pushNotification', {
          type: 'success',
          message: `${changeList.length} ${StringUtil.getUiPhraseByLang('field(s) added from template', this.user.settings.language, this.resources.i18n)}`,
        });
        } else {
          this.$store.dispatch('pushNotification', {
            type: 'info',
            message: `${StringUtil.getUiPhraseByLang('The record already contains these fields', this.user.settings.language, this.resources.i18n)}`,
          });
        }
      },
    openRemoveModal() {
      this.removeInProgress = true;
    },
    closeRemoveModal() {
      this.removeInProgress = false;
    },
    doRemoveRecord() {
      this.closeRemoveModal();
      const url = `${this.settings.apiPath}/${this.documentId}`;
      HttpUtil._delete({ url, activeSigel: this.user.settings.activeSigel, token: this.user.token }).then(() => {
        this.$store.dispatch('pushNotification', {
          type: 'success',
          message: `${labelByLang(this.recordType)} ${StringUtil.getUiPhraseByLang('was deleted', this.user.settings.language, this.resources.i18n)}!`,
        });

        // Wait so that the change is available in the index when the search hitlist is loaded
        setTimeout(() => {
          this.$router.go(-1);
        }, 1100);

      }, (error) => {
        if (error.status === 403) {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Forbidden', this.user.settings.language, this.resources.i18n)} - ${StringUtil.getUiPhraseByLang('This entity may have active links', this.user.settings.language, this.resources.i18n)} - ${error.statusText}` });
        } else {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.statusText}` });
        }
      });
    },
    doRemoveOtherRecord(fnurgel, type) {
      const url = `${this.settings.apiPath}/${fnurgel}`;
      HttpUtil._delete({ url, activeSigel: this.user.settings.activeSigel, token: this.user.token }).then(() => {
        this.$store.dispatch('pushNotification', {
          type: 'success',
          message: `${labelByLang(type)} ${translatePhrase('was deleted')}!`,
        });
      }, (error) => {
        if (error.status === 403) {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${translatePhrase('Forbidden')} - ${translatePhrase('This entity may have active links')} - ${error.statusText}` });
        } else {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${translatePhrase('Something went wrong')} - ${error.statusText}` });
        }
      });
    },
    removeOtherRecords() {
      this.inspector.otherRecordsToDeleteOnSave.forEach((r) => {
        this.doRemoveOtherRecord(RecordUtil.extractFnurgel(r.id), r.type);
      });
    },
    loadDocument() {
      this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: false });

      this.stopEditing();
      this.fetchDocument();
    },
    loadNewDocument() {
      const insertData = this.inspector.insertData;
      this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: true });

      if (!insertData.hasOwnProperty('@graph') || insertData['@graph'].length === 0) {
        this.$store.dispatch('removeLoadingIndicator', 'Loading document');
        this.$router.go(-1);
        console.warn('New document called without input data, routing user back.');
      } else {
        this.$store.dispatch('setInspectorData', LxlDataUtil.splitJson(insertData));
        this.startEditing();
        this.onRecordLoaded();
        DataUtil.fetchMissingLinkedToQuoted(insertData, this.$store);
      }
    },
    onRecordLoaded() {
      this.$store.dispatch('setInsertData', '');
      this.$store.dispatch('flushChangeHistory');
      this.$store.dispatch('saveLangTagSearch', '');
      this.$store.dispatch('removeLoadingIndicator', 'Loading document');
      this.removeEnrichedHighlight();

      this.recordLoaded = true;

      this.$nextTick(() => {
        this.$store.dispatch('pushInspectorEvent', {
          name: 'record-events',
          value: 'on-record-loaded',
        });
      });
    },
    checkForAutomaticFixes() {
      // If this is a holding, add the heldBy property
      if (this.inspector.data.mainEntity['@type'] === 'Item') {
        this.checkForMissingHeldBy();
      }
      // If this is a *new* work, add an empty cataloguersNote property to the record
      if (this.recordType === 'Work' && this.inspector.data.record.recordStatus === 'marc:New') {
        this.addCataloguersNote();
      }
    },
    checkForMissingHeldBy() {
      const mainEntity = this.inspector.data.mainEntity;
      if (
        mainEntity.hasOwnProperty('heldBy') === false
        && mainEntity.hasOwnProperty('hasComponent') === true
        && mainEntity.hasComponent.length !== 0
        && mainEntity.hasComponent[0].hasOwnProperty('heldBy') === true
      ) {
        window.lxlWarning(`🚑 Found holding without heldBy property. Adding heldBy found in hasComponent (${this.user.settings.activeSigel}).`);
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'lastAdded',
          value: 'mainEntity.heldBy',
        });
        this.$store.dispatch('updateInspectorData', {
          changeList: [{
            path: 'mainEntity.heldBy',
            value: mainEntity.hasComponent[0].heldBy,
          }],
          addToHistory: false,
        });
      }
    },
    addCataloguersNote() {
      const record = this.inspector.data.record;
      if (record.hasOwnProperty('cataloguersNote') === false) {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'lastAdded',
          value: 'record.cataloguersNote',
        });
        this.$store.dispatch('updateInspectorData', {
          changeList: [{
            path: 'record.cataloguersNote',
            value: [''],
          }],
          addToHistory: false,
        });
      }
    },
    startEditing() {
      this.$store.dispatch('setOriginalData', this.inspector.data);
      this.loadingEdit = true;
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: true,
      });
      this.checkForAutomaticFixes();
    },
    stopEditing() {
      // THIS IS NOT THE SAME AS THE "CANCEL"-EVENT
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: false,
      });
    },
    doCancel() {
      this.stopEditing();
      // Restore record
      this.$store.dispatch('setInspectorData', this.inspector.originalData);
      this.$store.dispatch('flushChangeHistory');
      this.clearBackendValidationErrors();
      this.removeEnrichedHighlight();
    },
    cancelEditing(callback) {
      if (this.inspector.status.editing) {
        if (!this.inspector.status.isNew) {
          if (this.shouldWarnOnUnload()) {
            const confString = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to cancel?', this.user.settings.language, this.resources.i18n);
            const answer = window.confirm(confString); // eslint-disable-line no-alert
            if (answer) {
              this.doCancel();
              if (callback) {
                callback();
              }
            }
          } else {
            this.doCancel();
            if (callback) {
              callback();
            }
          }
        } else {
          this.$router.go(-1);
        }
      } else {
        callback();
      }
    },
    setTitle() {
      if (typeof this.inspector.data.mainEntity !== 'undefined') {
        const headerList = DisplayUtil.getItemSummary(
          this.inspector.data.mainEntity,
          this.resources,
          this.inspector.data.quoted,
          this.settings,
          this.resources.displayGroups,
        ).header;
        const header = StringUtil.getFormattedEntries(
          headerList,
          this.resources.vocab,
          this.user.settings.language,
          this.resources.context,
        ).join(', ');
        if (header.length > 0 && header !== '{Unknown}') {
          const title = header;
          this.$store.dispatch('setInspectorTitle', title);
          this.documentTitle = title;
        }
      }
    },
    setEditorFocus(value) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: value });
      this.$store.dispatch('pushInspectorEvent', { name: 'form-control', value: 'focus-changed' });
    },
    downloadJson() {
      const focusId = this.inspector.data.record['@id'];
      const element = document.createElement('a');
      const json = JSON.stringify(this.getPackagedItem(true), null, 2); // 2 = json-spacing
      const blob = new Blob([`${json}`], { type: 'application/ld+json' });
      const splitIdParts = focusId.split('/');
      const id = splitIdParts[splitIdParts.length - 1];
      const promptInstruction = StringUtil.getUiPhraseByLang('Name your file', this.user.settings.language, this.resources.i18n);
      const promptedName = prompt(promptInstruction, id);
      if (promptedName !== null) {
        if (this.downloadIsSupported) {
          element.href = window.URL.createObjectURL(blob);
          element.download = `${promptedName}.jsonld`;
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } else {
          window.navigator.msSaveOrOpenBlob(blob, `${promptedName}.jsonld`);
        }
      }
    },
    getPackagedItem(keepEmpty = false) {
      const recordCopy = cloneDeep(this.inspector.data.record);
      let obj = null;

      if (keepEmpty) {
        obj = DataUtil.getMergedItems(
          recordCopy,
          this.inspector.data.mainEntity,
          this.inspector.data.work,
        );
      } else {
        obj = DataUtil.getMergedItems(
          DataUtil.normalizeBeforeSave(recordCopy),
          DataUtil.normalizeBeforeSave(this.inspector.data.mainEntity),
          DataUtil.normalizeBeforeSave(this.inspector.data.work),
        );
      }
      if (this.user.uriMinter && VocabUtil.isSubClassOf(this.inspector.data.mainEntity['@type'], 'Concept', this.resources.vocab, this.resources.context)) {
        this.user.uriMinter.assignUri(obj, { '@id': this.user.getActiveLibraryUri() });
      }

      return obj;
    },
    duplicateItem() {
      if (!this.status.inEdit && !this.isItem) {
        this.$store.dispatch('pushLoadingIndicator', 'Preparing copy');
        const duplicate = RecordUtil.prepareDuplicateFor(this.inspector.data, this.user, this.settings.keysToClear.duplication);
        this.$store.dispatch('setInsertData', duplicate);
        setTimeout(() => {
          this.$store.dispatch('removeLoadingIndicator', 'Preparing copy');
          this.$router.push({ path: '/new' });
        }, 0);
      }
    },
    createDigitalReproduction() {
      this.$store.dispatch('pushLoadingIndicator', 'Preparing reproduction');
      const repro = RecordUtil.getDigitalReproductionObject(this.inspector.data, this.resources, this.settings);
      const cleanedRepro = RecordUtil.prepareDuplicateFor(repro, this.user, []);
      this.$store.dispatch('setInsertData', cleanedRepro);
      setTimeout(() => {
        this.$store.dispatch('removeLoadingIndicator', 'Preparing reproduction');
        this.$router.push({ path: '/new' });
      }, 0);
    },
    async saveRecord(done = false) {
      try {
        await this.saveExtracted();
        this.saveQueued = () => this.saveItem(done);
      } catch (error) {
        console.error(error);
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error}`,
        });
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
      }
    },
    async saveExtracted() {
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });
      for await (const path of this.inspector.extractItemsOnSave) {
        const cleanedExtractedData = RecordUtil.getCleanedExtractedData(get(this.inspector.data, path), this.inspector.data, this.resources, this.settings);
        const extractedRecord = RecordUtil.getObjectAsRecord(cleanedExtractedData, {
          descriptionCreator: { '@id': this.user.getActiveLibraryUri() },
          ...((this.inspector.data.record['@id'] !== 'https://id.kb.se/TEMPID') && {
            derivedFrom: { '@id': this.inspector.data.record['@id'] },
          }),
        });
        const response = await this.preSaveHook(extractedRecord).then((r) => HttpUtil.post({
          url: `${this.settings.apiPath}/data`,
          token: this.user.token,
          activeSigel: this.user.settings.activeSigel,
        }, r));
        const postUrl = `${response.getResponseHeader('Location')}`;
        const savedExtractedRecord = await HttpUtil.get({ url: `${postUrl}/data.jsonld`, contentType: 'text/plain' });
        const savedExtractedMainEntity = LxlDataUtil.splitJson({
          '@graph': savedExtractedRecord['@graph'],
        }).mainEntity;
        this.$store.dispatch('addToQuoted', savedExtractedMainEntity);
        this.$store.dispatch('updateInspectorData', {
          changeList: [
            {
              path,
              value: { '@id': savedExtractedMainEntity['@id'] },
            },
          ],
          addToHistory: false,
        });
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'lastAdded',
          value: `${path}.{"@id":"${savedExtractedMainEntity['@id']}"}`,
        });
      }
      this.$store.dispatch('flushExtractItemsOnSave');
    },
    saveItem(done = false) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });

      const RecordId = this.inspector.data.record['@id'];
      let obj = null;
      try {
        obj = this.getPackagedItem();
      } catch (e) {
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        const errorMessage = `${StringUtil.getUiPhraseByLang(e.message, this.user.settings.language, this.resources.i18n)}`;
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        return;
      }

      const ETag = this.documentETag;

      if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
        this.doCreate(obj, done);
      } else { // ID exists -> update
        console.log('ETag ', ETag);
        this.doUpdate(RecordId, obj, ETag, done);
      }
      this.removeEnrichedHighlight();
    },
    doUpdate(url, obj, ETag, done) {
      this.doSaveRequest(HttpUtil.put, obj, { url, ETag }, done);
    },
    doCreate(obj, done) {
      this.doSaveRequest(HttpUtil.post, obj, { url: `${this.settings.apiPath}/data` }, done);
    },
    doSaveRequest(requestMethod, obj, opts, done) {
      this.preSaveHook(obj).then((obj2) =>
        requestMethod({
          url: opts.url,
          ETag: opts.ETag,
          activeSigel: this.user.settings.activeSigel,
          token: this.user.token,
        }, obj2)
      ).then((result) => {
        // eslint-disable-next-line no-nested-ternary
        const msgKey = this.isCxzMessage
          ? 'was sent'
          : (!this.documentId ? 'was created' : 'was saved');

        const type = get(obj, ['@graph', 1, '@type'], '');

        setTimeout(() => {
          this.$store.dispatch('pushNotification', {
            type: 'success',
            message: `${labelByLang(type)} ${StringUtil.getUiPhraseByLang(msgKey, this.user.settings.language, this.resources.i18n)}!`,
          });
        }, 10);

        if (!this.documentId) {
          const location = `${result.getResponseHeader('Location')}`;
          const locationParts = location.split('/');
          const fnurgel = locationParts[locationParts.length - 1];
          this.warnOnSave();
          this.$router.push({ path: `/${fnurgel}` });
        } else {
          this.fetchDocument();
          this.warnOnSave();
          this.removeOtherRecords();
          this.clearBackendValidationErrors();
          if (done) {
            this.stopEditing();
          } else {
            this.$store.dispatch('setOriginalData', LxlDataUtil.splitJson(obj));
          }
        }

        this.$nextTick(() => {
          this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
          this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: false });
        });
      }, (error) => {
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        let errorMessage = '';
        switch (error.status) {
          case 412:
            // eslint-disable-next-line vue/max-len
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource has been modified by another user', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            break;
          case 409:
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource already exists', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            break;
          case 400:
            { let errorJson = null;
            const responseHeader = error.getResponseHeader('Content-Type');
            if (responseHeader && responseHeader.indexOf('application/json') !== -1) {
              try {
                errorJson = JSON.parse(error.responseText);
              } catch (e) {
                console.error('Failed to parse with Content-Type application/json as JSON', e, error);
              }
            }
            if (errorJson && errorJson['message'] === 'Invalid JSON-LD' && errorJson['errors']) {
              errorMessage = `${StringUtil.getUiPhraseByLang('The record contains invalid data', this.user.settings.language, this.resources.i18n)}`;
              this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
              this.$store.dispatch('setBackendValidationErrors', errorJson['errors']);
              this.$store.dispatch('pushInspectorEvent', { name: 'form-control', value: 'expand-item' });
            } else {
              // eslint-disable-next-line vue/max-len
              errorMessage = `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.status}: ${StringUtil.getUiPhraseByLang(error.statusText, this.user.settings.language, this.resources.i18n)}`;
              this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
            }
            break; }
          case 401:
            localStorage.removeItem('lastPath');
            errorMessage = `${StringUtil.getUiPhraseByLang('Your login has expired', this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', {
              type: 'danger',
              message: `${errorBase}. ${errorMessage}.`,
              sticky: true,
              link: {
                to: this.$store.getters.oauth2Client.token.getUri(),
                title: `${StringUtil.getUiPhraseByLang('Log in', this.user.settings.language, this.resources.i18n)}`,
                newTab: true,
                external: true,
              }
            });
            break;
          default:
            console.error(error);
            // eslint-disable-next-line vue/max-len
            errorMessage = `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.status}: ${StringUtil.getUiPhraseByLang(error.statusText, this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
        }
      });
    },
    warnOnSave() {
      const warnArr = Object.keys(this.settings.warnOnSave);

      for (const element of warnArr) {
        const keys = element.split(".");
        const value = get(this.inspector.data, element);

        const warning = this.settings.warnOnSave[element].some((el) => el === value) || isEqual(this.settings.warnOnSave[element], value);

        if (warning) {
          const localizedValue =
            typeof value === "string"
              ? value
              : value?.label ||
                value?.name ||
                value?.[this.user.settings.language] ||
                String(value);

        const showMessage = (value) => {

          const alert = `${StringUtil.getUiPhraseByLang("Attention", this.user.settings.language, this.resources.i18n)}! `
          let message = ''

          if (isEmpty(value)) {
            message = `${StringUtil.getUiPhraseByLang("The property", this.user.settings.language, this.resources.i18n)}
                        '${StringUtil.getLabelByLang(keys[keys.length - 1], this.user.settings.language, this.resources)}'
                          ${StringUtil.getUiPhraseByLang("is empty", this.user.settings.language, this.resources.i18n)}!`
          } else {
            message = `${StringUtil.getLabelByLang(keys[keys.length - 1], this.user.settings.language, this.resources)}:
                        ${StringUtil.getLabelByLang(localizedValue, this.user.settings.language, this.resources)}`
          }

          return alert + message 
        };

          this.$store.dispatch("pushNotification", {
            type: "warning",
            message: showMessage(value)
          });

          return; 
        }
      }
    },
    removeEnrichedHighlight() {
      if (this.inspector.status.enriched.length) {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'enriched',
          value: [],
        });
      }
    },
    async preSaveHook(obj) {
      await checkAutoShelfControlNumber(obj, this.settings, this.user, this.resources);
      await this.saveInlined(obj);

      return obj;
    },
    async saveInlined(obj) {
      if (this.inlinedIds.includes(obj['@graph'][1]['@id'])) {
        // we only handle one level of inlined docs so far
        return;
      }

      const inlined = RecordUtil.extractInlinedData(obj['@graph'][1], this.inlinedIds, this.resources);
      await Promise.all(Object.keys(inlined)
        .map((id) => HttpUtil.getDocument(id, undefined, false)
          .then((r) => {
            if (!r.data) {
              // TODO Fix HttpUtil.getDocument so that it errors instead
              const e = new Error(`Could not fetch document ${id}`);
              e.statusText = 'Try again';
              throw e;
            }
            if (r.ETag !== this.etagMap[id]) {
              const msg = 'The resource has been modified by another user';
              const e = new Error(`${msg} ${id}`);
              // FIXME smuggling the fnurgel inside status
              e.status = RecordUtil.extractFnurgel(id);
              e.statusText = msg;
              throw e;
            }
            r.data['@graph'][1] = inlined[id];
            return this.preSaveHook(r.data);
          })
          .then((data) => HttpUtil.put({
            url: id,
            ETag: this.etagMap[id],
            activeSigel: this.user.settings.activeSigel,
            token: this.user.token,
          }, data))));
    },
    clearBackendValidationErrors() {
      this.$store.dispatch('setBackendValidationErrors', []);
    }
  },
  watch: {
    'inspector.data'(val, oldVal) {
      if (val !== oldVal) {
        this.setTitle();
        this.$store.dispatch('setInspectorStatusValue', { property: 'updating', value: false });
      }
    },
    '$route.params.fnurgel'(val, oldVal) {
      if (val && val !== oldVal) {
        this.documentId = val;
        this.initializeRecord();
      }
    },
    'recordLoaded'(val) {
      if (val === true) {
        // do something
      }
    },
    'inspector.event'(val) {
      if (val.name === 'record-control') {
        switch (val.value) {
          case 'cancel':
            this.cancelEditing(val.callback);
            break;
          case 'start-edit':
            this.startEditing();
            break;
          case 'create-digital-reproduction':
            this.createDigitalReproduction();
            break;
          case 'download-json':
            this.downloadJson();
            break;
          case 'remove-record':
            this.openRemoveModal();
            break;
          case 'save-record':
            this.saveRecord();
            break;
          case 'save-record-done':
            this.saveRecord(true);
            break;
          case 'open-marc-preview':
            this.openMarcPreview();
            break;
          default:
        }
      } else if (val.name === 'form-control') {
        switch (val.value) {
          case 'duplicate-item':
            this.duplicateItem();
            break;
          default:
            break;
        }
      } else if (val.name === 'apply-template') {
        this.applyFieldsFromTemplate(val.value);
      } else if (val.name === 'open-enrich-from-id') {
        this.toggleEnrichFromIdModal(true);
      } else if (val.name === 'open-detailed-enrich-from-id') {
        this.toggleEnrichFromIdModal(true, true);
      } else if (val.name === 'open-enrich-from-selection') {
        this.openEnrichFromSelectionModal()
      } else if (val.name === 'replace-data') {
        this.replaceData(val.value);
      } else if (val.name === 'apply-override') {
        this.applyOverride(val.value);
      }
    },
    isReadyForSave(val) {
      if (val) {
        this.saveQueued();
        this.saveQueued = null;
      }
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
      'userFlagged',
      'userBookmarks',
      'enrichment',
    ]),
    isDocumentAvailable() {
      return this.inspector.data.hasOwnProperty('record');
    },
    isReadyForSave() {
      if (this.saveQueued && this.inspector.status.readyForSave) {
        return true;
      }
      return false;
    },
    unsavedChanges() {
      if (this.$route.name === 'NewDocument') {
        return true;
      } if (this.$route.name === 'Inspector') {
        const original = JSON.stringify(this.inspector.originalData);
        const current = JSON.stringify(this.inspector.data);
        return original !== current;
      }
      return false;
    },
    isItem() {
      if (this.inspector.data.hasOwnProperty('mainEntity')) {
        return this.inspector.data.mainEntity['@type'] === 'Item';
      }
      return false;
    },
    isCxzMessage() {
      if (this.inspector.data.hasOwnProperty('mainEntity')) {
        const type = this.inspector.data.mainEntity['@type'];
        return type === 'InquiryAction' || type === 'ChangeNotice';
      }
      return false;
    },
    downloadIsSupported() {
      const a = document.createElement('a');
      return typeof a.download !== 'undefined';
    },
    recordType() {
      if (this.inspector.data.hasOwnProperty('mainEntity')) {
        return VocabUtil.getRecordType(
          this.inspector.data.mainEntity['@type'],
          this.resources.vocab,
          this.resources.context,
        );
      }
      return null;
    },
    editorTabs() {
      return [{ id: 'mainEntity', text: labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' }];
    },
  },
  components: {
    EnrichWrapper,
    'entity-header': EntityHeader,
    'entity-form': EntityForm,
    'modal-component': ModalComponent,
    toolbar: Toolbar,
    'entity-changelog': EntityChangelog,
    breadcrumb: Breadcrumb,
    DetailedEnrichment,
    'marc-preview': MarcPreview,
    'tab-menu': TabMenu,
    'validation-summary': ValidationSummary,
    'fullscreen-panel': FullscreenPanel,
    'version-history': VersionHistory,
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.recordLoaded) {
        this.initializeRecord();
        this.$emit('ready');
      }

      this.initializeWarnBeforeUnload();
      this.initJsonOutput();
    });
  },
};
</script>

<template>
  <div class="Inspector row">
    <div
      v-if="recordLoaded"
      class="col-sm-12"
      :class="{ 'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen, hideOnPrint: marcPreview.active }">
      <breadcrumb v-if="$route.meta.breadcrumb" class="Inspector-breadcrumb" />
    </div>

    <div
      ref="componentFocusTarget"
      class="col-12 col-sm-12"
      :class="{ 'col-md-1 col-md-offset-11': !status.panelOpen, 'col-md-5 col-md-offset-7': status.panelOpen }">
      <div v-if="recordLoaded && isDocumentAvailable" class="Toolbar-placeholder" ref="ToolbarPlaceholder" />
      <div v-if="recordLoaded && isDocumentAvailable" class="Toolbar-container" ref="ToolbarTest">
        <toolbar />
      </div>
    </div>

    <div class="col-sm-12" :class="{ 'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen, hideOnPrint: marcPreview.active }" ref="Inspector">
      <div v-if="!recordLoaded && loadFailure">
        <h2>{{loadFailure.status}}</h2>
        <p v-if="loadFailure.status === 404">
          {{ translatePhrase('The resource') }} <code>{{documentId}}</code> {{ translatePhrase('could not be found') }}.
        </p>
        <p v-if="loadFailure.status === 410">
          {{ translatePhrase('The resource') }} <code>{{documentId}}</code> {{ translatePhrase('has been removed')}}.
        </p>
        <router-link to="/">
          {{ translatePhrase('Back to home page') }}
        </router-link>
      </div>

      <div v-if="recordLoaded && isDocumentAvailable == false">
        <h2>{{ translatePhrase('Something went wrong') }}</h2>
        <p>{{ translatePhrase('The document was found but failed to load') }}.</p>
        <router-link to="/">
          {{ translatePhrase('Back to home page') }}
        </router-link>
      </div>

      <div v-if="recordLoaded && isDocumentAvailable" class="Inspector-entity">
        <div class="Inspector-admin">
          <div class="Inspector-header">
            <h1>
              <span class="type" :title="recordType">{{ labelByLang(recordType) }}</span>
              <span class="badge badge-accent2" v-if="inspector.status.isNew">{{ translatePhrase("New record") }}</span>
            </h1>
          </div>
          <entity-changelog v-if="inspector.status.isNew === false" />
        </div>
        <entity-header
          id="main-header"
          :full="true"
          :focus-data="inspector.data.mainEntity"
          :record-data="inspector.data.record"
        />
        <validation-summary v-if="user.settings.appTech" />
        <tab-menu @go="setEditorFocus" :tabs="editorTabs" :active="this.inspector.status.focus" />
        <entity-form
          v-for="tab in editorTabs"
          :editing-object="tab.id"
          :key="tab.id"
          :is-active="inspector.status.focus === tab.id"
          :form-data="inspector.data[tab.id]"
          :locked="!inspector.status.editing" />
      </div>
    </div>

    <portal to="sidebar" v-if="marcPreview.active">
      <marc-preview @hide="marcPreview.active = false" :error="marcPreview.error" :marc-obj="marcPreview.data" v-if="marcPreview.active" />
    </portal>

    <modal-component
      title="Error"
      modal-type="danger"
      @close="closeRemoveModal"
      class="RemoveRecordModal"
      v-if="removeInProgress">
      <template #modal-header>
        <div class="RemoveRecordModal-header">
          <header>
            {{ translatePhrase('Remove') }} {{ labelByLang(this.recordType) }}?
          </header>
        </div>
      </template>
      <template #modal-body>
        <div class="RemoveRecordModal-body">
          <p>
            {{ translatePhrase('This operation can\'t be reverted') }}
          </p>
          <div class="RemoveRecordModal-buttonContainer">
            <button class="btn btn-danger btn--md" @click="doRemoveRecord()">
              {{ translatePhrase('Remove') }} {{ labelByLang(this.recordType).toLowerCase() }}</button>
            <button class="btn btn-info btn--md" @click="closeRemoveModal()">{{ translatePhrase('Cancel') }}</button>
          </div>
        </div>
      </template>
    </modal-component>

    <modal-component
      class="EnrichFromIdModal"
      :title="[enrichFromIdModal.detailed ? 'Detailed enrichment' : 'Enrich from ID']"
      v-if="enrichFromIdModal.open"
      @close="enrichFromIdModal.open = false">
      <template #modal-body>
        <div class="EnrichFromIdModal-body">
          <div class="EnrichFromIdModal-infoText" v-if="enrichFromIdModal.detailed === true">
            <p>Med funktionen <em>Detaljerad berikning</em> kan du handplocka egenskaper från en post till en annan.</p>
            <p>För att göra detta behöver du tillgång till den berikande postens ID (URI), vilken du hittar i postens sammanfattning. Du kan också länka till posten genom att kopiera adressfältet i din webbläsare.</p>
            <p>
              Du kan välja mellan att <strong>utöka</strong> (<i class="fa text-success fa-plus" />) eller <strong>ersätta</strong> (<i class="fa text-accent3 fa-arrow-right" />) en egenskap.
              Att <strong>utöka</strong> innebär att information läggs till i den berikade posten.
              <strong>Ersätta</strong> resulterar i att den berikande posten skriver över egenskaper.
            </p>
          </div>
          <div class="EnrichFromIdModal-infoText" v-if="enrichFromIdModal.detailed === false">
            Med funktionen <em>Berika från ID</em> kan du berika en post med egenskaper från en annan. För att göra detta behöver du tillgång till den berikande postens ID (URI), vilken du hittar i postens sammanfattning. Du kan också länka till posten genom att kopiera adressfältet i din webbläsare.
          </div>
          <div class="input-group EnrichFromIdModal-form">
            <label class="input-group-addon EnrichFromIdModal-label" for="id">{{ translatePhrase('ID') }}/{{ translatePhrase('Link') }}</label>
            <input
              name="id"
              class="EnrichFromIdModal-input form-control"
              ref="EnrichFromIdModalInput"
              v-model="enrichFromIdModal.inputValue"
              @keyup.enter="confirmApplyRecordAsTemplate(enrichFromIdModal.detailed)" />
            <span class="input-group-btn">
              <button
                class="btn btn-primary btn--md EnrichFromIdModal-confirmButton"
                @click="confirmApplyRecordAsTemplate(enrichFromIdModal.detailed)"
                @keyup.enter="confirmApplyRecordAsTemplate(enrichFromIdModal.detailed)">{{ translatePhrase('Continue') }}</button>
            </span>
          </div>
        </div>
      </template>
    </modal-component>

    <modal-component class="DetailedEnrichmentModal" :title="translatePhrase('Detailed enrichment')" v-if="inspector.status.detailedEnrichmentModal.open === true" @close="closeDetailedEnrichmentModal" :backdrop-close="false">
      <template #modal-body>
        <DetailedEnrichment :floating-dialogs="true" />
      </template>
    </modal-component>

    <modal-component class="EnrichFromSelectionModal"
                     :title="translatePhrase('Enrich from selection')"
                     v-if="inspector.status.enrichFromSelection.open === true"
                     @close="closeEnrichFromSelectionModal"
                     :backdrop-close="false">
      <template #modal-body>
        <enrich-wrapper></enrich-wrapper>
      </template>
    </modal-component>

    <fullscreen-panel v-if="$route.params.view == 'history'">
      <template #content>
        <version-history />
      </template>
    </fullscreen-panel>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

.Inspector {
  padding: 4rem 0;

  &-spinner {
    margin-top: 2em;
  }

  &-admin {
    margin-bottom: 0.5em;
  }

  &-breadcrumb {
    border-bottom:  1px solid @grey-lighter;
    padding-bottom: 10px;
  }

  &-header {
    margin-bottom: 0.25em;
    h1 {
      margin: 0;
    }
    .type {
      font-size: 3rem;
      text-transform: uppercase;
    }
  }

  &-actions {
    display: flex;
    height: fit-content;

    @media (max-width: @screen-sm) {
      flex-direction: row-reverse;
      justify-content: flex-end;
    }
  }

  &-reverse {
  }

  &-code {
    padding: 10px 20px;
    background-color: @white;
    border: 1px solid @grey-lighter;
  }

  &.hideOnPrint {
    @media print {
      display: none;
    }
  }
}

.InspectorModal {
  &-body {
    display: flex;
    flex-direction: column;
  }
  &-filter {
    background-color: #ccc;
    width: 100%;
  }
  &-searchList {
    height: 100%;
    overflow-y: scroll;
  }
}

.TagContainer {
  height: fit-content;
  align-self: flex-end;
  margin-bottom: 10px;
  margin-right: 0.25em;
}

.EnrichFromIdModal {
  .ModalComponent-container {
    width: 650px;
    top: 40%;
  }
  &-body {
    padding: 1em;
    width: 100%;
  }
  &-form {

  }
  &-label {
    color: @black;
  }
  &-infoText {
    margin-bottom: 1em;
  }
  &-input {
    width: 50%;
    color: @black;
  }
  &-reference {
    margin-top: 1em;
    border: 1px solid @grey;
    border-radius: 0.5em;
    padding: 1em;
  }
  &-referenceTitle {
    display: block;
    font-weight: bold;
  }
  &-confirmButton {
    box-shadow: none;
  }
}

.RemoveRecordModal .ModalComponent-container {
  width: 600px;
}

.DetailedEnrichmentModal .ModalComponent-container {
  width: 96vw;
}

.EnrichFromSelectionModal .ModalComponent-container {
  width: 96vw;
}

.RemoveRecordModal {
  &-body {
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 15px 45px;
  }
  &-buttonContainer {
    margin: 10px 0;
    & > * {
      margin-right: 15px;
    }
  }
}

</style>
