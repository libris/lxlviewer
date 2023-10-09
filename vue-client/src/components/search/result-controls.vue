<script>
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import * as httpUtil from '@/utils/http';
import Sort from '@/components/search/sort';
import FilterBadge from '@/components/search/filter-badge';
import LensMixin from '@/components/mixins/lens-mixin';
import FacetMixin from '@/components/mixins/facet-mixin';
import PropertyMappings from '@/resources/json/propertymappings.json';

export default {
  name: 'result-controls',
  mixins: [LensMixin, FacetMixin],
  props: {
    pageData: {},
    showDetails: {
      type: Boolean,
      default: false,
    },
    showPages: {
      type: Boolean,
      default: false,
    },
    hasPagination: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      keyword: '',
    };
  },
  computed: {
    ...mapGetters([
      'resources',
      'user',
      'settings',
      'status',
    ]),
    excludeFilters() {
      const filtersToBeExcluded = PropertyMappings.flatMap(prop => Object.keys(prop.mappings));
      return filtersToBeExcluded;
    },
    filteredByHasItem() {
      return this.$route.query.hasOwnProperty('@reverse.itemOf.heldBy.@id') && this.$route.query['@reverse.itemOf.heldBy.@id'] === `https://libris.kb.se/library/${this.user.settings.activeSigel}`;
    },
    filters() {
      let filters = [];
      if (typeof this.pageData.search !== 'undefined') {
        // remove search-by filters, ISBN etc
        filters = this.pageData.search.mapping.filter(item => this.excludeFilters.every(el => el !== item.variable))
          .map((item) => {
            let label = '';

            if (item.hasOwnProperty('value')) { // Try to use item value to get label
              label = item.value;
            } else if (item.variable === 'p' && item.hasOwnProperty('predicate')) { // FIXME
              label = this.determineLabel(item.predicate);
            } else if (item.hasOwnProperty('object')) { 
              label = this.getLabel(item.object);
            }

            let predicateLabel = '';
            if (item.variable !== 'p' && item.hasOwnProperty('predicate')) { // FIXME
              const k = (item.variable === 'and-@type') || (item.variable === '@type') 
                ? { '@id': '@type' } 
                : item.predicate;
              
              predicateLabel = this.determineLabel(k);
            }

            return {
              label,
              predicateLabel: predicateLabel,
              variable: item.variable,
              up: item.up['@id'],
            };
          });
      }
      const filtersWithoutWildcard = filters.filter(item => item.label !== '*'); // Remove any filters that's just a wildcard
      return filtersWithoutWildcard;
    },
    queryText() {
      if (this.pageData.first) {
        return StringUtil.getParamValueFromUrl(this.pageData.first['@id'], 'q');
      }
      console.warn('Search details is missing Q parameter');
      return '';
    },
    limit() {
      const limitFromUrl = StringUtil.getParamValueFromUrl(this.pageData.first['@id'], '_limit');
      if (limitFromUrl !== null) {
        return limitFromUrl;
      } 
      return 20;
    },
    pageList() {
      const list = [];
      if (!this.pageData || !this.pageData.first) {
        console.warn('Search failed in getting pagination data');
        return list;
      }
      const first = this.pageData.first['@id'];
      const offset = this.pageData.itemOffset;
      const maxResult = Math.min(this.pageData.totalItems, this.pageData.maxItems);
      const noOfPages = Math.ceil(maxResult / parseInt(this.limit)) || 1;
      const currentPage = parseInt(offset / this.limit);
      let paddedPages = 3;
      if (currentPage < paddedPages) {
        paddedPages = paddedPages + 1 + (paddedPages - currentPage - 1);
      } else if (currentPage + paddedPages > noOfPages) {
        paddedPages = paddedPages + 1 + (currentPage + paddedPages - noOfPages);
      }
      const minPage = currentPage - paddedPages;
      const maxPage = currentPage + paddedPages;
      if (minPage > 0) {
        list.push({ pageLabel: '...' });
      }

      for (let i = 0; i < noOfPages; i++) {
        const pageOffset = i * this.limit;
        if (i >= minPage && i <= maxPage) {
          list.push({ pageLabel: i + 1, link: `${first}&_offset=${pageOffset}`, active: (i === currentPage) });
        }
      }
      if (noOfPages > maxPage) {
        list.push({ pageLabel: '...' });
      }

      return list;
    },
    searchedTypes() {
      return this.$route.query['@type'];
    },
    currentSortOrder() {
      return this.$route.query._sort;
    },
    resultRange() {
      if (this.$route.params.perimeter === 'remote') {
        return `1-${this.pageData.itemsPerPage}`;
      } 
      const first = this.pageData.itemOffset + 1;
      let last = this.pageData.itemOffset + this.pageData.itemsPerPage;
      if (last > this.pageData.totalItems) {
        last = this.pageData.totalItems;
      }
      return `${first}-${last}`;
    },
  },
  methods: {
    toggleFilterByHasItem() {
      if (this.filteredByHasItem) {
        this.removeFilter('@reverse.itemOf.heldBy.@id');
      } else {
        this.addFilter('@reverse.itemOf.heldBy.@id', `https://libris.kb.se/library/${this.user.settings.activeSigel}`);
      }
    },
    addFilter(key, value) {
      const newQuery = Object.assign({}, this.$route.query);
      newQuery[key] = value;
      this.$router.push({ path: this.$route.currentPath, query: newQuery });
    },
    removeFilter(key) {
      const newQuery = Object.assign({}, this.$route.query);
      if (newQuery.hasOwnProperty(key)) {
        delete newQuery[key];
        this.$router.push({ path: this.$route.currentPath, query: newQuery });
      }
    },
    setCompact() {
      const user = this.user;
      user.settings.resultListType = 'compact';
      this.$store.dispatch('setUser', user);
    },
    setFull() {
      const user = this.user;
      user.settings.resultListType = 'detailed';
      this.$store.dispatch('setUser', user);
    },
    getNewResult(url) {
      this.changeResultListStatus('loading', true);
      const resultPromise = new Promise((resolve, reject) => {
        httpUtil.get({ url: url, accept: 'application/ld+json' }).then((response) => {
          // TODO: investigate if we need to do something here: https://router.vuejs.org/guide/migration/#Usage-of-history-state
          window.history.pushState(response, 'unused', response['@id']);
          resolve(response);
        }, (error) => {
          window.history.pushState({}, 'unused', url);
          reject('Error searching...', error);
        });
      });
      this.$dispatch('newresult', resultPromise);
    },
    // clearAllFilters() { // introduce when we have 'type' radio buttons
    //   const currentQuery = Object.assign({}, this.$route.query);
    //   const clearedQuery = pickBy(currentQuery, (value, key) => this.filters.every(el => el.variable !== key));
    //   this.$router.push({ query: clearedQuery });
    // },
  },
  components: {
    sort: Sort,
    FilterBadge,
  },
};
</script>

