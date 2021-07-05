<template>
  <div class="CollectionFilter">
    <span v-if="noFilter == false">
      {{ collection.object.titleByLang['sv'] }} ({{ collection.totalItems }})
    </span>
    <span v-else>
      Alla
    </span>
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
    collection: {
      type: Object,
      default: null,
    },
    noFilter: {
      type: Boolean,
      default: false,
    }
  },
}
</script>

<style lang="scss">
.CollectionFilter {

}
</style>
