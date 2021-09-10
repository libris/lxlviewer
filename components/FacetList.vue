<template>
  <div class="FacetList">
    <FacetGroup v-for="(group, k) in filteredGroups" :group="group" :key="k" />
  </div>
</template>

<script>
import FacetGroup from '@/components/FacetGroup';

export default {
  data() {
    return {
      show: false
    }
  },
  props: {
    pageData: {
      type: Object,
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

}
</style>
