<script>
export default {
  name: 'main-search-field',
  props: {
    title: 'test',
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
  <div class="panel panel-default search-controls">
    {{title}}
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
