<script>
import * as _ from 'lodash';
import * as RecordUtil from '@/utils/record';
import * as StringUtil from '@/utils/string';
import * as LayoutUtil from '@/utils/layout';
import * as HttpUtil from '@/utils/http';
import ServiceWidgetSettings from '@/resources/json/serviceWidgetSettings.json';
import Copy from '@/resources/json/copy.json';
import FacetControls from '@/components/search/facet-controls';
import SearchResult from '@/components/search/search-result';
import SearchForm from '@/components/search/search-form';
import DatasetObservations from '@/components/search/dataset-observations';
import LinkCardComponent from '@/components/search/link-card';
import IntroComponent from '@/components/search/link-card';
import Modernizr from '@/../.modernizrrc.js';

import MockRemoteResult from '@/resources/json/mockRemoteResult.json';

export default {
  data: function () {
    return {
      initialized: false,
      combokeys: null,
      result: {},
      importData: [],
      searchInProgress: false,
    }
  },
  events: {
  },
  watch: {
    '$route.params.perimeter'(value) {
      this.getResult();
    },
    '$route.params.query'(value) {
      this.getResult();
    },
  },
  methods: {
    getResult() {
      this.emptyResults();
      if (typeof this.$route.params.query !== 'undefined') {
        this.searchInProgress = true;
        if (this.$route.params.perimeter === 'libris') {
          this.getLocalResult();
        } else {
          this.getRemoteResult();
        }
      }
    },
    emptyResults() {
      this.result = {};
      this.importData = [];
    },
    getLocalResult() {
      const fetchUrl = `${this.settings.apiPath}/find.json?${this.$route.params.query}`;

      fetch(fetchUrl).then((response) => {
        return response.json();
      }, (error) => {
        this.$store.dispatch('pushNotification', { color: 'red', message: StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language) });
        this.searchInProgress = false;
      }).then((result) => {
        this.result = result;
        this.searchInProgress = false;
      });
    },
    getRemoteResult() {
      const fetchUrl = `${this.settings.apiPath}/_remotesearch?${this.$route.params.query}`;
      fetch(fetchUrl).then((response) => {
        return response.json();
      }, (error) => {
        this.$store.dispatch('pushNotification', { color: 'red', message: StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language) });
        this.searchInProgress = false;
      }).then((result) => {
        this.result = this.convertRemoteResult(result);
        this.importData = result.items;
        this.searchInProgress = false;
      });
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
      if (this.$route.params.perimeter !== 'libris' && this.$route.params.perimeter !== 'remote') {
        this.$router.push({ path: `/search/` });
      }
      this.getResult();
      this.initialized = true;
    })
  },
  components: {
    'facet-controls': FacetControls,
    'search-result': SearchResult,
    'search-form': SearchForm,
    'dataset-observations': DatasetObservations,
  },
};

</script>

<template>
  <div class="find">
    <div class="row">
      <div class="col-md-3">
        <facet-controls :result="result"></facet-controls>
      </div>
      <div class="col-md-9 Find-content">
        <search-form :search-perimeter="$route.params.perimeter"></search-form>
        <div v-show="searchInProgress" class="panel panel-default">
          <div class="Find-progressText">
            {{ 'Searching' | translatePhrase }} <i class="fa fa-circle-o-notch fa-spin"></i>
          </div>
        </div>
        <search-result :import-data="importData" :result="result" v-show="result.totalItems > -1 && !searchInProgress"></search-result>
      </div>
    </div>
  </div>
</template>

<style lang="less">

.Find {
  &-progressText {
    padding: 20px;
  }
}

</style>
