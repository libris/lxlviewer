<template>
  <div clas="Document">
    <div class="container-fluid FilterContainer">
      <div class="row">
      </div>
    </div>
    <div class="container-fluid">
      <div class="row">
        <template v-if="appState.navigatingWithFacetColumn">
          <div class="DetailedFilters col-md-4 col-lg-3 col-xl-4 col-xxl-3 pt-4">
            <div class="Document-backButton">
              <a @click="$router.go(-1)"><i class="bi bi-chevron-double-left"></i> Tillbaka</a>
            </div>
          </div>
          <div class="p-2" :class="termCols">
            <ResultItem :entity="entityData" :force-expanded="true" />
          </div>
        </template>
        <template v-else>
        <div class="p-2" :class="termCols">
          <ResultItem :entity="entityData" :force-expanded="true" />
        </div>
        </template>
        <section v-if="showTermTree">
          <div class="col-md-12 col-lg-12 col-xl-10 col-xxl-9 mt-4">
          <TermTree :entity="entityData" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import * as DataUtil from 'lxljs/data';
import * as VocabUtil from 'lxljs/vocab';
import LensMixin from '@/mixins/lens';
import ResultItem from '@/components/ResultItem';
import TermTree from '@/components/TermTree';

export default {
  mixins: [LensMixin],
  layout (context) {
    const appState = context.store ? context.store.getters.appState : this.appState;
    const requestedDomain = appState ? appState.domain : context.req.headers['x-forwarded-host'];
    // TODO
    if (requestedDomain && requestedDomain.startsWith('id') === false) {
      return 'libris';
    }
    return 'default';
  },
  head() {
    return {
      title: `${this.documentTitle} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content:`${this.documentTitle}` },
        { hid: 'description', name: 'description', content: this.documentDescription },
        { hid:'og:description', property:'og:description', content: this.documentDescription },
      ],
    };
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['appState']),
    termCols() {
      if (this.appState.navigatingWithFacetColumn) {
        return "col-md-8 col-lg-9 col-xl-8 col-xxl-9";
      }
      return "col-md-12 col-lg-12 col-xl-10 col-xxl-9";
    },
    documentTitle() {
      return this.getItemLabel;
    },
    documentDescription() {
      if (this.entityData.hasOwnProperty('@type')) {
        let type = '';
        if (Array.isArray(this.entityData['@type'])) {
          type = this.entityData['@type'][0];
        } else {
          type = this.entityData['@type'];
        }
        return this.translateKey(type);
      }
      return '';
    },
    entityData() {
      if (this.document) {
        return this.document.mainEntity;
      }
      return null;
    },
    showTermTree() {
      if (this.entityData.hasOwnProperty('@type')) {
        const termData = VocabUtil.getTermObject(this.entityData['@type'], this.vocab, this.vocabContext);
        return !!termData.subClassOf.find(({ '@id': id }) =>  id === `https://id.kb.se/vocab/ConceptScheme`)
      }
    }
  },
  methods: {
    ...mapActions(['setCurrentDocument']),
  },
  async asyncData({ error, route, store, redirect, app, $config }) {
    const domain = store.getters.appState.domain
    const siteConfig = $config.siteConfig
    const host = app.$translateAliasedUri(siteConfig[domain].baseUri)
    const path = app.$encodeSpecialChars(route.path);
    const pageData = await fetch(`${host}${path}`,
      {
        headers: { 'Accept': 'application/ld+json' },
        redirect: 'manual'
      }
    ).then(response => {
      if (response.ok) {
        return response.json()
      }

      if (response.status === 0) {
        // We're on the client side and got redirected to the page we're already on
      }
      else if (response.status === 302) {
        const url = app.$translateAliasedUri(response.headers.get('Location'))
        console.log (`REDIRECTING: ${host}${path} -> ${url}`)
        redirect(url);
      }
      else {
        error({ statusCode: response.status, message: `` })
      }
    })
    .catch((err) => {
      console.log(`ERROR: ${err}`)
      error({ statusCode: 500, message: err })
    });

    if (pageData) {
      const document = DataUtil.splitJson(pageData);
      store.commit('SET_CURRENT_DOCUMENT', document);
      return { document }
    }
  },
  // call fetch only on client-side
  fetchOnServer: false,
  components: {
    ResultItem,
    TermTree
  },
}
</script>

<style lang="scss">
.Document {
  &-backButton {
    cursor: pointer;
    font-weight: 500;
    padding: 0.5em 0;
    user-select: none;
    @media (hover: hover) {
      user-select: unset;
    }
    display: inline-block;
    border: 1px solid $gray-300;
    border-radius: 4px;
    padding: 0.25em 1em;
    @media (min-width: 768px) {
      border: none;
      padding: unset;
    }
    &:hover {
      text-decoration: underline;
    }
  }
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
