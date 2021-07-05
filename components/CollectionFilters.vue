<template>
  <div class="CollectionFilters col-md-12">
    <template v-if="hasStats">
      <CollectionFilter :no-filter="true" />
      <CollectionFilter v-for="collection in stats.sliceByDimension['inScheme.@id'].observation" :collection="collection" />¨
    </template>
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
    stats: {
      type: Object,
      default: null,
    },
  },
  computed: {
    hasStats() {
      return this.stats !== null;
    }
  }
}
</script>

<style lang="scss">
.CollectionFilters {
  display: flex;
  gap: 1em;
  background-color: $gray-100;
  padding: 1em 0;
  border: solid $gray-200;
  border-width: 0px 0px 1px 0px;
}
</style>
