<template>
  <div class="container-fluid Marcframe" v-if="marcframe">
    <div class="row">
      <div class="Marcframe-codeListColumn col-md-4 col-lg-3 col-xl-4 col-xxl-3">
        <div class="Marcframe-codeListControllers">
          <button class="btn" :class="{'btn-dark': listShown == 'bib', 'btn-kb-primary-grey': listShown != 'bib' }" @click="listShown = 'bib'">bib</button>
          <button class="btn" :class="{'btn-dark': listShown == 'auth', 'btn-kb-primary-grey': listShown != 'auth' }" @click="listShown = 'auth'">auth</button>
          <button class="btn" :class="{'btn-dark': listShown == 'hold', 'btn-kb-primary-grey': listShown != 'hold' }" @click="listShown = 'hold'">hold</button>
        </div>
        <div class="Marcframe-codeList">
          <div class="Marcframe-codeListSection" :key="key" v-for="(value, key) in codeLists[listShown]">
            <span class="Marcframe-codeListInitial">{{ key !== '?' ? `${key}xx` : `?` }}</span>
            <ul :class="{'otherKey': key === '?'}">
              <NuxtLink @click.native="onCodeSelect" :to="`/marcframe/${listShown}/${subkey}`" v-for="(subvalue, subkey) in value" :key="subkey">
              <li>
                {{ subkey }}
              </li>
              </NuxtLink>
            </ul>
            <hr>
          </div>
        </div>
      </div>
      <div class="Marcframe-codeDetailsColumn offset-md-4 offset-lg-3 offset-xl-4 offset-xxl-3 col-md col-md-8 col-lg-9 col-xl-8 col-xxl-9">
        <NuxtChild  />
      </div>
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
    };
  },
  data() {
    return {
      listShown: 'bib',
      chosenCode: null,
      showMarc: false,
    }
  },
  async asyncData({ $config, store, $http }) {
    if (!store.getters.resources.marcframe) {
      const baseUri = $config.siteConfig['libris.kb.se']?.baseUri;
      const marcframePath = `${baseUri}/sys/marcframe.json`;
      const pageData = await fetch(
        marcframePath
      ).then(res => res.json());
      store.dispatch('setMarcframe', pageData);
    }
  },
  mounted() {
    if (this.category) {
      if (this.category === 'bib' || this.category === 'auth' || this.category === 'hold') {
        this.listShown = this.category;
      }
    }
  },
  computed: {
    ...mapGetters(['vocab', 'vocabContext', 'resources']),
    pageTitle() {
      if (this.termData) {
        return `${ this.termTitle || 'MARC-mappningar'}`
      }
      return 'MARC-mappningar';
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
    marcframe() {
      return this.resources.marcframe;
    },
    category() {
      if (this.$route.params.category) {
        return this.$route.params.category;
      }
      return null;
    },
    bibList() {
      return this.getSplitOnNumeric(this.marcframe.bib);
    },
    bibKeys() {
      return Object.keys(this.marcframe.bib).sort((a, b) => parseInt(a)-parseInt(b));
    },
    authKeys() {
      return Object.keys(this.marcframe.auth).sort((a, b) => a-b);
    },
    holdKeys() {
      return Object.keys(this.marcframe.hold).sort((a, b) => a-b);
    },
    codeLists() {
      return {
        bib: this.getSplitOnNumeric(this.marcframe.bib),
        auth: this.getSplitOnNumeric(this.marcframe.auth),
        hold: this.getSplitOnNumeric(this.marcframe.hold),
      };
    },
  },
  methods: {
    onCodeSelect() {
      if (this.category) {
        this.listShown = this.category;
      }
    },
    getSplitOnNumeric(objectList) {
      const splitObject = {};
      for (const [key, value] of Object.entries(objectList)) {
        const sortNumber = key.length <= 3 ? `${key[0]}` : '?';
        if (splitObject.hasOwnProperty(sortNumber) == false) {
          splitObject[sortNumber] = {};
        }
        splitObject[sortNumber][key] = value;
      }
      return splitObject;
    },
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

.Marcframe {
  &-codeListColumn {
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
  &-codeDetailsColumn {
      padding-top: 2rem;
  }
  &-codeListControllers {
    border: solid $gray-300;
    border-width: 0px 0px 1px 0px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 0.5em 0;
  }
  &-codeListSection {
    display: flex;
    border: solid $gray-200;
    border-width: 0px 0px 1px 0px;
  }
  &-codeList {
    flex-grow: 1;
    border: solid $gray-300;
    border-width: 0px 0px 1px 0px;
    height: 25vh;
    overflow-y: auto;
    overflow-x: hidden;
    @media (min-width: 768px) {
      height: 100%;
    }
    ul {
      &.otherKey {
        display: flex;
        flex-wrap: wrap;
      }
      flex-grow: 1;
      padding: 0;
      margin: 0.25em;
      display: inline-grid;
      grid-template-columns: repeat(5,  minmax(0, 1fr));
      @media (min-width: 576px) {
        grid-template-columns: repeat(8,  minmax(0, 1fr));
      }
      @media (min-width: 768px) {
        grid-template-columns: repeat(4,  minmax(0, 1fr));
      }
      @media (min-width: 992px) {
        grid-template-columns: repeat(4,  minmax(0, 1fr));
      }
      @media (min-width: 1200px) {
        grid-template-columns: repeat(6,  minmax(0, 1fr));
      }
      @media (min-width: 1400px) {
        grid-template-columns: repeat(6,  minmax(0, 1fr));
      }
      list-style-type: none;
      a {
        &:hover {
          background-color: $gray-300;
        }
        text-decoration: none;
        border-radius: 3px;
        &.nuxt-link-active {
          background-color: $dark;
          color: $light;
        }
      }
      li {
        padding: 0.25em;
        text-align: center;
      }
    }
  }
  &-codeListInitial {
    padding: 0.5em 0.25em;
    font-weight: 500;
    color: $gray-500;
  }
  &-codeDetails {
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
    margin-bottom: 1rem;
    font-size: 1rem;
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
}
</style>