<template>
  <div class="ResultControls" v-if="!(!showDetails && pageData.totalItems < limit)">
    <div class="ResultControls-searchDetails" v-if="showDetails">
      <p class="ResultControls-resultText" id="resultDescr">
        <span v-if="pageData.totalItems > 0"> {{['Showing', resultRange, 'of'] | translatePhrase }} </span>
        <span v-if="pageData.totalItems > 0" class="ResultControls-numTotal"> {{pageData.totalItems}} {{'Hits' | translatePhrase | lowercase}}</span>
        <span v-else class="ResultControls-numTotal">{{'No hits' | translatePhrase }}</span>
        
        <span v-if="$route.params.perimeter === 'remote' && status.workingRemoteDatabases.length > 0">{{ 'from' | translatePhrase }} <span v-for="(db, index) in status.workingRemoteDatabases" :key="index"><span class="ResultControls-dbLabel">{{ db }}</span>{{ index !== status.workingRemoteDatabases.length - 1 ? ', ' : '' }}</span></span>
      </p>
      <p class="ResultControls-resultText" v-if="$route.params.perimeter === 'remote' && pageData.totalItems > limit">
        {{ 'The search gave more results than can be displayed' | translatePhrase }}.
      </p>
      <div class="ResultControls-controlWrap" v-if="showDetails && pageData.totalItems > 0">
        <sort 
          v-if="searchedTypes && $route.params.perimeter != 'remote'"
          :currentSort="currentSortOrder ? currentSortOrder : ''"
          :common-sort-fallback="true"
          :recordTypes="searchedTypes"
          @change="$emit('sortChange', $event)"/>
        <div class="ResultControls-listTypes">
          <button class="ResultControls-listType icon icon--md"
            v-on:click="setFull()" 
            v-bind:class="{'is-active': user.settings.resultListType === 'detailed' }"
            :title="'Detailed view' | translatePhrase">
            <i class="fa fa-th-list"></i>
          </button>
          <button class="ResultControls-listType icon icon--md" 
            v-on:click="setCompact()" 
            v-bind:class="{'is-active': user.settings.resultListType === 'compact' }"
            :title="'Compact view' | translatePhrase">
            <i class="fa fa-list"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="ResultControls-secondary">
      <div class="ResultControls-filterWrapper" v-if="showDetails && filters.length > 0">
        <FilterBadge class="ResultControls-filterBadge" v-for="(filter, index) in filters" :key="index" :filter="filter" />
      </div>
    </div>
    <nav v-if="hasPagination && showPages">
      <ul class="ResultControls-pagList">
        <li class="ResultControls-pagItem" 
          v-bind:class="{ 'is-disabled': !pageData.first || pageData['@id'] === pageData.first['@id'] }">
          <router-link class="ResultControls-pagLink"  v-if="pageData.first" :to="pageData.first['@id'] | asAppPath">{{'First' | translatePhrase}}</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.first">{{'First' | translatePhrase}}</a>
        </li>
        <li class="ResultControls-pagItem" 
          v-bind:class="{ 'is-disabled': !pageData.previous }">
          <router-link class="ResultControls-pagLink" 
            v-if="pageData.previous" 
            :to="pageData.previous['@id'] | asAppPath">{{'Previous' | translatePhrase}}</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.previous">{{'Previous' | translatePhrase}}</a>
        </li>
        <li class="ResultControls-pagItem" 
          v-bind:class="{ 'is-active': page.active }" v-for="page in pageList" :key="page.link">
          <span class="ResultControls-pagDecor" v-if="!page.link">...</span>
          <router-link class="ResultControls-pagLink" 
            :to="page.link | asAppPath" v-if="!page.active && page.link">{{page.pageLabel}}</router-link>
          <a class="ResultControls-pagLink" v-if="page.active">{{page.pageLabel}}</a>
        </li>
        <li class="ResultControls-pagItem" 
          v-bind:class="{ 'is-disabled': !pageData.next }">
          <router-link class="ResultControls-pagLink" 
            v-if="pageData.next" :to="pageData.next['@id'] | asAppPath">{{'Next' | translatePhrase}}</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.next">{{'Next' | translatePhrase}}</a>
        </li>
        <li class="ResultControls-pagItem"
          v-bind:class="{ 'is-disabled': !pageData.last || pageData['@id'] === pageData.last['@id'] }">
          <router-link class="ResultControls-pagLink" 
            v-if="pageData.last" :to="pageData.last['@id'] | asAppPath">{{'Last' | translatePhrase}}</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.last">{{'Last' | translatePhrase}}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="less">
