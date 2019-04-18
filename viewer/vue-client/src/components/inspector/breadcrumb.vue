<script>
import { mapGetters } from 'vuex';
import { each } from 'lodash-es';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'breadcrumb',
  components: {
    'vue-simple-spinner': VueSimpleSpinner,
  },
  props: {
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      'inspector',
      'settings',
    ]),
    searchResultUrl() {
      return this.$route.meta.breadcrumb.resultUrl;
    },
    totalItems() {
      return this.$route.meta.breadcrumb.totalItems;
    },
    absoluteOffset() {
      return this.$route.meta.breadcrumb.absoluteOffset;
    },
    relativeOffset() {
      return this.$route.meta.breadcrumb.relativeOffset;
    },
    range() {
      return this.$route.meta.breadcrumb.range;
    },
    paths() {
      return this.$route.meta.breadcrumb.paths;
    },
    prevPath() {
      return this.paths[this.relativeOffset - 1];
    },
    nextPath() {
      return this.paths[this.relativeOffset + 1];
    },
    prevOutOfBounds() {
      if (this.absoluteOffset > 0 && this.relativeOffset === 0) {
        return true;
      } return false;
    },
    nextOutOfBounds() {
      if (this.absoluteOffset + 1 < this.totalItems && this.relativeOffset + 1 > this.paths.length - 1) {
        return true;
      } return false;
    },
  },
  methods: {
    getQuery(direction) {
      const queryObj = Object.assign({}, this.$route.meta.breadcrumb.query);
      queryObj._limit = this.range.itemsPerPage;
      switch (direction) {
        case 'prev':
          queryObj._offset = this.range.start - this.range.itemsPerPage;
          break;
        case 'next': 
          queryObj._offset = this.range.start + this.range.itemsPerPage;
          break;
        default:
          break;
      }
      let queryString = `${this.settings.apiPath}/find.json?`;
      each(queryObj, (v, k) => {
        queryString += (`${encodeURIComponent(k)}=${encodeURIComponent(v)}&`);
      });
      return [queryString, direction];
    },
    fetchLink(url) {
      return new Promise((resolve, reject) => {
        fetch(url).then((res) => {
          if (res.status === 200) {
            resolve(res.json());
          } 
        }, error => reject('Error fetching breadcrumb data', error));
      });
    },
    prev() {
      const meta = Object.assign({}, this.$route.meta);
      meta.breadcrumb.absoluteOffset--;
      meta.breadcrumb.relativeOffset--;
      this.$router.push({ path: this.$options.filters.asFnurgelLink(this.prevPath), meta });
    },
    next() {
      const meta = Object.assign({}, this.$route.meta);
      meta.breadcrumb.absoluteOffset++;
      meta.breadcrumb.relativeOffset++;
      this.$router.push({ path: this.$options.filters.asFnurgelLink(this.nextPath), meta });
    },
    lastOnPrevPage() {
      this.loading = true;
      this.fetchLink(...this.getQuery('prev'))
        .then((results) => {
          const meta = Object.assign({}, this.$route.meta);
          meta.breadcrumb.absoluteOffset--;
          meta.breadcrumb.relativeOffset = this.range.itemsPerPage - 1;
          meta.breadcrumb.range.start = results.itemOffset;
          const newPaths = results.items.map(res => res['@id']);
          meta.breadcrumb.paths = newPaths;

          this.loading = false;
          this.$router.push({ path: this.$options.filters.asFnurgelLink(newPaths[this.range.itemsPerPage - 1]), meta });
        });
    },
    firstOnNextPage() {
      this.loading = true;
      this.fetchLink(...this.getQuery('next'))
        .then((results) => {
          const meta = Object.assign({}, this.$route.meta);
          meta.breadcrumb.absoluteOffset++;
          meta.breadcrumb.relativeOffset = 0;
          meta.breadcrumb.range.start = results.itemOffset;
          const newPaths = results.items.map(res => res['@id']);
          meta.breadcrumb.paths = newPaths;

          this.loading = false;
          this.$router.push({ path: this.$options.filters.asFnurgelLink(newPaths[0]), meta });
        });
    },
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      console.log(this.$route.meta.breadcrumb);
    });
  },
};
</script>

<template>
  <div class="Breadcrumb">
    <div class="Breadcrumb-back">
      <router-link class="Breadcrumb-backLink"
        :to="searchResultUrl">{{ 'To result list' | translatePhrase }}</router-link>
    </div>
    <div class="Breadcrumb-postData">
      <span class="Breadcrumb-postNumbers">{{ absoluteOffset + 1 }} {{ 'of' | translatePhrase }} {{ totalItems }}</span>
      <div class="Breadcrumb-postLinks">
        <span class="Breadcrumb-prev" v-if="absoluteOffset > 0">
          <a v-if="prevPath" @click="prev">{{ ['Previous', 'post'] | translatePhrase }}</a>
          <a v-if="prevOutOfBounds" @click="lastOnPrevPage">
            <span v-if="!loading">{{ ['Previous', 'post'] | translatePhrase }}</span>
            <vue-simple-spinner v-if="loading" size="small"></vue-simple-spinner>
          </a>
        </span>
        <span v-if="absoluteOffset > 0 && absoluteOffset + 1 < totalItems"> | </span>
        <span class="Breadcrumb-next" v-if="absoluteOffset < totalItems">
          <a v-if="nextPath" @click="next">{{ ['Next', 'post'] | translatePhrase }}</a>
          <a v-if="nextOutOfBounds" @click="firstOnNextPage">
            <span v-if="!loading">{{ ['Next', 'post'] | translatePhrase }}</span>
            <vue-simple-spinner v-if="loading" size="small"></vue-simple-spinner>
          </a>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.Breadcrumb {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 0 30px 0;

  &-postNumbers {
  }

  &-postData {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    white-space: nowrap;

    @media (max-width: @screen-xs) {
      justify-content: space-between;
      flex-direction: column;
      align-items: flex-end;
    }
  }

  &-postLinks {
    display: flex;
    margin: 0 0 0 30px;
  }

  &-back {
    flex: 1;
  }

  &-backLink {
    white-space: nowrap;
    margin-right: 10px;
  } 

  &-next {
    margin: 0 0 0 10px;
  }

  &-prev {
    margin: 0 10px 0 0;
  }
}
</style>
