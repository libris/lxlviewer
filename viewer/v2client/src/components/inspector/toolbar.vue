<script>
/*
  Fixed toolbar
*/

import * as _ from 'lodash';
import * as DataUtil from '../../utils/data';
import * as DisplayUtil from '../../utils/display';
import * as LayoutUtil from '../../utils/layout';
import * as VocabUtil from '@/utils/vocab';
import * as ModalUtil from '@/utils/modals';
import * as HttpUtil from '@/utils/http';
import * as StringUtil from '@/utils/string';
import * as RecordUtil from '@/utils/record';
import MarcPreview from '@/components/inspector/marc-preview';
import FieldAdder from '@/components/inspector/field-adder';
import TooltipComponent from '@/components/shared/tooltip-component';
import LensMixin from '@/components/mixins/lens-mixin';
import FormMixin from '@/components/mixins/form-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';

export default {
  mixins: [clickaway, LensMixin, FormMixin],
  props: {
    fieldAdderOpen: false,
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
      fieldAdderActive: false
    };
  },
  watch: {
    'inspector.status.editing'(state) {
      if (state) {
        this.loadingEdit = false;
      }
    },
    'inspector.event'(val, oldVal) {
      if (val.name === 'form-control') {
        switch(val.value) {
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
            this.toggleEditorFocus(true);
            break;
          case 'admin-data-off':
            this.toggleEditorFocus();
            break;
          default:
            return;
        }
      }
    },
    'status.keyActions'(value) {
      this.formControl(value[value.length-1]);
    },
  },
  methods: {
    openFieldAdder() {
      if (!this.fieldAdderActive) {
        this.fieldAdderActive = true;
      } else {
        this.fieldAdderActive = false;
      }
    },
    showOtherFormatMenu() {
      this.otherFormatMenuActive = true;
    },
    hideOtherFormatMenu() {
      this.otherFormatMenuActive = false;
    },
    hideToolsMenu() {
      this.toolsMenuActive = false;
    },
    showToolsMenu() {
      this.toolsMenuActive = true;
    },
    getOtherDataFormat(suffix) {
      return `${this.focusData['@id']}/data.${suffix}`
    },
    formControl(control) {
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'form-control', 
        value: control 
      });
    },
    postControl(control) {
      // if (!this.inspector.status.updating) {
        this.$store.dispatch('pushInspectorEvent', { 
          name: 'post-control', 
          value: control 
        });
      // }
    },
    toggleEditorFocus(on = false) {
      if (on) {
        this.inspector.status.focus === 'record';
      } 

      if (this.inspector.status.focus === 'record') {
        this.$store.dispatch('setInspectorStatusValue', { 
          property: 'focus', 
          value: 'mainEntity' 
        });
      } else {
        this.$store.dispatch('setInspectorStatusValue', { 
          property: 'focus', 
          value: 'record' 
        });
      }
    },
    openMarc() {
      this.showMarcPreview = true;
    },
    closeMarc() {
      this.showMarcPreview = false;
    },
    cancel() {
      this.$store.dispatch('pushInspectorEvent', { 
        name: 'post-control', 
        value: 'cancel'
      });
    },
    undo() {
      this.$store.dispatch('undoInspectorChange');
    },
    edit() {
      this.loadingEdit = true;
      this.$store.dispatch('setInspectorStatusValue', { 
        property: 'editing', 
        value: true 
      });
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
        this.resources.context
      )
        .map(id => StringUtil.getCompactUri(id, this.resources.context));
      return baseClasses.indexOf(type) > -1;
    },
    download(text) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(text));
      const splitIdParts = this.inspector.data.record['@id'].split('/');
      const id = splitIdParts[splitIdParts.length-1];
      element.setAttribute('download', id);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    getCompiledPost() {
      HttpUtil.get({ url: this.compileMARCUrl }).then((response) => {
        this.download(response);
      }, (error) => {
        this.changeNotification('color', 'red');
        this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${StringUtil.getUiPhraseByLang(error, this.settings.language)}`);
      });
    },
    handleCopy() {
      this.$parent.$emit('duplicate-item');
      this.hideToolsMenu();
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
    formObj() {
      return this.inspector.data[this.inspector.status.focus];
    },
    allowed() {
      return VocabUtil.getPropertiesFromArray(
        this.formObj['@type'],
        this.resources.vocabClasses,
        this.resources.vocabProperties,
        this.resources.context
      );
    },
    recordType() {
      return VocabUtil.getRecordType(
        this.inspector.data.mainEntity['@type'], 
        this.resources.vocab, 
        this.resources.context);
    },
    canEditThisType() {
      return true;
      if (this.user.hasAnyCollections() === false) {
        return false;
      }
      const permission = this.user.getPermissions();
      if (this.inspector.data.mainEntity['@type'] === 'Item' && permission.registrant === true) {
        return true;
      } else if (permission.cataloger === true) {
        return true;
      }
      return false;
    },
    showRecord() {
      return this.status.showRecord;
    },
    downloadIsSupported() {
      const a = document.createElement('a');
      return typeof a.download != 'undefined';
    },
    libraryUrl() {
      return `https://libris.kb.se/library/${this.user.settings.activeSigel}`;
    },
    compileMARCUrl() {
      return `/_compilemarc?library=${this.libraryUrl}&id=${this.inspector.data.record['@id']}`;
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
      return (typeof this.inspector.data.work !== 'undefined') ? true : false;
    },
  },
  components: {
    'field-adder': FieldAdder,
    'tooltip-component': TooltipComponent,
    'marc-preview': MarcPreview,
  },
  mounted() {
    this.$nextTick(() => {
    
    });
  },
};
</script>

