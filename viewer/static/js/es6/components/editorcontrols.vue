<script>
import * as _ from 'lodash';
import HeaderComponent from './headercomponent';
import MarcPreview from '../components/marc-preview';
import * as DataUtil from '../utils/data';
import * as DisplayUtil from '../utils/display';
import * as LayoutUtil from '../utils/layout';
import * as VocabUtil from '../utils/vocab';
import * as ModalUtil from '../utils/modals';
import * as HttpUtil from '../utils/http';
import * as StringUtil from '../utils/string';
import * as RecordUtil from '../utils/record';
import LensMixin from './mixins/lens-mixin';
import { mixin as clickaway } from 'vue-clickaway';
import { changeSavedStatus, changeStatus, changeNotification } from '../vuex/actions';
import { getSettings, getVocabulary, getVocabularyClasses, getDisplayDefinitions, getEditorData, getStatus } from '../vuex/getters';

export default {
  vuex: {
    getters: {
      vocab: getVocabulary,
      vocabClasses: getVocabularyClasses,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
      status: getStatus,
    },
    actions: {
      changeSavedStatus,
      changeStatus,
      changeNotification,
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
    save() {
      this.changeSavedStatus('loading', true);
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
      setTimeout(() => this.$dispatch('cancel-edit'), 0);
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
    submitCopyForm() {
      const copyForm = document.getElementById('copyForm');
      copyForm.submit();
    },
    buildCopiedRecord() {
      const mainEntity = _.cloneDeep(this.editorData.mainEntity);
      if (mainEntity.hasOwnProperty('instanceOf') &&
      mainEntity.instanceOf.hasOwnProperty('@id') &&
      mainEntity.instanceOf['@id'].indexOf('#work') > -1) {
        const work = _.cloneDeep(this.editorData.work);
        _.unset(work, "['@id']");
        mainEntity.instanceOf = work;
      }
      this.copyRecord = RecordUtil.getObjectAsRecord(mainEntity);
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
    headerThreshold() {
      const editorContainer = document.getElementById('editor-container');
      return editorContainer.offsetTop;
    },
    focusData() {
      return this.editorData.record;
    },
    isHolding() {
      return this.editorData.mainEntity['@type'] === 'Item';
    },
    inEdit() {
      return this.status.inEdit;
    },
    hasLocalWork() {
      return (typeof this.editorData.work !== 'undefined') ? true : false;
    }
  },
  components: {
    'marc-preview': MarcPreview,
  },
};
</script>

<template>
  <div class="container" id="editor-container">
    <div class="editor-controls" v-bind:class="{ 'bib-style': !isHolding, 'holding-style': isHolding }">
      <div class="admin-info">
        <div class="actions">
          <div class="action" v-on:click="toggleDev()" v-bind:class="{'active': status.isDev}">
            <i class="fa fa-wrench" aria-hidden="true"></i>
          </div>
          <div class="action" v-on:click="showHelp()">
            <i class="fa fa-question-circle action" aria-hidden="true"></i>
          </div>
          <div class="action">
            <span class="data-selector" v-on:click="otherFormatMenu = true">RDF <i class="fa fa-caret-down" aria-hidden="true"></i></span>
            <div class="other-format-menu" v-if="otherFormatMenu" v-on-clickaway="otherFormatMenu = false">
              <a :href="`${focusData['@id']}/data.jsonld`">JSON-LD</a>
              <a :href="`${focusData['@id']}/data.ttl`">Turtle</a>
              <a :href="`${focusData['@id']}/data.rdf`">RDF/XML</a>
            </div>
          </div>
          <marc-preview v-show="status.inEdit"></marc-preview>
          <button v-if="!status.inEdit && isSubClassOf('Instance') && downloadIsSupported && hasSigel" @click="getCompiledPost()">
            <i class="fa fa-download" aria-hidden="true"></i>
            {{"Compiled" | translatePhrase}}
          </button>
          <a :href="compileMARCUrl" v-if="!status.inEdit && isSubClassOf('Instance') & !downloadIsSupported && hasSigel">
            <button>
              <i class="fa fa-download" aria-hidden="true"></i>
              {{"Compiled" | translatePhrase}}
            </button>
          </a>
        </div>
        <div>
          <span class="type-label">{{editorData.mainEntity['@type'] | labelByLang}}</span>
          <span v-if="status.isNew" class="new-indicator">- [{{"new record" | translatePhrase}}]</span>
        </div>
        <div>
          <button class="removeButton" v-show="!status.inEdit" @click="removePost"><i class="fa fa-trash" aria-hidden="true"></i> {{"Remove" | translatePhrase}} post</button>
          <button v-if="!status.isNew" v-show="status.inEdit" @click="cancelEdit">
            <i class="fa fa-times" aria-hidden="true" v-show="!loadingCancel"></i>
            <i class="fa fa-fw fa-circle-o-notch fa-spin" aria-hidden="true" v-show="loadingCancel"></i>
            {{"Cancel" | translatePhrase}}
          </button>
          <button id="saveButton" v-on:click="save()" v-if="status.inEdit">
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="status.saved.loading"></i>
            <i class="fa fa-fw fa-save" v-show="!status.saved.loading"></i>
            {{ "Save" | translatePhrase }}
          </button>
          <button id="duplicateButton" @click="submitCopyForm" v-show="!status.inEdit">
            <i class="fa fa-fw fa-files-o"></i>
            {{ "Copy" | translatePhrase }}
          </button>
          <button id="editButton" v-on:click="edit()" v-show="!status.inEdit">
            <i class="fa fa-fw fa-pencil" v-show="!loadingEdit"></i>
            <i class="fa fa-fw fa-circle-o-notch fa-spin" v-show="loadingEdit"></i>
            {{ "Edit" | translatePhrase }}
          </button>
        </div>
      </div>
    </div>
    <form id="copyForm" method="POST" action="/edit">
      <textarea name="data" class="hidden">{{copyRecord | json}}</textarea>
    </form>
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

.container {
  padding: 0px;

  .editor-controls {
    &.bib-style {
      background-color: @bib-color;
      border: 1px solid darken(@bib-color, 5%);
    }
    &.holding-style {
      background-color: desaturate(darken(@holding-color, 10%), 10%);
      border: 1px solid darken(desaturate(darken(@holding-color, 10%), 10%), 5%);
    }
    .data-selector {
      padding: 0 0.5em;
    }
    .other-format-menu {
      position: absolute;
      top: 1.5em;
      line-height: 1.6;
      white-space: normal;
      a {
        background-color: @black;
        display: block;
        padding: 0.1em 0.5em;
        text-decoration: none;
        color: white;
        &:hover {
          background-color: @gray-dark;
        }
      }
      &::before {
        content: "";
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 5px 6px 5px;
        border-color: transparent transparent @black transparent;
        font-size: 0;
	      line-height: 0;
        margin-left: 29px;
      }
    }
    .admin-info {
      color: @white;
      flex-direction: row;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      padding: 5px 7px;
      .type-label {
        font-size: 1.6em;
        font-weight: bold;
      }
      .new-indicator {
        font-size: 1.6em;
      }
      .admin-node {
        flex-grow: 5;
        text-align: center;
        .node {
          font-size: 0.9em;
          vertical-align: middle;
        }
      }
      button {
        margin: 0 0.3em;
        padding: 3px 10px;
        font-size: 12px;
        line-height: 20px;
        background-color: #efefef;
        border: 1px solid rgba(27,31,35,0);
        &.removeButton {
          margin-right: 3em;
          background-color: gray;
          color: #e6e6e6;
          transition: background-color 0.25s ease;
          &:hover {
            background-color: #986e6e;
          }
        }
      }
      .actions {
        display: flex;
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
