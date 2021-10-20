<script>
import { sortBy, orderBy } from 'lodash-es';
import { mixin as clickaway } from 'vue-clickaway';
import * as DisplayUtil from 'lxltools/display';
import EncodingLevelIcon from '@/components/shared/encoding-level-icon';
import TypeIcon from '@/components/shared/type-icon';
import Facet from './facet.vue';

export default {
  name: 'facet-group',
  mixins: [clickaway],
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
      sortDropDownActive: false,
      dropDownItemActive: null,
    };
  },
  methods: {
    facetLabelByLang(facetType) {
      return (this.settings.propertyChains[facetType] || {})[this.user.settings.language] || facetType;
    },
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    toggleSortDropDown() {
      this.sortDropDownActive = !this.sortDropDownActive;
    },
    hideSortDropDown() {
      this.sortDropDownActive = false;
    },
    selectSortDropDownItem(item) {
      const userObj = this.user;
      this.$set(userObj.settings.facetSortings, this.group.dimension, item);
      this.$store.dispatch('setUser', userObj);
    },
    featuredComparison(facet) {
      if (this.group.dimension === '@reverse.itemOf.heldBy.@id') {
        // Featured code for '@reverse.itemOf.heldBy.@id'
        const userSigels = this.user.collections.map(item => item.code);
        if (facet.object.hasOwnProperty('sigel')) {
          return userSigels.indexOf(facet.object.sigel) > -1;
        }
        if (facet.object.hasOwnProperty('@id')) {
          const keyParts = facet.object['@id'].split('/');
          const label = keyParts[keyParts.length - 1];
          return userSigels.indexOf(label) > -1;
        }
      }
      return false;
    },
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
    resources() {
      return this.$store.getters.resources;
    },
    list() {
      const self = this;
      const list = this.group.observation.map((o) => {
        let label;
        if (o.object.hasOwnProperty('@id')) {
          label = DisplayUtil.getItemLabel(
            o.object,
            this.resources,
            null,
            this.settings,
          );
        } else {
          label = o.object.label;
        }
        label = this.$options.filters.capitalize(label);
        return {
          label,
          object: o.object,
          amount: o.totalItems,
          link: o.view['@id'],
          featured: self.featuredComparison(o),
        };
      });
      return list;
    },
    chosenSort() {
      const key = this.group.dimension;
      const sorting = this.user.settings.facetSortings[key];
      if (typeof sorting === 'undefined') {
        return 'amount.desc';
      }
      return this.user.settings.facetSortings[key];
    },
    sorted() {
      let sorted = this.list;
      switch (this.chosenSort) {
        case 'amount.desc':
          sorted = orderBy(this.list, ['amount'], ['desc']);
          break;
        case 'amount.asc':
          sorted = orderBy(this.list, ['amount'], ['asc']);
          break;
        case 'alpha.desc':
          sorted = orderBy(this.list, ['label'], ['desc']);
          break;
        case 'alpha.asc':
          sorted = orderBy(this.list, ['label'], ['asc']);
          break;
        default:
          sorted = orderBy(this.list, ['amount'], ['desc']);
          break;
      }
      sorted = sortBy(sorted, o => o.featured === false);
      return sorted;
    },
    featuredFacets() {
      let featured = this.facets.filter(o => o.featured === true);
      if (this.group.dimension === '@reverse.itemOf.heldBy.@id') {
        const activeSigel = this.user.settings.activeSigel;
        featured = sortBy(featured, o => o.object.sigel !== activeSigel && o.label !== activeSigel && o.label !== `library/${activeSigel}`);
      }
      return featured;
    },
    normalFacets() {
      return this.facets.filter(o => o.featured === false);
    },
    facets() {
      let limit = this.revealLevels[this.currentLevel];
      if (this.sorted.length - limit === 1) {
        limit = false; // if only one remains hidden we might as well show all
      }
      return limit ? this.sorted.slice(0, limit) : this.sorted;
    },
    revealText() {
      if (this.facets.length >= this.sorted.length) {
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
    <div class="FacetGroup-header">
      <h4 class="FacetGroup-title uppercaseHeading--bold"
        :class="{'is-expanded' : isExpanded}"
        @click="toggleExpanded()"
        @keyup.enter="toggleExpanded()"
        tabindex="0"
        :id="facetLabelByLang(group.dimension)">
        {{facetLabelByLang(group.dimension) | capitalize}}
      </h4>
      <div
        class="FacetGroup-sortSelect" 
        tabindex="0"
        v-show="isExpanded"
        @click="toggleSortDropDown"
        @keyup.enter="toggleSortDropDown"
        v-on-clickaway="hideSortDropDown"
        :class="{'active': sortDropDownActive}"
      >
        <i v-if="chosenSort == 'amount.desc'" class="icon-selected fa fa-fw fa-sort-amount-desc"></i>
        <i v-if="chosenSort == 'amount.asc'" class="icon-selected fa fa-fw fa-sort-amount-asc"></i>
        <i v-if="chosenSort == 'alpha.asc'" class="icon-selected fa fa-fw fa-sort-alpha-asc"></i>
        <i v-if="chosenSort == 'alpha.desc'" class="icon-selected fa fa-fw fa-sort-alpha-desc"></i>
        <i class="fa fa-caret-down"></i>
        <ul class="FacetGroup-sortSelectDropdown" v-show="sortDropDownActive">
          <li :class="{'active': chosenSort == 'amount.desc'}" @click="selectSortDropDownItem('amount.desc')" @keyup.enter="selectSortDropDownItem('amount.desc')"><i class="fa fa-fw fa-sort-amount-desc"></i> Antal träffar (fallande)</li>
          <li :class="{'active': chosenSort == 'amount.asc'}" @click="selectSortDropDownItem('amount.asc')" @keyup.enter="selectSortDropDownItem('amount.asc')"><i class="fa fa-fw fa-sort-amount-asc"></i> Antal träffar (stigande)</li>
          <li :class="{'active': chosenSort == 'alpha.asc'}" @click="selectSortDropDownItem('alpha.asc')" @keyup.enter="selectSortDropDownItem('alpha.desc')"><i class="fa fa-fw fa-sort-alpha-asc"></i> A-Ö</li>
          <li :class="{'active': chosenSort == 'alpha.desc'}" @click="selectSortDropDownItem('alpha.desc')" @keyup.enter="selectSortDropDownItem('alpha.desc')"><i class="fa fa-fw fa-sort-alpha-desc"></i> Ö-A</li>
        </ul>
      </div>
    </div>
    <ul class="FacetGroup-list"
      :class="{'is-expanded' : isExpanded, 'has-scroll' : hasScroll}">
      <facet v-for="facetItem in featuredFacets"
        :facet="facetItem" 
        :key="'featured_'+facetItem.link">
        <encoding-level-icon
          slot="icon"
          v-if="group.dimension === 'meta.encodingLevel'"
          :encodingLevel="facetItem.object['@id']" />
        <type-icon
          slot="icon"
          :show-iconless="false"
          v-if="group.dimension === 'instanceOf.@type' || group.dimension === '@type'"
          :type="facetItem.object['@id']" />
      </facet>
      <hr v-show="featuredFacets.length > 0">
      <facet v-for="facetItem in normalFacets"
        :facet="facetItem" 
        :key="facetItem.link">
        <encoding-level-icon
          slot="icon"
          v-if="group.dimension === 'meta.encodingLevel'"
          :encodingLevel="facetItem.object['@id']" />
        <type-icon
          slot="icon"
          :show-iconless="false"
          v-if="group.dimension === 'instanceOf.@type' || group.dimension === '@type'"
          :type="facetItem.object['@id']" />
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

  &-header {
    display: flex;
    margin: 10px 0 8px 0;
    align-items: center;
    line-height: 1;
    justify-content: space-between;
    padding: 0 15px 0 0;
  }

  &-sortSelect {
    min-width: 3em;
    height: 1.8em;
    background-color: @grey-lightest;
    border: 1px solid @grey-lightest;
    border-radius: 2px;
    transition: border-color 0.25s ease;
    padding: 0.25em 0.25em;
    font-size: 1rem;
    user-select: none;
    .icon-selected {
      color: @brand-primary;
    }
  }
  &-sortSelectDropdown {
    position: absolute;
    margin-top: 0.25em;
    right: 10%;
    border: 1px solid @grey;
    display: flex;
    flex-direction: column;
    list-style: none;
    padding: 0;
    font-size: 1.3rem;
    border-radius: 3px;
    overflow: hidden;
    li {
      background-color: @neutral-color;
      padding: 0.5em;
      white-space: nowrap;
      &.active {
        color: @brand-primary;
      }
      &:hover {
        background-color: @brand-primary;
        color: @neutral-color;
      }
    }
  }

  &-title {
    margin: 0;
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
    hr {
      margin: 0;
      border-color: @grey-light;
    }

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
