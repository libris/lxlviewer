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
import { getSettings, getVocabulary, getVocabularyClasses, getDisplayDefinitions, getEditorData, getStatus, getChangeHistory } from '../vuex/getters';

export default {
  vuex: {
    getters: {
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
      if (!this.status.isNew) {
        this.buildCopiedRecord();
      }
    });
  },
  events: {
    'close-modals'() {
      this.closeDuplicateDialog();
      return true;
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
      this.buildCopiedRecord();
      this.$dispatch('save-item');
    },
    edit() {
      this.loadingEdit = true;
      setTimeout(() => this.$dispatch('edit-item'), 0); // $nextTick doesn't work
    },
    duplicate() {
      this.duplicating = true;
      this.$dispatch('duplicate-item');
    },
    navigateFormChanges(direction) {
      this.navigateChangeHistory(this.status.editorFocus, direction);
    },
    openDuplicateWindow() {
      this.showDuplicateWindow = true;
      LayoutUtil.scrollLock(true);
    },
    showHelp() {
      this.$dispatch('show-help', '');
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
            console.log("post WAS deleted...", result);

            // Force reload
            window.location.reload();
          }, (result) => {
            console.log("post was NOT deleted...", result);
          });
        }, () => {
        // rejected by user
      });
    },
    cancelEdit() {
      this.loadingCancel = true;
      if (this.status.isNew) {
        window.history.back();
      } else {
        setTimeout(() => this.$dispatch('cancel-edit'), 0);
      }
    },
    closeDuplicateDialog() {
      this.showDuplicateWindow = false;
      LayoutUtil.scrollLock(false);
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
      if (Modernizr.history) {
        history.pushState(this.copyRecord, 'unused', '/edit');
        this.$dispatch('new-editordata', this.copyRecord);
        this.changeNotification('color', 'green');
        this.changeNotification('message', `${StringUtil.getUiPhraseByLang('Copy successful', this.settings.language)}!`);
      }
    },
    buildCopiedRecord() {
      const mainEntity = _.cloneDeep(this.editorData.mainEntity);
      this.copyRecord = RecordUtil.splitJson(RecordUtil.getObjectAsRecord(mainEntity));
    },
  },
  data() {
    return {
      showAdminInfoDetails: false,
      showDuplicateWindow: false,
      duplicating: false,
      otherFormatMenu: false,
      loadingEdit: false,
      loadingCancel: false,
      copyRecord: {},
    };
  },
  computed: {
    activeChangeHistory() {
      return this.changeHistory[this.status.editorFocus];
    },
    showRecord() {
      return this.status.showRecord;
    },
    recordType() {
      if (VocabUtil.isSubClassOf(this.editorData.mainEntity['@type'], 'Item', this.vocab, this.settings.vocabPfx)) {
        return 'Item';
      }
      if (VocabUtil.isSubClassOf(this.editorData.mainEntity['@type'], 'Instance', this.vocab, this.settings.vocabPfx)) {
        return 'Instance';
      } else if (VocabUtil.isSubClassOf(this.editorData.mainEntity['@type'], 'Work', this.vocab, this.settings.vocabPfx)) {
        return 'Work';
      } else if (VocabUtil.isSubClassOf(this.editorData.mainEntity['@type'], 'Agent', this.vocab, this.settings.vocabPfx)) {
        return 'Agent';
      } else if (VocabUtil.isSubClassOf(this.editorData.mainEntity['@type'], 'Concept', this.vocab, this.settings.vocabPfx)) {
        return 'Concept';
      }
    },
    downloadIsSupported() {
      const a = document.createElement('a');
      return typeof a.download != 'undefined';
    },
    libraryUrl() {
      return `https://libris.kb.se/library/${this.settings.userSettings.currentSigel}`;
    },
    compileMARCUrl() {
      return `/_compilemarc?library=${this.libraryUrl}&id=${this.editorData.record['@id']}`;
    },
    hasSigel() {
      return typeof this.settings.userSettings.currentSigel !== 'undefined';
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
  <div class="container" id="editor-container">
    <div class="editor-controls">
      <div class="admin-info">
        <div class="actions">
          <div>
            <h2 class="recordtype-label">{{recordType | labelByLang }}</h2>
            <record-summary></record-summary>
          </div>
          <div class="action" v-if="settings.userSettings.showAppTech" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
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
          <button class="toolbar-button" v-on:click="showHelp()">
            {{'Help' | translatePhrase}}
            </button>
          <div class="dropdown other-format toolbar-button">
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
                <a @click="handleCopy">
                <i class="fa fa-fw fa-files-o"></i>
                {{ "Copy" | translatePhrase }}
                </a>
              </li>
              <li v-if="isSubClassOf('Instance') && downloadIsSupported && hasSigel">
                <a @click="getCompiledPost()">
                <i class="fa fa-fw fa-download" aria-hidden="true"></i>
                {{"Download compiled" | translatePhrase}}
                </a>
              </li>
              <li v-if="isSubClassOf('Instance') & !downloadIsSupported && hasSigel">
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
              <li class="remove-option" v-show="!status.isNew">
                <a @click="removePost">
                <i class="fa fa-fw fa-trash" aria-hidden="true"></i>
                {{"Remove" | translatePhrase}} post
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
          <button class="toolbar-button edit-button" id="editButton" v-on:click="edit()" v-show="!status.inEdit">
            <i class="fa fa-fw fa-pencil" v-show="!loadingEdit"></i>
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="loadingEdit"></i>
            {{ "Edit" | translatePhrase }}
          </button>
        </div>
      </div>
    </div>
    <div class="window duplicate-dialog" v-if="showDuplicateWindow">
      <div class="header">
        <span class="title">
          {{ "Duplicera post" | translatePhrase }}
        </span>
        <span class="windowControl">
          <i v-on:click="closeDuplicateDialog()" class="fa fa-close"></i>
        </span>
      </div>
      <div v-if="!hasLocalWork" class="body">
        <p class="duplicateLeadingText">
          Detta kommer att skapa en kopia av denna posten med samma innehåll som vid senaste sparning. Sedan skickas du vidare till den skapade posten.
        </p>
        <hr>
        <div class="button-container">
          <p>
            Vill du fortsätta?
          </p>
          <button class="acceptDuplicateButton" v-on:click="duplicate()" v-show="!duplicating">{{ "Ja" | translatePhrase }}</button>
          <button class="declineDuplicateButton" v-on:click="closeDuplicateDialog()" v-show="!duplicating">{{ "Nej" | translatePhrase }}</button>
          <div v-show="duplicating"><i class="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> {{ "Kopierar" | translatePhrase }}</div>
        </div>
      </div>
      <div v-if="hasLocalWork" class="body">
        <p class="duplicateLeadingText">
          Denna post innehåller ett lokalt verk och kan därför inte kopieras.
        </p>
        <p class="duplicateLeadingText">
          Bryt ut det lokala verket för att fortsätta.
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

@button-active-color: #cecece;

.container {
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
              color: #e6e6e6;
              background-color: #986e6e;
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
  .duplicate-dialog {
    .window-mixin();
    .body {
      padding: 2em;
      .duplicateLeadingText {
        text-align: center;
      }
      .button-container {
        text-align: center;
        button {
          padding: 0px 1em;
        }
        .acceptDuplicateButton {
          margin-right: 2em;
        }
        .declineDuplicateButton {

        }
      }
    }
  }
}
</style>
