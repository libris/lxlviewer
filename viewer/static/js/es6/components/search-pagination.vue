<script>
import * as StringUtil from '../utils/string';

export default {
  name: 'search-pagination',
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
  },
};
</script>

<template>
  <div class="panel panel-default result-controls" v-if="!(!showDetails && pageData.totalItems < limit)">
    <div class="search-details" v-if="showDetails">
      <span class="pull-left">Sökning på <strong>"{{ queryText }}"</strong> gav {{pageData.totalItems}} träffar.</span>
      <span class="pull-right">Visar {{ limit }} träffar per sida.</span>
    </div>
    <div class="search-buttons" v-if="pageData.totalItems > limit">
      <nav>
        <ul class="pagination">
          <li v-bind:class="{ 'disabled': !pageData.first || pageData['@id'] === pageData.first['@id'] }">
            <a v-if="pageData.first" href="{{pageData.first['@id']}}">Första</a>
            <a v-if="!pageData.first">Första</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.previous }">
            <a v-if="pageData.previous" href="{{pageData.previous['@id']}}">Föregående</a>
            <a v-if="!pageData.previous">Föregående</a>
          </li>
          <li v-bind:class="{ 'active': page.active }" v-for="page in pageList" track-by="$index">
            <span class="decorative" v-if="!page.link">...</span>
            <a v-if="!page.active && page.link" href="{{page.link}}">{{page.pageLabel}}</a>
            <a v-if="page.active">{{page.pageLabel}}</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.next }">
            <a v-if="pageData.next" href="{{pageData.next['@id']}}">Nästa</a>
            <a v-if="!pageData.next">Nästa</a>
          </li>
          <li v-bind:class="{ 'disabled': !pageData.last || pageData['@id'] === pageData.last['@id'] }">
            <a v-if="pageData.last" href="{{pageData.last['@id']}}">Sista</a>
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
