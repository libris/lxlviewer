import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import EventMixin from '../components/mixins/global-event-mixin';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import AboutComponent from '../components/about-component';
import { getSettings } from '../vuex/getters';
import { changeSettings, changeStatus } from '../vuex/actions';

export default class About extends View {

  initialize() {
    super.initialize();
    const self = this;
    self.initVue();
  }

  initVue() {
    const self = this;

    Vue.use(Vuex);

    self.vm = new Vue({
      el: '#about',
      mixins: [EventMixin],
      vuex: {
        getters: {
          settings: getSettings,
        },
        actions: {
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
        this.changeSettings(self.settings);
        document.title = `${StringUtil.getUiPhraseByLang('About XL', this.settings.language)} - ${this.settings.siteInfo.title}`;
        LayoutUtil.showPage(this);
      },
      components: {
        'about-component': AboutComponent,
      },
      store,
    });
  }
}
