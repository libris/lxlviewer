<template>
  <div class="container-fluid Vocab">
    <div class="row">
      <div class="Vocab-termListColumn col-md-4 col-lg-4 col-xl-3 col-xxl-3">
        <VocabTermlist />
      </div>
      <div class="Vocab-termDetailsColumn offset-md-4 offset-lg-4 offset-xl-3 offset-xxl-3 col-md-8 col-lg-8 col-xl-9 col-xxl-9">
        <NuxtChild  />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import ResultItem from '@/components/ResultItem';
import VocabTermlist from '@/components/VocabTermlist';

export default {
  head() {
    return {
      title: `${this.pageTitle} | ${this.$config.siteName}`,
    };
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['vocab', 'vocabContext']),
    pageTitle() {
      if (this.termData) {
        return `${ this.termTitle || 'Basvokabulär'}`
      }
      return 'Basvokabulär';
    },
    termTitle() {
      return this.getEntityTitle(this.termData);
    },
    termData() {
      if (this.$route.params.term) {
        return VocabUtil.getTermObject(this.$route.params.term, this.vocab, this.vocabContext);
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
    VocabTermlist,
  },
}
</script>

<style lang="scss">

.Vocab {
  &-termListColumn {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: $white;
    @media (min-width: 768px) {
      position: fixed;
      height: calc(100vh - 50px - 81px);
      padding-left: 2em !important;
      padding-right: 0em !important;
      left: 0;
      border: solid $gray-300;
      border-width: 0px 1px 0px 0px;
    }
  }
  &-termDetailsColumn {
      padding-top: 2rem;
  }
  &-termDetails {
    h1 {
      padding: 0.5rem 1rem 0.5rem 1.5rem;
      font-size: 3rem;
    }
  }
  p {
    padding: 0.5rem 0.25rem 0.5rem 0.25rem;
    @media (min-width: 768px) {
      padding: 0.5rem 1rem 0.5rem 1.5rem;
    }
  }
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