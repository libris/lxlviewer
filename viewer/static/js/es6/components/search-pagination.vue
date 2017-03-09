<script>

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
    pageList() {
      const list = [];
      const limit = 200; // TODO: PLZ NO MAGIC
      const offset = this.pageData.itemOffset;
      const noOfPages = parseInt(this.pageData.totalItems / limit) + 1 || 1;
      const currentPage = parseInt(offset/limit);
      let paddedPages = 4;
      if (currentPage < paddedPages) {
        paddedPages = paddedPages + (paddedPages - currentPage -1);
      } else if (currentPage + paddedPages > noOfPages) {
        paddedPages = paddedPages + (currentPage + paddedPages - noOfPages);
      }
      for (let i = 0; i < noOfPages; i++) {
        const pageOffset = i * limit;
        list.push({ link: `${this.pageData.first['@id']}&_offset=${pageOffset}`, active: (i === currentPage)});
      }
      return list;
    },
  },
};
</script>

<template>
  <div class="panel panel-default result-controls">
    <div class="search-details" v-if="showDetails">
      Sökningen gav {{pageData.totalItems}} resultat.
    </div>
    <div class="search-buttons">
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
          <li v-bind:class="{ 'active': page.active}" v-for="page in pageList" track-by="$index">
            <a v-if="!page.active" href="{{page.link}}">{{$index+1}}</a>
            <a v-if="page.active">{{$index+1}}</a>
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


</style>
