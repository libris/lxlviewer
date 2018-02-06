<script>
import * as _ from 'lodash';
import * as DataUtil from '../../utils/data';
import * as DisplayUtil from '../../utils/display';
import * as LayoutUtil from '../../utils/layout';
import * as VocabUtil from '../../utils/vocab';
import * as ModalUtil from '../../utils/modals';
import * as HttpUtil from '../../utils/http';
import * as StringUtil from '../../utils/string';
import * as RecordUtil from '../../utils/record';
import HeaderComponent from './headercomponent';
import FieldAdder from './fieldadder';
import RecordSummary from './record-summary';
import TooltipComponent from '../shared/tooltip-component';
import LensMixin from '../mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { changeSavedStatus, changeStatus, changeNotification, navigateChangeHistory } from '../../vuex/actions';
import { getUser, getContext, getSettings, getVocabulary, getVocabularyClasses, getVocabularyProperties, getDisplayDefinitions, getEditorData, getStatus, getChangeHistory } from '../../vuex/getters';

export default {
  vuex: {
    getters: {
      user: getUser,
      context: getContext,
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
      vocabProperties: getVocabularyProperties,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
      changeHistory: getChangeHistory,
    },
    actions: {
      changeSavedStatus,
      changeStatus,
      changeNotification,
      navigateChangeHistory,
    },
  },
  mixins: [clickaway, LensMixin],
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
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
    inEdit(state) {
      if (state) {
        this.loadingEdit = false;
      }
    },
  },
  methods: {
    getOtherDataFormat(suffix) {
      return `${this.focusData['@id']}/data.${suffix}`
    },
    formControl(control) {
      this.$dispatch('form-control', control);
    },
    toggleEditorFocus() {
      if (this.status.editorFocus === 'record') {
        this.changeStatus('editorFocus', 'mainEntity');
      } else {
        this.changeStatus('editorFocus', 'record');
      }
    },
    openMarc() {
      this.$dispatch('show-marc');
    },
    save(cancelEdit) {
      this.changeSavedStatus('loading', true);
      this.$dispatch('save-item', cancelEdit);
    },
    edit() {
      this.loadingEdit = true;
      setTimeout(() => this.$dispatch('edit-item'), 0); // $nextTick doesn't work
    },
    navigateFormChanges(direction) {
      this.navigateChangeHistory(this.status.editorFocus, direction);
    },
    toggleDev() {
      this.changeStatus('isDev', !this.status.isDev);
    },
    toggleAdminData() {
      this.showAdminInfoDetails = !this.showAdminInfoDetails;
    },
    isSubClassOf(type) {
      const baseClasses = VocabUtil.getBaseClasses(this.editorData.mainEntity['@type'], this.vocab, this.settings.vocabPfx, this.context)
        .map(id => id.replace(this.settings.vocabPfx, ''));
      return baseClasses.indexOf(type) > -1;
    },
    removePost() {
      const url = this.focusData['@id'];
      const translatedType = StringUtil.getLabelByLang(this.recordType, this.settings.language, this.vocab, this.settings.vocabPfx, this.context);
      ModalUtil.confirmDialog({
        sTitle: `${StringUtil.getUiPhraseByLang('Remove', this.settings.language)} ${translatedType}?`,
        sContent: `${StringUtil.getUiPhraseByLang('You can\'t undo this action', this.settings.language)}.`,
        sAccept: StringUtil.getUiPhraseByLang('Yes, remove', this.settings.language),
        sReject: StringUtil.getUiPhraseByLang('Cancel', this.settings.language),
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
  data() {
    return {
      showAdminInfoDetails: false,
      otherFormatMenu: false,
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
  computed: {
    canEditThisType() {
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
    activeChangeHistory() {
      return this.changeHistory[this.status.editorFocus];
    },
    showRecord() {
      return this.status.showRecord;
    },
    recordType() {
      return VocabUtil.getRecordType(this.editorData.mainEntity['@type'], this.vocab, this.settings, this.context);
    },
    downloadIsSupported() {
      const a = document.createElement('a');
      return typeof a.download != 'undefined';
    },
    libraryUrl() {
      return `https://libris.kb.se/library/${this.user.settings.activeSigel}`;
    },
    compileMARCUrl() {
      return `/_compilemarc?library=${this.libraryUrl}&id=${this.editorData.record['@id']}`;
    },
    hasSigel() {
      return typeof this.user.settings.activeSigel !== 'undefined';
    },
    focusData() {
      return this.editorData.record;
    },
    inEdit() {
      return this.status.inEdit;
    },
    hasLocalWork() {
      return (typeof this.editorData.work !== 'undefined') ? true : false;
    },
    allowedProperties() {
      const settings = this.settings;
      const formObj = this.editorData[this.status.editorFocus];
      const allowed = VocabUtil.getPropertiesFromArray(
        [StringUtil.convertToVocabKey(StringUtil.convertToBaseUri(formObj['@type'], this.context), this.context)],
        this.vocabClasses,
        this.settings.vocabPfx,
        this.vocabProperties,
        this.context
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
      sortedAllowed = _.sortBy(extendedAllowed, (prop) => {
        return prop.label.toLowerCase();
      });
      return sortedAllowed;
    },
  },
  components: {
    'record-summary': RecordSummary,
    'field-adder': FieldAdder,
    'tooltip-component': TooltipComponent,
  },
};
</script>

<template>
  <div class="editor-container" id="editor-container">
    <div class="editor-controls">
      <div class="admin-info">
        <div>
          <div>
            <h2 class="recordtype-label" title="{{recordType}}">
              <span>{{ recordType | labelByLang }}</span>
              <span v-if="status.isNew"> - [{{ "New record" | translatePhrase }}]</span>
            </h2>
            <record-summary></record-summary>
          </div>
          <div class="action" v-if="user.settings.appTech === 'on'" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
            <i class="fa fa-wrench" aria-hidden="true"></i>
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-default toolbar-button" v-on:click="toggleEditorFocus()">
            <span v-show="status.editorFocus === 'record'"><i class="fa fa-fw fa-toggle-on"></i> {{'Admin metadata' | translatePhrase}}</span>
            <span v-show="status.editorFocus === 'mainEntity'"><i class="fa fa-fw fa-toggle-off"></i> {{'Admin metadata' | translatePhrase}}</span>
          </button>
          <div v-if="!status.inEdit" class="dropdown other-format" @mouseover="showDisplayAs = true" @mouseout="showDisplayAs = false">
            <button class="btn btn-default toolbar-button dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              <i class="fa fa-eye" aria-hidden="true">
                <tooltip-component :show-tooltip="showDisplayAs" tooltip-text="Show as" translation="translatePhrase"></tooltip-component>
              </i>
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu">
              <li><a :href="getOtherDataFormat('jsonld')">JSON-LD</a></li>
              <li><a :href="getOtherDataFormat('ttl')">Turtle</a></li>
              <li><a :href="getOtherDataFormat('rdf')">RDF/XML</a></li>
            </ul>
          </div>
          <div class="dropdown tools">
            <button class="btn btn-default toolbar-button dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" @mouseover="showTools = true" @mouseout="showTools = false">
              <i class="fa fa-wrench" aria-hidden="true">
                <tooltip-component :show-tooltip="showTools" tooltip-text="Tools" translation="translatePhrase"></tooltip-component>
              </i>
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu">
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
              <li v-if="!status.inEdit && !isSubClassOf('Item')">
                <a @click="handleCopy">
                <i class="fa fa-fw fa-files-o"></i>
                {{ "Make copy" | translatePhrase }}
                </a>
              </li>
              <li v-if="isSubClassOf('Instance') && hasSigel && !status.inEdit && user.email !== ''">
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
          <div class="toolbar-divider"></div>
          <field-adder v-if="status.inEdit" :entity-type="editorData[status.editorFocus]['@type']" :inner="false" :allowed="allowedProperties" :editing-object="status.editorFocus"></field-adder>
          <button class="btn btn-default toolbar-button" :disabled="activeChangeHistory.length === 0" v-show="status.inEdit" @click="navigateFormChanges('back')" @mouseover="showUndo = true" @mouseout="showUndo = false">
            <i class="fa fa-undo" aria-hidden="true">
              <tooltip-component :show-tooltip="showUndo" tooltip-text="Undo" translation="translatePhrase"></tooltip-component>
            </i>
          </button>
          <button class="btn btn-info toolbar-button" id="saveButton" v-on:click="save(false)" v-if="status.inEdit && !status.isNew" @mouseover="showSave = true" @mouseout="showSave = false">
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="status.saved.loading"></i>
            <i class="fa fa-fw fa-save" v-show="!status.saved.loading">
              <tooltip-component :show-tooltip="showSave" tooltip-text="Save" translation="translatePhrase"></tooltip-component>
            </i>
          </button>
          <button class="btn btn-lg btn-success toolbar-button" id="saveButton" 
          @mouseover="showClarifySave = true" 
          @mouseout="showClarifySave = false"
          @click="save(true)" 
          v-if="status.inEdit">
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="status.saved.loading"></i>
            <i class="fa fa-fw fa-check" v-show="!status.saved.loading">
              <tooltip-component :show-tooltip="showClarifySave" tooltip-text="Save and stop editing" translation="translatePhrase"></tooltip-component>
            </i>
            {{"Done" | translatePhrase}}

          </button>
          <button class="btn btn-lg btn-info toolbar-button edit-button" id="editButton" v-on:click="edit()" v-show="!status.inEdit && canEditThisType" @mouseover="showEdit = true" @mouseout="showEdit = false">
            <i class="fa fa-fw fa-pencil" v-show="!loadingEdit"></i>
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="loadingEdit"></i>
            {{"Edit" | translatePhrase}}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import '../shared/_variables.less';

@button-active-color: #cecece;

.editor-container {
  padding: 0.5em 0;

  .editor-controls {
    .recordtype-label {
      margin: 0;
    }
    .admin-info {
      flex-direction: row;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      position: relative;
      .admin-node {
        flex-grow: 5;
        text-align: center;
        .node {
          font-size: 0.9em;
          vertical-align: middle;
        }
      }
      .toolbar-button {
        margin: 0.2em 0.3em;
        padding: 8px 15px;
        font-size: 13px;
        line-height: 20px;
        font-weight: bold;
      }
      .dropdown.tools, .dropdown.other-format {
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
      .toolbar-divider {
        display: inline-block;
        width: 0.5em;
      }
      .actions {
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
    }
    .admin-info-container {
      color: white;
      overflow: hidden;
      padding: 0px;
      max-height: 0px;
      transition: all ease 1s;
      &.show-admin-info-details {
        max-height: 120px;
      }
      .admin-info-details {
        > div > div{
          display: inline-block;
          &.admin-key {
            color: #c7c7c7;
            width: 50%;
            text-align: right;
          }
          &.admin-value {
            font-weight: bold;
          }
        }
        cursor: auto;
        font-size: 0.8em;
        padding: 5px 0px;
        columns: 2;
        column-fill: balance;
        overflow: hidden;
      }
    }
  }
}
</style>
