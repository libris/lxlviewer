<template>
  <div class="Marcframe-termDetails">
    <!-- <ResultItem :entity="termData" :force-expanded="true" :show-download="false" /> -->
    <template v-if="codeData">
      <h1>{{ category.toUpperCase() }}-{{ code }}</h1>
      <table>
        <tr v-for="(value, key) in mainProperties" :key="key">
          <td>{{ key }}</td>
          <td>
            <template v-if="key == 'addLink'">
              <EntityNode :parent-key="key" :entity="{'@id': `https://id.kb.se/vocab/${value}` }" />
            </template>
            <template v-else>{{ value }}</template>
          </td>
        </tr>
        <tr v-for="(value, key) in subfields" :key="key">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
      </table>
      <hr>
      <button class="btn btn-dark" @click="showFullData = !showFullData">json</button>
      <hr>
      <code v-if="showFullData">
        {{ codeData | json }}
      </code>
    </template>
    <template v-else>
      <h1>Hittade inte mappning för kod {{ category }}-{{ code }}</h1>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ResultItem from '@/components/ResultItem';
import EntityNode from '@/components/EntityNode';

export default {
  head() {
    return {
      title: `${this.pageTitle} | ${this.$config.siteName}`,
      meta: [
        { hid:'og:title', property:'og:title', content: this.pageTitle },
        { hid: 'description', name: 'description', content: this.documentDescription },
        { hid:'og:description', property:'og:description', content: this.documentDescription },
      ],
    };
  },
  data() {
    return {
      listShown: 'Classes',
      showMarc: false,
      showFullData: false,
    }
  },
  computed: {
    ...mapGetters(['vocab', 'vocabClasses', 'vocabProperties', 'vocabContext', 'resources']),
    pageTitle() {
      if (this.codeTitle) {
        return `${ this.codeTitle.toUpperCase() }`;
      }
      return 'MARC-mappningar';
    },
    mainProperties() {
      const mainProperties = {};
      for (const [key, value] of Object.entries(this.codeData)) {
        if (key.startsWith('$') == false && key.startsWith('_') == false) {
          mainProperties[key] = value;
        }
      }
      return mainProperties;
    },
    subfields() {
      const subfields = {};
      for (const [key, value] of Object.entries(this.codeData)) {
        if (key.startsWith('$')) {
          subfields[key] = value;
        }
      }
      return subfields;
    },
    category() {
      return this.$route.params.category;
    },
    code() {
      return this.$route.params.code;
    },
    codeData() {
      return this.resources.marcframe[this.category][this.code];
    },
    documentDescription() {
      return 'MARC-mappning';
      // if (this.termData.hasOwnProperty('@type')) {
      //   let type = '';
      //   if (Array.isArray(this.termData['@type'])) {
      //     type = this.termData['@type'][0];
      //   } else {
      //     type = this.termData['@type'];
      //   }
      //   return this.translateKey(type);
      // }
      // return '';
    },
    codeTitle() {
      return `${ this.category }-${ this.code }`;
    },
  },
  methods: {
  },
  // call fetch only on client-side
  fetchOnServer: false,
  watchQuery: true,
  components: {
    ResultItem,
    EntityNode,
  },
}
</script>

<style lang="scss">

.Marcframe-termDetails {
  table {
    margin: 0.5rem 1rem 0.5rem 1.5rem;
    tr {
      &:nth-child(odd) {
        background-color: $gray-100;
      }
    }
    td {
      vertical-align: top;
      padding: 0.5em;
    }
  }
}

</style>