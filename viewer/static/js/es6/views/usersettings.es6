import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import HelpComponent from '../components/help-component';
import UserSettingsApp from '../components/user-settings';
import { getSettings, getStatus } from '../vuex/getters';
import { changeSettings, changeStatus } from '../vuex/actions';


export default class UserSettings extends View {

  initialize() {
    super.initialize();
    this.initVue();
  }

  initVue() {
    const self = this;

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      return StringUtil.labelByLang(label, self.settings.language, self.vocabMap, self.settings.vocabPfx);
    });
    Vue.filter('removeDomain', (value) => {
      return StringUtil.removeDomain(value, self.settings.removableBaseUris);
    });
    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    Vue.use(Vuex);

    self.vm = new Vue({
      el: '#usersettings',
      vuex: {
        actions: {
          changeSettings,
          changeStatus,
        },
        getters: {
          status: getStatus,
          settings: getSettings,
        },
      },
      data: {
        initialized: false,
      },
      events: {
        'show-help': function(value) {
          LayoutUtil.scrollLock(true);
          this.changeStatus('keybindState', 'help-window');
          this.changeStatus('showHelp', true);
          this.changeStatus('helpSection', value);
        },
      },
      watch: {
      },
      methods: {
        showHelp() {
          this.$dispatch('show-help', '');
        },
      },
      computed: {
      },
      ready() {
        this.changeSettings(self.settings);
        document.title = `${StringUtil.getUiPhraseByLang('Settings', this.settings.userSettings.language)} - ${this.settings.siteInfo.title}`;
        LayoutUtil.showPage(this);
      },
      components: {
        'help-component': HelpComponent,
        'user-settings': UserSettingsApp,
      },
      store,
    });
  }
}
