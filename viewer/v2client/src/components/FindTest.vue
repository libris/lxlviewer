<template>
  <div class="hello">
    <div class="row">
      <div class="col-md-3 facet-container" :class="{'facet-hidden': isLandingPage}">
        <!-- <facet-controls v-if="initialized == true" :result="result"></facet-controls> -->
      </div>
      <div v-bind:class="{'col-md-12': isLandingPage, 'col-md-9': !isLandingPage }" class="search-content-container">
        <!-- <search-form v-if="initialized == true" :result="result" site-title="${g.site.title}" filter-param="${g.site.filter_param}" :is-landing-page="isLandingPage"></search-form> -->
        <search-result-component :result="result" v-if="(initialized == true && result.totalItems > -1)"></search-result-component>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import * as StringUtil from '@/utils/string';
import * as LayoutUtil from '@/utils/layout';
import * as HttpUtil from '@/utils/http';
import ServiceWidgetSettings from '@/resources/json/serviceWidgetSettings.json';
import Copy from '@/resources/json/copy.json';
import FacetControls from '@/components/search/facet-controls';
import SearchResultComponent from '@/components/search/search-result-component';
import SearchForm from '@/components/search/search-form';
import DatasetObservations from '@/components/search/dataset-observations';
import LinkCardComponent from '@/components/search/link-card-component';
import IntroComponent from '@/components/search/intro-component';
import Modernizr from '@/../.modernizrrc.js';

import MockResult from '@/resources/json/mockResult.json';

export default {
  data: function () {
    return {
      initialized: false,
      combokeys: null,
      result: {},
    }
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
    mockResult() {
      this.result = MockResult;
    },
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
  beforeCreate() {
  },
  beforeCompile() {
    this.changeResultListStatus('loading', true);
  },
  mounted() {
    this.$nextTick(() => {
      this.mockResult();
      this.initialized = true;
    })

    // this.changeSettings(self.settings);
    // this.updateUser(self.user);
    // this.loadContext(self.context);
    // this.loadVocabMap(self.vocabMap);
    // this.loadDisplayDefs(self.display);
    // this.result = self.dataIn;
    // this.changeResultListStatus('loading', false);
    // LayoutUtil.showPage(this);
    // document.title = `${StringUtil.getUiPhraseByLang('Search', this.settings.language)} - ${this.settings.siteInfo.title}`;
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
    'intro-component': IntroComponent,
    'link-card': LinkCardComponent,
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
