<template>
  <div class="Pagination">
    <ul>
      <li class="Pagination-item" v-if="resultData.hasOwnProperty('first') && currentPage != 0"><a aria-label="Första resultatsidan" :href="resultData.first['@id']"><i class="bi-chevron-double-left"></i></a></li>
      <li class="Pagination-item" v-if="resultData.hasOwnProperty('previous')"><a aria-label="Förra resultatsidan" :href="resultData.previous['@id']"><i class="bi-chevron-left"></i></a></li>
      <li class="Pagination-item" :class="{'active': page.number == currentPage }" v-for="page in pageItems" :key="page.number">
        <a :aria-label="`Resultatsida ${page.number + 1}`" v-if="page.number != currentPage" :href="page['@id']">{{ page.number + 1 }}</a>
        <span v-else>{{ page.number + 1 }}</span>
      </li>
      <li class="Pagination-item" v-if="resultData.hasOwnProperty('next')"><a aria-label="Nästa resultatsida" :href="resultData.next['@id']"><i class="bi-chevron-right"></i></a></li>
      <li class="Pagination-item" v-if="resultData.hasOwnProperty('last') && currentPage != lastPage"><a aria-label="Sista resultatsidan" :href="resultData.last['@id']"><i class="bi-chevron-double-right"></i></a></li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      numberOfItems: 9,
    }
  },
  props: {
    resultData: {
      type: Object,
    },
  },
  methods: {
  },
  computed: {
    lastPage() {
      return parseInt(this.resultData.totalItems / this.resultData.itemsPerPage);
    },
    currentPage() {
      const currentOffset = this.resultData.itemOffset;
      const perPage = this.resultData.itemsPerPage;
      const page = (currentOffset / perPage);
      return page;
    },
    pageItems() {
      let pages = [];
      const createPage = (number) => {
        const perPage = this.resultData.itemsPerPage;
        const offset = (number) * perPage;
        const uri = `${this.resultData.first['@id']}&_offset=${offset}`;
        return {
          number,
          '@id': uri,
        };
      }
      const paddedPages = parseInt(this.numberOfItems * 0.5);
      const minPage = this.currentPage - paddedPages < 0 ? 0 : this.currentPage - paddedPages;
      let maxPage = this.currentPage + paddedPages > this.lastPage ? this.lastPage : this.currentPage + paddedPages;
      if (minPage === 0) {
        maxPage += (this.currentPage - paddedPages) * -1;
      }
      if (maxPage === 0) {
        return [createPage(0)];
      }
      if (maxPage > this.lastPage) {
        maxPage = this.lastPage;
      }
      
      for (let i = minPage; i <= maxPage; i++) {
        pages.push(createPage(i));
      }
      return pages;
    },
  }
}

</script>

<style lang="scss">
.Pagination {
  padding: 0;
  margin: 1em 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &-item {
    border: 1px solid $gray-300;
    a {
      width: 100%;
      height: 100%;
      padding: 0.25em 1em;
      text-decoration: none;
    }
    span {
      padding: 0.25em 1em;
    }
    &:first-child {
      margin-left: 0;
    }
    &.active {
      font-weight: 500;
      border-color: $black;
    }
    &:hover:not(.active) {
      background-color: $gray-200;
    }
  }
  ul {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em;
    li {
      display: inline-block;
    }
  }
}
</style>
