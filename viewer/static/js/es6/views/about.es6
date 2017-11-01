import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import EventMixin from '../components/mixins/global-event-mixin';
import * as _ from 'lodash';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import AboutComponent from '../components/about-component';
import { getSettings } from '../vuex/getters';
import { changeSettings } from '../vuex/actions';

export default class About extends View {

  initialize() {
    super.initialize();

    const self = this;
    self.initVue();
  }

  initVue() {
    const self = this;

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
      el: '#about',
      mixins: [EventMixin],
      vuex: {
        getters: {
          settings: getSettings,
        },
        actions: {
          changeSettings,
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
