<script>
import { mapGetters } from 'vuex';
import { partition, flatten } from 'lodash-es';
import * as StringUtil from 'lxljs/string';
import * as DisplayUtil from 'lxljs/display';
import * as httpUtil from '@/utils/http';
import { getCompactNumber } from '@/utils/math';
import { translatePhrase, capitalize } from '@/utils/filters';
import Spinner from '@/components/shared/spinner.vue';
import PanelComponent from '@/components/shared/panel-component.vue';
import PanelSearchList from '@/components/search/panel-search-list.vue';
import ModalPagination from '@/components/inspector/modal-pagination.vue';
import FacetMixin from '@/components/mixins/facet-mixin.vue';

export default {
  name: 'relations-list',
  mixins: [FacetMixin],
  props: {
    query: {
      default: null,
    },
    listContextType: {
      type: String,
      default: '',
    },
    listContextTypeMode: {
      type: String,
      default: '',
    },
    itemOf: {},
  },
  data() {
    return {
      currentPage: 0,
      maxResults: 20,
      isCompact: false,
      loading: true,
      error: null,
      searchResult: null,
      itemData: {},
      embellishedList: [],
      showInstances: false,
      hideByContext: {},
      displayFacets: ['@reverse', '@type', 'instanceOf.@type'],
      facets: {},
      allOption: {},
      selectedFacet: null,
      selectedQuery: this.query,
    };
  },
  emits: ['close'],
  methods: {
    translatePhrase,
    capitalize,
    go(n) {
      this.currentPage = n;
    },
    getResults() {
      this.loading = true;
      fetch(this.builtQuery)
        .then((response) => {
          if (response.status === 200) {
            response.json().then((result) => {
              this.searchResult = result;
              this.totalItems = result.totalItems;
              this.maxItems = parseInt(result.maxItems);
              if (this.selectedQuery === this.query) {
                this.allOption = this.buildAllOption();
                this.selectedFacet = this.allOption;
                this.facets = this.buildFacets(result);
              }
              this.loading = false;
            });
          }
        })
        .catch((error) => {
          this.error = error;
          this.loading = false;
        });
    },
    hide() {
      this.$emit('close');
    },
    toFacets(observations) {
      return observations.map((o) => ({
        query: httpUtil.decomposeQueryString(o.view['@id']),
        label: this.determineLabel(o.object),
        count: `(${getCompactNumber(o.totalItems)})`,
      })).sort((a, b) => a.label.localeCompare(b.label));
    },
    facetsForDimension(d) {
      const i = this.settings.interestingFacets[d.dimension] || [];
      // partition into "interesting" and less interesting facets
      const s = partition(d.observation, (o) => o.object && (i.includes(o.object._key) || i.includes(o.object['@id'])))
        .map((observations) => this.toFacets(observations));
      // insert divider if there are any "interesting" facets
      if (s[0].length > 0 && s[1] && s[1].length > 0) {
        s.splice(1, 0, [{ disabled: true, label: '────────────────────' }]);
      }

      return flatten(s);
    },
    buildFacets(searchResult) {
      if (searchResult && searchResult.stats) {
        const dimensions = searchResult.stats.sliceByDimension;
        return this.displayFacets
          .filter((key) => dimensions.hasOwnProperty(key))
          .map((key) => dimensions[key])
          .map((d) => ({
            name: d.dimension,
            facets: this.facetsForDimension(d),
          }));
      }
      return {};
    },
    buildAllOption() {
      const all = {};
      if (this.searchResult) {
        all.totalItems = this.searchResult.totalItems;
        all.query = this.query;
      }
      return all;
    },
    facetGroupLabelByLang(facetType) {
      const key = facetType.endsWith('@id') ? facetType.slice(0, -4) : facetType;
      if (this.settings.propertyChains.hasOwnProperty(key)) {
        return this.settings.propertyChains[key][this.user.settings.language];
      }

      return key;
    },
    handleFacetSelected() {
      if (this.selectedFacet) {
        this.currentPage = 0;
        this.selectedQuery = this.selectedFacet.query;
      }
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
      'user',
      'settings',
      'status',
    ]),
    settings() {
      return this.$store.getters.settings;
    },
    resultItems() {
      if (this.searchResult) {
        return this.searchResult.items;
      }
      return [];
    },
    hiddenComponents() {
      const context = this.listContextType;
      if (context.length > 0 && this.hideByContext.hasOwnProperty(context)) {
        return this.hideByContext[context];
      }
      return [];
    },
    builtQuery() {
      const queryPairs = this.selectedQuery;
      if (queryPairs === null) {
        return '';
      }
      queryPairs._offset = this.currentPage * this.maxResults;
      queryPairs._limit = this.maxResults;
      const q = `${this.settings.apiPath}/find.jsonld?`;
      return q + httpUtil.buildQueryString(queryPairs);
    },
    windowTitle() {
      if (this.listContextTypeMode === 'Instance') {
        let windowTitle = StringUtil.getUiPhraseByLang('Holdings of', this.user.settings.language, this.resources.i18n);
        windowTitle += ` ${this.itemOfTitle}`;
        return windowTitle;
      }
      const typeLabel = StringUtil.getLabelByLang(this.listContextType, this.user.settings.language, this.resources);
      return `${typeLabel} ${StringUtil.getUiPhraseByLang('Used in', this.user.settings.language, this.resources.i18n)}`;
    },
    itemOfTitle() {
      return DisplayUtil.getItemLabel(this.itemOf, this.resources, null, this.settings);
    },
  },
  components: {
    Spinner,
    'modal-pagination': ModalPagination,
    'panel-component': PanelComponent,
    'panel-search-list': PanelSearchList,
  },
  watch: {
    builtQuery(val, oldVal) {
      if (val.length > 0 && val !== oldVal) {
        this.getResults();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.getResults();
    });
  },
};
</script>

