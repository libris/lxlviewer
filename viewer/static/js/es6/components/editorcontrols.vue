<script>
import * as _ from 'lodash';
import * as DataUtil from '../utils/data';
import * as DisplayUtil from '../utils/display';
import * as LayoutUtil from '../utils/layout';
import * as VocabUtil from '../utils/vocab';
import * as ModalUtil from '../utils/modals';
import * as HttpUtil from '../utils/http';
import * as StringUtil from '../utils/string';
import * as RecordUtil from '../utils/record';
import HeaderComponent from './headercomponent';
import RecordSummary from './record-summary';
import LensMixin from './mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { changeSavedStatus, changeStatus, changeNotification, navigateChangeHistory } from '../vuex/actions';
import { getUser, getSettings, getVocabulary, getVocabularyClasses, getDisplayDefinitions, getEditorData, getStatus, getChangeHistory } from '../vuex/getters';

export default {
  vuex: {
    getters: {
      user: getUser,
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
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
        this.loadingCancel = false;
      }
    },
  },
  methods: {
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
    save() {
      this.changeSavedStatus('loading', true);
      this.$dispatch('save-item');
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
      const baseClasses = VocabUtil.getBaseClasses(this.editorData.mainEntity['@type'], this.vocab, this.settings.vocabPfx)
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
          HttpUtil._delete({ url }).then((result) => {
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
    cancelEdit() {
      this.loadingCancel = true;
      this.$dispatch('set-dirty', false);
      if (this.status.isNew || this.status.isCopy) {
        window.history.back();
      } else {
        setTimeout(() => this.$dispatch('cancel-edit'), 0);
      }
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
      loadingCancel: false,
    };
  },
  computed: {
    canEditThisType() {
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
      return VocabUtil.getRecordType(this.editorData.mainEntity['@type'], this.vocab, this.settings);
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
    }
  },
  components: {
    'record-summary': RecordSummary,
  },
};
</script>

<template>
  <div class="editor-container" id="editor-container">
    <div class="editor-controls">
      <div class="admin-info">
        <div class="actions">
          <div>
            <h2 class="recordtype-label" title="{{recordType}}">
              <span>{{ recordType | labelByLang }}</span>
              <span v-if="status.isCopy"> - [{{ "Copy" | translatePhrase }}]</span>
              <span v-if="status.isNew"> - [{{ "New record" | translatePhrase }}]</span>
            </h2>
            <record-summary></record-summary>
          </div>
          <div class="action" v-if="user.settings.appTech === 'on'" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
            <i class="fa fa-wrench" aria-hidden="true"></i>
          </div>
          <a :href="compileMARCUrl" v-if="!status.inEdit && isSubClassOf('Instance') & !downloadIsSupported && hasSigel">
            <button>
              <i class="fa fa-download" aria-hidden="true"></i>
              {{"Compiled" | translatePhrase}}
            </button>
          </a>
        </div>
        <div>
          <button class="toolbar-button" v-on:click="toggleEditorFocus()" v-bind:class="{'active': status.editorFocus === 'record' }">
            <span v-show="status.editorFocus === 'record'"><i class="fa fa-fw fa-toggle-on"></i> {{'Admin metadata' | translatePhrase}}</span>
            <span v-show="status.editorFocus === 'mainEntity'"><i class="fa fa-fw fa-toggle-off"></i> {{'Admin metadata' | translatePhrase}}</span>
          </button>
          <div v-if="!status.inEdit" class="dropdown other-format toolbar-button">
            <div class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              {{ 'Show as' | translatePhrase }}
              <span class="caret"></span>
            </div>
            <ul class="dropdown-menu">
              <li><a :href="`${focusData['@id']}/data.jsonld`">JSON-LD</a></li>
              <li><a :href="`${focusData['@id']}/data.ttl`">Turtle</a></li>
              <li><a :href="`${focusData['@id']}/data.rdf`">RDF/XML</a></li>
            </ul>
          </div>
          <div class="dropdown tools toolbar-button">
            <div class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              {{ 'Tools' | translatePhrase }}
            <span class="caret"></span>
            </div>
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
              <li v-if="isSubClassOf('Instance') && downloadIsSupported && hasSigel && !status.inEdit">
                <a @click="getCompiledPost()">
                <i class="fa fa-fw fa-download" aria-hidden="true"></i>
                {{"Download compiled" | translatePhrase}}
                </a>
              </li>
              <li v-if="isSubClassOf('Instance') & !downloadIsSupported && hasSigel && !status.inEdit">
                <a :href="compileMARCUrl">
                  <button>
                    <i class="fa fa-fw fa-download" aria-hidden="true"></i>
                    {{"Compiled" | translatePhrase}}
                  </button>
                </a>
              </li>
              <li>
                <a @click="openMarc">
                <i class="fa fa-fw fa-eye" aria-hidden="true"></i>
                {{"Preview MARC21" | translatePhrase}}
                </a>
              </li>
              <li class="remove-option" v-show="!status.isNew && !status.isCopy">
                <a @click="removePost">
                <i class="fa fa-fw fa-trash" aria-hidden="true"></i>
                {{"Remove" | translatePhrase}} {{ recordType | labelByLang }}
                </a>
              </li>
            </ul>
          </div>
          <div class="toolbar-divider"></div>
          <button class="toolbar-button" v-bind:class="{'disabled': activeChangeHistory.length === 0 }" v-show="status.inEdit" @click="navigateFormChanges('back')">
            <i class="fa fa-undo" aria-hidden="true"></i>
            {{"Undo" | translatePhrase}}
          </button>
          <button class="toolbar-button" v-show="status.inEdit" @click="cancelEdit">
            <i class="fa fa-times" aria-hidden="true" v-show="!loadingCancel"></i>
            <i class="fa fa-fw fa-circle-o-notch fa-spin" aria-hidden="true" v-show="loadingCancel"></i>
            {{"Cancel" | translatePhrase}}
          </button>
          <button class="toolbar-button" id="saveButton" v-on:click="save()" v-if="status.inEdit">
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="status.saved.loading"></i>
            <i class="fa fa-fw fa-save" v-show="!status.saved.loading"></i>
            {{ "Save" | translatePhrase }}
          </button>
          <button class="toolbar-button edit-button" id="editButton" v-on:click="edit()" v-show="!status.inEdit && canEditThisType">
            <i class="fa fa-fw fa-pencil" v-show="!loadingEdit"></i>
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="loadingEdit"></i>
            {{ "Edit" | translatePhrase }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

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
        border: 1px solid rgba(27, 31, 35, 0.1);
        background-color: #efefef;
        margin: 0 0.3em;
        padding: 3px 10px;
        font-size: 12px;
        line-height: 20px;
        &:hover {
          border: 1px solid rgba(27, 31, 35, 0.2);
        }
        &.active, &.open {
          box-shadow: inset 0px 0em 2em 0em rgba(0, 0, 0, 0.1);
        }
        &.disabled {
          opacity: 0.5;
          cursor: default;
          border: 1px solid rgba(27, 31, 35, 0.1);
        }
      }
      .dropdown.tools, .dropdown.other-format {
        display: inline-block;
        border-radius: 2px;
        font-weight: bold;
        cursor: pointer;
        margin: 0 0.3em;
        padding: 0;
        font-size: 12px;
        line-height: 20px;
        .dropdown-toggle {
          padding: 3px 10px;
        }
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
