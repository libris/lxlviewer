import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import remoteSearch from '../components/remote-search';
import HelpComponent from '../components/help-component';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getKeybindState, getStatus } from '../vuex/getters';
import { changeSettings, changeStatus, changeNotification, loadVocab, loadVocabMap, loadContext, loadDisplayDefs, changeSavedStatus, changeResultListStatus } from '../vuex/actions';

export default class Import extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;
    this.params = window.urlArgs;

    self.getLdDepencendies().then(() => {
      self.initVue();
    }, (error) => {
      console.log("Everything broke", error);
    });
  }

  initVue(vocab, vocabPfx, params) {
    const self = this;
    Vue.use(Vuex);

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    $('#app').show();

    Vue.filter('labelByLang', (label) => {
      return StringUtil.labelByLang(label, self.settings.language, self.vocabMap, self.settings.vocabPfx);
    });

    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    self.vm = new Vue({
      el: '#import',
      vuex: {
        actions: {
          loadVocab,
          loadVocabMap,
          loadContext,
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
        showHelp() {
          this.$dispatch('show-help', '');
        },
      },
      events: {
        'set-results': function (value, oldvalue) {
          this.result = value;
        },
        'show-help': function(value) {
          LayoutUtil.scrollLock(true);
          this.changeStatus('keybindState', 'help-window');
          this.changeStatus('showHelp', true);
          this.changeStatus('helpSection', value);
        },
      },
      computed: {
      },
      components: {
        'remote-search': remoteSearch,
        'help-component': HelpComponent,
      },
      store,
      ready() {
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadContext(self.context);
        this.loadVocabMap(self.vocabMap);
        this.loadDisplayDefs(self.display);
        LayoutUtil.showPage(this);
        document.title = `${StringUtil.getUiPhraseByLang('Import', this.settings.language)} - ${this.settings.siteInfo.title}`;
      },
    });
  }

}
