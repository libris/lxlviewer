<script>
/*
  Fixed toolbar
*/
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';
import * as LayoutUtil from '../../utils/layout';
import * as VocabUtil from '@/utils/vocab';
import * as RecordUtil from '@/utils/record';
import * as HttpUtil from '@/utils/http';
import * as StringUtil from '@/utils/string';
import FieldAdder from '@/components/inspector/field-adder';
import TooltipComponent from '@/components/shared/tooltip-component';
import LensMixin from '@/components/mixins/lens-mixin';
import FormMixin from '@/components/mixins/form-mixin';

export default {
  mixins: [clickaway, LensMixin, FormMixin],
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
      showEmbellishFromPostSubMenu: false,
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
            this.postControl('save-record');
            break;
          case 'save-item-done':
            this.postControl('save-record-done');
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
    openTemplatePicker() {
      this.$refs.TemplatePicker.click();
    },
    openOverridePicker() {
      this.$refs.OverridePicker.click();
    },
    applyFileAsOverride(data) {
      const splitData = RecordUtil.splitJson(data);
      this.$refs.OverridePicker.value = ''; // Important: reset the picker
      if (splitData.record['@id'] === this.inspector.data.record['@id']) {
        this.$store.dispatch('pushInspectorEvent', {
          name: 'apply-override',
          value: splitData,
        });
      } else {
        this.$store.dispatch('pushNotification', {
          type: 'danger',
          message: StringUtil.getUiPhraseByLang('New data @id does not match existing @id', this.settings.language),
        });
      }
    },
    applyFileTemplate(data) {
      this.hideToolsMenu();
      const inspectorObj = RecordUtil.splitJson(data);
      const preparedData = RecordUtil.prepareDuplicateFor(inspectorObj, this.user, this.settings.keysToClear.duplication);
      const splitData = RecordUtil.splitJson(preparedData);
      this.$refs.TemplatePicker.value = ''; // Important: reset the picker
      this.$store.dispatch('pushInspectorEvent', {
        name: 'apply-template',
        value: splitData,
      });
    },
    applyPostAsTemplate() {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', {
        name: 'open-embellish-from-id',
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
              StringUtil.getUiPhraseByLang('Something went wrong', self.settings.language),
              StringUtil.getUiPhraseByLang('Verify structure in template', self.settings.language),
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
              StringUtil.getUiPhraseByLang('Something went wrong', self.settings.language),
              StringUtil.getUiPhraseByLang('Verify structure in template', self.settings.language),
            ];
            self.$store.dispatch('pushNotification', { type: 'danger', message: msg.join() });
          }
        };
        reader.readAsText(e.target.files[0]);
      });
    },
    getKeybindingText(eventName) {
      return LayoutUtil.getKeybindingText(eventName);
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
      this.showEmbellishFromPostSubMenu = false;
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
    postControl(control) {
      // if (!this.inspector.status.updating) {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'post-control', 
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
    openMarc() {
      this.hideToolsMenu();
      this.$store.dispatch('pushInspectorEvent', {
        name: 'post-control',
        value: 'open-marc-preview',
      });
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
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'post-control', 
        value: 'cancel',
      });
    },
    undo() {
      this.showUndo = false;
      this.$store.dispatch('undoInspectorChange');
    },
    edit() {
      if (this.user.isLoggedIn && !this.inspector.status.editing && this.canEditThisType) {
        this.loadingEdit = true;
        this.$store.dispatch('setInspectorStatusValue', { 
          property: 'editing', 
          value: true, 
        });
      }
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
    getCompiledPost() {
      HttpUtil.get({ url: this.compileMARCUrl }).then((response) => {
        this.download(response);
      }, (error) => {
        this.$store.dispatch('pushNotification', { type: 'danger', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}` });
      });
    },
    handleCopy() {
      if (this.user.isLoggedIn) {
        this.$parent.$emit('duplicate-item');
        this.hideToolsMenu();
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
    ]),
    isMyHolding() {
      if (this.recordType === 'Item' && this.inspector.data.mainEntity.heldBy['@id'] === this.libraryUrl) {
        return true;
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
      const CombinedTemplates = require('@/resources/json/combinedTemplates');
      const baseType = VocabUtil.getRecordType(type, this.resources.vocab, this.resources.context);
      const templates = VocabUtil.getValidTemplates(type, CombinedTemplates[baseType.toLowerCase()], this.resources.vocabClasses, this.resources.context);
      return templates;
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
    canEditThisType() {
      return true;
      // if (this.user.hasAnyCollections() === false) {
      //   return false;
      // }
      // const permission = this.user.getPermissions();
      // if (this.inspector.data.mainEntity['@type'] === 'Item' && permission.registrant === true) {
      //   return true;
      // } if (permission.cataloger === true) {
      //   return true;
      // }
      // return false;
    },
    showRecord() {
      return this.status.showRecord;
    },
    downloadIsSupported() {
      const a = document.createElement('a');
      return typeof a.download !== 'undefined';
    },
    libraryUrl() {
      return `https://libris.kb.se/library/${this.user.settings.activeSigel}`;
    },
    compileMARCUrl() {
      let focusId = this.inspector.data.record['@id'];
      if (this.recordType === 'Item') {
        focusId = this.inspector.data.mainEntity.itemOf['@id'].split('#')[0];
      }
      return `/_compilemarc?library=${this.libraryUrl}&id=${focusId}`;
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
    'tooltip-component': TooltipComponent,
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
    <input type="file" class="TemplatePicker" ref="TemplatePicker" accept=".jsonld,application/ld+json,text/*" aria-hidden="true"/>
    <input type="file" class="OverridePicker" ref="OverridePicker" accept=".jsonld,application/ld+json,text/*" aria-hidden="true"/>
    <div class="dropdown Toolbar-menu OtherFormatMenu"
      v-if="!inspector.status.editing" 
      v-on-clickaway="hideOtherFormatMenu">
      <button class="Toolbar-btn btn btn-default OtherFormatMenu-button" 
        @click="showOtherFormatMenu" 
        aria-haspopup="true" 
        aria-expanded="true" 
        @focus="showDisplayAs = true"
        @blur="showDisplayAs = false"
        @mouseover="showDisplayAs = true" 
        @mouseout="showDisplayAs = false"
        :aria-label="'Show as' | translatePhrase">
        <i class="fa fa-fw fa-eye" aria-hidden="true">
          <tooltip-component 
            class="Toolbar-tooltipContainer"
            :show-tooltip="showDisplayAs" 
            position="left"
            tooltip-text="Show as"></tooltip-component>
        </i>
        <span class="Toolbar-caret caret"></span>
      </button>
      <ul class="dropdown-menu Toolbar-menuList OtherFormatMenu-menu" 
        v-show="otherFormatMenuActive"
        @click="hideOtherFormatMenu" >
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="focusData['@id']" target="_blank">
            <i class="fa fa-fw fa-external-link" aria-hidden="true"></i>
            Formell resurs</a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="getOtherDataFormat('jsonld')" target="_blank">
            <i class="fa fa-fw fa-external-link" aria-hidden="true"></i>
            JSON-LD</a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="getOtherDataFormat('ttl')" target="_blank">
            <i class="fa fa-fw fa-external-link" aria-hidden="true"></i>
            Turtle</a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" :href="getOtherDataFormat('rdf')">
            <i class="fa fa-fw fa-download" aria-hidden="true"></i>
            RDF/XML</a>
        </li>
      </ul>
    </div>

    <div class="dropdown Toolbar-menu ToolsMenu" 
      v-on-clickaway="hideToolsMenu">
      <button class="Toolbar-btn btn btn-default ToolsMenu-button" 
        @click="showToolsMenu" 
        aria-haspopup="true" 
        aria-expanded="true" 
        @mouseover="showTools = true" 
        @mouseout="showTools = false"
        :aria-label="'Tools' | translatePhrase">
        <i class="fa fa-fw fa-wrench" aria-hidden="true">
          <tooltip-component 
            class="Toolbar-tooltipContainer"
            :show-tooltip="showTools" 
            position="left"
            tooltip-text="Tools"></tooltip-component>
        </i>
        <span class="Toolbar-caret caret"></span>
      </button>
      <ul class="dropdown-menu Toolbar-menuList ToolsMenu-menu" 
        v-show="toolsMenuActive">
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="formControl('expand-item'), hideToolsMenu()">
          <i class="fa fa-fw fa-expand" aria-hidden="true"></i>
          {{"Expand all" | translatePhrase}}{{ getKeybindingText('expand-item') ? ` (${getKeybindingText('expand-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="formControl('collapse-item'), hideToolsMenu()">
          <i class="fa fa-fw fa-compress" aria-hidden="true"></i>
          {{"Collapse all" | translatePhrase}}{{ getKeybindingText('collapse-item') ? ` (${getKeybindingText('collapse-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="user.isLoggedIn && !inspector.status.editing && !isSubClassOf('Item')">
          <a class="Toolbar-menuLink"  @click="handleCopy">
          <i class="fa fa-fw fa-files-o"></i>
          {{ "Make copy" | translatePhrase }}{{ getKeybindingText('duplicate-item') ? ` (${getKeybindingText('duplicate-item')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem" :class="{'is-active': showEmbellishTemplateSubMenu}" v-if="user.isLoggedIn && inspector.status.editing">
          <a class="Toolbar-menuLink" @click="showEmbellishTemplateSubMenu = !showEmbellishTemplateSubMenu">
            <i class="fa fa-fw fa-clipboard"></i>
            <span>{{ "Embellish from template" | translatePhrase }}{{ getKeybindingText('embellish-from-template') ? ` (${getKeybindingText('embellish-from-template')})` : ''}}</span>
            <span class="submenuControl"><i class="fa fa-fw" :class="{ 'fa-caret-down': showEmbellishTemplateSubMenu, 'fa-caret-right': !showEmbellishTemplateSubMenu }"></i></span>
          </a>
        </li>
        <li class="Toolbar-menuItem inSubMenu" v-for="(value, key) in validTemplates" v-show="showEmbellishTemplateSubMenu" :key="key">
          <a class="Toolbar-menuLink" @click="applyTemplate(value)">
          <i class="fa fa-fw fa-plus"></i>
          {{ value.label }}
          </a>
        </li>
        <li class="Toolbar-menuItem" :class="{'is-active': showEmbellishFromPostSubMenu}" v-if="user.isLoggedIn && inspector.status.editing">
          <a class="Toolbar-menuLink" @click="showEmbellishFromPostSubMenu = !showEmbellishFromPostSubMenu">
            <i class="fa fa-fw fa-clipboard"></i>
            <span>{{ "Embellish from post" | translatePhrase }}{{ getKeybindingText('embellish-from-post') ? ` (${getKeybindingText('embellish-from-post')})` : ''}}</span>
            <span class="submenuControl"><i class="fa fa-fw" :class="{ 'fa-caret-down': showEmbellishFromPostSubMenu, 'fa-caret-right': !showEmbellishFromPostSubMenu }"></i></span>
          </a>
        </li>
        <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishFromPostSubMenu">
          <a class="Toolbar-menuLink" @click="openTemplatePicker">
          <i class="fa fa-fw fa-upload"></i>
            {{ 'From file' | translatePhrase }}
          </a>
        </li>
        <li class="Toolbar-menuItem inSubMenu" v-show="showEmbellishFromPostSubMenu">
          <a class="Toolbar-menuLink" @click="applyPostAsTemplate">
          <i class="fa fa-fw fa-chain"></i>
          {{ 'From ID' | translatePhrase }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="compiledIsAvailable">
          <a class="Toolbar-menuLink"  v-if="downloadIsSupported" @click="getCompiledPost()">
            <i class="fa fa-fw fa-download" aria-hidden="true"></i>
              {{"Download compiled" | translatePhrase}} MARC21
          </a>
          <a class="Toolbar-menuLink"  v-if="!downloadIsSupported" :href="compileMARCUrl">
            <i class="fa fa-fw fa-download" aria-hidden="true"></i>
              {{"Download compiled" | translatePhrase}} MARC21
          </a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="postControl('download-json'), hideToolsMenu()">
            <i class="fa fa-fw fa-download" aria-hidden="true"></i>
            {{"Download" | translatePhrase}} JSON-LD<span v-show="inspector.status.editing">&nbsp;({{'Incl. unsaved changes' | translatePhrase}})</span>
          </a>
        </li>
        <li class="Toolbar-menuItem">
          <a class="Toolbar-menuLink" @click="openMarc()">
            <i class="fa fa-fw fa-eye" aria-hidden="true"></i>
            {{ "Preview MARC21" | translatePhrase }}  {{ getKeybindingText('preview-marc') ? ` (${getKeybindingText('preview-marc')})` : ''}}
          </a>
        </li>
        <li class="Toolbar-menuItem remove-option" v-if="user.isLoggedIn && !inspector.status.isNew">
          <a class="Toolbar-menuLink"  @click="postControl('remove-post')">
          <i class="fa fa-fw fa-trash" aria-hidden="true"></i>
          {{"Remove" | translatePhrase}} {{ recordType | labelByLang }}
          </a>
        </li>
        <li class="Toolbar-menuItem" v-if="user.isLoggedIn && inspector.status.editing && !inspector.status.isNew && user.settings.appTech">
          <a class="Toolbar-menuLink" @click="openOverridePicker">
          <i class="fa fa-fw fa-upload"></i>
          {{ 'Overwrite data' | translatePhrase }}
          </a>
        </li>
      </ul>
    </div>
    
    <field-adder class="FieldAdder--inToolbar Toolbar-btn"
      v-if="inspector.status.editing" 
      :entity-type="inspector.data[inspector.status.focus]['@type']" 
      :inner="false" 
      :allowed="allowedProperties" 
      :path="inspector.status.focus" 
      :editing-object="inspector.status.focus"
      :in-toolbar="true"
      :force-active="fieldAdderActive"></field-adder>

    <button class="Toolbar-btn btn btn-default toolbar-button" 
      :disabled="inspector.changeHistory.length === 0" 
      v-show="inspector.status.editing" 
      @click="undo" 
      @mouseover="showUndo = true" 
      @mouseout="showUndo = false"
      :aria-label="'Undo' | translatePhrase">
      <i class="fa fa-undo" aria-hidden="true">
        <tooltip-component 
          class="Toolbar-tooltipContainer"
          :show-tooltip="showUndo" 
          position="left"
          tooltip-text="Undo" 
          keybind-name="undo"></tooltip-component>
      </i>
    </button>

    <button class="Toolbar-btn btn btn-default toolbar-button" 
      v-show="inspector.status.editing" 
      @click="cancel" 
      @mouseover="showCancel = true" 
      @mouseout="showCancel = false"
      :aria-label="'Cancel' | translatePhrase">
      <i class="fa fa-close" aria-hidden="true">
        <tooltip-component 
          class="Toolbar-tooltipContainer"
          :show-tooltip="showCancel" 
          position="left"
          tooltip-text="Cancel" 
          keybind-name="cancel-edit"></tooltip-component>
      </i>
    </button>

    <button class="Toolbar-btn btn btn-default" id="saveButton" 
      @click="postControl('save-record')"
      v-if="inspector.status.editing && !isNewRecord" 
      @mouseover="showSave = true" 
      @mouseout="showSave = false"
      :aria-label="'Save' | translatePhrase">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving"></i>
      <i class="fa fa-fw fa-save" v-show="!inspector.status.saving">
        <tooltip-component 
          class="Toolbar-tooltipContainer"
          :show-tooltip="showSave" 
          position="left"
          tooltip-text="Save" 
          keybind-name="save-item"></tooltip-component>
      </i>
    </button>
    <button class="Toolbar-btn btn btn-primary" id="saveDoneButton" 
      @click="postControl('save-record-done')"
      v-if="inspector.status.editing"
      @mouseover="showClarifySave = true"
      @mouseout="showClarifySave = false"
      :aria-label="'Save and stop editing' | translatePhrase">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving"></i>
      <i class="fa fa-fw fa-check" v-show="!inspector.status.saving">
        <tooltip-component 
          class="Toolbar-tooltipContainer"
          tooltip-text="Save and stop editing" 
          keybind-name="save-item-done"
          position="left"
          v-if="!isNewRecord"
          :show-tooltip="showClarifySave"></tooltip-component>
        <tooltip-component 
          tooltip-text="Create record" 
          keybind-name="save-item"
          position="left"
          class="Toolbar-tooltipContainer"
          v-if="isNewRecord"
          :show-tooltip="showClarifySave"></tooltip-component>
      </i>
    </button>

    <button class="Toolbar-btn btn btn-primary edit-button" id="editButton" 
      v-on:click="edit()" 
      v-show="user.isLoggedIn && !inspector.status.editing && canEditThisType" 
      @mouseover="showEdit = true" 
      @mouseout="showEdit = false"
      :aria-label="'Edit' | translatePhrase">
      <i class="fa fa-fw fa-pencil-square-o" v-show="!inspector.status.opening">
        <tooltip-component 
        class="Toolbar-tooltipContainer"
        tooltip-text="Edit" 
        position="left"
        keybind-name="edit-item" 
        :show-tooltip="showEdit"></tooltip-component></i>
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.opening"></i>
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
    box-shadow: 0px 0px 15px 0px @gray;
    box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);

    @media (min-width: 992px) {
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
    cursor: pointer;

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
    top: -250%;
    left: 50px;
    bottom: 0;
    padding: 10px 0;

    & .Toolbar-menuItem {
      &.is-active {
        font-weight: bold;
      }
      &.inSubMenu {
        background-color: @gray-lighter;
      }
      & a {
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
