<script>
/*
  Upper most part of entity in Inspector, builds tools/buttons section and 
  entity changelog component.
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
import EntityHeader from '@/components/inspector/entity-header';
import FieldAdder from '@/components/inspector/field-adder';
import EntityChangelog from '@/components/inspector/entity-changelog';
import TooltipComponent from '@/components/shared/tooltip-component';
import LensMixin from '@/components/mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';

export default {
  mixins: [clickaway, LensMixin],
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
      showFieldAdderTooltip: false,
      showClarifySave: false,
    };
  },
  events: {
    'close-modals'() {
      return true;
    },
    'toggle-editor-focus'() {
      this.toggleEditorFocus();
    },
  },
  watch: {
    'inspector.status.editing'(state) {
      if (state) {
        this.loadingEdit = false;
      }
    },
  },
  methods: {
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
      this.$dispatch('form-control', control);
    },
    toggleEditorFocus() {
      if (this.inspector.status.focus === 'record') {
        this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: 'mainEntity' });
      } else {
        this.$store.dispatch('setInspectorStatusValue', { property: 'focus', value: 'record' });
      }
    },
    openMarc() {
      this.$dispatch('show-marc');
    },
    save() {
      this.$emit('save');
    },
    undo() {
      this.$store.dispatch('undoInspectorChange');
    },
    edit() {
      this.loadingEdit = true;
      this.$store.dispatch('setInspectorStatusValue', { property: 'editing', value: true });
    },
    navigateFormChanges(direction) {
      this.navigateChangeHistory(this.inspector.status.focus, direction);
    },
    toggleAdminData() {
      this.showAdminInfoDetails = !this.showAdminInfoDetails;
    },
    isSubClassOf(type) {
      const baseClasses = VocabUtil.getBaseClasses(this.inspector.data.mainEntity['@type'], this.resources.vocab, this.settings.vocabPfx, this.resources.context)
        .map(id => id.replace(this.settings.vocabPfx, ''));
      return baseClasses.indexOf(type) > -1;
    },
    removePost() {
      const url = this.focusData['@id'];
      ModalUtil.confirmDialog({
        sTitle: 'Ta bort?',
        sContent: 'Du kan inte ångra detta val.',
        sAccept: 'OK',
        sReject: 'Avbryt',
        sType: 'danger' }).then(() => {
          // accepted by user
          HttpUtil._delete({ url, activeSigel: this.user.settings.activeSigel }).then((result) => {
            this.changeNotification('color', 'green');
            this.changeNotification('message', `${StringUtil.getUiPhraseByLang('The entity was removed', this.settings.language)}!`);
            // Force reload
            setTimeout(() => {
              history.back();
            }, 2000);
          }, (error) => {
            if (error.status === 403) {
              this.changeNotification('color', 'red');
              this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Forbidden', this.settings.language)} - ${StringUtil.getUiPhraseByLang('This entity may have active links', this.settings.language)} - ${error.statusText}`);
            } else {
              this.changeNotification('color', 'red');
              this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error.statusText}`);
            }
          });
        }, () => {
        // rejected by user
      });
    },
    download(text) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(text));
      const splitIdParts = this.editorData.record['@id'].split('/');
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
      this.$dispatch('duplicate-item');
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
    canEditThisType() {
      return true;
      if (this.user.hasAnyCollections() === false) {
        return false;
      }
      const permission = this.user.getPermissions();
      if (this.editorData.mainEntity['@type'] === 'Item' && permission.registrant === true) {
        return true;
      } else if (permission.cataloger === true) {
        return true;
      }
      return false;
    },
    showRecord() {
      return this.status.showRecord;
    },
    recordType() {
      return VocabUtil.getRecordType(this.editorData.mainEntity['@type'], this.resources.vocab, this.settings, this.resources.context);
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
    hasLocalWork() {
      return (typeof this.inspector.data.work !== 'undefined') ? true : false;
    },
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.inspector.data[this.inspector.status.focus];
      const allowed = VocabUtil.getPropertiesFromArray(
        [StringUtil.convertToVocabKey(StringUtil.convertToBaseUri(formObj['@type'], this.resources.context), this.resources.context)],
        this.resources.vocabClasses,
        this.settings.vocabPfx,
        this.resources.vocabProperties,
        this.resources.context
      );
      // Add the "added" property
      for (const element of allowed) {
        const oId = element.item['@id'].replace(settings.vocabPfx, '');
        element.added = (formObj.hasOwnProperty(oId) && formObj[oId] !== null);
      }

      const extendedAllowed = allowed.map(property => {
        const labelByLang = property.item.labelByLang;
        if (typeof labelByLang !== 'undefined') {
          // Try to get the label in the preferred language
          let label = ((typeof labelByLang[this.settings.language] !== 'undefined') ? labelByLang[this.settings.language] : labelByLang.en);
          // If several labels are present, use the first one
          if (_.isArray(label)) {
            label = label[0];
          }
          return {
            added: property.added,
            item: property.item,
            label: label
          };
        } else {
          // If no label, use @id as label
          return {
            added: property.added,
            item: property.item,
            label: property.item['@id']
          };
        }
      });
      const sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
        return prop.label.toLowerCase();
      });
      return sortedAllowed;
    },
  },
  components: {
    'entity-changelog': EntityChangelog,
    'field-adder': FieldAdder,
    'tooltip-component': TooltipComponent,
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="EntityControls" id="editor-container">
    <div class="EntityControls-meta">
      <h1 class="EntityControls-typeLabel" :title="recordType">
        <span>{{ recordType | labelByLang }}</span>
        <span v-if="status.isNew"> - [{{ "New record" | translatePhrase }}]</span>
      </h1>
      <entity-changelog></entity-changelog>
    </div>

    <div class="EntityControls-btns">
      <button class="EntityControls-btn btn btn-default " v-on:click="toggleEditorFocus()">
        <span v-show="inspector.status.focus === 'record'">
          <i class="fa fa-fw fa-toggle-on"></i> {{'Admin metadata' | translatePhrase}}
        </span>
        <span v-show="inspector.status.focus === 'mainEntity'">
          <i class="fa fa-fw fa-toggle-off"></i> {{'Admin metadata' | translatePhrase}}
        </span>
      </button>
      
      <div 
        v-if="!inspector.status.editing" 
        v-on-clickaway="hideOtherFormatMenu" 
        class="dropdown OtherFormatMenu">
        <button class="EntityControls-btn btn btn-default OtherFormatMenu-button" 
          @click="showOtherFormatMenu" 
          aria-haspopup="true" 
          aria-expanded="true" 
          @mouseover="showDisplayAs = true" 
          @mouseout="showDisplayAs = false">
          <i class="fa fa-eye" aria-hidden="true">
            <tooltip-component :show-tooltip="showDisplayAs" tooltip-text="Show as" translation="translatePhrase"></tooltip-component>
          </i>
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu OtherFormatMenu-menu" v-show="otherFormatMenuActive">
          <li><a :href="getOtherDataFormat('jsonld')">JSON-LD</a></li>
          <li><a :href="getOtherDataFormat('ttl')">Turtle</a></li>
          <li><a :href="getOtherDataFormat('rdf')"><i class="fa fa-fw fa-download" aria-hidden="true"></i>RDF/XML</a></li>
        </ul>
      </div>
      <div class="dropdown ToolsMenu" v-on-clickaway="hideToolsMenu">
        <button class="EntityControls-btn btn btn-default ToolsMenu-button" 
          @click="showToolsMenu" 
          aria-haspopup="true" 
          aria-expanded="true" 
          @mouseover="showTools = true" 
          @mouseout="showTools = false">
          <i class="fa fa-wrench" aria-hidden="true">
            <tooltip-component :show-tooltip="showTools" tooltip-text="Tools" translation="translatePhrase"></tooltip-component>
          </i>
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu ToolsMenu-menu" v-show="toolsMenuActive">
          <li>
            <a @click="formControl('expand-item')">
            <i class="fa fa-fw fa-expand" aria-hidden="true"></i>
            {{"Expand all" | translatePhrase}}
            </a>
          </li>
          <li>
            <a @click="formControl('collapse-item')">
            <i class="fa fa-fw fa-compress" aria-hidden="true"></i>
            {{"Collapse all" | translatePhrase}}
            </a>
          </li>
          <li v-if="!inspector.status.editing && !isSubClassOf('Item')">
            <a @click="handleCopy">
            <i class="fa fa-fw fa-files-o"></i>
            {{ "Make copy" | translatePhrase }}
            </a>
          </li>
          <li v-if="isSubClassOf('Instance') && hasSigel && !inspector.status.editing && user.email !== ''">
            <a v-if="downloadIsSupported" @click="getCompiledPost()">
              <i class="fa fa-fw fa-download" aria-hidden="true"></i>
                {{"Download compiled MARC21" | translatePhrase}}
            </a>
            <a v-if="!downloadIsSupported" :href="compileMARCUrl">
              <i class="fa fa-fw fa-download" aria-hidden="true"></i>
                {{"Download compiled MARC21" | translatePhrase}}
            </a>
          </li>
          <li>
            <a @click="openMarc">
            <i class="fa fa-fw fa-eye" aria-hidden="true"></i>
            {{"Preview MARC21" | translatePhrase}}
            </a>
          </li>
          <li class="remove-option" v-show="!status.isNew">
            <a @click="removePost">
            <i class="fa fa-fw fa-trash" aria-hidden="true"></i>
            {{"Remove" | translatePhrase}} {{ recordType | labelByLang }}
            </a>
          </li>
        </ul>
      </div>
      <div class="EntityControls-divider"></div>
      <field-adder class="EntityControls-btn"
        v-if="inspector.status.editing" 
        :entity-type="editorData[inspector.status.focus]['@type']" 
        :inner="false" 
        :allowed="allowedProperties" 
        :path="inspector.status.focus" 
        :editing-object="inspector.status.focus"></field-adder>
      <button class="EntityControls-btn btn btn-default toolbar-button" 
        :disabled="inspector.changeHistory.length === 0" 
        v-show="inspector.status.editing" 
        @click="undo" 
        @mouseover="showUndo = true" 
        @mouseout="showUndo = false">
        <i class="fa fa-undo" aria-hidden="true">
          <tooltip-component :show-tooltip="showUndo" tooltip-text="Undo" translation="translatePhrase"></tooltip-component>
        </i>
      </button>
      <button class="EntityControls-btn btn btn-info" id="saveButton" 
        @click="save" 
        v-if="inspector.status.editing && !status.isNew" 
        @mouseover="showSave = true" @mouseout="showSave = false">
        <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving"></i>
        <i class="fa fa-fw fa-save" v-show="!inspector.status.saving">
          <tooltip-component :show-tooltip="showSave" tooltip-text="Save" translation="translatePhrase"></tooltip-component>
        </i>
      </button>
      <button class="EntityControls-btn btn btn-success" id="saveButton" 
        @click="save(true)" 
        v-if="inspector.status.editing"
        @mouseover="showClarifySave = true"
        @mouseout="showClarifySave = false">
        <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.saving"></i>
        <i class="fa fa-fw fa-check" v-show="!inspector.status.saving">
          <tooltip-component tooltip-text="Save and stop editing" translation="translatePhrase"
            :show-tooltip="showClarifySave"></tooltip-component>
        </i>
        {{"Done" | translatePhrase}}
      </button>
      <button class="EntityControls-btn btn btn-info edit-button" id="editButton" 
        v-on:click="edit()" 
        v-show="!inspector.status.editing && canEditThisType" 
        @mouseover="showEdit = true" 
        @mouseout="showEdit = false">
        <i class="fa fa-fw fa-pencil" v-show="!inspector.status.opening"></i>
        <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="inspector.status.opening"></i>
        {{"Edit" | translatePhrase}}
      </button>
    </div>
  </div>
</template>

<style lang="less">

@button-active-color: #cecece;

.EntityControls {
  flex-direction: row;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 0 15px;
  position: relative;

  &-typeLabel {
    margin: 10px 0 5px;
  }

  &-btns {
    display: flex;
    align-items: center;

    .action {
      display: inline-block;
      cursor: pointer;
      margin: 0 0.5em;
      > a {
        color: #fff;
        font-size: 11px;
      }
      &.active {
        i {
          color: @brand-primary;
        }
      }
      i {
        transition: all 0.5s ease;
        &.up {
          transform:rotate(-180deg);
        }
      }
    }
  }

  &-divider {
    display: inline-block;
    width: 10px;
  }

  &-btn {
    margin: 3px 4px;
    font-size: 12px;
    font-size: 1.2rem;
    line-height: 20px;
    font-weight: 700;
  }
}

.ToolsMenu, 
.OtherFormatMenu {

  &-menu {
    display: block;
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

// .admin-info-container {
//   color: white;
//   overflow: hidden;
//   padding: 0px;
//   max-height: 0px;
//   transition: all ease 1s;
//   &.show-admin-info-details {
//     max-height: 120px;
//   }
//   .admin-info-details {
//     > div > div{
//       display: inline-block;
//       &.admin-key {
//         color: #c7c7c7;
//         width: 50%;
//         text-align: right;
//       }
//       &.admin-value {
//         font-weight: bold;
//       }
//     }
//     cursor: auto;
//     font-size: 0.8em;
//     padding: 5px 0px;
//     columns: 2;
//     column-fill: balance;
//     overflow: hidden;
//   }
// }
</style>
