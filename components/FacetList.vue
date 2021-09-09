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
    stats: {
      type: Object,
    },
  },
  computed: {
    filteredGroups() {
      if (this.stats && this.stats.sliceByDimension) {
        const slice = this.stats.sliceByDimension;
        delete slice['inScheme.@id'];
        return slice;
      }
      return {};
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
