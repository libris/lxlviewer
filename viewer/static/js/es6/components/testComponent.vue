<script>
export default {
  name: 'test-component',
  props: {
    title: 'test',
  },
  data: function() {
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
    <h2>TEST COMPONENT: {{title}}</h2>
  </div>
</template>

<style lang="less">
@import '../../../less/main_libris.less';

</style>
