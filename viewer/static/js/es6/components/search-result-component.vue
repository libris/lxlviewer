<script>
import ResultList from './result-list';

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
    'result-list': ResultList,
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
    <result-list :results="result.items"></result-list>
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
