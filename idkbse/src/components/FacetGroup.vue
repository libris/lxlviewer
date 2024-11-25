<template>
  <div class="FacetGroup">
    <div class="FacetGroup-header">
      {{ groupLabel }}
    </div>
    <div class="FacetGroup-list">
      <Facet v-for="facet in group.observation" :dimension="group.dimension" :facet="facet" :key="facet.object['@id']" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Facet from '@/components/Facet';

export default {
  data() {
    return {
      show: false
    }
  },
  methods: {
  },
  props: {
    group: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters(['settings']),
    groupLabel() {
      return (this.settings.propertyChains[this.group.dimension] || {})[this.settings.language] || this.group.dimension;
    },
  },
  components: {
    Facet,
  },
}
</script>

<style lang="scss">
.FacetGroup {
  &-header {
    font-weight: 500;
    padding: 0.5em 0;
  }
}
</style>
