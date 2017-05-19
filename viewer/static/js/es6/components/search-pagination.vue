<script>
import * as StringUtil from '../utils/string';
import * as httpUtil from '../utils/http';
import { changeResultListStatus } from '../vuex/actions';

export default {
  name: 'search-pagination',
  vuex: {
    actions: {
      changeResultListStatus,
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
      return StringUtil.getParamValueFromUrl(this.pageData.first['@id'], 'q');
    },
    limit() {
      return StringUtil.getParamValueFromUrl(this.pageData.first['@id'], '_limit');
    },
    pageList() {
      const list = [];
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
    getNewResult(url) {
      this.changeResultListStatus('loading', true);
      const resultPromise = new Promise((resolve, reject) => {
        httpUtil.get({ url: url, accept: 'application/ld+json' }).then((response) => {
          history.pushState(response, "title", url);
          resolve(response);
        }, (error) => {
          history.pushState({}, "title", url);
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
        (filtrerat på <span v-for="filter in filters" track-by="$index">{{filter.label | labelByLang}}{{ $index === filters.length - 1 ? '' : ', ' }}</span>)
      </span>
      gav {{pageData.totalItems}} träffar.</span>
      <span v-if="pageData.totalItems > limit" class="pull-right">Visar {{ limit }} träffar per sida.</span>
    </div>
    <div class="search-buttons" v-if="pageData.totalItems > limit">
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

.search-details {
  height: 1em;
  margin-bottom: 1em;
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
