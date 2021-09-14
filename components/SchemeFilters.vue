<template>
  <div class="SchemeFilters col-md-12">
    <SchemeFilter :no-filter="true" />
    <template v-if="slices.hasOwnProperty('inScheme.@id')">
      <SchemeFilter v-for="scheme in slices['inScheme.@id'].observation" :scheme="scheme" :key="scheme['@id']" />
    </template>
  </div>
</template>

<script>
import SchemeFilter from '@/components/SchemeFilter';

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
    slices: {
      type: Object,
    }
  },
  computed: {
  },
  components: {
    SchemeFilter,
  },
}
</script>

<style lang="scss">
.SchemeFilters {
  padding: 1em 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
}
</style>
