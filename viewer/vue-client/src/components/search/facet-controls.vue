<script>
import FacetGroup from './facet-group.vue';

export default {
  name: 'facet-controls',
  props: {
    result: {},
  },
  data() {
    return {
    };
  },
  methods: {
  },
  computed: {
  },
  events: {
  },
  components: {
    'facet-group': FacetGroup,
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="FacetControls">
    <facet-group
      v-for="(dimensionValue, dimensionKey) in result.stats.sliceByDimension"
      :key="dimensionKey"
      :slice="dimensionValue"/>
  </div>
</template>

<style lang="less">
.FacetControls {
  padding: 0 10px;

  @media (min-width: @screen-md) {
    padding: 0;
  }
}
</style>
