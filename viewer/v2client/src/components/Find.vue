<template>
  <div class="find">
    <div class="row">
      <div class="col-md-3 facet-container">
        <facet-controls :result="result"></facet-controls>
      </div>
      <div class="col-md-9 search-content-container">
        <search-form :perimeter="searchPerimeter"></search-form>
        <search-result-component :import-data="importData" :result="result" v-if="result.totalItems && result.totalItems > -1"></search-result-component>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import * as RecordUtil from '@/utils/record';
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

import MockRemoteResult from '@/resources/json/mockRemoteResult.json';

export default {
  data: function () {
    return {
      initialized: false,
      combokeys: null,
      result: {},
      importData: [],
    }
  },
  events: {
  },
  watch: {
    '$route.name'(value) {
      this.getResult();
    },
    '$route.params.query'(value) {
      this.getResult();
    },
  },
  methods: {
    getResult() {
      this.result = {};
      this.importData = [];
      if (this.searchPerimeter === 'Libris') {
        this.getLocalResult();
      } else {
        this.getRemoteResult();
      }
    },
    getLocalResult() {
      const fetchUrl = `${this.settings.apiPath}/find.json?${this.$route.params.query}`;

      fetch(fetchUrl).then((response) => {
        return response.json();
      }, (error) => {
        this.$store.dispatch('pushNotification', { color: 'red', message: StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language) });
      }).then((result) => {
        this.result = result;
      });
    },
    getRemoteResult() {
      // const fetchUrl = `${this.settings.apiPath}/_remotesearch?${this.$route.params.query}`;
      
      // fetch(fetchUrl).then((response) => {
      //   return response.json();
      // }, (error) => {
      //   this.$store.dispatch('pushNotification', { color: 'red', message: StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language) });
      // }).then((result) => {
        const response = MockRemoteResult;
        this.result = this.convertRemoteResult(response);
        this.importData = response.items;
      // });
    },
    convertRemoteResult(result) {
      let totalResults = 0;
      for (const db in result.totalResults) {
        if (result.totalResults.hasOwnProperty(db)) {
           totalResults += result.totalResults[db];
        }
      }
      const convertedList = { totalItems: totalResults, items: []};
      _.each(result.items, (item) => {
        const convertedItem = RecordUtil.getMainEntity(item.data['@graph']);
        convertedList.items.push(convertedItem);
      })
      return convertedList;
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
    searchPerimeter() {
      switch(this.$route.name) {
        case 'SearchRemote':
          return 'Remote';
        break;
        case 'SearchLibris':
          return 'Libris';
        break;
        default:
          return 'Libris';
        break;
      }
    },
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    copy() {
      return Copy[this.settings.siteInfo.title];
    },
  },
  beforeCreate() {
  },
  mounted() {
    this.$nextTick(() => {
      this.getResult();
      this.initialized = true;
      console.log(this.$route);
    })
  },
  components: {
    'facet-controls': FacetControls,
    'search-result-component': SearchResultComponent,
    'search-form': SearchForm,
    'dataset-observations': DatasetObservations,
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
