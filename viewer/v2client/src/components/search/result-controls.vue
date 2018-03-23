<script>
import * as StringUtil from '@/utils/string';
import * as httpUtil from '@/utils/http';
import Modernizr from '@/../.modernizrrc.js';

export default {
  name: 'result-controls',
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
      const limit = 20;
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
          list.push({ pageLabel: i+1, link: `${first}&_offset=${pageOffset}`, active: (i === currentPage)});
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
  <div class="ResultControls panel panel-default" v-if="!(!showDetails && pageData.totalItems < limit)">
    <div class="ResultControls-searchDetails" v-if="showDetails">
      <p class="ResultControls-resultDescr" id="resultDescr">Sökning på <strong>{{ queryText }}</strong>
        <span v-if="filters.length > 0">(filtrerat på <span v-for="filter in filters" :key="filter.label"><strong>{{filter.label}}</strong></span>)</span>
      gav <strong>{{pageData.totalItems}}</strong> träffar.
      </p>
      <p v-if="pageData.totalItems > limit">Visar <strong>{{ limit }}</strong> träffar per sida.</p>
    </div>
    <div class="ResultControls-listTypes" v-if="showDetails">
      <button class="ResultControls-listType"
        v-on:click="setFull()" 
        v-bind:class="{'is-active': user.settings.resultListType === 'detailed' }"
        title="Detailed">
        <i class="fa fa-th-list"></i>
      </button>
      <button class="ResultControls-listType" 
        v-on:click="setCompact()" 
        v-bind:class="{'is-active': user.settings.resultListType === 'compact' }"
        title="Compact">
        <i class="fa fa-list"></i>
      </button>
    </div>
    <nav v-if="hasPagination && showPages" class="ResultControls-pag">
      <ul class="ResultControls-pagList">
        <li class="ResultControls-pagItem" 
          v-bind:class="{ 'is-disabled': !pageData.first || pageData['@id'] === pageData.first['@id'] }">
          <router-link class="ResultControls-pagLink"  v-if="pageData.first" :to="pageData.first['@id'] | asAppPath">Första</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.first">Första</a>
        </li>
        <li class="ResultControls-pagItem" 
          v-bind:class="{ 'is-disabled': !pageData.previous }">
          <router-link class="ResultControls-pagLink" 
            v-if="pageData.previous" 
            :to="pageData.previous['@id'] | asAppPath">Föregående</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.previous">Föregående</a>
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
            v-if="pageData.next" :to="pageData.next['@id'] | asAppPath">Nästa</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.next">Nästa</a>
        </li>
        <li class="ResultControls-pagItem" 
          v-bind:class="{ 'is-disabled': !pageData.last || pageData['@id'] === pageData.last['@id'] }">
          <router-link class="ResultControls-pagLink" 
            v-if="pageData.last" :to="pageData.last['@id'] | asAppPath">Sista</router-link>
          <a class="ResultControls-pagLink" v-if="!pageData.last">Sista</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="less">
@buttoncolor: darken(@neutral-color, 10%);

.ResultControls {
  margin: 10px 0px;
  padding: 20px;

  &-searchDetails {
    color: @gray-darker;
    display: flex;
    justify-content: space-between;  
  }

  &-listTypes {
    display: flex;
    flex-direction: row-reverse;
  }

  &-listType {
    background-color: @buttoncolor;
    margin: 0 0 0 0.3em;

    &.is-active {
      &.blue {
        background-color: @brand-id;
      }

      background-color: @brand-primary;
      i {
        color: @neutral-color;
      }
    }
  }

  &-pagDecor {
    font-size: 12px;
    border: none;
    line-height: 1;
    color: @black;
    background-color: @neutral-color;

    &:hover {
      background-color: @neutral-color;
    }
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
  }

  &-pagLink {
    border: 1px solid #fff;
    color: #009788;
    float: left;
    font-weight: bold;
    position: relative;
    padding: 6px 12px;
    text-transform: uppercase;
    opacity: 0.7;

    .is-disabled & {
      background-color: #fff;
      border: 1px solid #ddd;
      color: #c4c7ca;

      &:hover {
        border-color: #ddd;
        color: #c4c7ca;
      }
    }

    .is-active & {
      background-color: #009788;
      border-color: #009788;
      color: #fff;
      z-index: 3;

      &:hover {
        border-color: #009788;
        color: #fff;
      }
    }

    &:hover {
      border-color: #009788;
      color: #009788;
      opacity: 1;
      text-decoration: none;
    }

    &.pointer {
      cursor: pointer;
    }

    i {
      padding: 0 5px 0 5px;
    }
  }
}

</style>