<template>
  <div class="RelationsList">
    <panel-component :title="windowTitle" :query="selectedQuery" @close="hide()">
      <template #panel-header-extra>
        <div class="RelationsList-searchHeader">
          <div
            class="Filter"
          >
            <label class="Filter-label" for="filter-select">{{ translatePhrase('Filter') }}</label>
            <select
              id="filter-select"
              class="Filter-select customSelect"
              v-model="selectedFacet"
              @change="handleFacetSelected"
              :aria-label="translatePhrase('Filter')">
              >
              <option :value="allOption">
                {{ translatePhrase("All") }} ({{ getCompactNumber(allOption) }})
              </option>
              <optgroup v-for="(group, index) in facets" :key="`group-${index}`" :label="facetGroupLabelByLang(group.name)">
                <option v-for="(option, index) in group.facets" :key="`option-${index}`" :value="option" :disabled="option.disabled">
                  {{ capitalize(option.label) }} {{ option.count }}
                </option>
              </optgroup>
            </select>
          </div>
        </div>
      </template>
      <template #panel-body>
        <div class="PanelComponent-searchStatus" v-show="loading">
          <Spinner size="2x" :message="translatePhrase('Searching')" />
        </div>
        <panel-search-list
          class="RelationsList-resultListContainer"
          :results="resultItems"
          :is-compact="isCompact"
          :list-item-settings="{ excludeProperties: this.listContextType === 'Instance' ? ['itemOf'] : [], excludeComponents: hiddenComponents }"
          icon="chain"
          text="Link entity"
          v-if="!loading && searchResult !== null && error == null"
        />
        <div v-if="error !== null">
          error happened: {{error}}
        </div>
      </template>
      <template #panel-footer>
        <div class="RelationsList-resultControls" v-if="!loading && resultItems.length > 0">
          <modal-pagination
            v-if="searchResult.totalItems > maxResults"
            @go="go"
            :total-items="totalItems"
            :max-items="maxItems"
            :max-per-page="maxResults"
            :current-page="currentPage"
          />
        </div>
      </template>
    </panel-component>
  </div>
</template>

<style lang="less">

.RelationsList {
  &-searchHeader {
    margin: 0 0 0.5em 0;
  }

  &-resultControls {
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    .ModalPagination {
      margin: 15px 10px;
    }
  }
  &-body {
    width: 100%;
    background-color: white;
    border: 1px solid #ccc;
    padding: 0px;
    overflow-y: scroll;
    .entity-summary {
      &:hover {
        background: darken(@white, 5%);
        cursor: pointer;
        .header {
          text-decoration: underline;
        }
      }
    }
  }
}

.Filter {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  align-items: flex-start;
  position: relative;

  &-label {
    margin: 0 10px 10px 0;
    font-weight: 600;
    position: absolute;
    font-size: 1.2rem;
    left: 1rem;
    top: 0.4rem;
    color: @brand-primary;
  }
  &-select {
    text-align: start;
    margin: 0 10px 10px 0;
    padding: 1.8rem 3.5rem 0 1rem;
    background-color: @white;
    border: 1px solid @grey-lighter;
    line-height: 2.8rem;
    height: 4.8rem;
  }
}
</style>
