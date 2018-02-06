<template>
  <div class="find">
    <div class="row">
      <div class="col-md-3 facet-container">
        <facet-controls :result="result"></facet-controls>
      </div>
      <div v-bind:class="{'col-md-12': isLandingPage, 'col-md-9': !isLandingPage }" class="search-content-container">
        <search-form :result="result"></search-form>
        <search-result-component :result="result" v-if="result.totalItems > -1"></search-result-component>
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

export default {
  data: function () {
    return {
      initialized: false,
      combokeys: null,
      result: {},
    }
  },
  events: {
  },
  watch: {
    '$route.params.query'(value) {
      this.getResult();
    },
  },
  methods: {
    getResult() {
      const fetchUrl = `http://librisxl.local.tech:5000/find.json?${this.$route.params.query}`;

      fetch(fetchUrl).then((response) => {
        return response.json();
      }, (error) => {
        console.warn("Search failed...");
      }).then((result) => {
        this.result = result;
      });
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
  mounted() {
    this.$nextTick(() => {
      this.getResult();
      this.initialized = true;
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
