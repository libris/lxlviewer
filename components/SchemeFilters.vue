<template>
  <div class="SchemeFilters col-md-12">
    <SchemeFilter :no-filter="true" />
    <SchemeFilter v-for="scheme in schemes" :scheme="scheme" :key="scheme['@id']" />
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
    schemes: {
      type: Array,
    },
  },
  computed: {
  }
}
</script>

<style lang="scss">
.SchemeFilters {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  background-color: $gray-100;
  padding: 1em 0;
  border: solid $gray-200;
  border-width: 0px 0px 1px 0px;
}
</style>