@buttoncolor: darken(@neutral-color, 10%);

.ResultControls {
  margin: 1em 0;

  &-searchDetails {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: 2.8em;
    color: @grey-dark;
    border-bottom: 1px solid @grey-lighter;

    @media (max-width: @screen-sm) {
      flex-direction: column;
    }
  }

  &-resultDescr {

  }

  &-resultText {
    font-weight: 600;
    padding-right: 20px;
  }

  &-numTotal, &-dbLabel {
    color: @black;
  }

  &-controlWrap {
    display: flex;
  }

  &-listTypes {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }

  &-listType {
    background-color: transparent;

    &:hover, 
    &:focus {
      background-color: transparent;
      color: @grey-darker;
    }

    i {
      color: inherit;
      vertical-align: top;
    }

    &.is-active {
      color: @btn-primary;

      i {
        color: inherit;
      }
    }
  }

  &-secondary {
    display: flex;
    justify-content: space-between;
    padding: 0.25em 0;
  }

  &-hasItemFilter {
    padding: 0.25em 0.5em;
    border-radius: 2px;
    font-size: 1.4rem;
    background-color: @neutral-color;
    border: 1px solid @grey-lighter;
    display: flex;
    align-items: center;
    font-weight: normal;
    i {
      margin-right: 0.2em;
    }
    .fa-check-square {
      color: @brand-primary;
    }
  }

  &-filterWrapper {
    display: flex;
    flex-wrap: wrap;
  }

  // &-filterBadge {
  //   background-color: #364a4c;
  //   border: 1px solid #364a4c;
  //   color: @white;
  //   font-weight: 600;
  //   font-size: 1.4rem;
  //   padding: 2px 5px 2px 10px;
  //   margin: 5px 5px 0 0;
  //   border-radius: 4px;
  //   white-space: nowrap;
  //   &--inverted {
  //     background-color: transparent;
  //     border: 1px solid #364a4c;
  //     color: #364a4c;
  //     font-weight: 600;
  //     font-size: 1.4rem;
  //     padding: 2px 5px 2px 10px;
  //     margin: 5px 5px 0 0;
  //     border-radius: 4px;
  //     white-space: nowrap;
  //   }

  //   & i,
  //   & i:hover {
  //     color: @white;
  //   }

  //   &.clear-all {
  //     color: inherit;
  //     background-color: @white;
  //     border: 1px solid @grey-lighter;

  //     & i,
  //     & i:hover {
  //       color: inherit;
  //     }
  //   }

  // }

  &-pagDecor {
    color: @grey;
    cursor: initial;
  }

  &-pagList {
    display: inline-block;
    list-style-type: none;
    font-size: 16px;
    font-size: 1.6rem;
    margin: 0px;
    padding: 0;
  }

  &-pagItem {
    display: inline;
    line-height: 1;
    padding: 0 3px;

    &:first-of-type a {
      padding-left: 0;
    }
  }

  &-pagLink {
    color: @grey-dark;
    font-weight: 600;
    padding: 0 3px;
    position: relative;
    text-transform: uppercase;
    transition: color 0.2s ease;

    &:hover, 
    &:focus {
      color: @brand-primary;
      text-decoration: none;
    }

    .is-disabled & {
      color: @grey-light;
      cursor: initial;

      &:hover {
        color: @grey-light;
      }
    }

    .is-active & {
      color: @black;
      z-index: 3;

      &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 3px;
        background-color: #29A1A2;
        left: 0;
        right: 0;
        bottom: -3px;
      }

      &:hover {
        color: @black;
      }
    }
  }
}

</style>
