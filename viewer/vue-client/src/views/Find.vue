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
import { mapGetters } from 'vuex';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  data: function () {
    return {
      initialized: false,
      //combokeys: null,
      result: {},
      importData: [],
      searchInProgress: false,
      query: '',
    }
  },
  events: {
  },
  watch: {
    '$route.fullPath'(value, oldValue) {
      if (value !== oldValue) {
        this.query = this.$route.fullPath.split('?')[1];
        this.getResult();
      }
    },
  },
  methods: {
    getResult() {
      this.emptyResults();
      if (typeof this.query !== 'undefined') {
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
      const fetchUrl = `${this.settings.apiPath}/find.json?${this.query}`;

      fetch(fetchUrl).then((response) => {
        return response.json();
      }, (error) => {
        this.$store.dispatch('pushNotification', { type: 'danger', message: StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language) });
        this.searchInProgress = false;
      }).then((result) => {
        this.result = result;
        this.searchInProgress = false;
      });
    },
    getRemoteResult() {
      const fetchUrl = `${this.settings.apiPath}/_remotesearch?${this.query}`;
      
      fetch(fetchUrl).then((response) => {
        return response.json();
      }, (error) => {
        this.$store.dispatch('pushNotification', { type: 'danger', message: StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language) });
        this.searchInProgress = false;
      }).then((result) => {
        console.log(result);
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
      const convertedList = { totalItems: totalResults, items: [], first: {'@id': this.query } };
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
    ...mapGetters([
      'user',
      'settings',
      'status',
    ]),
    copy() {
      return Copy;
    },
  },
  beforeCreate() {
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$route.params.perimeter !== 'libris' && this.$route.params.perimeter !== 'remote') {
        this.$router.push({ path: `/search/` });
      }
      this.query = this.$route.fullPath.split('?')[1];
      this.getResult();
      this.initialized = true;
    })
  },
  components: {
    'facet-controls': FacetControls,
    'search-result': SearchResult,
    'search-form': SearchForm,
    'dataset-observations': DatasetObservations,
    'vue-simple-spinner': VueSimpleSpinner,
  },
};

</script>

<template>
  <div class="row">
    <div class="Find col-sm-12" :class="{'col-md-12': !status.panelOpen, 'col-md-7': status.panelOpen }" ref="Find">
      <search-form 
        :search-perimeter="$route.params.perimeter"
        :result-data="result">
      </search-form>
    </div>
    <div v-show="searchInProgress" class="col-sm-12">
        <div class="Find-progressText">
          <vue-simple-spinner size="large" :message="'Searching' | translatePhrase"></vue-simple-spinner>
        </div>
    </div>
    <div class="col-sm-12 col-md-3" v-if="!status.panelOpen && result.totalItems > 0 && $route.params.perimeter === 'libris'">
      <facet-controls :result="result" v-if="result.stats"></facet-controls>
    </div>
    <div 
      class="col-sm-12 Find-content" 
      :class="{
        'col-md-9': $route.params.perimeter === 'libris',
        'col-md-12': $route.params.perimeter === 'remote' && !status.panelOpen,
        'col-md-7': status.panelOpen
        }">
      <search-result
        v-show="!searchInProgress"
        :import-data="importData" 
        :result="result" 
        :query="query"
        v-if="result.totalItems > -1">
      </search-result>
    </div>
  </div>
</template>

<style lang="less">

.Find {
  &-progressText {
    margin-top: 20px;
  }
}

</style>
