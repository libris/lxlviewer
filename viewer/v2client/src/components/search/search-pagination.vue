<script>
import * as StringUtil from '@/utils/string';
import * as httpUtil from '@/utils/http';
import Modernizr from '@/../.modernizrrc.js';

export default {
  name: 'search-pagination',
  props: {
    pageData: {},
    showDetails: false,
    showPages: false,
    hasPagination: true,
  },
  data() {
    return {
      keyword: '',
    }
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
            this.pageData.search.mapping.forEach(item => {
            if (item.variable !== 'q') {
                const filterObj = {
                    label: '',
                    up: '',
                };
                if (typeof item.object !== 'undefined') {
                  if (item.variable === '@type') {
                    filterObj.label = StringUtil.getLabelByLang(item.object['@id'], this.settings.language, this.resources.vocab, this.settings.vocabPfx, this.resources.context);
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
      if (this.pageData.first) {
        return StringUtil.getParamValueFromUrl(this.pageData.first['@id'], '_limit');
      }
      console.warn('Search details is missing limit parameter');
      return '';
    },
    pageList() {
      const list = [];
      if (!this.pageData || !this.pageData.first) {
        console.warn('Search failed in getting pagination data');
        return list;
      }
      const first = this.pageData.first['@id'];
      const limit = StringUtil.getParamValueFromUrl(first, '_limit');
      const offset = this.pageData.itemOffset;
      const noOfPages = parseInt(this.pageData.totalItems / this.limit) + 1 || 1;
      const currentPage = parseInt(offset/this.limit);
      let paddedPages = 3;
      if (currentPage < paddedPages) {
        paddedPages = paddedPages + 1 + (paddedPages - currentPage -1);
      } else if (currentPage + paddedPages > noOfPages) {
        paddedPages = paddedPages + 1 + (currentPage + paddedPages - noOfPages);
      }
      const minPage = currentPage - paddedPages;
      const maxPage = currentPage + paddedPages;
      if (minPage > 0) {
        list.push({pageLabel: '...'});
      }
      for (let i = 0; i < noOfPages; i++) {
        const pageOffset = i * this.limit;
        if (i >= minPage && i <= maxPage) {
          list.push({ pageLabel: i+1, link: `${this.pageData.first['@id']}&_offset=${pageOffset}`, active: (i === currentPage)});
        }
      }
      if (noOfPages > maxPage) {
        list.push({pageLabel: '...'});
      }
      return list;
    }
  },
  methods: {
    setCompact() {
      const user = this.user;
      user.settings.resultListType = 'compact';
      this.updateUser(user);
    },
    setFull() {
      const user = this.user;
      user.settings.resultListType = 'detailed';
      this.updateUser(user);
    },
    getNewResult(url) {
      this.changeResultListStatus('loading', true);
      const resultPromise = new Promise((resolve, reject) => {
        httpUtil.get({ url: url, accept: 'application/ld+json' }).then((response) => {
          history.pushState(response, 'unused', response['@id']);
          resolve(response);
        }, (error) => {
          history.pushState({}, 'unused', url);
          reject('Error searching...', error);
        });
      });
      this.$dispatch('newresult', resultPromise);
    }
  },
};
</script>

<template>
  <div class="panel panel-default result-controls" v-if="!(!showDetails && pageData.totalItems < limit)">
    <div class="search-details" v-if="showDetails">
      <span>Sökning på <strong>{{ queryText }}</strong>
        <span v-if="filters.length > 0">
        (filtrerat på <span v-for="filter in filters" :key="filter.label"><strong>{{filter.label}}</strong></span>)
      </span>
      gav <strong>{{pageData.totalItems}}</strong> träffar.</span>
      <span v-if="pageData.totalItems > limit">Visar <strong>{{ limit }}</strong> träffar per sida.</span>
    </div>
    <div class="list-type-buttons" v-if="showDetails">
      <button v-on:click="setFull()" v-bind:class="{'active': user.settings.resultListType === 'detailed' }"><i class="fa fa-th-list"></i></button>
      <button v-on:click="setCompact()" v-bind:class="{'active': user.settings.resultListType === 'compact' }"><i class="fa fa-list"></i></button>
    </div>
    <div v-if="hasPagination && showPages" class="search-buttons">
      <nav>
        <ul class="pagination">
          <li v-bind:class="{ 'disabled': !pageData.first || pageData['@id'] === pageData.first['@id'] }">
            <a v-if="pageData.first" @click="getNewResult(pageData.first['@id'])" class="pointer">Första</a>
            <a v-if="!pageData.first">Första</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.previous }">
            <a v-if="pageData.previous" @click="getNewResult(pageData.previous['@id'])" class="pointer">Föregående</a>
            <a v-if="!pageData.previous">Föregående</a>
          </li>
          <li v-bind:class="{ 'active': page.active }" v-for="page in pageList" :key="page.link">
            <span class="decorative" v-if="!page.link">...</span>
            <a v-if="!page.active && page.link" @click="getNewResult(page.link)" class="pointer">{{page.pageLabel}}</a>
            <a v-if="page.active">{{page.pageLabel}}</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.next }">
            <a v-if="pageData.next" @click="getNewResult(pageData.next['@id'])" class="pointer">Nästa</a>
            <a v-if="!pageData.next">Nästa</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.last || pageData['@id'] === pageData.last['@id'] }">
            <a v-if="pageData.last" @click="getNewResult(pageData.last['@id'])" class="pointer">Sista</a>
            <a v-if="!pageData.last">Sista</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style lang="less">

@buttoncolor: darken(@neutral-color, 10%);

.search-details {
  display: flex;
  justify-content: space-between;
}
.list-type-buttons {
  display: flex;
  flex-direction: row-reverse;
  button {
    background-color: @buttoncolor;
    margin: 0 0 0 0.3em;
    &.active {
      &.blue {
        background-color: @brand-id;
      }
      background-color: @brand-primary;
      i {
        color: @neutral-color;
      }
    }
  }
}
.search-buttons {
  .decorative {
    font-size: 12px;
    border: none;
    line-height: 1;
    color: @black;
    background-color: @neutral-color;
    &:hover {
      background-color: @neutral-color;
    }
  }
}

// PAGED COLLECTION
.result-controls {
  padding: 20px;
  margin: 10px 0px;
  .search-details {
    color: @gray-darker;
    .query {
      font-weight:600;
      &:before {
        content: open-quote;
        padding-right: 1px;
      }
      &:after {
        content: close-quote;
        padding-left: 1px;
      }
    }
  }
  .search-buttons {
    &:first-child {
      margin-top: 0;
    }
    margin-top: 1em;
    .pagination {
      margin: 0px;
      li {
        a {
          border-radius: 0px !important;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: bold;
          opacity: 0.7;
          //background-color:#f5f5f5; TODO: test visual unity
          .disabled {
            border: none;
          }
          &:hover {
            opacity:1;
          }
          &.pointer {
            cursor: pointer;
          }
          i {
            padding: 0 5px 0 5px;
          }
        }
      }
    }
  }
}

</style>
