import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import ComboKeys from 'combokeys';
import KeyBindings from '../keybindings.json';
import * as editUtil from '../utils/edit';
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
import EditorControls from '../components/editorcontrols';
import HeaderComponent from '../components/headercomponent';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';
import { changeSettings, loadVocab, loadDisplayDefs, syncData } from '../vuex/actions';

function showError(error) {
  $('#loadingText .fa-cog').fadeOut('fast', () => {
    $('#loadingText .fa-warning').removeClass('hidden').fadeIn('fast');
    $('#loadingText .status').text('').append('Något gick fel...');
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

    self.settings = {
      lang: 'sv',
      vocabPfx: 'kbv:',
      embeddedTypes: ['StructuredValue', 'ProvisionActivity', 'Contribution'],
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
    };
    $('#loadingText .fa-warning').hide();
    $('#loadingText .status').text('Hämtar vokabulär');
    VocabUtil.getVocab().then((vocab) => {
      self.vocab = vocab;
      $('#loadingText .status').text('Hämtar visningsdefinitioner');
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

  populateHolding(meta, thing) {
    const emptyHolding = JSON.stringify(RecordUtil.getEmptyHolding(thing['@id'], UserUtil.get('sigel')));
    $('#holdingItem').text(emptyHolding);
  }

  initVue() {
    const self = this;
    $('#loadingText').fadeOut('slow', function() {
      $('#editorApp').fadeIn('slow');
    });

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      return StringUtil.labelByLang(label, self.settings.lang, self.vocab, self.vocabPfx);
    });
    Vue.filter('removeDomain', (value) => {
      return StringUtil.removeDomain(value, self.settings.removableBaseUris);
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
        },
        getters: {
          settings: getSettings,
          editorData: getEditorData,
          vocab: getVocabulary,
          display: getDisplayDefinitions,
        },
      },
      data: {
        initialized: false,
        combokeys: null,
        status: {
          lastAdded: '',
          state: 'it',
          dirty: true,
          isDev: false,
          saved: {
            loading: false,
            status: {
              error: false,
              info: '',
            },
          },
        },
      },
      events: {
        'toggle-dev': function() {
          this.status.isDev = !this.status.isDev;
          console.log("dev", JSON.stringify(this.status.isDev));
        },
        'focus-update': function(value, oldValue) {
          const newData = this.editorData;
          console.log("Update");
          if (oldValue === this.editorData.meta) {
            newData.meta = value;
            // this.$set('meta', value);
          } else if (oldValue === this.editorData.thing) {
            newData.thing = value;
            // this.$set('thing', value);
          } else {
            console.warn('Something went wrong trying to update a focused object.');
          }
          this.syncData(newData);
        },
        'keyboard-binding-state': function(state) {
          // Bindings are defined in keybindings.json
          if (this.combokeys) {
            this.combokeys.detach();
          }
          this.combokeys = new ComboKeys(document.documentElement);
          require('combokeys/plugins/global-bind')(this.combokeys); // TODO: Solve with ES6 syntax
          const stateSettings = KeyBindings[state];
          console.log(stateSettings);
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
        'add-linked': function(item) {
          const newData = this.editorData;
          newData.linked.push(item);
          this.syncData(newData);
        },
        'save-item': function() {
          this.status.saved.loading = true;
          this.saveItem();
        },
        'check-changes': function() {
          // TODO: Some logic plz...
            this.status.dirty = true;
            console.log('Form is dirty?', this.status.dirty);
        },
        'show-message': function(messageObj) {
          console.log("Should show notification", JSON.stringify(messageObj));
        },
        'change-state': function(newState) {
          this.status.state = newState;
        },
        'update-last-added': function(fieldName) {
          this.status.lastAdded = fieldName;
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
      },
      methods: {
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        convertItemToMarc() {
          return httpUtil.post({
            url: '/_convert',
            token: self.access_token,
          },
            // Use clean method on args
            editUtil.getMergedItems(
              this.editorData.record,
              this.editorData.it,
              this.editorData.work,
              this.editorData.linked
            )
          );
        },
        saveItem() {
          const inputData = JSON.parse(document.getElementById('data').innerText);
          const obj = editUtil.getMergedItems(
            editUtil.removeNullValues(this.editorData.record),
            editUtil.removeNullValues(this.editorData.it),
            editUtil.removeNullValues(this.editorData.work),
            this.editorData.linked
          );

          // if (JSON.stringify(obj) === JSON.stringify(inputData)) {
          //   console.warn("No changes done, skipping to save. Time to tell the user?");
          // } else {
          const atId = this.editorData.record['@id'];
          if (atId) {
            this.doSave(atId, obj);
          } else {
            this.doCreate(obj);
          }
          // }
        },
        doSave(url, obj) {
          this.doRequest(httpUtil.put, obj, url);
        },
        doCreate(obj) {
          this.doRequest(httpUtil.post, obj, '/create');
        },
        doRequest(requestMethod, obj, url) {
          this.status.saved.loading = true;
          requestMethod({ url, token: self.access_token }, obj).then((result) => {
            console.log('Success was had');
            self.vm.syncData(RecordUtil.splitJson(result));
            self.vm.status.saved.loading = false;
            self.vm.status.saved.status = { error: false, info: '' };
            this.$dispatch('show-message', {
              title: 'OK!',
              msg: 'Posten blev sparad...',
              type: 'success',
            });
          }, (error) => {
            self.vm.status.saved.loading = false;
            self.vm.status.saved.status = { error: true, info: error };
            this.$dispatch('show-message', {
              title: 'Något gick fel!',
              msg: error,
              type: 'error',
            });
          });
        },
      },
      ready() {
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadDisplayDefs(self.display);
        this.syncData(self.dataIn);
        this.initialized = true;
        this.$dispatch('keyboard-binding-state', 'overview');
      },
      components: {
        'form-component': FormComponent,
        'editor-controls': EditorControls,
        'header-component': HeaderComponent,
      },
      store,
    });
  }
}
