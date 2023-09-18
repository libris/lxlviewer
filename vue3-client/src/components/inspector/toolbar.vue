<script lang="js">
/*
  Fixed toolbar
*/
import { translatePhrase, convertResourceLink } from '@/utils/filters';
import { getKeybindText } from '@/utils/mixins';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useInspectorStore } from '@/stores/inspector';
import { useStatusStore } from '@/stores/status';
import { useUserStore } from '@/stores/user';
import { useResourcesStore } from '@/stores/resources';
import { useSettingsStore } from '@/stores/settings';
import { get } from 'lodash-es';
import * as LxlDataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import * as HttpUtil from '@/utils/http';
import FieldAdder from '@/components/inspector/field-adder.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import FormMixin from '@/components/mixins/form-mixin.vue';
import { Dropdown } from 'floating-vue';

export default {
  mixins: [LensMixin, FormMixin],
  props: {
    fieldAdderOpen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showAdminInfoDetails: false,
      loadingEdit: false,
      showEdit: false,
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
          case 'duplicate-item':
            this.handleCopy();
            break;
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
    'keyActions'(value) {
      this.formControl(value[value.length - 1]);
    },
  },
  methods: {
    translatePhrase, getKeybindText, convertResourceLink,
    ...mapActions(useStatusStore, ['pushNotification']),
    ...mapActions(useInspectorStore, ['setInspectorStatusValue', 'undoInspectorChange']),
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
        this.event = {
          name: 'apply-override',
          value: splitData,
        };
      } else {
        this.pushNotification({
          type: 'danger',
          message: StringUtil.getUiPhraseByLang('New data @id does not match existing @id', this.user.settings.language, this.resources.i18n),
        });
      }
    },
    applyFileTemplate(data) {
      const inspectorObj = LxlDataUtil.splitJson(data);
      const preparedData = RecordUtil.prepareDuplicateFor(inspectorObj, this.user, this.settings.keysToClear.duplication);
      const splitData = LxlDataUtil.splitJson(preparedData);
      this.$refs.TemplatePicker.value = ''; // Important: reset the picker
      this.event = {
        name: 'apply-template',
        value: splitData,
      };
    },
    applyRecordAsTemplate() {
      this.event = {
        name: 'open-embellish-from-id',
      }
    },
    detailedApplyRecordAsTemplate() {
      this.event = {
        name: 'open-detailed-embellish-from-id',
      };
    },
    initOverridePicker() {
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

            this.pushNotification({
              type: 'danger',
              message: msg.join()
            });
          }
        };
        reader.readAsText(e.target.files[0]);
      });
    },
    initTemplatePicker() {
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

            this.pushNotification({
              type: 'danger',
              message: msg.join()
            });
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
    getOtherDataFormat(suffix) {
      return `${this.focusData['@id']}/data.${suffix}`;
    },
    openHelpWindow() {
      const helpUrl = 'https://libris.kb.se/katalogisering/help';
      window.open(helpUrl);
    },
    formControl(control) {
      this.event = {
        name: 'form-control', 
        value: control, 
      };
    },
    recordControl(control) {
      this.event = {
        name: 'record-control',
        value: control,
      };
    },
    toggleEditorFocus() {
      if (this.inspector.status.focus === 'record') {
        this.setInspectorStatusValue({
          property: 'focus',
          value: 'mainEntity',
        });
      } else {
        this.setInspectorStatusValue({
          property: 'focus',
          value: 'record',
        });
      }
    },
    openMarc() {
      if (this.enableMarcPreview) {
        this.event = {
          name: 'record-control',
          value: 'open-marc-preview',
        };
      }
    },
    applyTemplate(template) {
      this.event = {
        name: 'apply-template',
        value: template.value,
      };
    },
    closeMarc() {
      this.showMarcPreview = false;
    },
    cancel() {
      this.event = {
        name: 'record-control', 
        value: 'cancel',
      };
    },
    undo() {
      this.showUndo = false;
      this.undoInspectorChange();
    },
    edit() {
      this.event = { 
        name: 'record-control', 
        value: 'start-edit', 
      };
    },
    navigateFormChanges(direction) {
      this.navigateChangeHistory(this.inspector.status.focus, direction);
    },
    toggleAdminData() {
      this.showAdminInfoDetails = !this.showAdminInfoDetails;
    },
    isSubClassOf(type) {
      const baseClasses = VocabUtil.getBaseClasses(
        this.inspector.data.mainEntity['@type'], 
        this.resources.vocab, 
        this.resources.context,
      ).map(id => StringUtil.getCompactUri(id, this.resources.context));
      return baseClasses.indexOf(type) > -1;
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
        this.pushNotification({
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.resources.i18n)} - ${StringUtil.getUiPhraseByLang(error, this.user.settings.language, this.resources.i18n)}`
        });
      });
    },
    handleCopy() {
      if (this.user.isLoggedIn) {
        this.$parent.$emit('duplicate-item');
      }
    },
  },
  computed: {
    ...mapState(useResourcesStore, ['resources', 'templates']),
    ...mapState(useInspectorStore, ['inspector']),
    ...mapWritableState(useInspectorStore, ['event']),
    ...mapState(useStatusStore, ['keyActions']),
    ...mapState(useUserStore, ['user']),
    ...mapState(useSettingsStore, ['settings']),
    isMyHolding() {
      if (this.recordType !== 'Item') {
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
        (this.recordType === 'Instance' || this.isMyHolding)
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
      if (mainEntity['@type'] === 'Item') {
        if (this.isMyHolding || this.user.isGlobalRegistrant()) {
          return true;
        }
        return false;
      }
      if (VocabUtil.isSubClassOf(mainEntity['@type'], 'Concept',
        this.resources.vocab, this.resources.context)
        && (!this.user.uriMinter
        || !this.user.uriMinter.findContainerForEntity(mainEntity,
          { '@id': this.user.getActiveLibraryUri() }))) {
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
    Dropdown,
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
    <input type="file" class="TemplatePicker" ref="TemplatePicker" accept=".jsonld,application/ld+json,text/*" tabindex="-1" aria-hidden="true"/>
    <input type="file" class="OverridePicker" ref="OverridePicker" accept=".jsonld,application/ld+json,text/*" tabindex="-1" aria-hidden="true"/>

    <Dropdown>
      <div class="Toolbar-menu OtherFormatMenu">
        <button
          class="Toolbar-btn btn btn-default OtherFormatMenu-button" 
          @click="showOtherFormatMenu" 
          aria-haspopup="true" 
          aria-expanded="true" 
          v-tooltip.left="translatePhrase('Show as')"
          :aria-label="translatePhrase('Show as')"
          v-if="!inspector.status.editing"
        >
          <font-awesome-icon :icon="['fas', 'eye']" />
          <span class="Toolbar-caret caret">
            <font-awesome-icon :icon="['fas', 'caret-down']" size="2xs" />
          </span>
        </button>
      </div>

      <template #popper>
        <div class="Toolbar-menu OtherFormatMenu">
          <ul class="Toolbar-menuList OtherFormatMenu-menu">
              <li class="Toolbar-menuItem">
                <a class="Toolbar-menuLink" :href="convertResourceLink(focusData.mainEntity['@id'])" target="_blank" v-close-popper>
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
                  Formell resurs
                </a>
              </li>
              <li class="Toolbar-menuItem">
                <a class="Toolbar-menuLink" :href="convertResourceLink(getOtherDataFormat('jsonld'))" target="_blank" v-close-popper>
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
                  JSON-LD
                </a>
              </li>
              <li class="Toolbar-menuItem">
                <a class="Toolbar-menuLink" :href="convertResourceLink(getOtherDataFormat('ttl'))" target="_blank" v-close-popper>
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
                  Turtle
                </a>
              </li>
              <li class="Toolbar-menuItem">
                <a class="Toolbar-menuLink" :href="convertResourceLink(getOtherDataFormat('rdf'))" v-close-popper>
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
                  RDF/XML
                </a>
              </li>
            </ul>
          </div>
      </template>
    </Dropdown>

    <Dropdown>
      <div class="Toolbar-menu OtherFormatMenu">
        <button
          class="Toolbar-btn btn btn-default ToolsMenu-button" 
          aria-haspopup="true"
          aria-expanded="true"
          v-tooltip.left="translatePhrase('Tools')"
          :aria-label="translatePhrase('Tools')"
        >
          <font-awesome-icon :icon="['fa', 'wrench']" />
          <span class="Toolbar-caret caret">
            <font-awesome-icon :icon="['fas', 'caret-down']" size="2xs" />
          </span>
        </button>
      </div>

      <template #popper>
        <div class="Toolbar-menu OtherFormatMenu">
          <ul class="Toolbar-menuList OtherFormatMenu-menu">
            <li class="Toolbar-menuItem">
              <a class="Toolbar-menuLink" @click="formControl('expand-item')" v-close-popper>
                <font-awesome-icon :icon="['fas', 'expand']" aria-hidden="true" />
                {{translatePhrase("Expand all")}}{{ getKeybindText('expand-item') ? ` (${getKeybindText('expand-item')})` : ''}}
              </a>
            </li>

            <li class="Toolbar-menuItem">
              <a class="Toolbar-menuLink" @click="formControl('collapse-item')" v-close-popper>
                <font-awesome-icon :icon="['fas', 'compress']" aria-hidden="true" />
                {{translatePhrase("Collapse all")}}{{ getKeybindText('collapse-item') ? ` (${getKeybindText('collapse-item')})` : ''}}
              </a>
            </li>

            <li class="Toolbar-menuItem" v-if="user.isLoggedIn && !inspector.status.editing && !isSubClassOf('Item')">
              <a class="Toolbar-menuLink"  @click="formControl('duplicate-item')" v-close-popper>
                <font-awesome-icon :icon="['fas', 'copy']" />
                {{ translatePhrase("Make copy") }}{{ getKeybindText('duplicate-item') ? ` (${getKeybindText('duplicate-item')})` : ''}}
              </a>
            </li>

            <li class="Toolbar-menuItem" v-if="user.isLoggedIn && !inspector.status.editing && isSubClassOf('Instance') && !isSubClassOf('Electronic')">
              <a class="Toolbar-menuLink"  @click="recordControl('create-digital-reproduction')" v-close-popper>
                <font-awesome-icon :icon="['fab', 'wpforms']" />
                {{ translatePhrase("Create digital reproduction") }}{{ getKeybindText('create-digital-reproduction') ? ` (${getKeybindText('create-digital-reproduction')})` : ''}}
              </a>
            </li>

            <li class="Toolbar-menuItem" :class="{'is-active': showEmbellishTemplateSubMenu}" v-if="user.isLoggedIn && inspector.status.editing">
              <a class="Toolbar-menuLink" @click="showEmbellishTemplateSubMenu = !showEmbellishTemplateSubMenu" v-close-popper>
                <font-awesome-icon :icon="['fas', 'clipboard']" />
                <span>{{ translatePhrase("Embellish from template") }}{{ getKeybindText('embellish-from-template') ? ` (${getKeybindText('embellish-from-template')})` : ''}}</span>
                <span class="submenuControl">
                  <font-awesome-icon :icon="['fas', 'caret-down']" v-if="showEmbellishTemplateSubMenu" />
                  <font-awesome-icon :icon="['fas', 'caret-right']" v-if="!showEmbellishTemplateSubMenu" />
                </span>
              </a>
            </li>

            <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishTemplateSubMenu && validTemplates.length === 0">
              <span class="Toolbar-menuLink">
                <font-awesome-icon :icon="['fas', 'exclamation']" />
                {{ translatePhrase("No matching templates") }}
              </span>
            </li>

            <li class="Toolbar-menuItem inSubMenu" v-for="(value, key) in validTemplates" v-show="showEmbellishTemplateSubMenu" :key="key">
              <a class="Toolbar-menuLink" @click="applyTemplate(value)" v-close-popper>
              <font-awesome-icon :icon="['fas', 'plus']" />
              {{ value.label }}
              </a>
            </li>

            <li class="Toolbar-menuItem" :class="{'is-active': showEmbellishFromRecordSubMenu}" v-if="user.isLoggedIn && inspector.status.editing">
              <a class="Toolbar-menuLink" @click="showEmbellishFromRecordSubMenu = !showEmbellishFromRecordSubMenu" v-close-popper>
                <font-awesome-icon :icon="['fas', 'clipboard']" />
                <span>{{ translatePhrase("Embellish from record") }}{{ getKeybindText('embellish-from-record') ? ` (${getKeybindText('embellish-from-record')})` : ''}}</span>
                <span class="submenuControl">
                  <font-awesome-icon :icon="['fas', 'caret-down']" v-if="showEmbellishFromRecordSubMenu" />
                  <font-awesome-icon :icon="['fas', 'caret-right']" v-if="!showEmbellishFromRecordSubMenu" />
                </span>
              </a>
            </li>

            <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishFromRecordSubMenu">
              <a class="Toolbar-menuLink" @click="applyRecordAsTemplate" v-close-popper>
                <font-awesome-icon :icon="['fas', 'link']" />
                {{ translatePhrase('From ID') }}
              </a>
            </li>

            <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishFromRecordSubMenu">
              <a class="Toolbar-menuLink" @click="openTemplatePicker" v-close-popper>
                <font-awesome-icon :icon="['fas', 'upload']" />
                {{ translatePhrase('From file') }}
              </a>
            </li>

            <li class="Toolbar-menuItem" v-if="user.isLoggedIn && inspector.status.editing">
              <a class="Toolbar-menuLink" @click="detailedApplyRecordAsTemplate" v-close-popper>
                <font-awesome-icon :icon="['fas', 'clipboard']" />
                {{ translatePhrase('Detailed enrichment') }}
              </a>
            </li>

            <li class="Toolbar-menuItem" v-if="compiledIsAvailable">
              <a class="Toolbar-menuLink" v-if="downloadIsSupported" @click="getCompiledRecord()" v-close-popper>
                <font-awesome-icon :icon="['fas', 'download']" aria-hidden="true" />
                {{ translatePhrase("Download compiled") }} MARC21
              </a>

              <a class="Toolbar-menuLink"  v-if="!downloadIsSupported" :href="compileMARCUrl | convertResourceLink" v-close-popper>
                <font-awesome-icon :icon="['fas', 'download']" aria-hidden="true" />
                {{ translatePhrase("Download compiled") }} MARC21
              </a>
            </li>

            <li class="Toolbar-menuItem">
              <a class="Toolbar-menuLink" @click="recordControl('download-json')" v-close-popper>
                <font-awesome-icon :icon="['fas', 'download']" aria-hidden="true" />
                {{ translatePhrase("Download") }} JSON-LD<span v-show="inspector.status.editing">&nbsp;({{ translatePhrase('Incl. unsaved changes')}})</span>
              </a>
            </li>

            <li class="Toolbar-menuItem" v-if="enableMarcPreview">
              <a class="Toolbar-menuLink" @click="openMarc()" v-close-popper>
                <font-awesome-icon :icon="['fas', 'eye']" aria-hidden="true" />
                {{ translatePhrase("Preview MARC21") }} {{ getKeybindText('preview-marc') ? ` (${getKeybindText('preview-marc')})` : ''}}
              </a>
            </li>

            <li class="Toolbar-menuItem remove-option" v-if="user.isLoggedIn && !inspector.status.isNew && userIsPermittedToRemove">
              <a class="Toolbar-menuLink"  @click="recordControl('remove-record')" v-close-popper>
                <font-awesome-icon :icon="['fas', 'trash-can']" aria-hidden="true" />
                {{ translatePhrase("Remove") }} {{ recordType | labelByLang | lowercase }}
              </a>
            </li>

            <li class="Toolbar-menuItem" v-if="user.isLoggedIn && inspector.status.editing && !inspector.status.isNew && user.settings.appTech && userIsPermittedToEdit">
              <a class="Toolbar-menuLink" @click="openOverridePicker" v-close-popper>
                <font-awesome-icon :icon="['fas', 'upload']" />
                {{ translatePhrase('Overwrite data') }}
              </a>
            </li>
          </ul>
        </div>
      </template>
    </Dropdown>

    <field-adder
      class="FieldAdder--inToolbar Toolbar-btn"
      v-if="inspector.status.editing" 
      :entity-type="inspector.data[inspector.status.focus]['@type']" 
      :inner="false" 
      :allowed="allowedProperties" 
      :path="inspector.status.focus" 
      :editing-object="inspector.status.focus"
      :in-toolbar="true"
      :force-active="fieldAdderActive"
    />

    <button
      class="Toolbar-btn btn btn-default toolbar-button" 
      :disabled="inspector.changeHistory.length === 0" 
      v-show="inspector.status.editing" 
      v-tooltip.left="`${translatePhrase('Undo')} (${getKeybindText('undo')})`"
      @click="undo" 
      @mouseover="showUndo = true" 
      @mouseout="showUndo = false"
      :aria-label="translatePhrase('Undo')"
    >
      <font-awesome-icon :icon="['fa', 'undo']" aria-hidden="true" />
    </button>

    <button
      class="Toolbar-btn btn btn-default toolbar-button" 
      v-show="inspector.status.editing" 
      @click="cancel" 
      v-tooltip.left="`${translatePhrase('Cancel')} (${getKeybindText('cancel-edit')})`"
      @mouseover="showCancel = true" 
      @mouseout="showCancel = false"
      :aria-label="translatePhrase('Cancel')"
    >
      <font-awesome-icon :icon="['fa', 'close']" aria-hidden="true" />
    </button>

    <button class="Toolbar-btn btn btn-default" id="saveButton" 
      @click="recordControl('save-record')"
      v-if="inspector.status.editing && !isNewRecord" 
      @mouseover="showSave = true" 
      @mouseout="showSave = false"
      v-tooltip.left="`${translatePhrase('Save')} (${getKeybindText('save-item')})`"
      :aria-label="translatePhrase('Save')"
    >
      <font-awesome-icon :icon="['fa', 'circle-notch']" class="fa-spin" v-show="inspector.status.saving" />
      <font-awesome-icon :icon="['fa', 'save']" v-show="!inspector.status.saving" />
    </button>

    <button
      class="Toolbar-btn btn btn-primary" id="saveDoneButton" 
      @click="recordControl('save-record-done')"
      v-if="inspector.status.editing"
      v-tooltip.left="`${ isNewRecord ? translatePhrase('Create record') : translatePhrase('Save and stop editing') } (${ isNewRecord ? getKeybindText('save-item') : getKeybindText('save-item-done') })`"
      @mouseover="showClarifySave = true"
      @mouseout="showClarifySave = false"
      :aria-label="translatePhrase('Save and stop editing')"
    >
      <font-awesome-icon :icon="['fa', 'circle-notch']" class="fa-spin" v-show="inspector.status.saving" />
      <font-awesome-icon :icon="['fa', 'check']" v-show="!inspector.status.saving" />
    </button>

    <button
      class="Toolbar-btn btn btn-primary edit-button" id="editButton" 
      v-on:click="edit()" 
      v-show="!inspector.status.editing && userIsPermittedToEdit" 
      v-tooltip.left="`${ translatePhrase('Edit') } (${ getKeybindText('edit-item') })`"
      @mouseover="showEdit = true" 
      @mouseout="showEdit = false"
      :aria-label="translatePhrase('Edit')"
    >
      <font-awesome-icon :icon="['fa', 'circle-notch']" class="fa-spin" v-show="inspector.status.saving" />
      <font-awesome-icon :icon="['fa', 'pen-to-square']" v-show="!inspector.status.saving" />
    </button>
  </div>
</template>

<style lang="scss">
.Toolbar {
  &-placeholder {
    width: 100%;
  }

  &-container {
    bottom: 10px;
    min-width: 65px;
    position: fixed;
    // border: 1px solid #cccccc;
    // border: 1px solid #cccccc75;
    background-color: #ececec;
    background-color: #ecececd1;
    padding: 6px;
    // border-radius: 0.5em;
    // box-shadow: 0px 0px 15px 0px $grey;
    // box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);

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
    background-color: #fff;

    &:disabled {
      opacity: 0.65;
    }
  }

  &-menuLink {
    & svg {
      margin-right: 5px;
    }
  }

  &-caret {
    position: absolute;
    right: 10px;
    height: 12px;
    bottom: 15px;
  }

  &-menuList {
    display: block;
    padding: 0;
    margin: 0;

    & .Toolbar-menuItem {
      font-size: 14px;
      list-style: none;
      font-weight: 400;

      &.is-active {
        font-weight: bold;
      }
      &.inSubMenu {
        background-color: $grey-lighter;
        & a:hover {
          background-color: darken($grey-lighter, 5%);
        }
      }

      & .Toolbar-menuLink {
        display: flex;
        align-items: center;
        padding: 5px 15px;
        color: $grey-darker;

        svg {
          margin-right: 5px;
        }

        &:hover {
          text-decoration: none;
          background-color: #f5f5f5;
        }
      }

      & .submenuControl {
        display: flex;
        flex: 1;
        justify-content: flex-end;
        align-items: center;
      }
    }

    // @media (min-width: 992px) {
    //   top: auto;
    //   left: auto;
    //   bottom: auto;
    //   right: 0;
    // }

    // @media (min-height: 650px) {
    //   max-height: 400px;
    // }

    // @media (min-height: 850px) {
    //   max-height: 550px;
    // }

    // @media (min-height: 1000px) {
    //   max-height: none;
    // }
  } 

  .TemplatePicker, .OverridePicker {
    display: none;
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
        color: $white;
        background-color: #c55252;
      }
    }
  }
}

</style>
