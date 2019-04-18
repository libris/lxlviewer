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
    fetchLink(url, direction) {
      fetch(url)
        .then((res) => {
          if (res.ok) {
            res.json().then((json) => {
              this.updatedPaths = json.items.map(item => item['@id']);
              if (direction === 'prev') {
                this.prevPath = this.updatedPaths[this.range.itemsPerPage - 1];
              } else if (direction === 'next') {
                this.nextPath = this.updatedPaths[0];
              }
            });
          }
        })
        .catch(err => console.log('Error fetching breadcrumb data', err));
    },
    reduceOffset() {
      const crumb = Object.assign({}, this.$route.meta.breadcrumb);
      crumb.absoluteOffset--;
      crumb.relativeOffset--;
      this.$route.meta.breadcrumb = crumb;
    },
    addOffset() {
      const crumb = Object.assign({}, this.$route.meta.breadcrumb);
      crumb.absoluteOffset++;
      crumb.relativeOffset++;
      this.$route.meta.breadcrumb = crumb;
    },
    getPrev() {
      this.loading = true;
      console.log('will handle prev manually');
      // this.fetchLink(...this.getQuery('prev'));
      // const crumb = Object.assign({}, this.$route.meta.breadcrumb);
      // crumb.absoluteOffset--;
      // crumb.relativeOffset = this.range.itemsPerPage;
      // crumb.paths = something;
      // this.$route.meta.breadcrumb = crumb;
    },
    getNext() {
      this.loading = true;
      console.log('will handle next manually');
      // this.fetchLink(...this.getQuery('next'));
      // const crumb = Object.assign({}, this.$route.meta.breadcrumb);
      // crumb.absoluteOffset++;
      // crumb.relativeOffset = 0;
      // crumb.paths = something;
      // this.$route.meta.breadcrumb = crumb;
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
      <router-link class="Breadcrumb-backLink"
        :to="searchResultUrl">{{ 'To result list' | translatePhrase }}</router-link>
    </div>
    <div class="Breadcrumb-postData">
      <span class="Breadcrumb-postNumbers">{{ absoluteOffset + 1 }} {{ 'of' | translatePhrase }} {{ totalItems }}</span>
      <div class="Breadcrumb-postLinks">
        <router-link class="Breadcrumb-prev"
          v-if="prevPath"
          :to="prevPath | asFnurgelLink"><span @click="reduceOffset">{{ ['Previous', 'post'] | translatePhrase }}</span></router-link>
        <a class="Breadcrumb-prev" 
          v-if="prevOutOfBounds" 
          @click="getPrev">
          <span v-if="!loading">{{ ['Previous', 'post'] | translatePhrase }}</span>
          <vue-simple-spinner v-if="loading" size="small"></vue-simple-spinner>
        </a>
        <span v-if="absoluteOffset > 0 && absoluteOffset < this.totalItems"> | </span>
        <router-link class="Breadcrumb-next"
          v-if="nextPath"
          :to="nextPath | asFnurgelLink"><span @click="addOffset">{{ ['Next', 'post'] | translatePhrase }}</span></router-link>
        <a class="Breadcrumb-next" 
          v-if="nextOutOfBounds" 
          @click="getNext">
          <span v-if="!loading">{{ ['Next', 'post'] | translatePhrase }}</span>
          <vue-simple-spinner v-if="loading" size="small"></vue-simple-spinner>
        </a>
      </div>
      absolute: {{ absoluteOffset }} relative: {{relativeOffset}} getnext: {{nextOutOfBounds}} getprev: {{prevOutOfBounds}}
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
