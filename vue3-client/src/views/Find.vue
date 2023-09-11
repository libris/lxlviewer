<script>
import { translatePhrase } from '@/utils/filters';
import { each, isArray, isPlainObject } from 'lodash-es';
import { mapActions, mapState, mapWritableState } from 'pinia';
import { useResourcesStore } from '@/stores/resources';
import { useStatusStore } from '@/stores/status';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import * as StringUtil from 'lxljs/string';
import * as RecordUtil from '@/utils/record';
import ServiceWidgetSettings from '@/resources/json/serviceWidgetSettings.json';
import Copy from '@/resources/json/copy.json';
import Spinner from '@/components/shared/Spinner.vue';
import FacetControls from '@/components/search/facet-controls.vue';
import SearchResult from '@/components/search/search-result.vue';
import TabMenu from '@/components/shared/tab-menu.vue';

export default {
  name: 'Find',
  data() {
    return {
      initialized: false,
      // combokeys: null,
      result: null,
      importData: [],
      searchInProgress: false,
      hideFacetColumn: true,
      query: '',
    };
  },
  watch: {
    '$route.fullPath'(value, oldValue) {
      if (value !== oldValue) {
        this.query = this.$route.fullPath.split('?')[1];
        this.getResult();
      }
    },
    '$route.params.perimeter'(value) {
      this.searchInProgress = false;
      this.emptyResults();
      this.hideFacetColumn = true;
      if (value === 'remote') {
        if (this.remoteDatabases.length === 0) {
          this.hideFacetColumn = false;
        }
      }
    },
  },
  methods: {
    translatePhrase,
    ...mapActions(useStatusStore, ['pushNotification']),
    setSearchPerimeter(id) {
      this.$router.push({ path: `/search/${id}` }).catch(() => {});
    },
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
      this.result = null;
      this.importData = [];
    },
    getLocalResult() {
      const fetchUrl = `${this.settings.apiPath}/find.jsonld?${this.query}`;
      fetch(fetchUrl).then((response) => {
        if (response.status === 400) {
          this.pushNotification({
            type: 'danger',
            message: `${StringUtil.getUiPhraseByLang('Invalid query', this.user.settings.language)}`
          });
        } else {
          response.json().then((result) => {
            this.result = result;
          }, () => {
            const msg = [
              `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.i18n)}`,
              `${StringUtil.getUiPhraseByLang('Could not process server response', this.user.settings.language, this.i18n)}`,
            ];

            this.pushNotification({
              type: 'danger',
              message: msg.join('. '),
            });
          });
        }

        this.searchInProgress = false;
      }, (error) => {
        this.pushNotification({
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.i18n)} ${error}`
        });

        this.searchInProgress = false;
      });
    },
    getRemoteResult() {
      const fetchUrl = `${this.settings.apiPath}/_remotesearch?${this.query}`;
      this.hideFacetColumn = true;

      fetch(fetchUrl, { headers: { Authorization: `Bearer ${this.user.token}` } }).then(response => response.json(), (error) => {
        this.pushNotification({
          type: 'danger',
          message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language, this.i18n)} ${error}`
        });
        this.searchInProgress = false;
      }).then((result) => {
        this.result = this.convertRemoteResult(result);

        this.workingRemoteDatabases = this.result.workingDbs;
        this.failedRemoteDatabases = this.result.failedDbs;

        if (this.result.failedDbs.length > 0) {
          const errorBase = StringUtil.getUiPhraseByLang('The following database(s) could not be reached, try again later:', this.user.settings.language, this.i18n);
          const errorMessage = `${errorBase} ${this.result.failedDbs.join(', ')}`;
          this.pushNotification({
            type: 'danger',
            message: errorMessage
          });
        }

        this.importData = result.items;
        this.searchInProgress = false;
      });
    },
    convertRemoteResult(result) {
      let totalResults = 0;

      let failedDbs = [];
      if (result.hasOwnProperty('errors')) {
        failedDbs = Object.keys(result.errors);
      }

      const workingDbs = [];
      for (const db in result.totalResults) {
        if (result.totalResults.hasOwnProperty(db) && !failedDbs.includes(db)) {
          totalResults += result.totalResults[db];
          workingDbs.push(db);
        }
      }

      const convertedList = { totalItems: totalResults, items: [], first: { '@id': this.query }, workingDbs: workingDbs, failedDbs: failedDbs };
      each(result.items, (item) => {
        const convertedItem = RecordUtil.getMainEntity(item.data['@graph']);
        convertedList.items.push(convertedItem);
      });
      return convertedList;
    },
    isArray(o) {
      return isArray(o);
    },
    isPlainObject(o) {
      return isPlainObject(o);
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
        (componentList[id].hasOwnProperty('forced') && componentList[id].forced === true)
        // TODO: Don't read standard here, read from user settings and init as active in user settings if standard
        || (componentList[id].hasOwnProperty('standard') && componentList[id].standard)
      ) {
        return true;
      }
      return false;
    },
  },
  computed: {
    ...mapState(useResourcesStore, ['i18n']),
    ...mapState(useStatusStore, ['panelOpen', 'remoteDatabases']),
    ...mapState(useUserStore, ['user']),
    ...mapState(useSettingsStore, ['settings']),
    ...mapWritableState(useStatusStore, ['workingRemoteDatabases', 'failedRemoteDatabases']),
    findTabs() {
      const tabs = [
        { 
          id: 'libris', 
          text: StringUtil.getUiPhraseByLang('Libris', this.user.settings.language, this.i18n),
        },
        { 
          id: 'remote', 
          text: StringUtil.getUiPhraseByLang('Other sources', this.user.settings.language, this.i18n),
          disabled: !this.user.isLoggedIn,
          tooltipText: !this.user.isLoggedIn ? StringUtil.getUiPhraseByLang('Sign in to search other sources', this.user.settings.language, this.i18n) : null,
        },
      ];
      return tabs;
    },
    copy() {
      return Copy;
    },
  },
  beforeCreate() {
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$route.params.perimeter !== 'libris' && this.$route.params.perimeter !== 'remote') {
        this.$router.push({ path: '/search/' });
      }
      if (!this.user.isLoggedIn && this.$route.params.perimeter === 'remote') {
        this.$router.push({ path: '/search/' });
      }
      this.query = this.$route.fullPath.split('?')[1];
      this.getResult();
      this.initialized = true;
    });
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'Inspector') {
      const startOffset = this.result.itemOffset;
      const relativeOffset = this.result.items.findIndex(item => RecordUtil.extractFnurgel(item['@id']) === to.params.fnurgel);
      const absoluteOffset = startOffset + relativeOffset;

      const breadcrumb = {
        resultUrl: from.fullPath,
        totalItems: this.result.totalItems,
        query: Object.assign({}, this.$route.query),
        relativeOffset,
        absoluteOffset,
        range: { start: startOffset, itemsPerPage: this.result.itemsPerPage },
        paths: this.result.items.map(el => el['@id']),
      };
      to.meta.breadcrumb = breadcrumb;
    }
    next();
  },
  components: {
    TabMenu,
    'facet-controls': FacetControls,
    'search-result': SearchResult,
    Spinner,
  },
};

