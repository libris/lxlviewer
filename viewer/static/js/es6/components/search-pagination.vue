<script>
import * as StringUtil from '../utils/string';
import * as httpUtil from '../utils/http';
import * as UserUtil from '../utils/user';
import { changeResultListStatus, changeSettings } from '../vuex/actions';
import { getSettings } from '../vuex/getters';

export default {
  name: 'search-pagination',
  vuex: {
    actions: {
      changeResultListStatus,
      changeSettings,
    },
    getters: {
      settings: getSettings,
    },
  },
  props: {
    pageData: {},
    showDetails: false,
  },
  data() {
    return {
      keyword: '',
    }
  },
  computed: {
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
                  filterObj.label = item.object['@id'];
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
    },
    historySupported() {
      if (Modernizr.history) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    setCompact() {
      const settings = this.settings;
      settings.userSettings.resultListType = 'compact';
      this.changeSettings(settings);
    },
    setFull() {
      const settings = this.settings;
      settings.userSettings.resultListType = 'detailed';
      this.changeSettings(settings);
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
      <span class="pull-left">Sökning på <strong>{{ queryText }}</strong>
        <span v-if="filters.length > 0">
        (filtrerat på <span v-for="filter in filters" track-by="$index"><strong>{{filter.label | labelByLang}}{{ $index === filters.length - 1 ? '' : ', ' }}</strong></span>)
      </span>
      gav <strong>{{pageData.totalItems}}</strong> träffar.</span>
      <span v-if="pageData.totalItems > limit" class="pull-right">Visar <strong>{{ limit }}</strong> träffar per sida.</span>
    </div>
    <div class="list-type-buttons" v-if="showDetails">
      <button v-on:click="setFull()" v-bind:class="{'active': settings.userSettings.resultListType === 'detailed'}"><i class="fa fa-th-list"></i></button>
      <button v-on:click="setCompact()" v-bind:class="{'active': settings.userSettings.resultListType === 'compact'}"><i class="fa fa-list"></i></button>
    </div>
    <div class="search-buttons">
      <nav>
        <ul class="pagination">
          <li v-bind:class="{ 'disabled': !pageData.first || pageData['@id'] === pageData.first['@id'] }">
            <a v-if="pageData.first && historySupported" @click="getNewResult(pageData.first['@id'])" class="pointer">Första</a>
            <a v-if="pageData.first && !historySupported" href="{{pageData.first['@id']}}">Första</a>
            <a v-if="!pageData.first">Första</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.previous }">
            <a v-if="pageData.previous && historySupported" @click="getNewResult(pageData.previous['@id'])" class="pointer">Föregående</a>
            <a v-if="pageData.previous && !historySupported" href="{{pageData.previous['@id']}}">Föregående</a>
            <a v-if="!pageData.previous">Föregående</a>
          </li>
          <li v-bind:class="{ 'active': page.active }" v-for="page in pageList" track-by="$index">
            <span class="decorative" v-if="!page.link">...</span>
            <a v-if="!page.active && page.link && historySupported" @click="getNewResult(page.link)" class="pointer">{{page.pageLabel}}</a>
            <a v-if="!page.active && page.link && !historySupported" href="{{page.link}}">{{page.pageLabel}}</a>
            <a v-if="page.active">{{page.pageLabel}}</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.next }">
            <a v-if="pageData.next && historySupported" @click="getNewResult(pageData.next['@id'])" class="pointer">Nästa</a>
            <a v-if="pageData.next && !historySupported" href="{{pageData.next['@id']}}">Nästa</a>
            <a v-if="!pageData.next">Nästa</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.last || pageData['@id'] === pageData.last['@id'] }">
            <a v-if="pageData.last && historySupported" @click="getNewResult(pageData.last['@id'])" class="pointer">Sista</a>
            <a v-if="pageData.last && !historySupported" href="{{pageData.last['@id']}}">Sista</a>
            <a v-if="!pageData.last">Sista</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

@buttoncolor: darken(@neutral-color, 10%);

.search-details {
  height: 1em;
  margin-bottom: 1em;
}
.list-type-buttons {
  float: right;
  button {
    background-color: @buttoncolor;
    &.active {
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


</style>
