import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import remoteSearch from '../components/remote-search';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getKeybindState, getStatus } from '../vuex/getters';
import { changeSettings, changeStatus, changeNotification, loadVocab, loadVocabMap, loadDisplayDefs, changeSavedStatus, changeResultListStatus } from '../vuex/actions';

export default class Import extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;
    this.params = window.urlArgs;

    VocabUtil.getVocab().then((vocab) => {
      self.vocab = vocab['@graph'];
      self.vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));
      DisplayUtil.getDisplayDefinitions().then((display) => {
        self.display = display;
        self.initVue();
      }, (error) => {
        // showError(error);
      });
    }, (error) => {
      // showError(error);
    });
  }

  initVue(vocab, vocabPfx, params) {
    const self = this;
    Vue.use(Vuex);
    $('#app').show();

    const vm = new Vue({
      el: '#app',
      vuex: {
        actions: {
          loadVocab,
          loadVocabMap,
          loadDisplayDefs,
          changeSettings,
          changeStatus,
          changeSavedStatus,
          changeNotification,
          changeResultListStatus,
        },
        getters: {
          status: getStatus,
          settings: getSettings,
          editorData: getEditorData,
          vocab: getVocabulary,
          display: getDisplayDefinitions,
          keybindState: getKeybindState,
        },
      },
      data: {
        params,
        initialized: false,
        result: {},
      },
      methods: {
      },
      events: {
        'set-results': function (value, oldvalue) {
          this.result = value;
        },
      },
      computed: {
      },
      components: {
        'remote-search': remoteSearch,
      },
      store,
      ready() {
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadVocabMap(self.vocabMap);
        this.loadDisplayDefs(self.display);
        this.initialized = true;
      },
    });
  }

}
