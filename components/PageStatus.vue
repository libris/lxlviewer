<template>
  <div class="PageStatus">
    {{ pageData.itemOffset + 1 }}-{{ (pageData.itemOffset + pageData.items.length) }} av {{ pageData.totalItems }}
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
    pageData: {
      type: Object,
      default: null,
    },
  },
}
</script>

<style lang="scss">
.PageStatus {
  font-weight: 500;
  color: $gray-600;
}

</style>
