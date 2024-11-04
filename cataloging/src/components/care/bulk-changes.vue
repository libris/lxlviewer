<script>
import FormBuilder from '@/components/care/form-builder.vue';
import TargetFormBuilder from '@/components/care/target-form-builder.vue';
import Preview from '@/components/care/preview.vue';
import BulkChangesHeader from "@/components/care/bulk-changes-header.vue";
import { mapGetters } from 'vuex';
import { cloneDeep, get, isEmpty, isEqual } from 'lodash-es';
import emptyTemplate from './templates/empty.json';
import toolbar from "@/components/inspector/bulkchange-toolbar.vue";
import { labelByLang, translatePhrase } from "@/utils/filters.js";
import * as LayoutUtil from '@/utils/layout';
import Inspector from "@/views/Inspector.vue";
import ModalComponent from '@/components/shared/modal-component.vue';
import * as DataUtil from "@/utils/data.js";
import * as StringUtil from 'lxljs/string.js';
import * as HttpUtil from "@/utils/http.js";
import * as RecordUtil from "@/utils/record.js";
import * as LxlDataUtil from "lxljs/data.js";
import * as HistoryUtil from "@/utils/history.js";
import ReverseRelations from "../inspector/reverse-relations.vue";
import { appendIds } from "../../utils/data.js";
import {
  ANY_OF_TYPE,
  CHANGE_SPEC_KEY,
  HAS_ID_KEY,
  MATCH_FORM_KEY,
  SHOULD_UPDATE_TIMESTAMP_KEY,
  STATUS_KEY,
  Status,
  TARGET_FORM_KEY,
  VALUE_FROM_KEY,
  Type
} from "@/utils/bulk.js";

