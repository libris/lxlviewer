import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import EventMixin from '../components/mixins/global-event-mixin';
import * as _ from 'lodash';
import * as StringUtil from '../utils/string';
import * as LayoutUtil from '../utils/layout';
import ServiceWidgetSettings from '../../../resources/json/serviceWidgetSettings.json';
import Copy from '../../../resources/json/copy.json';
import FacetControls from '../components/search/facet-controls';
import SearchResultComponent from '../components/search/search-result-component';
import SearchForm from '../components/search/search-form';
import DatasetObservations from '../components/search/dataset-observations';
import LinkCardComponent from '../components/search/link-card-component';
import { getSettings, getStatus } from '../vuex/getters';
import { changeSettings, changeNotification, loadContext, loadVocabMap, loadDisplayDefs, changeResultListStatus, changeStatus } from '../vuex/actions';

export default class PagedCollection extends View {

  initialize() {
    const self = this;
    Promise.all(self.getLdDependencies('vocab display context')).then(() => {
      self.initVue();
    }, (error) => {
      window.lxlError(error);
    });
    super.initialize();
    window.currentView = this;
    this.dataIn = JSON.parse(document.getElementById('data').innerText);
  }

  initVue() {
    const self = this;
    
    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      return StringUtil.getLabelByLang(label, self.settings.language, self.vocabMap, self.settings.vocabPfx, self.context);
    });
    Vue.filter('removeDomain', (value) => {
      return StringUtil.removeDomain(value, self.settings.removableBaseUris);
    });
    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    Vue.use(Vuex);

    self.vm = new Vue({
      el: '#pagedcollection',
      mixins: [EventMixin],
      vuex: {
        actions: {
          loadContext,
          loadVocabMap,
          loadDisplayDefs,
          changeSettings,
          changeStatus,
          changeNotification,
          changeResultListStatus,
        },
        getters: {
          settings: getSettings,
          status: getStatus,
        },
      },
      data: {
        initialized: false,
        combokeys: null,
        result: {},
      },
      events: {
        newresult(resultPromise) {
          this.changeResultListStatus('error', false);
          resultPromise.then((result) => {
            this.result = result;
            this.changeResultListStatus('loading', false);
          }, (error) => {
            this.changeResultListStatus('error', true);
            this.changeResultListStatus('loading', false);
            this.changeResultListStatus('info', 'Could not find result');
            console.log(error);
          });
        },
      },
      watch: {

      },
      methods: {
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        showHelp() {
          this.$dispatch('show-help', '');
        },
        widgetShouldBeShown(id) {
          if (!this.isLandingPage) {
            return false;
          }
          const componentList = ServiceWidgetSettings[this.settings.siteInfo.title];
          if (!componentList.hasOwnProperty(id)) {
            return false;
          }
          if (
            (componentList[id].hasOwnProperty('forced') && componentList[id].forced === true) ||
            // TODO: Don't read standard here, read from user settings and init as active in user settings if standard
            (componentList[id].hasOwnProperty('standard') && componentList[id].standard)
          ) {
            return true;
          }
          return false;
        },
      },
      computed: {
        isLibris() {
          return this.settings.siteInfo.title === 'libris.kb.se';
        },
        isLandingPage() {
          return typeof this.result.totalItems === 'undefined';
        },
        copy() {
          return Copy[this.settings.siteInfo.title];
        },
      },
      beforeCompile() {
        this.changeResultListStatus('loading', true);
      },
      ready() {
        this.changeSettings(self.settings);
        this.updateUser(self.user);
        this.loadContext(self.context);
        this.loadVocabMap(self.vocabMap);
        this.loadDisplayDefs(self.display);
        this.result = self.dataIn;
        this.changeResultListStatus('loading', false);
        LayoutUtil.showPage(this);
        document.title = `${StringUtil.getUiPhraseByLang('Search', this.settings.language)} - ${this.settings.siteInfo.title}`;
        if (Modernizr.history) {
          history.replaceState(this.result, 'unused');
          history.scrollRestoration = 'manual';
          window.onpopstate = e => {
            e.preventDefault();
            this.changeResultListStatus('loading', true);
            const resultPromise = new Promise((resolve, reject) => {
              if (e.state !== null) {
                resolve(e.state);
              } else {
                reject(Error('State error'));
              }
            });
            this.$dispatch('newresult', resultPromise);
            return false;
          };
        }
      },
      components: {
        'facet-controls': FacetControls,
        'search-result-component': SearchResultComponent,
        'search-form': SearchForm,
        'dataset-observations': DatasetObservations,
        'link-card': LinkCardComponent,
      },
      store,
    });
  }
}