</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-md-3 Column-facets" v-if="!panelOpen">
      <tab-menu
        @go="setSearchPerimeter"
        :active="$route.params.perimeter"
        :tabs="findTabs"
      />
      <div v-if="$route.params.perimeter === 'libris'" @click="hideFacetColumn = !hideFacetColumn" class="Find-facetHeading uppercaseHeading--light">
        {{ translatePhrase('Filter') }} 
        <font-awesome-icon
          :icon="['fas', 'caret-down']"
          class="hidden-md hidden-lg"
          v-if="!hideFacetColumn"
        />

        <font-awesome-icon
          :icon="['fas', 'caret-right']"
          class="hidden-md hidden-lg"
          v-if="hideFacetColumn"
        />
      </div>

      <facet-controls :class="{'hidden-xs hidden-sm': hideFacetColumn }" :result="result" v-if="result && result.stats && result.totalItems > 0 && $route.params.perimeter === 'libris'"></facet-controls>
      <portal-target name="facetColumn" />
    </div>

    <div v-show="searchInProgress" class="col-sm-12 col-md-9">
        <div class="Find-progressText">
          <Spinner size="lg" :message="translatePhrase('Searching')"></Spinner>
        </div>
    </div>

    <div
      class="col-sm-12 Find-content Column-searchResult" 
      :class="{
        'col-md-9': !panelOpen,
        'col-md-7': panelOpen
        }">
      <search-result
        v-show="!searchInProgress"
        :import-data="importData" 
        :result="result" 
        :query="query"
        v-if="result !== null && result.totalItems > -1">
      </search-result>
    </div>
  </div>
</template>

<style lang="scss">

.Find {
  &-facetHeading {
    user-select: none;
  }
  &-progressText {
    margin-top: 20px;
    height: 25vh;
    display: flex;
    flex-direction: column;
  }
}
.Column {
  &-facets {
    height: unset;
    min-height: unset;
    padding-bottom: 0;
    @include media-breakpoint-up(md) {
      padding-bottom: 5rem;
      height: 100%;
      min-height: 50vh;
    }
    border: solid $grey-lighter;
    border-width: 0px 1px 0px 0px;
    input {
      background-color: #fff;
      border: 1px solid $grey-lighter;
      margin: 0.5em 0;
      &:focus {
        border-color: $brand-primary;
      }
    }
    .sectionDivider {
      margin: 0.5em 0;
    }
  }
  &-searchForm {

  }
  &-searchResult {
  }
}

</style>
