<template>
  <div class="container-fluid Marcframe">
    <div class="row">
      <div class="Marcframe-codeListColumn col-md-5 col-lg-5 col-xl-4 col-xxl-3">
        <div class="Marcframe-codeListControllers">
          <button class="btn" :class="{'btn-dark': listShown == 'bib', 'btn-kb-primary-grey': listShown != 'bib' }" @click="listShown = 'bib'">bib</button>
          <button class="btn" :class="{'btn-dark': listShown == 'auth', 'btn-kb-primary-grey': listShown != 'auth' }" @click="listShown = 'auth'">auth</button>
          <button class="btn" :class="{'btn-dark': listShown == 'hold', 'btn-kb-primary-grey': listShown != 'hold' }" @click="listShown = 'hold'">hold</button>
        </div>
        <div class="Marcframe-codeList">
          <ul>
            <NuxtLink :to="`/marcframe/${listShown}/${key}`" v-for="(value, key) in codeLists[listShown]" :key="key">
            <li>
              {{key }}
            </li>
            </NuxtLink>
          </ul>
        </div>
      </div>
      <div class="Marcframe-codeDetailsColumn col-md-7 col-lg-7 col-xl-8 col-xxl-7">
        <NuxtChild  />
      </div>
    </div>
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
    };
  },
  data() {
    return {
      listShown: 'bib',
      chosenCode: null,
      showMarc: false,
    }
  },
  mounted() {
    this.listShown = this.category;
  },
  computed: {
    ...mapGetters(['vocab', 'vocabClasses', 'vocabProperties', 'vocabContext', 'resources']),
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
      return this.$route.params.category;
    },
    bib() {
      return Object.keys(this.marcframe.bib).sort((a, b) => a-b).reduce(
        (obj, key) => { 
          obj[key] = this.marcframe.bib[key]; 
          return obj;
        }, 
        {}
      );
    },
    auth() {
      return Object.keys(this.marcframe.auth).sort((a, b) => a-b).reduce(
        (obj, key) => { 
          obj[key] = this.marcframe.auth[key]; 
          return obj;
        }, 
        {}
      );
    },
    hold() {
      return Object.keys(this.marcframe.hold).sort((a, b) => a-b).reduce(
        (obj, key) => { 
          obj[key] = this.marcframe.hold[key]; 
          return obj;
        }, 
        {}
      );
    },
    codeLists() {
      return {
        bib: this.bib,
        auth: this.auth,
        hold: this.hold,
      };
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

.Marcframe {
  &-codeListColumn {
    display: flex;
    flex-direction: column;
    height: 80vh;
  }
  &-codeDetailsColumn {
      padding-top: 2rem;
  }
  &-codeListControllers {
    border: solid $gray-500;
    border-width: 0px 0px 1px 0px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 0.5em 0;
  }
  &-codeList {
    flex-grow: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    ul {
      margin: 0.25em;
      display: grid;
      grid-template-columns: repeat(8,  minmax(0, 1fr));
      @media (min-width: 768px) {
        grid-template-columns: repeat(6,  minmax(0, 1fr));
      }
      @media (min-width: 1200px) {
        grid-template-columns: repeat(8,  minmax(0, 1fr));
      }
      @media (min-width: 1400px) {
        grid-template-columns: repeat(7,  minmax(0, 1fr));
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
    margin-bottom: -1rem;
    font-size: 1rem;
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
}
</style>