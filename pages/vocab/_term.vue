<template>
  <div class="container-fluid Vocab">
    <div class="row">
      <div class="Vocab-termListColumn col-md-4 col-lg-4 col-xl-3 col-xxl-2">
        <div class="Vocab-termListControllers">
          <button class="btn" :class="{'btn-dark': listShown == 'Classes', 'btn-kb-primary-grey': listShown != 'Classes' }" @click="listShown = 'Classes'">Classes</button>
          <button class="btn" :class="{'btn-dark': listShown == 'Properties', 'btn-kb-primary-grey': listShown != 'Properties' }" @click="listShown = 'Properties'">Properties</button>
          <div>
            <input type="checkbox" id="showMarc" v-model="showMarc" /> <label for="showMarc">Visa marc-termer</label>
          </div>
        </div>
        <div class="Vocab-termList" v-if="vocab && listShown == 'Classes'">
          <ul>
            <li v-for="item in classes" :key="item[0]"><NuxtLink v-if="item[0]" :to="item[0] | replaceBaseWithApi">{{ item[0].split('/').pop() }}</NuxtLink></li>
          </ul>
        </div>
        <div class="Vocab-termList" v-if="vocab && listShown == 'Properties'">
          <ul>
            <li v-for="item in properties" :key="item[0]"><NuxtLink v-if="item[0]" :to="item[0] | replaceBaseWithApi">{{ item[0].split('/').pop() }}</NuxtLink></li>
          </ul>
        </div>
      </div>
      <div class="Vocab-termDetailsColumn col-md-8 col-lg-8 col-xl-9 col-xxl-10">
        <div class="Vocab-termDetails" v-if="termData != null">
          <h2 class="text-muted">{{ termData['@id'].split('/').pop() }}</h2>
          <h1>{{ getEntityTitle(termData) }}</h1>
          <EntityTable :item-data="termData" />
        </div>
        <div class="Vocab-termDetails" v-if="termData == null">
          <h1>Basvokabulär</h1>
          <p>Välj en term i listan för att se detaljer.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as VocabUtil from '@/utils/vocab';

export default {
  head() {
    return {
      title: `${this.$route.params.term || 'Basvokabulär'} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content: this.$route.params.term || 'Basvokabulär' },
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
    termData() {
      if (this.$route.params.term) {
        return VocabUtil.getTermObject(this.$route.params.term, this.vocab, this.vocabContext);
      }
      return null;
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
}
</script>

<style lang="scss">

.Vocab {
  &-termListColumn {
    display: flex;
    flex-direction: column;
    height: 80vh;
  }
  &-termDetailsColumn {
      padding-top: 2rem;
  }
  &-termListControllers {
    border: solid $gray-500;
    border-width: 0px 0px 1px 0px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 0.5em 0;
  }
  &-termList {
    flex-grow: 1;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  &-termDetails {
    h1 {
      padding: 0.5rem 1rem 0.5rem 1.5rem;
      font-size: 3rem;
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