export default {
  name: 'bulk-changes.vue',
  components: {
    ReverseRelations,
    Inspector,
    toolbar,
    FormBuilder,
    TargetFormBuilder,
    Preview,
    BulkChangesHeader,
    'modal-component': ModalComponent,
  },
  props: {
    fnurgel: ''
  },
  data() {
    return {
      showOverview: true,
      inlinedIds: [],
      activeStep: '',
      allSteps: [
        'form',
        'targetForm',
        'preview',
      ],
      currentBulkChange: {},
      currentSpec: {},
      lastFetchedSpec: {},
      record: {},
      formPreview: {},
      formPreviewData: {'@type': 'Instance'},
      formPreviewDiff: {},
      nextPreviewLink: {},
      previousPreviewLink: {},
      totalItems: 0,
      itemOffset: 0,
      fullPreview: {},
      fullPreviewData: {'@type': 'Instance'},
      fullPreviewDiff: {},
      showOverwriteWarning: false,
      showConfirmRunModal: false,
      loadingPreview: {
        'next': false,
        'previous': false
      },
      showIdListModal: false,
      idListUri: '',
      idListTempPath: ''
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'directoryCare',
      'status',
      'user',
      'resources',
      'settings',
    ]),
    documentId() {
      return this.fnurgel;
    },
    isNew() {
      return !this.documentId || this.documentId === 'new';
    },
    dataObj() {
      return this.inspector.data.mainEntity;
    },
    formObj() {
      return this.isActive('form') ? this.inspector.data.mainEntity : this.currentSpec[MATCH_FORM_KEY];
    },
    targetFormObj() {
      return this.isActive('targetForm') ? this.inspector.data.mainEntity : this.currentSpec[TARGET_FORM_KEY];
    },
    formTitle() {
      if (this.specType === Type.Delete) {
        return `${this.steps.indexOf('form') + 1}. ${translatePhrase('Remove records')}`
      }
      return `${this.steps.indexOf('form') + 1}. ${translatePhrase('Selection')}`
    },
    changesTitle() {
      if (this.specType === Type.Create) {
        return `${this.steps.indexOf('targetForm') + 1}. ${translatePhrase('Create records')}`
      }
      return `${this.steps.indexOf('targetForm') + 1}. ${translatePhrase('Changes')}`
    },
    previewTitle() {
      return `${this.steps.indexOf('preview') + 1}. ${translatePhrase('Preview ')}`
    },
    hasNext() {
      return !isEmpty(this.nextPreviewLink);
    },
    hasPrevious() {
      return !isEmpty(this.previousPreviewLink);
    },
    isLastActive() {
      return this.activeStep === this.steps.slice(-1)[0];
    },
    isFirstActive() {
      return this.activeStep === this.steps[0];
    },
    isDraft() {
      return this.currentBulkChange[STATUS_KEY] === Status.Draft;
    },
    isReady() {
      return this.currentBulkChange[STATUS_KEY] === Status.Ready;
    },
    isFinished() {
      return this.currentBulkChange[STATUS_KEY] === Status.Completed
        || this.currentBulkChange[STATUS_KEY] === Status.Failed;
    },
    isRunningOrFinished() {
      return this.isFinished
        || this.currentBulkChange[STATUS_KEY] === Status.Running;
    },
    statusLabel() {
      return StringUtil.getLabelByLang(this.currentBulkChange[STATUS_KEY], this.user.settings.language, this.resources);
    },
    loudOrSilentLabel() {
      return translatePhrase('Export changed records (update change date)');
    },
    isLoud() {
      return this.currentBulkChange[SHOULD_UPDATE_TIMESTAMP_KEY] === true;
    },
    shouldExportAffected() {
      return this.isLoud;
    },
    steps() {
      if (!this.hasTargetForm) {
        return this.allSteps.filter(step => step !== 'targetForm');
      } else if(!this.hasMatchForm) {
        return this.allSteps.filter(step => step !== 'form')
      } else {
        return this.allSteps;
      }
    },
    hasUnsavedChanges() {
      if (this.lastFetchedSpec && this.isDraft) {
        const matchFormEqual = isEqual(this.formObj, this.lastFetchedSpec[MATCH_FORM_KEY]);
        const targetFormEqual = isEqual(this.targetFormObj, this.lastFetchedSpec[MATCH_FORM_KEY]);
        return !matchFormEqual || !targetFormEqual;
      }
      return false;
    },
    hasTargetForm() {
      return this.specType !== Type.Delete;
    },
    hasMatchForm() {
      return this.specType !== Type.Create;
    },
    specType() {
      return this.currentSpec['@type'];
    }
  },
  methods: {
    translatePhrase,
    getDateString() {
      const date = new Date();
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    },
    initNew() {
      const initData = this.directoryCare.bulkChange.initData;

      const record = initData['@graph'][0];
      const mainEntity = initData['@graph'][1];
      this.currentBulkChange = mainEntity;
      this.currentBulkChange.label = '<namn>-' + this.getDateString();
      this.currentSpec = this.currentBulkChange[CHANGE_SPEC_KEY];

      //TODO: Allow differing initial match and target forms. + Make it work with appended _ids.
      this.record = record;
      this.lastFetchedSpec = this.currentSpec;
      DataUtil.fetchMissingLinkedToQuoted(this.currentBulkChange, this.$store);

      this.setActive(this.steps[0]);
      const initialForm = appendIds(mainEntity[CHANGE_SPEC_KEY][MATCH_FORM_KEY]);
      this.currentSpec[MATCH_FORM_KEY] = initialForm;
      this.currentSpec[TARGET_FORM_KEY] = initialForm;
      this.setInspectorData(initialForm);
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
    },
    initFromRecord() {
      this.setActive(this.steps[0]);
      // FIXME: remove emptyTemplate
      const initial = emptyTemplate.mainEntity[CHANGE_SPEC_KEY][MATCH_FORM_KEY];
      this.setInspectorData(initial);
      this.currentSpec = emptyTemplate.mainEntity[CHANGE_SPEC_KEY]; //FIXME: to avoid undefined on init
      this.fetchRecord(this.documentId);
    },
    fetchRecord(fnurgel) {
      const fetchUrl = `${this.settings.apiPath}/${fnurgel}/data.jsonld`;
      fetch(fetchUrl).then((response) => {
        if (response.status === 200) {
          this.documentETag = response.headers.get('ETag');
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
          const bulkChange = LxlDataUtil.splitJson(result);
          this.currentBulkChange = bulkChange.mainEntity;
          this.currentSpec = this.currentBulkChange[CHANGE_SPEC_KEY];
          this.record = bulkChange.record;
          this.lastFetchedSpec = cloneDeep(this.currentSpec);

          if (this.isActive('form')) {
            this.setInspectorData(this.currentSpec[MATCH_FORM_KEY]);
          } else if (this.isActive('targetForm')){
            this.setInspectorData(this.currentSpec[TARGET_FORM_KEY])
          } else {
            this.setInspectorData(this.currentSpec[MATCH_FORM_KEY])
          }
          if (this.isDraft) {
            this.$store.dispatch('pushInspectorEvent', {
              name: 'record-control',
              value: 'start-edit',
            });
          }
          DataUtil.fetchMissingLinkedToQuoted(this.currentBulkChange, this.$store);
          this.getPreview(fnurgel);
        }
      });
    },
    setInspectorData(formData, path='mainEntity') {
      // Piggy-backing on inspector.data for direct use of entity adder, undo history etc.
      if (typeof formData === 'undefined') {
        return;
      }
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: path,
            value: formData,
          },
        ],
        addToHistory: false,
      });
    },
    onInactiveForm() {
      let form = DataUtil.appendIds(cloneDeep(this.inspector.data.mainEntity));
      if (isEqual(form, this.currentSpec[MATCH_FORM_KEY])) {
        this.setInspectorData(this.currentSpec[TARGET_FORM_KEY]);
      } else {
        this.setInspectorData(form);
        this.currentSpec[MATCH_FORM_KEY] = form;
      }
    },
    onInactiveTargetForm() {
      if (this.activeStep === 'form') {
        this.setInspectorData(this.currentSpec[MATCH_FORM_KEY]);
      }
      this.currentSpec[TARGET_FORM_KEY] = cloneDeep(this.inspector.data.mainEntity);
    },
    reset() {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: false,
      });
    },
    focusPreview() {
      LayoutUtil.ensureInViewport(this.$refs.preview);
    },
    focusMatchForm() {
      LayoutUtil.ensureInViewport(this.$refs.matchForm);
    },
    focusTargetForm() {
      LayoutUtil.ensureInViewport(this.$refs.targetForm);
    },
    nextStep() {
      this.closeSidePanel();
      this.resetLastAdded();
      this.clearUndoState();
      this.setActive(this.steps[this.steps.indexOf(this.activeStep) + 1]);
    },
    previousStep() {
      if (this.isActive('targetForm')) {
        this.openOverwriteModal();
      }
      this.closeSidePanel();
      this.resetLastAdded();
      this.clearUndoState();
      this.setActive(this.steps[this.steps.indexOf(this.activeStep) - 1]);
    },
    closeSidePanel() {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'form-control',
        value: 'close-modals',
      })
    },
    resetLastAdded() {
      this.$store.dispatch('setInspectorStatusValue', { property: 'lastAdded', value: '' });
    },
    clearUndoState() {
      this.$store.dispatch('flushChangeHistory');
    },
    setActive(step) {
      if (!step) return;
      this.activeStep = step;
    },
    isActive(step) {
      return this.activeStep === step;
    },
    closeOverwriteModal() {
      this.showOverwriteWarning = false;
    },
    openOverwriteModal() {
      this.showOverwriteWarning = true;
    },
    closeConfirmRunModal() {
      this.showConfirmRunModal = false;
    },
    openConfirmRunModal() {
      this.showConfirmRunModal = true;
    },
    toggleExportAffected() {
      this.currentBulkChange[SHOULD_UPDATE_TIMESTAMP_KEY] = !this.shouldExportAffected;
    },
    save() {
      this.resetLastAdded();
      if (this.isActive('form')) {
        this.onInactiveForm();
        this.onInactiveTargetForm();
      } else if (this.isActive('targetForm')) {
        this.onInactiveTargetForm();
      }
      this.saveBulkChange();
    },
    getPreview(fnurgel) {
      const baseUri = this.settings.dataPath;
      const offset = 0;
      const limit = 1;
      const fetchUrl = `${this.settings.apiPath}/_bulk-change/preview?@id=${baseUri}/${fnurgel}&_limit=${limit}&_offset=${offset}`;
      this.getPreviewFromUrl(fetchUrl);
    },
    getPreviewFromUrl(fetchUrl) {
      fetch(fetchUrl).then((response) => response.json()).then((result) => {
        // const agents = (this.changeSets || []).map((c) => c.agent).filter((a) => a);
        // DataUtil.fetchMissingLinkedToQuoted(agents, this.$store);

        // Form preview
        if (typeof result.changeSets !== 'undefined') {
          const formChangeset = result.changeSets[1];

          const [formDisplayData, formDisplayPaths] = HistoryUtil.buildDisplayData(
            this.currentSpec[MATCH_FORM_KEY],
            this.currentSpec[TARGET_FORM_KEY],
            formChangeset.addedPaths,
            formChangeset.removedPaths,
            (s) => StringUtil.getLabelByLang(s, this.user.settings.language, this.resources),
          );
          this.formPreviewData = formDisplayData;
          this.formPreviewDiff.removed = formDisplayPaths.removed.map(path => `mainEntity.${path}`);
          this.formPreviewDiff.added = formDisplayPaths.added.map(path => `mainEntity.${path}`);
          this.formPreviewDiff.modified = formDisplayPaths.modified.map(path => `mainEntity.${path}`);
        }

        this.totalItems = result.totalItems;
        if (this.totalItems === 0) {
          this.resetPreviewData();
          return;
        } else {
          this.setActive('preview');
        }
        // Full record preview
        this.nextPreviewLink = result.next;
        this.previousPreviewLink = result.prev;
        this.itemOffset = result.itemOffset;

        if (this.specType === Type.Update) {
          let before = result.items[0].changeSets[0].version;
          let after = result.items[0].changeSets[1].version;
          const changeset = result.items[0].changeSets[1];

          const [displayData, displayPaths] = HistoryUtil.buildDisplayData(
            before,
            after,
            changeset.addedPaths.map(el => el.slice(2)), //temporary hack to remove [@graph, 1, ...
            changeset.removedPaths.map(el => el.slice(2)),
            (s) => StringUtil.getLabelByLang(s, this.user.settings.language, this.resources),
          );

          this.fullPreviewData = displayData;
          this.fullPreviewDiff.removed = displayPaths.removed.map(path => `mainEntity.${path}`);
          this.fullPreviewDiff.added = displayPaths.added.map(path => `mainEntity.${path}`);
          this.fullPreviewDiff.modified = displayPaths.modified.map(path => `mainEntity.${path}`);
        } else if (this.specType === Type.Delete) {
          this.fullPreviewDiff.removed = [];
          this.fullPreviewDiff.added = [];
          this.fullPreviewDiff.modifed = [];
          this.fullPreviewData = result.items[0].changeSets[0].version;
        }
        DataUtil.fetchMissingLinkedToQuoted(this.fullPreviewData, this.$store);
        this.loadingPreview.next = false;
        this.loadingPreview.previous = false;
      });
    },
    async triggerRunBulkChange() {
      const nonEmpty = {'a' : 'b'};
      await HttpUtil.post({
        url: `${this.settings.apiPath}/_bulk-change/poll-ready`
      }, nonEmpty);
    },
    run() {
      this.openConfirmRunModal();
    },
    doRun() {
      this.closeConfirmRunModal();
      this.setRunStatus(Status.Ready);
      this.save();
      this.setActive('preview');
    },
    setAsDraft() {
      this.setRunStatus(Status.Draft);
    },
    openIdListModal() {
      this.idListUri = '';
      this.showIdListModal = true;
    },
    setIdListUri() {
      this.showIdListModal = false;
      const idList = {
        '@type': ANY_OF_TYPE,
        [VALUE_FROM_KEY]: {'@id': this.idListUri}
      }
      if (this.idListTempPath) {
        this.setInspectorData({ [HAS_ID_KEY]: idList }, this.idListTempPath);
      } else {
        const mainEntity = cloneDeep(this.inspector.data.mainEntity);
        mainEntity[HAS_ID_KEY] = idList;
        this.setInspectorData(mainEntity, 'mainEntity');
      }
      this.idListTempPath = '';
    },
    removeIdList() {
      const matchForm = cloneDeep(this.inspector.data.mainEntity);
      delete matchForm[HAS_ID_KEY];
      this.idListUri = '';
      this.setInspectorData(matchForm);
    },
    nextPreview() {
      this.loadingPreview.next = true;
      this.getPreviewFromUrl(`${this.settings.apiPath}${this.nextPreviewLink['@id']}`);
    },
    previousPreview() {
      this.loadingPreview.previous = true;
      this.getPreviewFromUrl(`${this.settings.apiPath}${this.previousPreviewLink['@id']}`);
    },
    setRunStatus(status) {
      this.currentBulkChange[STATUS_KEY] = status;
    },
    resetPreviewData() {
      this.fullPreview = {};
      this.fullPreviewData = {};
      this.fullPreviewDiff = {};
    },
    async saveBulkChange() {
      try {
        await this.doSaveBulkChange();
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
    async doSaveBulkChange(done = false) {
      let obj = DataUtil.getMergedItems(
        DataUtil.removeNullValues(this.record),
        DataUtil.removeNullValues(this.currentBulkChange),
      );
      const ETag = this.documentETag;

      const RecordId = this.record['@id'];
      if (!RecordId || RecordId === 'https://id.kb.se/TEMPID') { // No ID -> create new
        this.create(obj, done);
      } else { // ID exists -> update
        console.log('ETag ', ETag);
        this.update(RecordId, obj, ETag, done);
      }
    },
    update(url, obj, ETag, done) {
      this.doSaveRequest(HttpUtil.put, obj, { url, ETag }, done);
    },
    create(obj, done) {
      this.doSaveRequest(HttpUtil.post, obj, { url: `${this.settings.apiPath}/data` }, done);
    },
    doSaveRequest(requestMethod, obj, opts, done) {
      this.preSaveHook(obj).then((obj2) => requestMethod({
        url: opts.url,
        ETag: opts.ETag,
        activeSigel: this.user.settings.activeSigel,
        token: this.user.token,
      }, obj2)).then((result) => {
        // eslint-disable-next-line no-nested-ternary
        const msgKey = !this.documentId ? 'was created' : 'was saved';
        const type = get(obj, ['@graph', 1, '@type'], '');

        setTimeout(() => {
          this.$store.dispatch('pushNotification', {
            type: 'success',
            message: `${labelByLang(type)} ${StringUtil.getUiPhraseByLang(msgKey, this.user.settings.language, this.resources.i18n)}!`,
          });
        }, 10);
        if (this.isNew) {
          const location = `${result.getResponseHeader('Location')}`;
          const locationParts = location.split('/');
          const fnurgel = locationParts[locationParts.length - 1];
          this.fetchRecord(fnurgel);
          const path = this.$route.path;
          // Strip 'new' from path
          this.$router.push({ path: `${path.substr(0, path.lastIndexOf('/'))}/${fnurgel}` });
          this.warnOnSave();
        } else {
          this.fetchRecord(this.documentId);
          this.warnOnSave();
        }
        if (this.isReady) {
          this.setActive('preview');
          this.triggerRunBulkChange();
          setTimeout(() => {
            this.triggerRunBulkChange();
          }, 5000);
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
    async preSaveHook(obj) {
      // await checkAutoShelfControlNumber(obj, this.settings, this.user, this.resources);
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
    warnOnSave() {
      const warnArr = Object.keys(this.settings.warnOnSave);
      warnArr.forEach((element) => {
        const keys = element.split('.');
        const value = get(this.inspector.data, element);
        const warning = this.settings.warnOnSave[element].some((el) => el === value);
        if (warning) {
          this.$store.dispatch('pushNotification', {
            type: 'warning',
            message: `${StringUtil.getUiPhraseByLang('Attention', this.user.settings.language, this.resources.i18n)}! ${StringUtil.getLabelByLang(keys[keys.length - 1], this.user.settings.language, this.resources)}: ${StringUtil.getLabelByLang(value, this.user.settings.language, this.resources)}`,
          });
        }
      });
    },
  },
  watch: {
    'inspector.event'(val) {
      if (val.name === 'open-id-list-modal') {
        this.idListTempPath = val.path;
        this.openIdListModal();
      }
    }
  },
    beforeMount() {
    if (this.isNew) {
      this.initNew();
    } else {
      this.initFromRecord();
    }
    this.$store.dispatch('setInspectorStatusValue', {property: 'editing', value: true});
  },
  unmounted() {
    this.reset();
  },
};
</script>
<template>
  <div class="BulkChanges row">
    <div
      class="col-sm-12"
      :class="{ 'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen }">
    <div class="BulkChanges-new">
      <bulk-changes-header
        :currentBulkChange="currentBulkChange"
        :documentId="documentId"
        :is-new="isNew"
        :is-draft="isDraft"
        :spec-type="specType"
      />
      <div ref="matchForm" v-if="hasMatchForm">
        <form-builder
          :title="formTitle"
          tabindex="0"
          :is-active="isActive('form') && isDraft"
          :form-data="formObj"
          :first-item-active="isFirstActive"
          @onInactive="onInactiveForm"
          @onActive="focusMatchForm"
          @removeIdList="removeIdList"
        />
      </div>
      <div ref="targetForm" v-if="hasTargetForm">
        <target-form-builder
          :title="changesTitle"
          tabindex="0"
          :is-active="isActive('targetForm') && isDraft"
          :form-data="targetFormObj"
          :preview-data="formPreviewData"
          :preview-diff="formPreviewDiff"
          :has-unsaved="hasUnsavedChanges"
          :is-draft="isDraft"
          :spec-type="specType"
          @onInactive="onInactiveTargetForm"
          @onActive="focusTargetForm"
        />
      </div>
      <div v-if="!isRunningOrFinished" ref="preview">
        <preview
          :title="previewTitle"
          tabindex="0"
          :is-active="isActive('preview')"
          :form-data="fullPreview"
          :preview-data="fullPreviewData"
          :preview-diff="fullPreviewDiff"
          :offset="itemOffset"
          :total-items="totalItems"
          :finished="isFinished"
          :has-unsaved="hasUnsavedChanges"
          :spec-type="specType"
          @onActive="focusPreview"
        />
      </div>
      <div class="BulkChanges-result" v-if="isRunningOrFinished">
        <div>
         {{ translatePhrase('Bulk change') }}
            <span class="badge badge-accent2">{{ statusLabel }}</span>
        </div>
        <div class="break"></div>
        <div>
        {{ translatePhrase('See affected records') }}:
        </div>
        <div>
          <reverse-relations
            :main-entity="this.currentBulkChange"
            :compact="true"
            :force-load="true"
            :show-label="false"
          />
        </div>
        <div class="break"></div>
        <div>
        {{ loudOrSilentLabel }}&nbsp
          <input
            :checked="shouldExportAffected"
            type="checkbox"
            :disabled="true"/>
        </div>
      </div>
      <div>
<!--        SPECIFICATION-->
<!--        <pre>{{ this.currentBulkChange }}</pre>-->
<!--        ENTITY FORM-->
<!--        <pre>{{ this.dataObj }}</pre>-->

<!--        RECORD-->
<!--        <pre>{{ this.record }}</pre>-->
      </div>
    </div>
    </div>
    <div class="col-12 col-sm-12"
      :class="{ 'col-md-1 col-md-offset-11': !status.panelOpen, 'col-md-5 col-md-offset-7': status.panelOpen }">
      <div class="Toolbar-container">
        <toolbar
          :show-field-adder="!isActive('preview')"
          :show-undo="!isActive('preview')"
          :form-obj="dataObj"
          :is-set-to-ready="isReady"
          :last-item-active="isLastActive"
          :first-item-active="isFirstActive"
          :has-next="hasNext"
          :has-previous="hasPrevious"
          :finished="isFinished"
          :is-draft="isDraft"
          :loading-preview="this.loadingPreview"
          @ready="run"
          @next="nextStep"
          @previous="previousStep"
          @nextPreview="nextPreview"
          @previousPreview="previousPreview"
          @save="save"
          @setAsDraft="setAsDraft"
          @openIdListModal="openIdListModal"
        />
      </div>
    </div>
    <modal-component
      class="ImportFromIdListModal"
      :title="'Import selection from ID list'"
      v-if="showIdListModal"
      @close="showIdListModal = false">
      <template #modal-body>
        <div class="ImportFromIdListModal-body">
          <div class="ImportFromIdListModal-infoText">
            Ange en länk till en lista med Libris-ID:n (ett ID per rad).
          </div>
          <div class="input-group ImportFromIdListModal-form">
            <label class="input-group-addon ImportFromIdListModal-label" for="id">{{ translatePhrase('URL') }}/{{ translatePhrase('Link') }}</label>
            <input
              name="id"
              class="ImportFromIdListModal-input form-control"
              ref="ImportFromIdListModalInput"
              v-model="idListUri"
              @keyup.enter="setIdListUri" />
            <span class="input-group-btn">
              <button
                class="btn btn-primary btn--md ImportFromIdListModal-confirmButton"
                @click="setIdListUri"
                @keyup.enter="setIdListUri">{{ translatePhrase('Continue') }}</button>
            </span>
          </div>
        </div>
      </template>
    </modal-component>
    <modal-component
      :title="'Overwrite warning'"
      :width="'600px'"
      @close="closeOverwriteModal"
      v-if="showOverwriteWarning">
      <template #modal-header>
        <div class="Modal-header">
          <header>
            {{ translatePhrase('Note') }}
          </header>
        </div>
      </template>
      <template #modal-body>
        <div class="Modal-body">
          <p>
             {{ translatePhrase('Changes in') }}
            <i>
              {{this.formTitle}}
            </i>
            {{ translatePhrase('will reset') }}
            <i>
              {{this.changesTitle}}.
            </i>
          </p>
          <div class="Modal-buttonContainerCol">
            <button class="btn btn-info btn--md" @click="closeOverwriteModal()">{{ translatePhrase('Ok') }}</button>
          </div>
        </div>
      </template>
    </modal-component>
    <modal-component
      :title="'Confirm run'"
      :width="'600px'"
      @close="closeConfirmRunModal"
      v-if="showConfirmRunModal">
      <template #modal-header>
        <div class="Modal-header">
          <header>
            {{ translatePhrase('Confirm run') }}
          </header>
        </div>
      </template>
      <template #modal-body>
        <div class="Modal-body">
          <p>
            {{ loudOrSilentLabel }}&nbsp
            <input
              :checked="shouldExportAffected"
              type="checkbox"
              :disabled="!isDraft"
              @change="toggleExportAffected()"/>
          </p>
          <div class="Modal-buttonContainer">
            <button class="btn btn-primary btn--md" @click="doRun()">
              {{ translatePhrase('Run') }}</button>
            <button class="btn btn-info btn--md" @click="closeConfirmRunModal()">{{ translatePhrase('Cancel') }}</button>
          </div>
        </div>
      </template>
    </modal-component>
  </div>
</template>

<style scoped lang="less">
.BulkChanges {
  &-result {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    background-color: @white;
    border: 1px solid @grey-lighter;
    padding:  20px;
  }
  &-loudOrSilentLabel {
    margin-left: auto;
    text-align: right;
  }
  .break {
    flex-basis: 100%;
    padding: 4px;
    height: 0;
  }
}

.ImportFromIdListModal {
  .ModalComponent-container {
    width: 650px;
    top: 40%;
  }
  &-body {
    padding: 1em;
    width: 100%;
  }
  &-label {
    color: @black;
  }
  &-infoText {
    margin-bottom: 1em;
  }
  &-input {
    //width: 50%;
    color: @black;
  }
  &-confirmButton {
    box-shadow: none;
  }
}
.Modal {
  &-body {
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 15px 45px;
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
