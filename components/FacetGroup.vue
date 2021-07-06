<template>
  <div class="FacetGroup">
    <div class="FacetGroup-header">
      {{ group.dimension }}
    </div>
    <div class="FacetGroup-list">
      <Facet v-for="facet in group.observation" :dimension="group.dimension" :facet="facet" :key="facet.object['@id']" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  props: {
    group: {
      type: Object,
    },
  },
  computed: {

  }
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
