import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import EventMixin from '../components/mixins/global-event-mixin';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import remoteSearch from '../components/search/remote-search';
import { getSettings } from '../vuex/getters';
import { changeSettings, changeStatus, changeNotification, loadVocabMap, loadContext, loadDisplayDefs } from '../vuex/actions';

export default class Import extends View {

  initialize() {
    const self = this;
    Promise.all(self.getLdDependencies('vocab display context')).then(() => {
      self.initVue();
    }, (error) => {
      window.lxlError(error);
    });
    super.initialize();
    this.activeForm = '';
    this.transition = false;
    this.params = window.urlArgs;
  }

  initVue(vocab, vocabPfx, params) {
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
      el: '#import',
      mixins: [EventMixin],
      vuex: {
        actions: {
          loadVocabMap,
          loadContext,
          loadDisplayDefs,
          changeSettings,
          changeStatus,
          changeNotification,
        },
        getters: {
          settings: getSettings,
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
      },
      computed: {
      },
      components: {
        'remote-search': remoteSearch,
      
      },
      store,
      ready() {
        this.updateUser(self.user);
        this.changeSettings(self.settings);
        this.loadContext(self.context);
        this.loadVocabMap(self.vocabMap);
        this.loadDisplayDefs(self.display);
        LayoutUtil.showPage(this);
        document.title = `${StringUtil.getUiPhraseByLang('Import', this.settings.language)} - ${this.settings.siteInfo.title}`;
      },
    });
  }

}
