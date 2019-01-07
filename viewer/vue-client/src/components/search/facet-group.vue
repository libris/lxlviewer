<script>
import Facet from './facet.vue';

export default {
  name: 'facet-group',
  props: {
    group: {
      type: Object,
      required: true,
    },
    expanded: {
      type: Boolean,
    },
  },
  data() {
    return {
      isExpanded: this.expanded,
      currentLevel: 0,
      revealLevels: [5, 15, false],
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
    slicedObservations() {
      let limit = this.revealLevels[this.currentLevel];

      if (this.group.observation.length - limit === 1) {
        limit = false; // if only one remains hidden we might as well show all
      }
      return limit ? this.group.observation.slice(0, limit) : this.group.observation;
    },
    revealText() {
      if (this.slicedObservations.length >= this.group.observation.length) {
        return false;
      } 
      if (this.revealLevels[this.currentLevel + 1] 
        && this.revealLevels[this.currentLevel + 1] < this.group.observation.length) {
        return 'Show more';
      } 
      return 'Show all';
    },
    hasScroll() {
      return !this.revealLevels[this.currentLevel] && this.isExpanded; 
    },
  },
  components: {
    facet: Facet,
  },
};
</script>

<template>
  <nav class="FacetGroup" 
    :class="{'has-scroll' : hasScroll}"
    :aria-labelledby="facetLabelByLang(group.dimension)">
    <h4 class="FacetGroup-title uppercaseHeading--bold"
      :class="{'is-expanded' : isExpanded}"
      @click="toggleExpanded()"
      :id="facetLabelByLang(group.dimension)">
      {{facetLabelByLang(group.dimension) | capitalize}}
    </h4>
    <ul class="FacetGroup-list"
      :class="{'is-expanded' : isExpanded, 'has-scroll' : hasScroll}">
      <facet v-for="observation in slicedObservations"
      :observation="observation" 
      :key="observation.label"></facet>
      <span 
        v-if="revealText" 
        class="FacetGroup-reveal link" 
        @click="currentLevel++">{{ revealText | translatePhrase }}...</span>
    </ul>

  </nav>
</template>

<style lang="less">
.FacetGroup {
  width: 230px;
  margin: 0px 0 0;

  &.has-scroll {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 215px;
      height: 50px;
      background-image: linear-gradient(to bottom, transparent, @bg-site);
    }
  }

  &-title {
    margin: 10px 0 5px 0;
    padding: 0px;
    cursor: pointer;
    display: inline-block;

    &::before {
      font-family: FontAwesome;
      content: "\F054";
      font-weight: normal;
      color: @brand-primary;
      display: inline-block;
      margin-right: 5px;
      transition: transform 0.1s ease;
    }

    &.is-expanded {
      &::before {
        transform: rotate(90deg);
      }
    }
  }

  &-list {
    list-style: none;
    padding: 0 15px 0 0;
    display: none;

    &.is-expanded {
      margin-top: 5px;
      display: block;
    }

    &.has-scroll {
      max-height: 450px;
      overflow-y: scroll;
      padding-bottom: 50px;
    }
  }

  &-reveal {
    font-size: 14px;
    line-height: 30px;
  }
}
</style>
