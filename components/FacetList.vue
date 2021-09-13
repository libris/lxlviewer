<template>
  <div class="FacetList pt-4">
    <span @click="toggleExpand" class="FacetList-expandControls d-md-none">
      Filter
      <i class="bi bi-chevron-right" v-if="!expanded"></i>
      <i class="bi bi-chevron-down" v-if="expanded"></i>
    </span>
    <div class="FacetList-expandable d-md-block" :class="{ 'd-block': expanded, 'd-none': !expanded }">
      <FacetGroup v-for="(group, k) in filteredGroups" :group="group" :key="k" />
    </div>
  </div>
</template>

<script>
import FacetGroup from '@/components/FacetGroup';

export default {
  data() {
    return {
      expanded: false,
    }
  },
  props: {
    pageData: {
      type: Object,
    },
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
  },
  computed: {
    filteredGroups() {
      if (this.stats && this.stats.sliceByDimension) {
        const slice = this.stats.sliceByDimension;
        for (const [key, value] of Object.entries(this.mapping)) {
          if (slice.hasOwnProperty(key)) {
            if (slice[key].observation.filter(item => item.object['@id'] === value.object['@id']).length == 0) {
              slice[key].observation.push(value);
            }
          } else {
            slice[key] = {
              dimension: key,
              observation: [value],
            }
          }
        }
        delete slice['inScheme.@id'];
        return slice;
      }
      return {};
    },
    stats() {
      return this.pageData.stats;
    },
    mapping() {
      const mapping = {};
      this.pageData.search.mapping.forEach((item) => {
        if (item.object) {
          mapping[item.variable] = { object: item.object, totalItems: this.pageData.totalItems };
        }
      });
      return mapping;
    },
  },
  components: {
    FacetGroup,
  },
}
</script>

<style lang="scss">
.FacetList {
 &-expandControls {
  font-weight: 500;
  padding: 0.5em 0;
 }
}
</style>
