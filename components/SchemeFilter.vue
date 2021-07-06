<template>
  <div class="SchemeFilter">
    <span v-if="noFilter == false">
      {{ scheme.object.titleByLang['sv'] }} ({{ scheme.totalItems }})
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
    scheme: {
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
.SchemeFilter {

}
</style>
