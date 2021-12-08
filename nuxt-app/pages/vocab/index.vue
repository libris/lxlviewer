<template>
  <div>
    <div class="Vocab-termDetails">
      <ResultItem :entity="termDataOntology" :force-expanded="true" :show-download="false" :show-other-services="false" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
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
      showMarc: false,
    }
  },
  computed: {
    ...mapGetters(['vocab', 'settings', 'vocabContext']),
    pageTitle() {
      if (this.termData) {
        return `${ this.termTitle || 'Basvokabulär'}`
      }
      return 'Basvokabulär';
    },
    termTitle() {
      return this.getEntityTitle(this.termData);
    },
    termDataOntology() {
      const termData = VocabUtil.getTermObject('https://id.kb.se/vocab/', this.vocab, this.vocabContext);
      if (termData) {
        return termData;
      }
      return null;
    },
  },
  methods: {
  },
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