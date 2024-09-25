<script>
export default {
  name: 'test-component',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      keyword: '',
    };
  },
  methods: {
  },
  computed: {
  },
  components: {
  },
  watch: {
    keyword(value, oldval) {
      console.log('keyword changed', value, oldval);
    },
  },
  mounted() {
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

</style>
