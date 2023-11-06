<script>
import { mapGetters } from 'vuex';
import { each } from 'lodash-es';
import Spinner from '@/components/shared/spinner.vue';
import * as RecordUtil from '@/utils/record';
import { translatePhrase, asFnurgelLink } from '@/utils/filters';

export default {
  name: 'breadcrumb',
  components: {
    Spinner,
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
      if (this.absoluteOffset + 1 < this.totalItems
      && this.relativeOffset + 1 > this.paths.length - 1) {
        return true;
      } return false;
    },
    thisIsSearchResult() {
      // check if this id is present in our list of paths.
      // Otherwise user has gone off path (to a holding for example)
      // and prev/next are no longer valid
      const match = this.paths.filter((path) => `/${RecordUtil.extractFnurgel(path)}` === this.$route.path);
      return match.length === 1;
    },
  },
  methods: {
    translatePhrase,
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
      let queryString = `${this.settings.apiPath}/find.jsonld?`;
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
        }, (error) => reject('Error fetching breadcrumb data', error));
      });
    },
    prev() {
      const meta = Object.assign({}, this.$route.meta);
      meta.breadcrumb.absoluteOffset--;
      meta.breadcrumb.relativeOffset--;
      this.$router.push({ path: asFnurgelLink(this.prevPath), meta });
    },
    next() {
      const meta = Object.assign({}, this.$route.meta);
      meta.breadcrumb.absoluteOffset++;
      meta.breadcrumb.relativeOffset++;
      this.$router.push({ path: asFnurgelLink(this.nextPath), meta });
    },
    lastOnPrevPage() {
      this.loading = true;
      this.fetchLink(...this.getQuery('prev'))
        .then((results) => {
          const meta = Object.assign({}, this.$route.meta);
          meta.breadcrumb.absoluteOffset--;
          meta.breadcrumb.relativeOffset = this.range.itemsPerPage - 1;
          meta.breadcrumb.range.start = results.itemOffset;
          const newPaths = results.items.map((res) => res['@id']);
          meta.breadcrumb.paths = newPaths;

          this.loading = false;
          this.$router.push({ path: asFnurgelLink(newPaths[this.range.itemsPerPage - 1]), meta });
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
          const newPaths = results.items.map((res) => res['@id']);
          meta.breadcrumb.paths = newPaths;

          this.loading = false;
          this.$router.push({ path: asFnurgelLink(newPaths[0]), meta });
        });
    },
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="Breadcrumb">
    <div class="Breadcrumb-back">
      <router-link
        class="Breadcrumb-backLink"
        :to="searchResultUrl">{{ translatePhrase('To result list') }}</router-link>
    </div>
    <div class="Breadcrumb-recordData" v-if="thisIsSearchResult">
      <span class="Breadcrumb-recordNumbers">{{ absoluteOffset + 1 }} {{ translatePhrase('of') }} {{ totalItems }}</span>
      <div class="Breadcrumb-recordLinks">
        <span class="Breadcrumb-prev" v-if="absoluteOffset > 0">
          <button class="btn--as-link" v-if="prevPath" @click="prev">{{ translatePhrase('Previous') }}</button>
          <button class="btn--as-link" v-if="prevOutOfBounds" @click="lastOnPrevPage">
            <span v-if="!loading">{{ translatePhrase('Previous') }}</span>
            <Spinner v-if="loading" size="sm" />
          </button>
        </span>
        <span v-if="absoluteOffset > 0 && absoluteOffset + 1 < totalItems"> | </span>
        <span class="Breadcrumb-next" v-if="absoluteOffset < totalItems">
          <button class="btn--as-link" v-if="nextPath" @click="next">{{ translatePhrase('Next') }}</button>
          <button class="btn--as-link" v-if="nextOutOfBounds" @click="firstOnNextPage">
            <span v-if="!loading">{{ translatePhrase('Next') }}</span>
            <Spinner v-if="loading" size="sm" />
          </button>
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
  margin: 0 0 0.5em 0;

  &-recordData {
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

  &-recordLinks {
    display: flex;
    margin: 0 0 0 30px;

    & .vue-simple-spinner {
      margin-top: 5px !important;
    }
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
    min-width: 50px;
  }

  &-prev {
    margin: 0 10px 0 0;
    min-width: 50px;
  }
}
</style>
