<script>
import Facet from './facet.vue';

export default {
  name: 'facet-group',
  props: {
    slice: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isExpanded: true,
    };
  },
  methods: {
    facetLabelByLang(facetType) {
      return this.settings.propertyChains[facetType][this.user.settings.language];
    },
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
  },
  components: {
    facet: Facet,
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <nav class="FacetGroup" 
    :aria-labelledby="facetLabelByLang(slice.dimension)">
    <h4 class="FacetGroup-title uppercaseHeading--bold"
      :class="{'is-expanded' : isExpanded}"
      @click="toggleExpanded()"
      :id="facetLabelByLang(slice.dimension)">
      {{facetLabelByLang(slice.dimension) | capitalize}}
    </h4>
    <ul class="FacetGroup-list"
      :class="{'is-expanded' : isExpanded}">
      <facet v-for="observation in slice.observation" 
      :observation="observation" 
      :key="observation.label"></facet>
    </ul>
  </nav>
</template>

<style lang="less">
.FacetGroup {
  width: 200px;
  margin: 0px 0 0;

  &-title {
    margin: 10px 0 5px 0;
    padding: 0px;
    cursor: pointer;
    display: inline-block;

    &:before {
      font-family: FontAwesome;
      content: "\F054";
      font-weight: normal;
      color: @brand-primary;
      display: inline-block;
      margin-right: 5px;
      transition: transform 0.1s ease;
    }

    &.is-expanded {
      &:before {
        transform: rotate(90deg);
      }
    }
  }

  &-list {
    list-style: none;
    padding: 0;
    display: none;

    &.is-expanded {
      margin-top: 5px;
      display: block;     
    }
  }
}
</style>
