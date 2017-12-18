import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import CreateNewForm from '../components/create-new-form';
import EventMixin from '../components/mixins/global-event-mixin';
import { getSettings, getVocabulary, getContext, getKeybindState } from '../vuex/getters';
import { changeSettings, loadVocabMap, loadVocab, loadContext, changeStatus } from '../vuex/actions';

export default class CreateNew extends View {

  initialize() {
    const self = this;
    Promise.all(self.getLdDependencies('vocab context')).then(() => {
      self.initVue();
    }, (error) => {
      window.lxlError(error);
    });
    super.initialize();
    this.activeForm = '';
    this.transition = false;
    this.language = 'sv';
  }

  initVue() {
    const self = this;
    Vue.use(Vuex);

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      return StringUtil.getLabelByLang(label, self.settings.language, self.vocabMap, self.settings.vocabPfx, self.context);
    });

    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    self.vm = new Vue({
      el: '#createnew',
      mixins: [EventMixin],
      vuex: {
        actions: {
          loadVocabMap,
          loadVocab,
          loadContext,
          changeStatus,
          changeSettings,
        },
        getters: {
          settings: getSettings,
          vocab: getVocabulary,
          context: getContext,
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
      components: {
        'create-new-form': CreateNewForm,
      },
      store,
      ready() {
        this.updateUser(self.user);
        this.changeSettings(self.settings);
        this.loadContext(self.context);
        this.loadVocabMap(self.vocabMap);
        this.loadVocab(self.vocab);
        LayoutUtil.showPage(this);
        document.title = `${StringUtil.getUiPhraseByLang('Create new', this.settings.language)} - ${this.settings.siteInfo.title}`;
      },
    });
  }

}
