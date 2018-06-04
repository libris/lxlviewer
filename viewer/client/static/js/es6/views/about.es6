import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import EventMixin from '../components/mixins/global-event-mixin';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import AboutComponent from '../components/about/about-component';
import { getSettings } from '../vuex/getters';
import { changeSettings, updateUser, changeStatus } from '../vuex/actions';

export default class About extends View {

  initialize() {
    super.initialize();
    window.currentView = this;
    const self = this;
    self.initVue();
  }

  initVue() {
    const self = this;

    Vue.use(Vuex);

    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    self.vm = new Vue({
      el: '#about',
      mixins: [EventMixin],
      vuex: {
        getters: {
          settings: getSettings,
        },
        actions: {
          updateUser,
          changeSettings,
          changeStatus,
        },
      },
      data: {
        initialized: false,
      },
      events: {
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
        this.updateUser(self.user);
        this.changeSettings(self.settings);
        document.title = `${StringUtil.getUiPhraseByLang('About XL', this.settings.language)} - ${this.settings.siteInfo.title}`;
        LayoutUtil.showPage(this);
        this.initialized = true;
      },
      components: {
        'about-component': AboutComponent,
      },
      store,
    });
  }
}