<template>
  <div class="Toolbar" id="editor-container">
    <div class="dropdown Toolbar-menu OtherFormatMenu"
      v-if="!inspector.status.editing" 
      v-on-clickaway="hideOtherFormatMenu">
      <button class="Toolbar-btn btn btn-default OtherFormatMenu-button" 
        @click="showOtherFormatMenu" 
        aria-haspopup="true" 
        aria-expanded="true" 
        @mouseover="showDisplayAs = true" 
        @mouseout="showDisplayAs = false">
        <i class="fa fa-eye" aria-hidden="true">
          <tooltip-component :show-tooltip="showDisplayAs" tooltip-text="Show as" translation="translatePhrase"></tooltip-component>
        </i>
        <span class="Toolbar-caret caret"></span>
      </button>
      <ul class="dropdown-menu Toolbar-menuList OtherFormatMenu-menu" 
        v-show="otherFormatMenuActive"
        @click="hideOtherFormatMenu" >
        <li><a :href="getOtherDataFormat('jsonld')">JSON-LD</a></li>
        <li><a :href="getOtherDataFormat('ttl')">Turtle</a></li>
        <li><a :href="getOtherDataFormat('rdf')"><i class="fa fa-fw fa-download" aria-hidden="true"></i>RDF/XML</a></li>
      </ul>
    </div>

    <div class="dropdown Toolbar-menu ToolsMenu" 
      v-on-clickaway="hideToolsMenu">
      <button class="Toolbar-btn btn btn-default ToolsMenu-button" 
        @click="showToolsMenu" 
        aria-haspopup="true" 
        aria-expanded="true" 
        @mouseover="showTools = true" 
        @mouseout="showTools = false">
        <i class="fa fa-wrench" aria-hidden="true">
          <tooltip-component 
            :show-tooltip="showTools" 
            tooltip-text="Tools" 
            translation="translatePhrase"></tooltip-component>
        </i>
        <span class="Toolbar-caret caret"></span>
      </button>
      <ul class="dropdown-menu Toolbar-menuList ToolsMenu-menu" 
      v-show="toolsMenuActive">
        <li>
          <a class="Toolbar-menuLink" @click="formControl('expand-item')">
          <i class="fa fa-fw fa-expand" aria-hidden="true"></i>
          {{"Expand all" | translatePhrase}}
          </a>
        </li>
        <li>
          <a class="Toolbar-menuLink"  @click="formControl('collapse-item')">
          <i class="fa fa-fw fa-compress" aria-hidden="true"></i>
          {{"Collapse all" | translatePhrase}}
          </a>
        </li>
        <li v-if="user.isLoggedIn && !inspector.status.editing && !isSubClassOf('Item')">
          <a class="Toolbar-menuLink"  @click="handleCopy">
          <i class="fa fa-fw fa-files-o"></i>
          {{ "Make copy" | translatePhrase }}
          </a>
        </li>
        <li v-if="isSubClassOf('Instance') && hasSigel && !inspector.status.editing && user.email !== ''">
          <a class="Toolbar-menuLink"  v-if="downloadIsSupported" @click="getCompiledPost()">
            <i class="fa fa-fw fa-download" aria-hidden="true"></i>
              {{"Download compiled MARC21" | translatePhrase}}
          </a>
          <a class="Toolbar-menuLink"  v-if="!downloadIsSupported" :href="compileMARCUrl">
            <i class="fa fa-fw fa-download" aria-hidden="true"></i>
              {{"Download compiled MARC21" | translatePhrase}}
          </a>
        </li>
        <li>
          <marc-preview :openPreview="showMarcPreview" v-on:close-marc="closeMarc()"></marc-preview>
          <a class="Toolbar-menuLink"   @click="openMarc" >
          <i class="fa fa-fw fa-eye" aria-hidden="true"></i>
          {{"Preview MARC21" | translatePhrase}}
          </a>
        </li>
        <li class="remove-option" v-show="user.isLoggedIn && !status.isNew">
          <a class="Toolbar-menuLink"  @click="postControl('remove-post')">
          <i class="fa fa-fw fa-trash" aria-hidden="true"></i>
          {{"Remove" | translatePhrase}} {{ recordType | labelByLang }}
          </a>
        </li>
      </ul>
    </div>
    
    <field-adder class="FieldAdder--inToolbar"
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
      @mouseout="showUndo = false">
      <i class="fa fa-undo" aria-hidden="true">
        <tooltip-component 
          :show-tooltip="showUndo" 
          tooltip-text="Undo" 
          translation="translatePhrase"></tooltip-component>
      </i>
    </button>

    <button class="Toolbar-btn btn btn-default toolbar-button" 
      v-show="inspector.status.editing" 
      @click="cancel" 
      @mouseover="showCancel = true" 
      @mouseout="showCancel = false">
      <i class="fa fa-close" aria-hidden="true">
        <tooltip-component 
          :show-tooltip="showCancel" 
          tooltip-text="Cancel" 
          translation="translatePhrase"></tooltip-component>
      </i>
    </button>

    <button class="Toolbar-btn btn btn-default" id="saveButton" 
      @click="postControl('save-record')"
      v-if="inspector.status.editing && !isNewRecord" 
      @mouseover="showSave = true" @mouseout="showSave = false">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving"></i>
      <i class="fa fa-fw fa-save" v-show="!inspector.status.saving">
        <tooltip-component 
          :show-tooltip="showSave" 
          tooltip-text="Save" 
          translation="translatePhrase"></tooltip-component>
      </i>
    </button>
    <button class="Toolbar-btn btn btn-success" id="saveButton" 
      @click="postControl('save-record-done')"
      v-if="inspector.status.editing"
      @mouseover="showClarifySave = true"
      @mouseout="showClarifySave = false">
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving"></i>
      <i class="fa fa-fw fa-check" v-show="!inspector.status.saving">
        <tooltip-component tooltip-text="Save and stop editing" translation="translatePhrase"
          v-if="!isNewRecord"
          :show-tooltip="showClarifySave"></tooltip-component>
        <tooltip-component tooltip-text="Create record" translation="translatePhrase"
          v-if="isNewRecord"
          :show-tooltip="showClarifySave"></tooltip-component>
      </i>
    </button>
    <button class="Toolbar-btn btn btn-info edit-button" id="editButton" 
      v-on:click="edit()" 
      v-show="user.isLoggedIn && !inspector.status.editing && canEditThisType" 
      @mouseover="showEdit = true" 
      @mouseout="showEdit = false">
      <i class="fa fa-fw fa-pencil" v-show="!inspector.status.opening"></i>
      <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.opening"></i>
      <tooltip-component tooltip-text="Edit" translation="translatePhrase"
          :show-tooltip="showEdit"></tooltip-component>
    </button>
  </div>
</template>

<style lang="less">

.Toolbar {

  &-placeholder {
    width: 100%;
  }

  &-container {
    width: 100%;
    bottom: 10px;
    min-width: 65px;
    position: fixed;
    border: 1px solid #cccccc75;
    background-color: #ecececd1;
    padding: 6px;
    border-radius: 0.5em;
    box-shadow: 0px 0px 15px 0px #0000001f;

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
    font-size: 22px;
    font-size: 2.2rem;
    margin: 2px 0;
    width: 50px;
    height: 50px;
    line-height: 1;
  }

  &-menuLink {
    cursor: pointer;
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

    @media (min-width: 992px) {
      top: auto;
      left: auto;
      bottom: auto;
      right: 0;
    }
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
