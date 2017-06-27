import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import ComboKeys from 'combokeys';
import KeyBindings from '../keybindings.json';
import * as DataUtil from '../utils/data';
import * as LayoutUtil from '../utils/layout';
import * as httpUtil from '../utils/http';
import * as toolbarUtil from '../utils/toolbar';
import * as _ from 'lodash';
import * as VocabLoader from '../utils/vocabloader';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as RecordUtil from '../utils/record';
import * as UserUtil from '../utils/user';
import * as StringUtil from '../utils/string';
import FormComponent from '../components/formcomponent';
import HelpComponent from '../components/help-component';
import EditorControls from '../components/editorcontrols';
import HeaderComponent from '../components/headercomponent';
import Notification from '../components/notification';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus, getKeybindState } from '../vuex/getters';
import { changeSettings, changeNotification, loadVocab, loadDisplayDefs, syncData, changeSavedStatus, changeStatus } from '../vuex/actions';

function showError(error) {
  $('#loadingText .fa-circle-o-notch').fadeOut('fast', () => {
    $('#loadingText .fa-warning').removeClass('hidden').fadeIn('fast');
    $('#loadingText .mainStatus').text('').append(StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language));
    $('#loadingText .status').text('');
    $('#loadingText .error').text('').append(error).removeClass('hidden').fadeIn('slow');
  });
}

export default class Editor extends View {

  initialize() {
    super.initialize();
    VocabLoader.initVocabClicks();
    toolbarUtil.initToolbar(this);
    this.dataIn = RecordUtil.splitJson(JSON.parse(document.getElementById('data').innerText));
    const self = this;

    $('#loadingText .fa-warning').hide();
    const loadingStr = `${StringUtil.getUiPhraseByLang("Loading", self.settings.language)} ${StringUtil.getUiPhraseByLang("Post", self.settings.language).toLowerCase()}`;
    $('#loadingText .mainStatus').text(loadingStr);
    // $('#loadingText .status').text('Hämtar vokabulär');
    VocabUtil.getVocab().then((vocab) => {
      self.vocab = vocab['@graph'];
      // $('#loadingText .status').text('Hämtar visningsdefinitioner');
      DisplayUtil.getDisplayDefinitions().then((display) => {
        self.display = display;
        self.initVue();
      }, (error) => {
        showError(error);
      });
    }, (error) => {
      showError(error);
    });
  }

