<template>
  <div class="EntityTable-body">
    <div class="PropertyRow d-md-flex" v-if="showUri">
      <span class="PropertyRow-bodyKey d-block d-md-inline">URI</span>
      <span class="PropertyRow-bodyValue">
        <a :href="itemData['@id'] | removeBaseUri">
          {{ decodeURI(itemData['@id']) }}
        </a>
        </span>
    </div>
    <PropertyRow :property="prop" :key="prop" :value="itemData[prop]" v-for="prop in sortedProperties" />
    <div class="PropertyRow d-md-flex" v-if="showDownload">
      <span class="PropertyRow-bodyKey d-block d-md-inline">Ladda ner</span>
      <span class="PropertyRow-bodyValue"><a :href="`${itemData['@id']}/data.jsonld` | replaceBaseWithApi">JSON-LD</a> • <a :href="`${itemData['@id']}/data.ttl` | replaceBaseWithApi">Turtle</a> • <a :href="`${itemData['@id']}/data.rdf` | replaceBaseWithApi">RDF/XML</a></span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as DisplayUtil from '@/utils/display';
import * as VocabUtil from '@/utils/vocab';
import PropertyRow from '@/components/PropertyRow';

export default {
  data() {
    return {
      hiddenProperties: [
        '@type',
        '@id',
        'reverseLinks',
        'meta',
      ],
    };
  },
  methods: {
    isByLangKey(key) {
      return key.endsWith('ByLang');
    },
  },
  computed: {
    ...mapGetters(['display', 'vocabContext', 'settings', 'vocab']),
    sortedProperties() {
      const propertyOrder = DisplayUtil.getDisplayProperties(this.itemData['@type'], this.display, this.vocab, this.settings, this.vocabContext, 'full');
      const translatedOrder = [];
      propertyOrder.forEach((prop) => {
        let currentProp = prop;
        if (prop.includes('@reverse')) {
          const termObj = VocabUtil.getTermObject(prop.split('/').pop(), this.vocab, this.vocabContext);
          currentProp = termObj['owl:inverseOf']['@id'].split('/').pop();
        }
        if (this.itemData.hasOwnProperty(currentProp)) {
          translatedOrder.push(currentProp);
        }
      });
      const objectToInject = this.itemData.hasOwnProperty('@reverse') ? this.afterInverseReverse : this.itemData;
      Object.keys(objectToInject).forEach((prop) => {
        if (translatedOrder.includes(prop) == false && this.hiddenProperties.includes(prop) == false) {
          translatedOrder.push(prop);
        }
      });
      return translatedOrder;
    },
    afterInverseReverse() {
      const extracted = {};
      for (const [key, value] of Object.entries(this.itemData['@reverse'])) {
        const termObj = VocabUtil.getTermObject(key, this.vocab, this.vocabContext);
        const reverseKey = termObj['owl:inverseOf']['@id'].split('/').pop();
        extracted[reverseKey] = value;
      }
      const combinedData = Object.assign(this.itemData, extracted);
      delete combinedData['@reverse'];
      return combinedData;
    },
  },
  props: {
    itemData: {
      type: Object,
      default: null,
    },
    showDownload: {
      type: Boolean,
      default: false,
    },
    showUri: {
      type: Boolean,
      default: true,
    }
  },
  components: {
    PropertyRow,
  },
}
</script>

<style lang="scss">
.EntityTable {
  border: solid $gray-200;
  border-width: 0px 1px 1px 1px;
  &:first-child {
    border-width: 1px 1px 1px 1px;
  }
  &-header {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 0.5em 1em;
    gap: 1em;
    > span {
      padding: 0.5em;
      &:first-child {
        flex-grow: 1;
      }
    }
  }
  &-title {
    a {
      color: $kb-secondary-turquoise;
      font-weight: 500;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  &-body {
    padding: 0.5rem 0.25rem 0.5rem 0.25rem;
    @media (min-width: 768px) {
      padding: 0.5rem 1rem 0.5rem 1.5rem;
    }
  }
  &.hovered {
    box-shadow: 0 0.25em 0.5em 0 rgba(0, 0, 0, 0.25);
    .chip {
      border-color: $gray-500;
      color: $black;
    }
  }
  .chip {
    transition: 0.25s ease all;
    border: 1px solid $gray-100;
    background-color: $gray-100;
    border-radius: 2em;
    color: $gray-600;
    padding: 0.5em 0.75em;
  }

}

</style>
