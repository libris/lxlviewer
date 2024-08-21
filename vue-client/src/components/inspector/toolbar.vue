<script>
/*
  Fixed toolbar
*/
import { vOnClickOutside } from '@vueuse/components';
import { mapGetters } from 'vuex';
import { get, pick, set } from 'lodash-es';
import * as LxlDataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import * as HttpUtil from '@/utils/http';
import * as LayoutUtil from '@/utils/layout';
import { translatePhrase, labelByLang, convertResourceLink } from '@/utils/filters';
import FieldAdder from '@/components/inspector/field-adder.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';

export default {
  mixins: [LensMixin, FormMixin],
  directives: {
    'on-click-outside': vOnClickOutside,
  },
  props: {
    fieldAdderOpen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showAdminInfoDetails: false,
      otherFormatMenuActive: false,
      toolsMenuActive: false,
      loadingEdit: false,
      showEdit: false,
      showTools: false,
      showDisplayAs: false,
      showUndo: false,
      showSave: false,
      showCancel: false,
      showFieldAdderTooltip: false,
      showClarifySave: false,
      showMarcPreview: false,
      showEmbellishTemplateSubMenu: false,
      showEmbellishFromRecordSubMenu: false,
      fieldAdderActive: false,
    };
  },
  watch: {
    'inspector.status.editing'(state) {
      if (state) {
        this.loadingEdit = false;
      }
    },
    'inspector.event'(val) {
      if (val.name === 'form-control') {
        switch (val.value) {
          case 'edit-item':
            this.edit();
            break;
          case 'open-field-adder':
            this.openFieldAdder();
            break;
          case 'undo':
            this.undo();
            break;
          case 'cancel-edit':
            this.cancel();
            break;
          case 'save-item':
            this.recordControl('save-record');
            break;
          case 'save-item-done':
            this.recordControl('save-record-done');
            break;
          case 'admin-data-on':
            this.toggleEditorFocus();
            break;
          case 'admin-data-off':
            this.toggleEditorFocus();
            break;
          case 'preview-marc':
            this.openMarc();
            break;
          case 'open-help':
            this.openHelpWindow();
            break;
          default:
        }
      }
    },
    'status.keyActions'(value) {
      this.formControl(value[value.length - 1]);
    },
  },
  methods: {
    translatePhrase,
    labelByLang,
    convertResourceLink,
    getKeybindText(eventName) {
      return LayoutUtil.getKeybindingText(eventName);
    },
    openTemplatePicker() {
      this.$refs.TemplatePicker.click();
    },
    openOverridePicker() {
      this.$refs.OverridePicker.click();
    },
    applyFileAsOverride(data) {
      const splitData = LxlDataUtil.splitJson(data);
      this.$refs.OverridePicker.value = ''; // Important: reset the picker
      if (splitData.record['@id'] === this.inspector.data.record['@id']) {
        this.$store.dispatch('pushInspectorEvent', {
          name: 'apply-override',
          value: splitData,
        });
      } else {
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: StringUtil.getUiPhraseByLang('New data @id does not match existing @id', this.user.settings.language, this.resources.i18n),
        });
      }
    },
    applyFileTemplate(data) {
      this.hideToolsMenu();
      const inspectorObj = LxlDataUtil.splitJson(data);
      const preparedData = RecordUtil.prepareDuplicateFor(inspectorObj, this.user, this.settings.keysToClear.duplication);
      const splitData = LxlDataUtil.splitJson(preparedData);
      this.$refs.TemplatePicker.value = ''; // Important: reset the picker
      this.$store.dispatch('pushInspectorEvent', {
        name: 'apply-template',
        value: splitData,
      });
    },
    applyRecordAsTemplate() {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', {
        name: 'open-embellish-from-id',
      });
    },
    detailedApplyRecordAsTemplate() {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', {
        name: 'open-detailed-embellish-from-id',
      });
    },
    initOverridePicker() {
      this.hideToolsMenu();
      const self = this;
      this.$refs.OverridePicker.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onloadend = function onloadend() {
          try {
            const data = JSON.parse(this.result);
            self.applyFileAsOverride(data);
          } catch (error) {
            const msg = [
              StringUtil.getUiPhraseByLang('Something went wrong', self.settings.language, self.resources.i18n),
              StringUtil.getUiPhraseByLang('Verify structure in template', self.settings.language, self.resources.i18n),
            ];
            self.$store.dispatch('pushNotification', { type: 'danger', message: msg.join() });
          }
        };
        reader.readAsText(e.target.files[0]);
      });
    },
    initTemplatePicker() {
      this.hideToolsMenu();
      const self = this;
      this.$refs.TemplatePicker.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onloadend = function onloadend() {
          try {
            const data = JSON.parse(this.result);
            self.applyFileTemplate(data);
          } catch (error) {
            const msg = [
              StringUtil.getUiPhraseByLang('Something went wrong', self.settings.language, self.resources.i18n),
              StringUtil.getUiPhraseByLang('Verify structure in template', self.settings.language, self.resources.i18n),
            ];
            self.$store.dispatch('pushNotification', { type: 'danger', message: msg.join() });
          }
        };
        reader.readAsText(e.target.files[0]);
      });
    },
    openFieldAdder() {
      if (!this.fieldAdderActive) {
        this.fieldAdderActive = true;
      } else {
        this.fieldAdderActive = false;
      }
    },
    showOtherFormatMenu() {
      this.otherFormatMenuActive = !this.otherFormatMenuActive;
    },
    hideOtherFormatMenu() {
      this.otherFormatMenuActive = false;
    },
    hideToolsMenu() {
      this.toolsMenuActive = false;
      this.showEmbellishTemplateSubMenu = false;
      this.showEmbellishFromRecordSubMenu = false;
    },
    showToolsMenu() {
      this.toolsMenuActive = !this.toolsMenuActive;
    },
    getOtherDataFormat(suffix) {
      return `${this.focusData['@id']}/data.${suffix}`;
    },
    openHelpWindow() {
      const helpUrl = 'https://libris.kb.se/katalogisering/help';
      window.open(helpUrl);
    },
    formControl(control) {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'form-control',
        value: control,
      });
    },
    recordControl(control) {
      // if (!this.inspector.status.updating) {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: control,
      });
      // }
    },
    toggleEditorFocus() {
      if (this.inspector.status.focus === 'record') {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'focus',
          value: 'mainEntity',
        });
      } else {
        this.$store.dispatch('setInspectorStatusValue', {
          property: 'focus',
          value: 'record',
        });
      }
    },
    createMessage(templateId) {
      const template = this.templates.combined['messages'].find(t => t['@id'] === templateId).value;
      const preparedTemplate = RecordUtil.prepareDuplicateFor(template, this.user, this.settings.keysToClear.duplication);
      set(preparedTemplate, ['@graph', 1, 'concerning'], [pick(this.inspector.data.mainEntity, '@id')]);
      if (preparedTemplate['@graph'][1].hasOwnProperty('descriptionCreator')) {
        set(preparedTemplate, ['@graph', 1, 'descriptionCreator'], {'@id': StringUtil.getLibraryUri(this.user.settings.activeSigel)});
      }
      this.$store.dispatch('setInsertData', preparedTemplate);
      this.$router.push({ path: '/new' });
    },
    openMarc() {
      if (this.enableMarcPreview) {
        this.hideToolsMenu();
        this.$store.dispatch('pushInspectorEvent', {
          name: 'record-control',
          value: 'open-marc-preview',
        });
      }
    },
    applyTemplate(template) {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', {
        name: 'apply-template',
        value: template.value,
      });
    },
    closeMarc() {
      this.showMarcPreview = false;
    },
    cancel() {
      this.$store.dispatch('flushExtractItemsOnSave');
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'cancel',
      });
    },
    undo() {
      this.showUndo = false;
      this.$store.dispatch('undoInspectorChange');
    },
    edit() {
      this.$store.dispatch('pushInspectorEvent', {
        name: 'record-control',
        value: 'start-edit',
      });
    },
    navigateFormChanges(direction) {
      this.navigateChangeHistory(this.inspector.status.focus, direction);
    },
    toggleAdminData() {
      this.showAdminInfoDetails = !this.showAdminInfoDetails;
    },
    isSubClassOf(type) {
      return VocabUtil.isSubClassOf(
        this.inspector.data.mainEntity['@type'],
        type,
        this.resources.vocab,
        this.resources.context,
      );
    },
    isInReadOnlyDataset(record) {
      // TODO: get from backend
      // TODO: implement proper access control mechanism in backend
      return (record.inDataset || []).find((dataset) => {
        const id = dataset['@id'] || '';
        return id.startsWith('https://id.kb.se/dataset/')
          || id.startsWith('https://libris.kb.se/dataset/');
      });
    },
    download(text) {
      let focusId = this.inspector.data.record['@id'];
      if (this.recordType === 'Item') {
        focusId = this.inspector.data.mainEntity.itemOf['@id'].split('#')[0];
      }
      const element = document.createElement('a');
      const blob = new Blob([`${text}`], { type: 'application/marc' });
      element.href = window.URL.createObjectURL(blob);
      const splitIdParts = focusId.split('/');
      const id = splitIdParts[splitIdParts.length - 1];
      element.download = id;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    getCompiledRecord() {
      HttpUtil.get({ url: this.compileMARCUrl }).then((response) => {
        this.download(response);
      }, (error) => {
        this.$store.dispatch(
          'pushNotification',
          { type: 'danger',
            message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${StringUtil.getUiPhraseByLang(error, this.user.settings.language, this.resources.i18n)}` },
        );
      });
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'templates',
      'user',
      'settings',
      'status',
    ]),
    isMyHolding() {
      if (!VocabUtil.isSubClassOf(this.recordType, 'Item', this.resources.vocab, this.resources.context)) {
        return false;
      }
      if (this.inspector.data.mainEntity.heldBy && this.inspector.data.mainEntity.heldBy['@id'] === this.activeSigelId) {
        return true;
      }
      const componentList = this.inspector.data.mainEntity.hasComponent;
      if (typeof componentList !== 'undefined') {
        for (const component of componentList) {
          if (component.heldBy && component.heldBy['@id'] === this.activeSigelId) {
            return true;
          }
        }
      }
      return false;
    },
    compiledIsAvailable() {
      if (
        (this.recordType === 'Instance' || (this.isMyHolding && this.inspector.data.mainEntity.itemOf))
        && this.hasSigel
        && !this.inspector.status.editing
        && this.user.email !== ''
      ) {
        return true;
      }
      return false;
    },
    validTemplates() {
      const type = this.inspector.data.mainEntity['@type'];
      const baseType = VocabUtil.getRecordType(type, this.resources.vocab, this.resources.context);
      const templates = VocabUtil.getValidTemplates(type, this.templates.combined[baseType.toLowerCase()], this.resources.vocabClasses, this.resources.context);
      return templates.sort((a, b) => a.label.localeCompare(b.label));
    },
    formObj() {
      return this.inspector.data[this.inspector.status.focus];
    },
    allowed() {
      return VocabUtil.getPropertiesFromArray(
        this.formObj['@type'],
        this.resources.vocabClasses,
        this.resources.vocabProperties,
        this.resources.context,
      );
    },
    recordType() {
      return VocabUtil.getRecordType(
        this.inspector.data.mainEntity['@type'],
        this.resources.vocab,
        this.resources.context,
      );
    },
    userIsPermittedToEdit() {
      const mainEntity = this.inspector.data.mainEntity;
      const record = this.inspector.data.record;
      if (this.user.isLoggedIn === false) {
        return false;
      }
      if (record['@type'] !== 'Record') {
        return false;
      }
      if (VocabUtil.isSubClassOf(
        mainEntity['@type'],
        'Item',
        this.resources.vocab,
        this.resources.context,
      )) {
        return this.isMyHolding || this.user.isGlobalRegistrant();
      }
      if (VocabUtil.isSubClassOf(
        mainEntity['@type'],
        'Concept',
        this.resources.vocab,
        this.resources.context,
      )
        && (!this.user.uriMinter
        || !this.user.uriMinter.findContainerForEntity(
          mainEntity,
          { '@id': this.user.getActiveLibraryUri() },
        ))) {
        return false;
      }
      if (this.isInReadOnlyDataset(record)) {
        return false;
      }
      if (mainEntity['@type'] === 'ShelfMarkSequence') {
        const ownedBy = get(this.inspector, ['data', 'record', 'descriptionCreator', '@id']);
        return this.user.getActiveLibraryUri() === ownedBy;
      }
      return true;
    },
    userIsPermittedToRemove() {
      const record = this.inspector.data.record;
      if (record['@type'] === 'CacheRecord' || record['@type'] === 'PlaceholderRecord') {
        return true;
      }
      return this.userIsPermittedToEdit;
    },
    showRecord() {
      return this.status.showRecord;
    },
    downloadIsSupported() {
      const a = document.createElement('a');
      return typeof a.download !== 'undefined';
    },
    activeSigelId() {
      return this.user.getActiveLibraryUri();
    },
    compileMARCUrl() {
      let focusId = this.inspector.data.record['@id'];
      if (this.recordType === 'Item') {
        focusId = this.inspector.data.mainEntity.itemOf['@id'].split('#')[0];
      }
      return `/_compilemarc?library=${this.activeSigelId}&id=${focusId}`;
    },
    enableMarcPreview() {
      if (this.recordType === 'Work') {
        return false;
      }
      return true;
    },
    hasSigel() {
      return typeof this.user.settings.activeSigel !== 'undefined';
    },
    focusData() {
      return this.inspector.data.record;
    },
    editing() {
      return this.inspector.status.editing;
    },
    isNewRecord() {
      return this.inspector.data.record['@id'] === 'https://id.kb.se/TEMPID';
    },
    hasLocalWork() {
      return (typeof this.inspector.data.work !== 'undefined');
    },
  },
  components: {
    'field-adder': FieldAdder,
  },
  mounted() {
    this.$nextTick(() => {
      this.initTemplatePicker();
      this.initOverridePicker();
    });
  },
};
</script>

<template>
  <div class="Toolbar" id="editor-container">
    <input type="file" class="TemplatePicker" ref="TemplatePicker" accept=".jsonld,application/ld+json,text/*" tabindex="-1" aria-hidden="true" />
    <input type="file" class="OverridePicker" ref="OverridePicker" accept=".jsonld,application/ld+json,text/*" tabindex="-1" aria-hidden="true" />
    <div
      class="dropdown Toolbar-menu OtherFormatMenu"
      v-if="!inspector.status.editing"
      v-on-click-outside="hideOtherFormatMenu">
      <button
        class="Toolbar-btn btn btn-default OtherFormatMenu-button"
        @click="showOtherFormatMenu"
        aria-haspopup="true"
        aria-expanded="true"
        v-tooltip.left="translatePhrase('Show as')"
        @focus="showDisplayAs = true"
        @blur="showDisplayAs = false"
        @mouseover="showDisplayAs = true"
        @mouseout="showDisplayAs = false"
        :aria-label="translatePhrase('Show as')">
        <i class="fa fa-fw fa-eye" aria-hidden="true" />
        <span class="Toolbar-caret caret" />
      </button>
      <ul
        class="dropdown-menu Toolbar-menuList OtherFormatMenu-menu"
        v-show="otherFormatMenuActive"
        @click="hideOtherFormatMenu">
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="convertResourceLink(focusData.mainEntity['@id'])" target="_blank">
            <i class="fa fa-fw fa-external-link" aria-hidden="true" />
            Formell resurs</a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="convertResourceLink(getOtherDataFormat('jsonld'))" target="_blank">
            <i class="fa fa-fw fa-external-link" aria-hidden="true" />
            JSON-LD</a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="convertResourceLink(getOtherDataFormat('ttl'))" target="_blank">
            <i class="fa fa-fw fa-external-link" aria-hidden="true" />
            Turtle</a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="convertResourceLink(getOtherDataFormat('rdf'))">
            <i class="fa fa-fw fa-download" aria-hidden="true" />
            RDF/XML</a>
        </li>
      </ul>
    </div>

    <div
      class="dropdown Toolbar-menu ToolsMenu"
      v-on-click-outside="hideToolsMenu">
      <button
        class="Toolbar-btn btn btn-default ToolsMenu-button"
        @click="showToolsMenu"
        aria-haspopup="true"
        aria-expanded="true"
        v-tooltip.left="translatePhrase('Tools')"
        @mouseover="showTools = true"
        @mouseout="showTools = false"
        :aria-label="translatePhrase('Tools')">
        <i class="fa fa-fw fa-wrench" aria-hidden="true" />
        <span class="Toolbar-caret caret" />
      </button>
      <ul
        class="dropdown-menu Toolbar-menuList ToolsMenu-menu"
        v-show="toolsMenuActive">
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="formControl('expand-item'), hideToolsMenu()">
            <i class="fa fa-fw fa-expand" aria-hidden="true" />
            {{ translatePhrase("Expand all") }}{{ getKeybindText('expand-item') ? ` (${getKeybindText('expand-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="formControl('collapse-item'), hideToolsMenu()">
            <i class="fa fa-fw fa-compress" aria-hidden="true" />
            {{ translatePhrase("Collapse all") }}{{ getKeybindText('collapse-item') ? ` (${getKeybindText('collapse-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="user.isLoggedIn && !inspector.status.editing && !isSubClassOf('Item')">
          <a class="Toolbar-menuLink" @click="formControl('duplicate-item'), hideToolsMenu()">
            <i class="fa fa-fw fa-files-o" />
            {{ translatePhrase("Make copy") }}{{ getKeybindText('duplicate-item') ? ` (${getKeybindText('duplicate-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="user.isLoggedIn && !inspector.status.editing && isSubClassOf('Instance') && !isSubClassOf('Electronic')">
          <a class="Toolbar-menuLink" @click="recordControl('create-digital-reproduction'), hideToolsMenu()">
            <i class="fa fa-fw fa-wpforms" />
            {{ translatePhrase("Create digital reproduction") }}{{ getKeybindText('create-digital-reproduction') ? ` (${getKeybindText('create-digital-reproduction')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem" :class="{ 'is-active': showEmbellishTemplateSubMenu }" v-if="user.isLoggedIn && inspector.status.editing">
          <a class="Toolbar-menuLink" @click="showEmbellishTemplateSubMenu = !showEmbellishTemplateSubMenu">
            <i class="fa fa-fw fa-clipboard" />
            <span>{{ translatePhrase("Embellish from template") }}{{ getKeybindText('embellish-from-template') ? ` (${getKeybindText('embellish-from-template')})` : ''}}</span>
            <span class="submenuControl"><i class="fa fa-fw" :class="{ 'fa-caret-down': showEmbellishTemplateSubMenu, 'fa-caret-right': !showEmbellishTemplateSubMenu }" /></span>
          </a>
        </li>
        <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishTemplateSubMenu && validTemplates.length === 0">
          <span class="Toolbar-menuLink">
            <i class="fa fa-fw fa-exclamation" />
            {{ translatePhrase("No matching templates") }}
          </span>
        </li>
        <li class="Toolbar-menuItem inSubMenu" v-for="(value, key) in validTemplates" v-show="showEmbellishTemplateSubMenu" :key="key">
          <a class="Toolbar-menuLink" @click="applyTemplate(value)">
            <i class="fa fa-fw fa-plus" />
            {{ value.label }}
          </a>
        </li>
        <li class="Toolbar-menuItem" :class="{ 'is-active': showEmbellishFromRecordSubMenu }" v-if="user.isLoggedIn && inspector.status.editing">
          <a class="Toolbar-menuLink" @click="showEmbellishFromRecordSubMenu = !showEmbellishFromRecordSubMenu">
            <i class="fa fa-fw fa-clipboard" />
            <span>{{ translatePhrase("Embellish from record") }}{{ getKeybindText('embellish-from-record') ? ` (${getKeybindText('embellish-from-record')})` : ''}}</span>
            <span class="submenuControl"><i class="fa fa-fw" :class="{ 'fa-caret-down': showEmbellishFromRecordSubMenu, 'fa-caret-right': !showEmbellishFromRecordSubMenu }" /></span>
          </a>
        </li>
        <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishFromRecordSubMenu">
          <a class="Toolbar-menuLink" @click="applyRecordAsTemplate">
            <i class="fa fa-fw fa-chain" />
            {{ translatePhrase('From ID') }}
          </a>
        </li>
        <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishFromRecordSubMenu">
          <a class="Toolbar-menuLink" @click="openTemplatePicker">
            <i class="fa fa-fw fa-upload" />
            {{ translatePhrase('From file') }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="user.isLoggedIn && inspector.status.editing">
          <a class="Toolbar-menuLink" @click="detailedApplyRecordAsTemplate">
            <i class="fa fa-fw fa-clipboard" />
            {{ translatePhrase('Detailed enrichment') }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="compiledIsAvailable">
          <a class="Toolbar-menuLink" v-if="downloadIsSupported" @click="getCompiledRecord()">
            <i class="fa fa-fw fa-download" aria-hidden="true" />
            {{ translatePhrase("Download compiled") }} MARC21
          </a>
          <a class="Toolbar-menuLink" v-if="!downloadIsSupported" :href="convertResourceLink(compileMARCUrl)">
            <i class="fa fa-fw fa-download" aria-hidden="true" />
            {{ translatePhrase("Download compiled") }} MARC21
          </a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="recordControl('download-json'), hideToolsMenu()">
            <i class="fa fa-fw fa-download" aria-hidden="true" />
            {{ translatePhrase("Download") }} JSON-LD<span v-show="inspector.status.editing">&nbsp;({{ translatePhrase('Incl. unsaved changes') }})</span>
          </a>
        </li>
        <li class="Toolbar-menuItem" v-show="!inspector.status.editing">
          <a class="Toolbar-menuLink" @click="createMessage('inquiry')">
            <i class="fa fa-fw fa-question" aria-hidden="true" />
            {{ translatePhrase("Inquiry") }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-show="!inspector.status.editing">
          <a class="Toolbar-menuLink" @click="createMessage('changeNotice'), hideToolsMenu()">
            <i class="fa fa-fw fa-exclamation" aria-hidden="true" />
            {{ translatePhrase("Change notice") }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="enableMarcPreview">
          <a class="Toolbar-menuLink" @click="openMarc()">
            <i class="fa fa-fw fa-eye" aria-hidden="true" />
            {{ translatePhrase("Preview MARC21") }}  {{ getKeybindText('preview-marc') ? ` (${getKeybindText('preview-marc')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem remove-option" v-if="user.isLoggedIn && !inspector.status.isNew && userIsPermittedToRemove">
          <a class="Toolbar-menuLink" @click="recordControl('remove-record')">
            <i class="fa fa-fw fa-trash" aria-hidden="true" />
            {{ translatePhrase("Remove") }} {{ labelByLang(recordType).toLowerCase() }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="user.isLoggedIn && inspector.status.editing && !inspector.status.isNew && user.settings.appTech && userIsPermittedToEdit">
          <a class="Toolbar-menuLink" @click="openOverridePicker">
            <i class="fa fa-fw fa-upload" />
            {{ translatePhrase('Overwrite data') }}
          </a>
        </li>
      </ul>
    </div>

    <field-adder
      class="FieldAdder--inToolbar Toolbar-btn"
      v-if="inspector.status.editing"
      :entity-type="inspector.data[inspector.status.focus]['@type']"
      :inner="false"
      :allowed="allowedProperties"
      :path="inspector.status.focus"
      :editing-object="inspector.status.focus"
      :in-toolbar="true"
      :force-active="fieldAdderActive" />

    <button
      class="Toolbar-btn btn btn-default toolbar-button"
      :disabled="inspector.changeHistory.length === 0"
      v-show="inspector.status.editing"
      v-tooltip.left="`${translatePhrase('Undo')} (${getKeybindText('undo')})`"
      @click="undo"
      @mouseover="showUndo = true"
      @mouseout="showUndo = false"
      :aria-label="translatePhrase('Undo')">
      <i class="fa fa-undo" aria-hidden="true" />
    </button>

    <button
      class="Toolbar-btn btn btn-default toolbar-button"
      v-show="inspector.status.editing"
      @click="cancel"
      v-tooltip.left="`${translatePhrase('Cancel')} (${getKeybindText('cancel-edit')})`"
      @mouseover="showCancel = true"
      @mouseout="showCancel = false"
      :aria-label="translatePhrase('Cancel')">
      <i class="fa fa-close" aria-hidden="true" />
    </button>

    <button
      class="Toolbar-btn btn btn-default"
      id="saveButton"
      @click="recordControl('save-record')"
      v-if="inspector.status.editing && !isNewRecord"
      @mouseover="showSave = true"
      @mouseout="showSave = false"
      v-tooltip.left="`${translatePhrase('Save')} (${getKeybindText('save-item')})`"
      :aria-label="translatePhrase('Save')">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving" />
      <i class="fa fa-fw fa-save" v-show="!inspector.status.saving" />
    </button>
    <button
      class="Toolbar-btn btn btn-primary"
      id="saveDoneButton"
      @click="recordControl('save-record-done')"
      v-if="inspector.status.editing"
      v-tooltip.left="`${ isNewRecord ? translatePhrase('Create record') : translatePhrase('Save and stop editing') } (${ isNewRecord ? getKeybindText('save-item') : getKeybindText('save-item-done') })`"
      @mouseover="showClarifySave = true"
      @mouseout="showClarifySave = false"
      :aria-label="translatePhrase('Save and stop editing')">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving" />
      <i class="fa fa-fw fa-check" v-show="!inspector.status.saving" />
    </button>

    <button
      class="Toolbar-btn btn btn-primary edit-button"
      id="editButton"
      v-on:click="edit()"
      v-show="!inspector.status.editing && userIsPermittedToEdit"
      v-tooltip.left="`${ translatePhrase('Edit') } (${ getKeybindText('edit-item') })`"
      @mouseover="showEdit = true"
      @mouseout="showEdit = false"
      :aria-label="translatePhrase('Edit')">
      <i class="fa fa-fw fa-pencil-square-o" v-show="!inspector.status.opening" />
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.opening" />
    </button>
  </div>
</template>

<style lang="less">

.Toolbar {
  &-placeholder {
    width: 100%;
  }

  &-container {
    bottom: 10px;
    min-width: 65px;
    position: fixed;
    border: 1px solid #cccccc;
    border: 1px solid #cccccc75;
    background-color: #ececec;
    background-color: #ecececd1;
    padding: 6px;
    border-radius: 0.5em;
    box-shadow: 0px 0px 15px 0px @grey;
    box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);

    @media (min-width: 992px) {
      top: 11em;
      bottom: auto;
      width: 65px;
    }
    @media (min-width: 1200px) {
      padding: 8px;
    }
    @media print {
      display: none;
    }
  }

  &-container {
    z-index: 3;
  }

  &-menu {
    display: inline-block;
  }

  &-btn {
    border-radius: 100%;
    font-size: 20px;
    font-size: 2rem;
    margin: 4px 0;
    width: 50px;
    height: 50px;
    position: relative;

    &:disabled {
      opacity: 0.65;
    }
  }

  &-menuLink {
    & i {
      margin-right: 5px;
    }
  }

  &-caret {
    position: absolute;
    right: 8px;
    bottom: 12px;
  }

  &-menuList {
    display: block;
    top: auto;
    left: 50px;
    bottom: 0;
    padding: 10px 0;
    min-height: 52px;
    max-height: 300px;
    overflow: hidden;
    overflow-y: auto;

    & .Toolbar-menuItem {
      &.is-active {
        font-weight: bold;
      }
      &.inSubMenu {
        background-color: @grey-lighter;
        & a:hover {
          background-color: darken(@grey-lighter, 5%);
        }
      }
      & .Toolbar-menuLink {
        display: flex;
        align-items: center;
        padding: 5px 15px;
        color: @grey-darker;
      }

      & .submenuControl {
        display: flex;
        flex: 1;
        justify-content: flex-end;
        align-items: center;
      }
    }

    @media (min-width: 992px) {
      top: auto;
      left: auto;
      bottom: auto;
      right: 0;
    }

    @media (min-height: 650px) {
      max-height: 400px;
    }

    @media (min-height: 850px) {
      max-height: 550px;
    }

    @media (min-height: 1000px) {
      max-height: none;
    }
  }
  .TemplatePicker, .OverridePicker {
    width: 1px;
    height: 1px;
    opacity: 0;
  }
}

.dropdown.tools,
.dropdown.other-format {
  li > a {
    cursor: pointer;
    padding: 3px 5px;
  }
  .remove-option {
    a {
      &:hover {
        color: @white;
        background-color: #c55252;
      }
    }
  }
}

</style>
