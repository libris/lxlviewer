import * as _ from 'lodash';
import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as CombinedTemplates from '../templates/combinedTemplates.json';
import * as BaseTemplates from '../templates/baseTemplates.json';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';
import * as RecordUtil from '../utils/record';
import * as DisplayUtil from '../utils/display';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import CreateNewForm from '../components/create-new-form';
import HelpComponent from '../components/help-component';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getStatus, getKeybindState } from '../vuex/getters';
import { changeSettings, changeNotification, loadVocab, loadVocabMap, loadDisplayDefs, syncData, changeSavedStatus, changeStatus } from '../vuex/actions';

export default class CreateNew extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;
    this.language = 'sv';

    VocabUtil.getVocab().then((vocab) => {
      self.vocabMap = new Map(vocab['@graph'].map((entry) => [entry['@id'], entry]));
      self.vocab = vocab['@graph'];
      self.initVue();
    });
  }

  initVue() {
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
      el: '#createnew',
      vuex: {
        actions: {
          syncData,
          loadVocab,
          loadVocabMap,
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
      },
      watch: {
      },
      methods: {
        showHelp() {
          this.$dispatch('show-help', '');
        },
      },
      events: {
        'show-help': function(value) {
          LayoutUtil.scrollLock(true);
          this.changeStatus('keybindState', 'help-window');
          this.changeStatus('showHelp', true);
          this.changeStatus('helpSection', value);
        },
      },
      components: {
        'create-new-form': CreateNewForm,
        'help-component': HelpComponent,
      },
      store,
      ready() {
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadVocabMap(self.vocabMap);
        this.initialized = true;
        document.title = `${StringUtil.getUiPhraseByLang('Create new', this.settings.language)} - ${this.settings.siteInfo.title}`;
      },
    });
  }

}
