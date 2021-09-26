<template>
  <div class="Vocab-termDetails">
    <h1>Marcframe</h1>
    <p>Välj en kod i listan för att se detaljer.</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';
import ResultItem from '@/components/ResultItem';

export default {
  head() {
    return {
      title: `${this.pageTitle} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content: this.pageTitle },
      ],
    };
  },
  data() {
    return {
      listShown: 'Classes',
      showMarc: false,
    }
  },
  computed: {
    ...mapGetters(['vocab', 'vocabClasses', 'vocabProperties', 'vocabContext']),
    pageTitle() {
      if (this.termData) {
        return `${ this.termTitle || 'Marcframe'}`
      }
      return 'Marcframe';
    },
    termTitle() {
      return this.getEntityTitle(this.termData);
    },
    chosenList() {
      if (this.listShown === 'Classes') {
        return this.classes;
      } else {
        return this.properties;
      }
    },
    classes() {
      return this.vocabClasses;
    },
    properties() {
      return this.vocabProperties;
    },
  },
  methods: {
  },
  // async asyncData({ $config, route, params, $http }) {
  //   const pageData = await $http.$get(`${$config.apiPath}/vocab/data.jsonld`);
  //   return {
  //     pageData,
  //   };
  // },
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
  components: {
    ResultItem,
  },
}
</script>

<style lang="scss">

</style>