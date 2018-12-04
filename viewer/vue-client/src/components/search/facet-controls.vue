<script>
import Facet from './facet.vue';

export default {
  name: 'facet-controls',
  props: {
    result: {},
  },
  data() {
    return {
    };
  },
  methods: {
    isRangeFacet(dimensionKey) {
      return dimensionKey === 'publication.date';
    },
    facetLabelByLang(facetType) {
      return this.settings.propertyChains[facetType][this.user.settings.language];
    },
    expandFacets($event) {
      const el = $event.target;
      const list = el.nextSibling.nextSibling;
      el.classList.toggle('is-open');
      list.classList.toggle('is-open');
    },
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
  },
  events: {
  },
  components: {
    facet: Facet,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="FacetControls">
    <nav class="FacetControls-listNav" 
      :aria-labelledby="facetLabelByLang(dimensionValue.dimension)"
      v-for="(dimensionValue, dimensionKey) in result.stats.sliceByDimension" 
      :key="dimensionKey">
      <h4 class="FacetControls-listTitle js-listTitle uppercaseHeading--bold" 
        @click="expandFacets($event)"
        :id="facetLabelByLang(dimensionValue.dimension)">
        {{facetLabelByLang(dimensionValue.dimension) | capitalize}}
      </h4>
      <!--<range-input v-if="isRangeFacet(dimensionKey)"></range-input>-->
      <ul class="FacetControls-list js-list">
        <facet class="FacetControls-listItem"
        v-for="observation in dimensionValue.observation" 
        :observation="observation" 
        :key="observation.label"></facet>
      </ul>
    </nav>
  </div>
</template>

<style lang="less">
.FacetControls {
  padding: 0 10px;

  @media (min-width: @screen-md) {
    padding: 0;
  }

  &-listTitle {
    margin: 10px 0 5px 0;
    padding: 0px;
    cursor: pointer;
    display: inline-block;

    &:before {
      font-family: FontAwesome;
      content: "\F054";
      display: inline-block;
      margin-right: 3px;
      transition: transform 0.1s ease;
    }

    @media (min-width: 992px) {
      cursor: default;
      pointer-events: none;

      &:before {
        content: '';
        margin: -2px;
      }
    }

    &.is-open {
      &:before {
        transform: rotate(90deg);
      }
    }
  }

  &-listNav {
    margin: 0px 0 0;
  }

  &-list {
    list-style: none;
    padding: 0;
    display: none;

    @media (min-width: 992px) {
      display: block;
    }

    &.is-open {
      display: block;     
    }
  }

  &-listItem {
    line-height: 27px;
  }
}
</style>
