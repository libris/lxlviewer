<script>
import FormBuilder from '@/components/care/form-builder.vue';
import OperationsBuilder from '@/components/care/operations-builder.vue';
import MassChangesHeader from "@/components/care/mass-changes-header.vue";
import { mapGetters } from 'vuex';
import {cloneDeep, get, isEmpty} from 'lodash-es';
import emptyTemplate from './templates/empty.json';
import toolbar from "@/components/inspector/toolbar-simple.vue";
import {labelByLang, translatePhrase} from "@/utils/filters.js";
import Inspector from "@/views/Inspector.vue";
import * as DataUtil from "@/utils/data.js";
import * as StringUtil from 'lxljs/string.js';
import * as HttpUtil from "@/utils/http.js";
import * as RecordUtil from "@/utils/record.js";
import * as LxlDataUtil from "lxljs/data.js";

export default {
  name: 'mass-changes.vue',
  components: { Inspector, toolbar, FormBuilder, OperationsBuilder, MassChangesHeader },
  props: {
    fnurgel: ''
  },
  data() {
    return {
      showOverview: true,
      inlinedIds: [],
      initialData: {
        '@type': 'Instance',
        label: 'test',
        genreForm: [
          {
            '@id': 'https://id.kb.se/term/saogf/Technopop'
          }
        ]
      },
      activeStep: '',
      steps: [
        'form',
        'operations'
      ],
      runSpecifications: [],
      currentBulkChange: {},
      currentSpec: {},
      record: {},
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'status',
      'user',
      'resources',
      'settings'
    ]),
    documentId() {
      return this.fnurgel;
    },
    isNew() {
      return typeof this.documentId === 'undefined';
    },
    dataObj() {
      return this.inspector.data.mainEntity;
    },
    formObj() {
      return this.isActive('form') ? this.inspector.data.mainEntity : this.currentSpec.matchForm;
    },
    opsObj() {
      return this.isActive('operations') ? this.inspector.data.mainEntity : this.currentSpec.targetForm;
    },
    formTitle() {
      return `${this.steps.indexOf('form') + 1}. ${translatePhrase('Form builder')}`
    },
    changesTitle() {
      return `${this.steps.indexOf('operations') + 1}. ${translatePhrase('Changes')}`
    },
  },
  methods: {
    translatePhrase,
    initRunSpecification(defaultName) {
      const bulkChange = emptyTemplate.mainEntity;
      bulkChange.label = defaultName + this.getDateString();

      if (!this.runSpecifications.some((run) => run.label === bulkChange.label)) {
        this.runSpecifications.push(bulkChange);
      }
      this.currentBulkChange = bulkChange;
      this.currentSpec = bulkChange.bulkChangeSpecification;
      this.record = emptyTemplate.record;
    },
    getDateString() {
      const date = new Date();
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    },
    initNew() {
      this.setActive(this.steps[0]);
      this.setFormData(this.initialData);
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
      this.initRunSpecification('Namn-');
      this.currentSpec.matchForm = this.initialData;
      this.currentSpec.targetForm = this.initialData;
      DataUtil.fetchMissingLinkedToQuoted(this.currentBulkChange, this.$store);
    },
    initFromRecord() {
      this.setActive(this.steps[0]);
      this.setFormData(this.initialData);
      this.currentSpec.matchForm = this.initialData;
      this.currentSpec.targetForm = this.initialData; //FIXME: to avoid undefined on init
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
          this.currentSpec = this.currentBulkChange.bulkChangeSpecification;
          this.record = bulkChange.record;
          this.setFormData(this.currentSpec.matchForm);
          this.$store.dispatch('pushInspectorEvent', {
            name: 'record-control',
            value: 'start-edit',
          });
          DataUtil.fetchMissingLinkedToQuoted(this.currentBulkChange, this.$store);
        }
      });
    },
    setFormData(formData) {
      if (typeof formData === 'undefined') {
        return
      }
      this.$store.dispatch('updateInspectorData', {
        changeList: [
          {
            path: 'mainEntity',
            value: formData,
          },
        ],
        addToHistory: false,
      });
    },
    onInactiveForm() {
      let form = cloneDeep(this.inspector.data.mainEntity);
      this.currentSpec.matchForm = DataUtil.appendIds(form);
    },
    onActiveForm() {
      this.setFormData(isEmpty(this.currentSpec.matchForm) ? this.initialData : this.currentSpec.matchForm);
    },
    onInactiveOperations() {
      this.currentSpec.targetForm = cloneDeep(this.inspector.data.mainEntity);
    },
    reset() {
      this.$store.dispatch('setInspectorStatusValue', {
        property: 'editing',
        value: false,
      });

    },
      nextStep() {
      this.setActive(this.steps[this.steps.indexOf(this.activeStep) + 1]);
    },
    previousStep() {
      this.setActive(this.steps[this.steps.indexOf(this.activeStep) - 1]);
    },
    setActive(step) {
      if (!step) return;
      this.activeStep = step;
    },
    isActive(step) {
      return this.activeStep === step;
    },
    save() {
      this.setActive('none');
      this.onInactiveOperations();
      this.saveBulkChange();
    },
    run() {
      this.setRunStatus();
    },
    setRunStatus() {
      this.currentBulkChange.bulkChangeStatus === 'ReadyBulkChange';
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
      console.log('obj to save', JSON.stringify(obj));
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
        if (!this.documentId) {
          const location = `${result.getResponseHeader('Location')}`;
          const locationParts = location.split('/');
          const fnurgel = locationParts[locationParts.length - 1];
          this.warnOnSave();
          this.$router.push({ path: `/${fnurgel}` }); //push current path + fnurgel instead?
        } else {
          this.fetchRecord(this.documentId);
          this.warnOnSave();
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
  beforeMount() {
    if (this.documentId) {
      this.initFromRecord();
    } else {
      this.initNew();
    }
  },
  unmounted() {
    this.reset();
  },
};
</script>
<template>
  <div class="MassChanges row">
    <div
      class="col-sm-12"
      :class="{ 'col-md-11': !status.panelOpen, 'col-md-7': status.panelOpen }">
    <div class="MassChanges-new">
      <mass-changes-header
        :currentBulkChange="this.currentBulkChange"
        :documentId="this.documentId"
        :is-new="this.isNew"
      />
      <form-builder
        :title="formTitle"
        @click="setActive('form')"
        @keyup.enter="setActive('form')"
        tabindex="0"
        :is-active="isActive('form')"
        :form-data="formObj"
        @onInactive="onInactiveForm"
        @onActive="onActiveForm"
      />
      <operations-builder
        :title="changesTitle"
        @click="setActive('operations')"
        @keyup.enter="setActive('operations')"
        tabindex="0"
        :is-active="isActive('operations')"
        :form-data="opsObj"
        @onInactive="onInactiveOperations"
      />
      <div>
        SPECIFICATION
        <pre>{{this.currentBulkChange}}</pre>
        ENTITY FORM
        <pre>{{ this.dataObj }}</pre>
        RECORD
        <pre>{{ this.record }}</pre>
      </div>
    </div>
    </div>
    <div class="col-12 col-sm-12"
      :class="{ 'col-md-1 col-md-offset-11': !status.panelOpen, 'col-md-5 col-md-offset-7': status.panelOpen }">
      <div class="Toolbar-container">
        <toolbar
          :form-obj="dataObj"
        @next="nextStep"
        @previous="previousStep"
        @save="save"
        @run="run"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.MassChanges {
  &-new {

  }

}
</style>
