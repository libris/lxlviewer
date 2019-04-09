
<script>
import { cloneDeep, each } from 'lodash-es';
import * as StringUtil from '@/utils/string';
import * as DataUtil from '@/utils/data';
import * as VocabUtil from '@/utils/vocab';
import * as HttpUtil from '@/utils/http';
import * as DisplayUtil from '@/utils/display';
import * as RecordUtil from '@/utils/record';
import * as md5 from 'md5';
import EntityForm from '@/components/inspector/entity-form';
import TagSwitch from '@/components/shared/tag-switch';
import Toolbar from '@/components/inspector/toolbar';
import EntityChangelog from '@/components/inspector/entity-changelog';
import EntityHeader from '@/components/inspector/entity-header';
import Breadcrumb from '@/components/inspector/breadcrumb';
import ModalComponent from '@/components/shared/modal-component';
import ReverseRelations from '@/components/inspector/reverse-relations';
import MarcPreview from '@/components/inspector/marc-preview';
import TabMenu from '@/components/shared/tab-menu';
import ValidationSummary from '@/components/inspector/validation-summary';
import { mapGetters } from 'vuex';

export default {
  name: 'Inspector',
  beforeRouteLeave(to, from, next) {
    if (this.shouldWarnOnUnload()) {
      const confString = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to leave the page?', this.settings.language);
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
    this.addBreadcrumb();
    if (this.shouldWarnOnUnload()) {
      const confString = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to leave the page?', this.settings.language);
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
      result: {},
      postLoaded: false,
      modalOpen: false,
      removeInProgress: false,
      loadFailure: null,
      marcPreview: {
        data: null,
        active: false,
        error: null,
      },
      embellishFromIdModal: {
        open: false,
        inputValue: '',
      },
    };
  },
  methods: {
    applyOverride(data) {
      this.$store.dispatch('setInspectorData', data);
      this.$store.dispatch('pushNotification', { 
        type: 'success', 
        message: `${StringUtil.getUiPhraseByLang('Formulär uppdaterat, glöm inte att spara posten', this.user.settings.language)}`, 
      });
    },
    addBreadcrumb() {
      if (this.inspector.breadcrumb !== '') {
        const currentTrail = this.inspector.breadcrumb;
        const firstTrail = currentTrail.shift();

        const newBreadcrumb = {
          type: 'fromPost',
          recordType: this.recordType,
          postUrl: this.$route.fullPath,
        };

        const newTrail = [];
        newTrail.push(firstTrail);
        newTrail.push(newBreadcrumb);

        this.$store.dispatch('setBreadcrumbData', 
          newTrail);
      } else {
        this.$store.dispatch('setBreadcrumbData', 
          [
            {
              type: 'fromPost',
              recordType: this.recordType,
              postUrl: this.$route.fullPath,
            },
          ]);
      }
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
          const confirmationMessage = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to leave the page?', this.settings.language);
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
    toggleEmbellishFromIdModal(open = true) {
      if (open) {
        this.embellishFromIdModal.inputValue = '';
        this.embellishFromIdModal.open = true;
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
      const randomHash = md5(new Date());
      const fetchUrl = `${this.settings.apiPath}/${this.documentId}/data.jsonld?${randomHash}`;
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
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${response.status} ${response.statusText}`, 
          });
          this.$store.dispatch('removeLoadingIndicator', 'Loading document');
        }
        return null;
      }, (error) => {
        this.$store.dispatch('pushNotification', { 
          type: 'danger', 
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}`, 
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
    confirmApplyPostAsTemplate() {
      const id = this.embellishFromIdModal.inputValue;
      if (id.length > 0) {
        this.applyPostAsTemplate(id);
      }
    },
    applyPostAsTemplate(id) {
      const fixedId = RecordUtil.extractFnurgel(id);
      const randomHash = md5(new Date());
      const fetchUrl = `${this.settings.apiPath}/${fixedId}/data.jsonld?${randomHash}`;
      fetch(fetchUrl).then((response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 404 || response.status === 410) {
          this.$store.dispatch('pushNotification', { 
            type: 'danger', 
            message: `${StringUtil.getUiPhraseByLang('The post was not found', this.user.settings.language)}. ${response.status} ${response.statusText}`, 
          });
        } else {
          this.$store.dispatch('pushNotification', { 
            type: 'danger', 
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${response.status} ${response.statusText}`, 
          });
        }
        return false;
      }, (error) => {
        this.$store.dispatch('pushNotification', { 
          type: 'danger', 
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}`, 
        });
      }).then((result) => {
        if (typeof result !== 'undefined') {
          const splitFetched = RecordUtil.splitJson(result);
          const templateJson = RecordUtil.prepareDuplicateFor(splitFetched, this.user, this.settings);
          const template = RecordUtil.splitJson(templateJson);
          this.applyFieldsFromTemplate(template);
          this.embellishFromIdModal.open = false;
        }
      });
    },
    applyFieldsFromTemplate(templateJson) {
      const basePostType = this.inspector.data.mainEntity['@type'];
      const tempPostType = templateJson.mainEntity['@type'];
      const matching = (
        VocabUtil.isSubClassOf(tempPostType, basePostType, this.resources.vocab, this.resources.context)
        || VocabUtil.isSubClassOf(basePostType, tempPostType, this.resources.vocab, this.resources.context)
      );
      if (matching === false) {
        const basePostLabel = StringUtil.getLabelByLang(basePostType, this.user.settings.language, this.resources.vocab, this.resources.context);
        const tempPostLabel = StringUtil.getLabelByLang(tempPostType, this.user.settings.language, this.resources.vocab, this.resources.context);
        const errorBase = `${StringUtil.getUiPhraseByLang('The types do not match', this.user.settings.language)}`;
        const errorMessage = `"${tempPostLabel}" ${StringUtil.getUiPhraseByLang('is not compatible with', this.user.settings.language)} "${basePostLabel}"`;
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}! ${errorMessage}` });
        return;
      }

      const basePostData = cloneDeep(this.inspector.data);
      const changeList = [];
      function applyChangeList(objectKey) {
        each(templateJson[objectKey], (value, key) => {
          if (!basePostData.hasOwnProperty(objectKey) || basePostData[objectKey] === null) {
            basePostData[objectKey] = {};
          }
          if (!basePostData[objectKey].hasOwnProperty(key) || basePostData[objectKey][key] === null) {
            // console.log("Applied ->", `${objectKey}.${key}`);
            changeList.push({
              path: `${objectKey}.${key}`,
              value: value,
            });
          }
        });
      }
      applyChangeList('record');
      applyChangeList('mainEntity');
      applyChangeList('work');
      if (changeList.length !== 0) {
        this.$store.dispatch('updateInspectorData', {
          changeList: changeList,
          addToHistory: false,
        });
        this.$store.dispatch('pushNotification', { 
          type: 'success', 
          message: `${changeList.length} ${StringUtil.getUiPhraseByLang('field(s) added from template', this.user.settings.language)}`, 
        });
      } else {
        this.$store.dispatch('pushNotification', { 
          type: 'info', 
          message: `${StringUtil.getUiPhraseByLang('The record already contains these fields', this.user.settings.language)}`, 
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
        this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('The post was deleted', this.settings.language)}!` });
        // Force reload
        this.$router.go(-1);
      }, (error) => {
        if (error.status === 403) {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Forbidden', this.settings.language)} - ${StringUtil.getUiPhraseByLang('This entity may have active links', this.settings.language)} - ${error.statusText}` });
        } else {
          this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error.statusText}` });
        }
      });
    },
    loadDocument() {
      this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: false });
      this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: false });
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
        this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: true });
        this.onPostLoaded();
      }
    },
    onPostLoaded() {
      this.$store.dispatch('setInsertData', '');
      this.$store.dispatch('setOriginalData', this.inspector.data);
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
    doCancel() {
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'editing', 
        value: false, 
      });
      // Restore post
      this.$store.dispatch('setInspectorData', this.inspector.originalData);
      this.$store.dispatch('flushChangeHistory');
    },
    cancelEditing() {
      if (!this.inspector.status.isNew) {
        if (this.shouldWarnOnUnload()) {
          const confString = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to cancel?', this.settings.language);
          const answer = window.confirm(confString); // eslint-disable-line no-alert
          if (answer) {
            this.doCancel();
          } 
        } else {
          this.doCancel();
        }
      } else {
        this.$router.go(-1);
      }
    },
    setTitle() {
      if (typeof this.inspector.data.mainEntity !== 'undefined') {
        const headerList = DisplayUtil.getItemSummary(
          this.inspector.data.mainEntity, 
          this.resources.display, 
          this.inspector.data.quoted, 
          this.resources.vocab, 
          this.settings, 
          this.resources.context,
        ).header;
        const header = StringUtil.getFormattedEntries(
          headerList, 
          this.resources.vocab, 
          this.settings, 
          this.resources.context,
        ).join(', ');
        if (header.length > 0 && header !== '{Unknown}') {
          const title = header;
          this.$store.dispatch('setInspectorTitle', title);
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
      const promptInstruction = StringUtil.getUiPhraseByLang('Name your file', this.user.settings.language);
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
      const RecordId = this.inspector.data.record['@id'];
      const recordCopy = cloneDeep(this.inspector.data.record);

      if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
        recordCopy.descriptionCreator = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
      } else { // ID exists -> update
        recordCopy.descriptionLastModifier = { '@id': `https://libris.kb.se/library/${this.user.settings.activeSigel}` };
      }

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
      return obj;
    },
    duplicateItem() {
      if (!this.status.inEdit && !this.isItem) {
        const duplicate = RecordUtil.prepareDuplicateFor(this.inspector.data, this.user, this.settings);
        this.$store.dispatch('setInsertData', duplicate);
        this.$router.push({ path: '/new' });
      }
    },
    saveItem(done = false) {
      this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: true });

      const RecordId = this.inspector.data.record['@id'];
      const obj = this.getPackagedItem();
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
      requestMethod({ 
        url: opts.url, 
        ETag: opts.ETag, 
        activeSigel: this.user.settings.activeSigel, 
        token: this.user.token,
      }, obj).then((result) => {
        if (!this.documentId) {
          const location = `${result.getResponseHeader('Location')}`;
          const locationParts = location.split('/');
          const fnurgel = locationParts[locationParts.length - 1];
          this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('The post was created', this.settings.language)}!` });
          this.$router.push({ path: `/${fnurgel}` });
        } else {
          this.fetchDocument();
          this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('The post was saved', this.settings.language)}!` });
          if (done) {
            this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: false });
          }
        }
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        this.$store.dispatch('setInspectorStatusValue', { property: 'isNew', value: false });
      }, (error) => {
        this.$store.dispatch('setInspectorStatusValue', { property: 'saving', value: false });
        const errorBase = StringUtil.getUiPhraseByLang('Save failed', this.settings.language);
        let errorMessage = '';
        switch (error.status) {
          case 412:
            errorMessage = `${StringUtil.getUiPhraseByLang('The resource has been modified by another user', this.settings.language)}`;
            break;
          case 401:
            errorMessage = `${StringUtil.getUiPhraseByLang('Your login has expired', this.settings.language)}`;
            break;
          default:
            errorMessage = `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error.status}: ${StringUtil.getUiPhraseByLang(error.statusText, this.settings.language)}`;
        }
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${errorBase}. ${errorMessage}.` });
      });
    },
  },
  watch: {
    'inspector.data'(val, oldVal) {
      if (val !== oldVal) {
        this.setTitle();
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
            this.cancelEditing();
            break;
          case 'download-json':
            this.downloadJson();
            break;
          case 'remove-post':
            this.openRemoveModal();
            break;
          case 'save-record':
            this.saveItem();
            break;
          case 'save-record-done':
            this.saveItem(true);
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
      } else if (val.name === 'apply-override') {
        this.applyOverride(val.value);
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
    ]),
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
      return this.inspector.data.mainEntity['@type'] === 'Item';
    },
    downloadIsSupported() {
      const a = document.createElement('a');
      return typeof a.download !== 'undefined';
    },
    recordType() {
      return VocabUtil.getRecordType(
        this.inspector.data.mainEntity['@type'], 
        this.resources.vocab, 
        this.resources.context,
      );
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
    'reverse-relations': ReverseRelations,
    breadcrumb: Breadcrumb,
    'marc-preview': MarcPreview,
    'tab-menu': TabMenu,
    TagSwitch,
    'validation-summary': ValidationSummary,
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.postLoaded) {
        this.initializeRecord();
      }
      this.initializeWarnBeforeUnload();
      this.initJsonOutput();
    });
  },
};
</script>
<template>
  <div class="row">
    <div class="Inspector col-sm-12" :class="{'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen, 'hideOnPrint': marcPreview.active}" ref="Inspector">
      <div v-if="!postLoaded && loadFailure">
        <h2>{{loadFailure.status}}</h2>
        <p v-if="loadFailure.status === 404">
          {{ 'The record' | translatePhrase }} <code>{{documentId}}</code> {{ 'could not be found' | translatePhrase}}.
        </p>
        <p v-if="loadFailure.status === 410">
          {{ 'The record' | translatePhrase }} <code>{{documentId}}</code> {{ 'has been removed' | translatePhrase}}.
        </p>
        <router-link to="/">
          {{ 'Back to home page' | translatePhrase }}
        </router-link>
      </div>
      <div v-if="postLoaded" class="Inspector-entity">
        <breadcrumb class="Inspector-breadcrumb"
          v-if="postLoaded && this.inspector.breadcrumb.length !== 0"
          :record-type="recordType">
        </breadcrumb>   
        <div class="Inspector-admin">
          <div class="Inspector-header">
            <h1 class="Inspector-title mainTitle" :title="recordType">
              <span>{{ recordType | labelByLang }}</span>
              <span v-if="inspector.status.isNew"> - [{{ "New record" | translatePhrase }}]</span>
            </h1>
            <entity-changelog v-if="inspector.status.isNew === false" />
          </div>
        </div>
        <entity-header id="main-header" 
          :full="true" 
          v-if="!isItem">
        </entity-header>
        <validation-summary v-if="user.settings.appTech" />
        <tab-menu @go="setEditorFocus" :tabs="editorTabs" :active="this.inspector.status.focus" />
        <entity-form 
          v-for="tab in editorTabs"
          :editing-object="tab.id" 
          :key="tab.id"
          :locked="!inspector.status.editing">
        </entity-form>
      </div>
    </div>
    <div v-if="postLoaded" class="col-12 col-sm-12" :class="{'col-md-1': !status.panelOpen, 'col-md-5': status.panelOpen }">
      <div class="Toolbar-placeholder" ref="ToolbarPlaceholder"></div>
      <div class="Toolbar-container" ref="ToolbarTest">
        <toolbar></toolbar>
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
          <button class="btn btn-danger btn--md" @click="doRemovePost()">{{ 'Remove the record' | translatePhrase }}</button>
          <button class="btn btn-gray btn--md" @click="closeRemoveModal()">{{ 'Cancel' | translatePhrase }}</button>
        </div>
      </div>
    </modal-component>
    <modal-component class="EmbellishFromIdModal" :title="['Embellish', 'From ID']" v-if="embellishFromIdModal.open" @close="embellishFromIdModal.open = false">
      <div slot="modal-body" class="EmbellishFromIdModal-body">
        <div class="EmbellishFromIdModal-infoText">
          Med funktionen <em>Berika från ID</em> kan du berika en post med egenskaper från en annan. För att göra detta behöver du tillgång till den berikande postens ID (URI), vilken du hittar i postens sammanfattning. Du kan också länka till posten genom att kopiera adressfältet i din webbläsare.
        </div>
        <div class="input-group EmbellishFromIdModal-form">
          <label class="input-group-addon EmbellishFromIdModal-label" for="id">{{ 'ID' | translatePhrase }}/{{ 'Link' | translatePhrase }}</label>
          <input name="id" class="EmbellishFromIdModal-input form-control" ref="EmbellishFromIdModalInput" v-model="embellishFromIdModal.inputValue" @keyup.enter="confirmApplyPostAsTemplate" />
          <span class="input-group-btn">
            <button class="btn btn-primary EmbellishFromIdModal-confirmButton" @click="confirmApplyPostAsTemplate" @keyup.enter="confirmApplyPostAsTemplate">{{ 'Embellish' | translatePhrase }}</button>
          </span>
        </div>
      </div>
    </modal-component>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">

.Inspector {

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
    border-bottom:  1px solid @gray-lighter;
    padding-bottom: 10px;
  }

  &-header {
    flex: 3;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-direction: column;
    @media (min-width: @screen-md) {
      flex-direction: row;
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
    border: 1px solid @gray-lighter;
  }

  &.hideOnPrint {
    @media print {
      display: none;
    }
  }

  @media screen and (max-width: @screen-sm) {
    padding-left: 0;
    padding-right: 0;
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
    border: 1px solid @gray;
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
  height: 250px;
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
