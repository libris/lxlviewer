<script>
export default {
  name: 'landing-box',
  props: [
    'title',
    'text',
  ],
  methods: {
  },
  computed: {
    serviceName() {
      return this.title === 'libris.kb.se' ? 'Libris katalogiseringstjänst' : 'id.kb.se';
    },
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
  <div class="landing-box">
    <p v-html="text">
    </p>
  </div>
</template>

<style lang="less">
@import './_variables.less';

</style>
