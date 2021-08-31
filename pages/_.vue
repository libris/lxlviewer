<template>
  <div class="container-fluid">
    <div class="Document">
      <h2 class="text-muted">{{ translateKey(entityData['@type']) }}</h2>
      <h1>{{ documentTitle }}</h1>
      <EntityTable v-if="entityData != null" :item-data="entityData" :show-download="true" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import LensMixin from '@/mixins/lens';

export default {
  mixins: [LensMixin],
  head() {
    return {
      title: `${this.documentTitle} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content:`${this.documentTitle}` },
      ],
    };
  },
  data() {
    return {
    }
  },
  computed: {
    documentTitle() {
      return this.getItemLabel;
    },
    entityData() {
      if (this.pageData['@graph']) {
        return this.pageData['@graph'][1];
      }
      return null;
    },
  },
  methods: {
    ...mapActions(['setCurrentDocument']),
  },
  async asyncData({ $config, route, params, $http, store }) {
    const pageData = await $http.$get(`${$config.apiPath}/${route.path}/data.jsonld`);
    store.commit('SET_CURRENT_DOCUMENT', pageData);
    return { pageData }
  },
  // call fetch only on client-side
  fetchOnServer: false
}
</script>

<style lang="scss">
.Document {
  padding-top: 2rem;
  h1, h2 {
    padding: 0.5rem 0.25rem 0.5rem 0.25rem;
    @media (min-width: 768px) {
      padding: 0.5rem 1rem 0.5rem 1.5rem;
    }
    margin: 0;
  }
  h1 {
    font-size: 1.5rem;
    @media (min-width: 768px) {
      font-size: 2.5rem;
    }
  }
  h2 {
    margin-bottom: -1rem;
    font-size: 1rem;
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
}
</style>