<script>
import EntitySearchList from './entity-search-list';

export default {
  name: 'search-result-component',
  props: {
    result: {},
  },
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
  },
  components: {
    'entity-search-list': EntitySearchList,
  },
  watch: {
    keyword(value, oldval) {
      console.log("keyword changed", value, oldval);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div>
    <entity-search-list :results="result.items"></entity-search-list>
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
