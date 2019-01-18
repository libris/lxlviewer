<script>
import * as StringUtil from '@/utils/string';
import * as httpUtil from '@/utils/http';
import Sort from '@/components/search/sort';

export default {
  name: 'result-controls',
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
    settings() {
      return this.$store.getters.settings;
    },
    resources() {
      return this.$store.getters.resources;
    },
    user() {
      return this.$store.getters.user;
    },
    filters() {
      const filters = [];
      if (typeof this.pageData.search !== 'undefined') {
        this.pageData.search.mapping.forEach((item) => {
          if (item.variable !== 'q') {
            const filterObj = {
              label: '',
              up: '',
            };
            if (typeof item.object !== 'undefined') {
              if (item.variable === '@type') {
                filterObj.label = StringUtil.getLabelByLang(item.object['@id'], this.settings.language, this.resources.vocab, this.resources.context) || item.object['@id'];
              } else {
                filterObj.label = item.object['@id'].replace('https://id.kb.se/', '');
              }
            } else {
              filterObj.label = item.value;
            }
            filterObj.up = item.up['@id'];
            filters.push(filterObj);
          }
        });
      }
      return filters;
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
      const noOfPages = parseInt(this.pageData.totalItems / this.limit) + 1 || 1;
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
  },
  methods: {
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
          window.history.pushState(response, 'unused', response['@id']);
          resolve(response);
        }, (error) => {
          window.history.pushState({}, 'unused', url);
          reject('Error searching...', error);
        });
      });
      this.$dispatch('newresult', resultPromise);
    },
  },
  components: {
    sort: Sort,
  },
};
</script>

<template>
  <div class="ResultControls" v-if="!(!showDetails && pageData.totalItems < limit)">
    <div class="ResultControls-searchDetails" v-if="showDetails">
      <div class="ResultControls-resultDescr">
        <p class="ResultControls-resultText" id="resultDescr">Sökning på {{ queryText }}
          <span v-if="filters.length > 0">(filtrerat på <span v-for="(filter, index) in filters" :key="index">{{filter.label}}{{ index === (filters.length - 1) ? '' : ', ' }}</span>)</span>
          gav {{pageData.totalItems}} träffar.
          <em v-if="pageData.totalItems > limit && $route.params.perimeter === 'remote'">Du har fått fler träffar än vad som kan visas, testa att göra en mer detaljerad sökning om du inte kan hitta det du letar efter.</em>
        </p>  
        <p v-if="pageData.totalItems > limit && $route.params.perimeter != 'remote'" class="ResultControls-resultText">Visar {{ limit }} träffar per sida.</p>
      </div>
      <div class="ResultControls-controlWrap" v-if="showDetails && pageData.totalItems > 0">
        <sort 
          v-if="searchedTypes && $route.params.perimeter != 'remote'"
          :currentSort="currentSortOrder ? currentSortOrder : ''"
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
  margin: 10px 0px 20px 0;

  &-searchDetails {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
    color: @gray-dark;

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
    height: 20px;

    &:hover, 
    &:focus {
      background-color: transparent;
      color: @gray-darker;
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

  &-pagDecor {
    color: @gray;
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
      color: @gray-light;
      cursor: initial;

      &:hover {
        color: @gray-light;
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

    i {
      padding: 0 5px 0 5px;
    }
  }
}

</style>
