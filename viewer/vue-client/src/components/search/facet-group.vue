<script>
import { sortBy } from 'lodash-es';
import Facet from './facet.vue';
import EncodingLevelIcon from '@/components/shared/encoding-level-icon';
import TypeIcon from '@/components/shared/type-icon';

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
      return (this.settings.propertyChains[facetType] || {})[this.user.settings.language] || facetType;
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
    sorted() {
      let sorted = this.group.observation;
      if (this.group.dimension === '@reverse.itemOf.heldBy.@id') {
        const userSigels = this.user.collections.map((item) => {
          return item.code;
        });
        sorted = sortBy(sorted, (o) => {
          // Put all the users sigels on top
          return userSigels.indexOf(o.object.sigel) < 0;
        });
        sorted = sortBy(sorted, (o) => {
          // Put the active sigel on top
          return o.object.sigel !== this.user.settings.activeSigel;
        });
      }
      return sorted;
    },
    slicedObservations() {
      let limit = this.revealLevels[this.currentLevel];

      if (this.sorted.length - limit === 1) {
        limit = false; // if only one remains hidden we might as well show all
      }
      return limit ? this.sorted.slice(0, limit) : this.sorted;
    },
    revealText() {
      if (this.slicedObservations.length >= this.sorted.length) {
        return false;
      } 
      if (this.revealLevels[this.currentLevel + 1] 
        && this.revealLevels[this.currentLevel + 1] < this.sorted.length) {
        return 'Show more';
      } 
      return 'Show all';
    },
    hasScroll() {
      return !this.revealLevels[this.currentLevel] && this.isExpanded; 
    },
  },
  components: {
    Facet,
    EncodingLevelIcon,
    TypeIcon,
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
      @keyup.enter="toggleExpanded()"
      tabindex="0"
      :id="facetLabelByLang(group.dimension)">
      {{facetLabelByLang(group.dimension) | capitalize}}
    </h4>
    <ul class="FacetGroup-list"
      :class="{'is-expanded' : isExpanded, 'has-scroll' : hasScroll}">
      <facet v-for="observation in slicedObservations"
        :observation="observation" 
        :key="observation.label">
        <encoding-level-icon
          slot="icon"
          v-if="group.dimension === 'meta.encodingLevel'"
          :encodingLevel="observation.object['@id']" />
        <type-icon
          slot="icon"
          :show-iconless="false"
          v-if="group.dimension === 'instanceOf.@type' || group.dimension === '@type'"
          :type="observation.object['@id']" />
      </facet>
    </ul>
    <span 
      v-if="revealText && isExpanded" 
      class="FacetGroup-reveal link"
      tabindex="0"
      @click="currentLevel++"
      @keyup.enter="currentLevel++">{{ revealText | translatePhrase }}...</span>
  </nav>
</template>

<style lang="less">
.FacetGroup {
  // width: 230px;
  margin-bottom: 15px;

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
    margin: 0;
    padding: 0 15px 0 0;
    display: none;

    &.is-expanded {
      margin-top: 5px;
      display: block;
    }

    &.has-scroll {
      max-height: 437px;
      overflow-y: scroll;
      border-bottom: 1px solid @grey-light;
    }
  }

  &-reveal {
    font-size: 14px;
    line-height: 30px;
  }
}
</style>
