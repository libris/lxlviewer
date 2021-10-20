
<script>
import { cloneDeep, each, get } from 'lodash-es';
import { mapGetters, mapActions } from 'vuex';
import * as StringUtil from 'lxltools/string';
import * as VocabUtil from 'lxltools/vocab';
import * as DisplayUtil from 'lxltools/display';
import * as DataUtil from '@/utils/data';
import * as HttpUtil from '@/utils/http';
import * as RecordUtil from '@/utils/record';
import { checkAutoShelfControlNumber } from '@/utils/shelfmark';
import EntityForm from '@/components/inspector/entity-form';
import Toolbar from '@/components/inspector/toolbar';
import DetailedEnrichment from '@/components/care/detailed-enrichment';
import EntityChangelog from '@/components/inspector/entity-changelog';
import EntityHeader from '@/components/inspector/entity-header';
import Breadcrumb from '@/components/inspector/breadcrumb';
import ModalComponent from '@/components/shared/modal-component';
import MarcPreview from '@/components/inspector/marc-preview';
import TabMenu from '@/components/shared/tab-menu';
import ValidationSummary from '@/components/inspector/validation-summary';

export default {
  name: 'Inspector',
  beforeRouteLeave(to, from, next) {
    if (this.shouldWarnOnUnload()) {
      const confString = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to leave the page?', this.user.settings.language, this.resources.i18n);
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
    if (this.shouldWarnOnUnload()) {
      const confString = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to leave the page?', this.user.settings.language, this.resources.i18n);
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
      documentTitle: null,
      result: {},
      postLoaded: false,
      modalOpen: false,
      removeInProgress: false,
      saveQueued: null,
      loadFailure: null,
      marcPreview: {
        data: null,
        active: false,
        error: null,
      },
      embellishFromIdModal: {
        open: false,
        inputValue: '',
        detailed: false,
      },
      justEmbellished: false,
    };
  },
  methods: {
    ...mapActions([
      'setEnrichmentSource',
      'setEnrichmentTarget',
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
    toggleEmbellishFromIdModal(open = true, detailed = false) {
      if (open) {
        this.embellishFromIdModal.inputValue = '';
        this.embellishFromIdModal.open = true;
        this.embellishFromIdModal.detailed = detailed;
        this.$nextTick(() => {
          this.$refs.EmbellishFromIdModalInput.focus();
        });
      } else {
        this.embellishFromIdModal.open = false;
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
          this.result = result;
          const splitFetched = RecordUtil.splitJson(result);
          this.$store.dispatch('setInspectorData', splitFetched);
          this.onPostLoaded();
        }
      });
    },
    initializeRecord() {
      this.documentETag = null; // Reset this
      this.marcPreview.active = false;
      this.$store.dispatch('pushLoadingIndicator', 'Loading document');
      this.postLoaded = false;
      this.$store.dispatch('flushChangeHistory');
      this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: 'mainEntity' });
      if (this.$route.name === 'Inspector') {
        console.log('Initializing view for existing document');
        this.documentId = this.$route.params.fnurgel;
        this.loadDocument();
      } else {
        console.log('Initializing view for new document');
        this.loadNewDocument();
      }
    },
    confirmApplyPostAsTemplate(detailed = false) {
      this.embellishFromIdModal.open = false;
      const id = this.embellishFromIdModal.inputValue;
      if (detailed) {
        this.prepareDetailedEnrichment(id);
      } else if (id.length > 0) {
        this.applyPostAsTemplate(id, this.embellishFromIdModal.detailed);
      }
    },
    prepareDetailedEnrichment(id = null, data = null) {
      if (id !== null) {
        const fixedId = RecordUtil.extractFnurgel(id);
        const fetchUrl = `${this.settings.apiPath}/${fixedId}/data.jsonld`;
        fetch(fetchUrl).then((response) => {
          if (response.status === 200) {
            return response.json();
          } if (response.status === 404 || response.status === 410) {
            this.$store.dispatch('pushNotification', {
              type: 'danger',
              message: `${StringUtil.getUiPhraseByLang('The post was not found', this.user.settings.language, this.resources.i18n)}. ${response.status} ${response.statusText}`,
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
            const template = RecordUtil.splitJson(result);
            this.applyAsDetailedEnrichment(template);
          }
        });
      } else if (data !== null) {
        this.applyAsDetailedEnrichment(data);
      } else {
        throw new Error('Failed to prepare data for detailed enrichment.');
      }
    },
    applyAsDetailedEnrichment(data) {
      this.setEnrichmentTarget(this.inspector.data);
      this.setEnrichmentSource(data);
      this.openDetailedEnrichmentModal();
    },
    applyPostAsTemplate(id) {
      const fixedId = RecordUtil.extractFnurgel(id);
      const fetchUrl = `${this.settings.apiPath}/${fixedId}/data.jsonld`;
      fetch(fetchUrl).then((response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 404 || response.status === 410) {
          this.$store.dispatch('pushNotification', {
            type: 'danger',
            message: `${StringUtil.getUiPhraseByLang('The post was not found', this.user.settings.language, this.resources.i18n)}. ${response.status} ${response.statusText}`,
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
          const splitFetched = RecordUtil.splitJson(result);
          const templateJson = RecordUtil.prepareDuplicateFor(splitFetched, this.user, this.settings.keysToClear.duplication);
          const template = RecordUtil.splitJson(templateJson);
          this.applyFieldsFromTemplate(template);
        }
      });
    },
    applyFieldsFromTemplate(template) {
      if (template.hasOwnProperty('work')) {
        // DO NOT switch order of these lines :)
        delete template.work['@id'];
        template.mainEntity.instanceOf = template.work;
        delete template.work;
      }
      const basePostType = this.inspector.data.mainEntity['@type'];
      const tempPostType = template.mainEntity['@type'];
      const matching = (
        VocabUtil.isSubClassOf(tempPostType, basePostType, this.resources.vocab, this.resources.context)
        || VocabUtil.isSubClassOf(basePostType, tempPostType, this.resources.vocab, this.resources.context)
      );
      if (matching === false) {
        const basePostLabel = StringUtil.getLabelByLang(basePostType, this.user.settings.language, this.resources);
        const tempPostLabel = StringUtil.getLabelByLang(tempPostType, this.user.settings.language, this.resources);
        const errorBase = `${StringUtil.getUiPhraseByLang('The types do not match', this.user.settings.language, this.resources.i18n)}`;
        const errorMessage = `"${tempPostLabel}" ${StringUtil.getUiPhraseByLang('is not compatible with', this.user.settings.language, this.resources.i18n)} "${basePostLabel}"`;
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}! ${errorMessage}` });
        return;
      }

      const basePostData = cloneDeep(this.inspector.data);

      // This part checks if the template should include the work or not (to not overwrite a link)
      if (basePostData.mainEntity.hasOwnProperty('instanceOf')) {
        const basePostWork = basePostData.mainEntity.instanceOf;
        if (Object.keys(basePostWork).length === 1 && basePostWork.hasOwnProperty('@id')) {
          delete template.mainEntity.instanceOf;
        }
      }

      const changeList = [];
      function applyChangeList(templatePath, targetPath = null) {
        if (targetPath === null) {
          // targetPath is used when the target path differs from the templatePath
          targetPath = templatePath;
        }
        const templateObject = get(template, templatePath);
        let targetObject = get(basePostData, targetPath);
        if (targetObject === null || typeof targetObject === 'undefined') {
          targetObject = {};
        }
        each(templateObject, (value, key) => {
          if (!targetObject.hasOwnProperty(key) || targetObject[key] === null) {
            changeList.push({
              path: `${targetPath}.${key}`,
              value: value,
            });
          }
        });
      }

      applyChangeList('record');
      applyChangeList('mainEntity');
      if (basePostData.hasOwnProperty('work') && basePostData.work === null) {
        delete basePostData.work;
      }
      if (!basePostData.hasOwnProperty('work')) {
        applyChangeList('mainEntity.instanceOf');
      } else {
        // If work property exists, put the work entity there
        applyChangeList('mainEntity.instanceOf', 'work');
      }
      if (changeList.length !== 0) {
        this.$store.dispatch('updateInspectorData', {
          changeList: changeList,
          addToHistory: false,
        });
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'embellished',
          value: changeList,
        });
        this.justEmbellished = true;
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
    doRemovePost() {
      this.closeRemoveModal();
      const url = `${this.settings.apiPath}/${this.documentId}`;
      HttpUtil._delete({ url, activeSigel: this.user.settings.activeSigel, token: this.user.token }).then(() => {
        this.$store.dispatch('pushNotification', { 
          type: 'success', 
          message: `${this.$options.filters.labelByLang(this.recordType)} ${StringUtil.getUiPhraseByLang('was deleted', this.user.settings.language, this.resources.i18n)}!`, 
        });
        // Force reload
        this.$router.go(-1);
      }, (error) => {
        if (error.status === 403) {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Forbidden', this.user.settings.language, this.resources.i18n)} - ${StringUtil.getUiPhraseByLang('This entity may have active links', this.user.settings.language, this.resources.i18n)} - ${error.statusText}` });
        } else {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.statusText}` });
        }
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
        this.$store.dispatch('setInspectorData', RecordUtil.splitJson(insertData));
        this.startEditing();
        this.onPostLoaded();
        DataUtil.fetchMissingLinkedToQuoted(insertData, this.$store);
      }
    },
    onPostLoaded() {
      this.$store.dispatch('setInsertData', '');
      this.$store.dispatch('flushChangeHistory');
      this.postLoaded = true;
      this.$store.dispatch('removeLoadingIndicator', 'Loading document');
      this.$nextTick(() => {
        this.$store.dispatch('pushInspectorEvent', {
          name: 'post-events',
          value: 'on-post-loaded',
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
      // Restore post
      this.$store.dispatch('setInspectorData', this.inspector.originalData);
      this.$store.dispatch('flushChangeHistory');
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
          DataUtil.removeNullValues(recordCopy),
          DataUtil.removeNullValues(this.inspector.data.mainEntity),
          DataUtil.removeNullValues(this.inspector.data.work),
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
      const cleanedRepro = RecordUtil.prepareDuplicateFor(repro, this.user, this.settings.keysToClear.duplication);
      this.$store.dispatch('setInsertData', cleanedRepro);
      setTimeout(() => {
        this.$store.dispatch('removeLoadingIndicator', 'Preparing reproduction');
        this.$router.push({ path: '/new' });
      }, 0);
    },
    saveItem(done = false) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });

      const RecordId = this.inspector.data.record['@id'];
      let obj = null;
      try {
        obj = this.getPackagedItem();
      } catch (e) {
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        const errorMessage = `${StringUtil.getUiPhraseByLang(e.message, this.user.settings.language)}`;
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
    },
    doUpdate(url, obj, ETag, done) {
      this.doSaveRequest(HttpUtil.put, obj, { url, ETag }, done);
    },
    doCreate(obj, done) {
      this.doSaveRequest(HttpUtil.post, obj, { url: `${this.settings.apiPath}/data` }, done);
    },
    doSaveRequest(requestMethod, obj, opts, done) {
      this.preSaveHook(obj).then(obj2 => requestMethod({
        url: opts.url,
        ETag: opts.ETag,
        activeSigel: this.user.settings.activeSigel,
        token: this.user.token,
      }, obj2)).then((result) => {
        if (!this.documentId) {
          const location = `${result.getResponseHeader('Location')}`;
          const locationParts = location.split('/');
          const fnurgel = locationParts[locationParts.length - 1];
          setTimeout(() => {
            this.$store.dispatch('pushNotification', { 
              type: 'success', 
              message: `${this.$options.filters.labelByLang(this.recordType)}  ${StringUtil.getUiPhraseByLang('was created', this.user.settings.language, this.resources.i18n)}!`,
            });
          }, 10);
          this.warnOnSave();
          this.$router.push({ path: `/${fnurgel}` });
        } else {
          this.fetchDocument();
          setTimeout(() => {
            this.$store.dispatch('pushNotification', {
              type: 'success', 
              message: `${this.$options.filters.labelByLang(this.recordType)} ${StringUtil.getUiPhraseByLang('was saved', this.user.settings.language, this.resources.i18n)}!`,
            });
          }, 10);
          this.warnOnSave();
          if (done) {
            this.stopEditing();
          } else {
            // Reset original data that should be restored when you click cancel
            this.$store.dispatch('setOriginalData', RecordUtil.splitJson(obj));
          }
        }
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: false });
      }, (error) => {
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.user.settings.language, this.resources.i18n);
        let errorMessage = '';
        switch (error.status) {
          case 412:
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource has been modified by another user', this.user.settings.language, this.resources.i18n)}`;
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
            errorMessage = `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${error.status}: ${StringUtil.getUiPhraseByLang(error.statusText, this.user.settings.language, this.resources.i18n)}`;
            this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
        }
      });
    },
    warnOnSave() {
      const warnArr = Object.keys(this.settings.warnOnSave);
      warnArr.forEach((element) => {
        const keys = element.split('.');
        const value = get(this.inspector.data, element);
        const warning = this.settings.warnOnSave[element].some(el => el === value);
        if (warning) {
          this.$store.dispatch('pushNotification', {
            type: 'warning',
            message: `${StringUtil.getUiPhraseByLang('Attention', this.user.settings.language, this.resources.i18n)}! ${StringUtil.getLabelByLang(keys[keys.length - 1], this.user.settings.language, this.resources)}: ${StringUtil.getLabelByLang(value, this.user.settings.language, this.resources)}`,
          });
        }
      });
    },
    removeEmbellishedHighlight() {
      if (this.inspector.status.embellished.length > 0 && !this.justEmbellished) {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'embellished',
          value: [],
        });
      }
      setTimeout(() => {
        this.justEmbellished = false;
      }, 300);
    },
    async preSaveHook(obj) {
      await checkAutoShelfControlNumber(obj, this.settings, this.user);
      return obj;
    },
  },
  
  watch: {
    'inspector.data'(val, oldVal) {
      if (val !== oldVal) {
        this.setTitle();
        this.removeEmbellishedHighlight();
        this.$store.dispatch('setInspectorStatusValue', { property: 'updating', value: false });
      }
    },
    '$route.params.fnurgel'(val, oldVal) {
      if (val !== oldVal) {
        this.documentId = val;
        this.initializeRecord();
      }
    },
    'postLoaded'(val) {
      if (val === true) {
        // do something
      }
    },
    'inspector.event'(val) {
      if (val.name === 'post-control') {
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
          case 'remove-post':
            this.openRemoveModal();
            break;
          case 'save-record':
            this.saveQueued = () => this.saveItem();
            break;
          case 'save-record-done':
            this.saveQueued = () => this.saveItem(true);
            break;
          case 'open-marc-preview':
            this.openMarcPreview();
            break;
          default:
        }
      } else if (val.name === 'apply-template') {
        this.applyFieldsFromTemplate(val.value);
      } else if (val.name === 'open-embellish-from-id') {
        this.toggleEmbellishFromIdModal(true);
      } else if (val.name === 'open-detailed-embellish-from-id') {
        this.toggleEmbellishFromIdModal(true, true);
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
  created() {
    this.$on('duplicate-item', this.duplicateItem);
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
      'userCare',
      'userFavorites',
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
      return [{ id: 'mainEntity', text: this.$options.filters.labelByLang(this.recordType) },
        { id: 'record', text: 'Admin metadata' }];
    },
  },
  components: {
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
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.postLoaded) {
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
      v-if="postLoaded" 
      class="col-sm-12" 
      :class="{'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen, 'hideOnPrint': marcPreview.active}">
        <breadcrumb v-if="$route.meta.breadcrumb" class="Inspector-breadcrumb" />
    </div>
    <div ref="componentFocusTarget" class="col-12 col-sm-12" :class="{'col-md-1 col-md-offset-11': !status.panelOpen, 'col-md-5 col-md-offset-7': status.panelOpen }">
      <div v-if="postLoaded && isDocumentAvailable" class="Toolbar-placeholder" ref="ToolbarPlaceholder"></div>
      <div v-if="postLoaded && isDocumentAvailable" class="Toolbar-container" ref="ToolbarTest">
        <toolbar></toolbar>
      </div>
    </div>
    <div class="col-sm-12" :class="{'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen, 'hideOnPrint': marcPreview.active}" ref="Inspector">
      <div v-if="!postLoaded && loadFailure">
        <h2>{{loadFailure.status}}</h2>
        <p v-if="loadFailure.status === 404">
          {{ 'The resource' | translatePhrase }} <code>{{documentId}}</code> {{ 'could not be found' | translatePhrase}}.
        </p>
        <p v-if="loadFailure.status === 410">
          {{ 'The resource' | translatePhrase }} <code>{{documentId}}</code> {{ 'has been removed' | translatePhrase}}.
        </p>
        <router-link to="/">
          {{ 'Back to home page' | translatePhrase }}
        </router-link>
      </div>
      <div v-if="postLoaded && isDocumentAvailable == false">
        <h2>{{ 'Something went wrong' | translatePhrase }}</h2>
        <p>{{ 'The document was found but failed to load' | translatePhrase }}.</p>
        <router-link to="/">
          {{ 'Back to home page' | translatePhrase }}
        </router-link>
      </div>
      <div v-if="postLoaded && isDocumentAvailable" class="Inspector-entity">
        <div class="Inspector-admin">
          <div class="Inspector-header">
            <h1>
              <span class="type" :title="recordType">{{ recordType | labelByLang }}</span>
              <span class="badge badge-accent2" v-if="inspector.status.isNew">{{ "New record" | translatePhrase }}</span>
            </h1>
            <entity-changelog v-if="inspector.status.isNew === false" />
          </div>
        </div>
        <entity-header id="main-header"
          :full="true"
          :focus-data="inspector.data.mainEntity"
          v-if="!isItem">
        </entity-header>
        <validation-summary v-if="user.settings.appTech" />
        <tab-menu @go="setEditorFocus" :tabs="editorTabs" :active="this.inspector.status.focus" />
        <entity-form
          v-for="tab in editorTabs"
          :editing-object="tab.id"
          :key="tab.id"
          :is-active="inspector.status.focus === tab.id"
          :form-data="inspector.data[tab.id]"
          :locked="!inspector.status.editing">
        </entity-form>
      </div>
    </div>
    <portal to="sidebar" v-if="marcPreview.active">
      <marc-preview @hide="marcPreview.active = false" :error="marcPreview.error" :marc-obj="marcPreview.data" v-if="marcPreview.active"></marc-preview>
    </portal>
    <modal-component title="Error" modal-type="danger" @close="closeRemoveModal" class="RemovePostModal"
      v-if="removeInProgress">
      <div slot="modal-header" class="RemovePostModal-header">
        <header>
          {{ 'Remove' | translatePhrase }} {{ this.recordType | labelByLang }}?
        </header>
      </div>
      <div slot="modal-body" class="RemovePostModal-body">
        <p>
          {{ 'This operation can\'t be reverted' | translatePhrase }}
        </p>
        <div class="RemovePostModal-buttonContainer">
          <button class="btn btn-danger btn--md" @click="doRemovePost()">{{ 'Remove' | translatePhrase }} {{ this.recordType | labelByLang | lowercase }}</button>
          <button class="btn btn-info btn--md" @click="closeRemoveModal()">{{ 'Cancel' | translatePhrase }}</button>
        </div>
      </div>
    </modal-component>
    <modal-component class="EmbellishFromIdModal" :title="[embellishFromIdModal.detailed ? 'Detailed enrichment' : 'Enrich from ID']" v-if="embellishFromIdModal.open" @close="embellishFromIdModal.open = false">
      <div slot="modal-body" class="EmbellishFromIdModal-body">
        <div class="EmbellishFromIdModal-infoText" v-if="embellishFromIdModal.detailed === true">
          <p>Med funktionen <em>Detaljerad berikning</em> kan du handplocka egenskaper från en post till en annan.</p>
          <p>För att göra detta behöver du tillgång till den berikande postens ID (URI), vilken du hittar i postens sammanfattning. Du kan också länka till posten genom att kopiera adressfältet i din webbläsare.</p>
          <p>
            Du kan välja mellan att <strong>utöka</strong> (<i class="fa text-success fa-plus"></i>) eller <strong>ersätta</strong> (<i class="fa text-accent3 fa-arrow-right"></i>) en egenskap.
            Att <strong>utöka</strong> innebär att information läggs till i den berikade posten.
            <strong>Ersätta</strong> resulterar i att den berikande posten skriver över egenskaper.
          </p>
        </div>
        <div class="EmbellishFromIdModal-infoText" v-if="embellishFromIdModal.detailed === false">
          Med funktionen <em>Berika från ID</em> kan du berika en post med egenskaper från en annan. För att göra detta behöver du tillgång till den berikande postens ID (URI), vilken du hittar i postens sammanfattning. Du kan också länka till posten genom att kopiera adressfältet i din webbläsare.
        </div>
        <div class="input-group EmbellishFromIdModal-form">
          <label class="input-group-addon EmbellishFromIdModal-label" for="id">{{ 'ID' | translatePhrase }}/{{ 'Link' | translatePhrase }}</label>
          <input name="id" class="EmbellishFromIdModal-input form-control" ref="EmbellishFromIdModalInput" v-model="embellishFromIdModal.inputValue" @keyup.enter="confirmApplyPostAsTemplate(embellishFromIdModal.detailed)" />
          <span class="input-group-btn">
            <button class="btn btn-primary btn--md EmbellishFromIdModal-confirmButton" @click="confirmApplyPostAsTemplate(embellishFromIdModal.detailed)" @keyup.enter="confirmApplyPostAsTemplate(embellishFromIdModal.detailed)">{{ 'Continue' | translatePhrase }}</button>
          </span>
        </div>
      </div>
    </modal-component>

    <modal-component class="DetailedEnrichmentModal" :title="'Detailed enrichment' | translatePhrase" v-if="inspector.status.detailedEnrichmentModal.open === true" @close="closeDetailedEnrichmentModal" :backdrop-close="false">
      <DetailedEnrichment slot="modal-body" :floating-dialogs="true" />
    </modal-component>
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
    display: flex;
    flex-direction: column;

    @media (min-width: @screen-sm) {
      flex-direction: row;
    }
  }

  &-breadcrumb {
    border-bottom:  1px solid @grey-lighter;
    padding-bottom: 10px;
  }

  &-header {
    flex: 3;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 0.25em;
    align-items: flex-end;
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

.EmbellishFromIdModal {
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

.RemovePostModal .ModalComponent-container {
  width: 600px;
}

.DetailedEnrichmentModal .ModalComponent-container {
  width: 90vw;
}

.RemovePostModal {
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