  initVue() {
    const self = this;
    $('#loadingText').fadeOut('fast', function() {
      $('#editorApp').fadeIn('fast');
    });

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      return StringUtil.labelByLang(label, self.settings.language, self.vocab, self.settings.vocabPfx);
    });
    Vue.filter('removeDomain', (value) => {
      return StringUtil.removeDomain(value, self.settings.removableBaseUris);
    });
    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    Vue.use(Vuex);

    self.vm = new Vue({
      el: '#editorApp',
      vuex: {
        actions: {
          syncData,
          loadVocab,
          loadDisplayDefs,
          changeSettings,
          changeSavedStatus,
          changeStatus,
          changeNotification,
        },
        getters: {
          settings: getSettings,
          editorData: getEditorData,
          vocab: getVocabulary,
          display: getDisplayDefinitions,
          status: getStatus,
          keybindState: getKeybindState,
        },
      },
      data: {
        initialized: false,
        combokeys: null,
        locked: true,
      },
      events: {
        'focus-update': function(value, oldValue) {
          const newData = this.editorData;
          console.log("Update");
          if (oldValue === this.editorData.meta) {
            newData.meta = value;
          } else if (oldValue === this.editorData.thing) {
            newData.thing = value;
          } else {
            console.warn('Something went wrong trying to update a focused object.');
          }
          this.syncData(newData);
        },
        'add-linked': function(item) {
          const newData = this.editorData;
          const graphId = RecordUtil.extractFnurgel(item['@id']) || item['@id'];
          const graphObj = {
            '@id': graphId,
            '@graph': [item],
          };
          newData.quoted.push(graphObj);
          this.syncData(newData);
        },
        'save-item': function() {
          this.saveItem();
        },
        'show-help': function(value) {
          LayoutUtil.scrollLock(true);
          this.changeStatus('keybindState', 'help-window');
          this.changeStatus('showHelp', true);
          this.changeStatus('helpSection', value);
        },
        'edit-item': function() {
          this.editItem();
        },
        'cancel-edit': function() {
          this.changeStatus('inEdit', false);
          this.syncData(Object.assign({}, this.status.lastSavedData));
        },
      },
      watch: {
        copyId(value, oldval) {
          if (value.length === 0 && oldval && oldval.length > 0) {
            this.copy.state = '';
          } else if (!/[^a-z0-9]/gi.test(value)) {
            this.getCopyItem(value);
          } else {
            this.copy.state = 'invalid';
          }
        },
        keybindState(state) {
          // Bindings are defined in keybindings.json
          if (this.combokeys) {
            this.combokeys.detach();
          }
          this.combokeys = new ComboKeys(document.documentElement);
          require('combokeys/plugins/global-bind')(this.combokeys); // TODO: Solve with ES6 syntax
          const stateSettings = KeyBindings[state];
          if (typeof stateSettings !== 'undefined') {
            _.each(stateSettings, (value, key) => {
              if (value !== null && value !== '') {
                this.combokeys.bindGlobal(key.toString(), () => {
                  this.$broadcast(value);
                });
              }
            });
          }
        },
      },
      methods: {
        initiateWarnBeforeUnload() {
          window.addEventListener("beforeunload", function (e) {
            if (!self.dirty) {
                return undefined;
            }
            const confirmationMessage = StringUtil.getUiPhraseByLang('You have unsaved changes. Do you want to leave the page?', self.settings.language);

            (e || window.event).returnValue = confirmationMessage; //Gecko + IE
            return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
          });
        },
        removeWarnBeforeUnload() {
          self.dirty = false;
          window.onbeforeunload = null;
        },
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        editItem() {
          if (UserUtil.isLoggedIn(window.userInfo)) {
            self.dirty = true;
            this.initiateWarnBeforeUnload();
            this.changeStatus('inEdit', true);
          } else {
            window.location = '/login';
          }
        },
        getCollectionName(entity) {
          const vocabPfx = this.settings.vocabPfx;
          const baseClasses = VocabUtil.getBaseClasses(entity['@type'], this.vocab, vocabPfx);
          const classList = [entity['@type']].concat(baseClasses);
          for (const cn of classList) {
            if (cn === 'Instance' || cn === `${vocabPfx}Instance`) {
              return 'bib';
            } else if (cn === 'Item' || cn === `${vocabPfx}Item`) {
              return 'hold';
            }
          }
          return 'auth';
        },
        saveItem() {
          const inputData = JSON.parse(document.getElementById('data').innerText);
          const ETag = this.editorData.record.modified;
          const RecordId = this.editorData.record['@id'];
          const obj = DataUtil.getMergedItems(
            DataUtil.removeNullValues(this.editorData.record),
            DataUtil.removeNullValues(this.editorData.mainEntity),
            DataUtil.removeNullValues(this.editorData.work),
            this.editorData.quoted
          );

          if (!RecordId || RecordId === '_:TEMP_ID') { // No ID -> create new
            this.doCreate(obj);
          } else { // ID exists -> update
            this.doUpdate(RecordId, obj, ETag);
          }
        },
        doUpdate(url, obj, ETag) {
          this.doSaveRequest(httpUtil.put, obj, url, ETag);
        },
        doCreate(obj) {
          this.doSaveRequest(httpUtil.post, obj, '/');
        },
        doSaveRequest(requestMethod, obj, url, ETag) {
          requestMethod({ url, token: self.access_token, ETag }, obj).then((result) => {
            if (result.status === 201) {
              window.location = result.getResponseHeader('Location');
            } else {
              const postUrl = `${result.getResponseHeader('Location')}/data.jsonld`;
              httpUtil.get({ url: postUrl }).then((getResult) => {
                const newData = RecordUtil.splitJson(getResult);
                self.vm.syncData(newData);
                self.vm.changeStatus('lastSavedData', Object.assign({}, newData));
                self.vm.changeSavedStatus('loading', false);
                self.vm.changeSavedStatus('error', false);
                self.vm.changeSavedStatus('info', '');
                self.vm.changeNotification('color', 'green');
                self.vm.changeNotification('message', `${StringUtil.getUiPhraseByLang('The post was saved', this.settings.language)}!`);
                this.changeStatus('inEdit', false);
                this.removeWarnBeforeUnload();
              }, (error) => {
                self.vm.changeSavedStatus('loading', false);
                self.vm.changeNotification('color', 'red');
                self.vm.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`);
              });
            }
          }, (error) => {
            self.vm.changeSavedStatus('loading', false);
            self.vm.changeNotification('color', 'red');
            self.vm.changeNotification('message', `${StringUtil.getUiPhraseByLang('Something went wrong', this.settings.language)} - ${error}`);
          });
        },
      },
      ready() {
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadDisplayDefs(self.display);
        this.syncData(self.dataIn);
        this.changeStatus('lastSavedData', Object.assign({}, self.dataIn));
        this.initialized = true;
        this.changeStatus('keybindState', 'overview');

        const atId = this.editorData.record['@id'];
        if (!atId || atId === '_:TEMP_ID') {
          this.editItem();
        }
      },
      components: {
        'form-component': FormComponent,
        'editor-controls': EditorControls,
        'header-component': HeaderComponent,
        'help-component': HelpComponent,
        'notification': Notification,
      },
      store,
    });
  }
}
