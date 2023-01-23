<template>
  <div class="SchemeFilters col-md-12">
    <SchemeFilter :no-filter="true" />
    <template v-if="slices.hasOwnProperty('inScheme.@id')">
      <SchemeFilter v-for="scheme in shownObservations" :scheme="scheme" :key="scheme['@id']" />
    </template>
    <span class="SchemeFilters-showMore" ref="showMore" tabindex="0" v-show="!showMore && observations.length > limitedObservations.length" @click="toggleShowMore" @keyup.enter="toggleShowMore(true)">{{ translateUi('Show more') }}... ({{ observations.length - limitedObservations.length }})</span>
    <span class="SchemeFilters-showLess" ref="showLess" tabindex="0" v-show="showMore" @click="toggleShowMore" @keyup.enter="toggleShowMore(true)">{{ translateUi('Show less') }}</span>
  </div>
</template>

<script>
import SchemeFilter from '@/components/SchemeFilter';

export default {
  data() {
    return {
      show: false,
      showMore: false,
      hasMore: false,
    }
  },
  props: {
    schemes: {
      type: Array,
    },
    slices: {
      type: Object,
    },
  },
  methods: {
    toggleShowMore(withKeys = false) {
      if (this.showMore) {
        this.showMore = false;
        if (withKeys) {
          this.$nextTick(() => {
            this.$refs.showMore.focus();
          });
        }
      } else {
        this.showMore = true;
        if (withKeys) {
          this.$nextTick(() => {
            this.$refs.showLess.focus();
          });
        }
      }
    },
  },
  computed: {
    shownObservations() {
      if (this.showMore) {
        return this.observations;
      }
      return this.limitedObservations;
    },
    limitedObservations() {
      return this.observations.slice(0, 5);
    },
    observations() {
      return this.slices['inScheme.@id'].observation;
    },
  },
  components: {
    SchemeFilter,
  },
}
</script>

<style lang="scss">
.SchemeFilters {
  padding: 1em 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  &-showMore, &-showLess {
    cursor: pointer;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
