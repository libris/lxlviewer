<script>
import TabMenu from '@/components/shared/tab-menu';

export default {
  name: 'DirectoryCare',
  components: {
    'tab-menu': TabMenu,
  },
  computed: {
  },
  methods: {
    switchTool(id) {
      this.$router.push({ path: `/directory-care/${id}` });
    },
  },
  mounted() {
    if (this.$route.params.tool === '' || typeof this.$route.params.tool === 'undefined') {
      this.$router.push({ path: '/directory-care/holdings' });
    }
  },
};
</script>

<template>
  <div class="DirectoryCare">
    <tab-menu @go="switchTool" :tabs="[
      { 'id': 'holdings', 'text': 'Move holdings' },
      { 'id': 'merge', 'text': 'Merge posts' },
    ]" :active="$route.params.tool"></tab-menu>
    <hr class="menuDivider">
    <div class="" v-if="$route.params.tool === 'holdings'">
      <h1>move holdings</h1>
      <!-- replace this whole div with the component -->
    </div>
    <div class="" v-if="$route.params.tool === 'merge'">
      <h1>merge posts</h1>
      <!-- replace this whole div with the component -->
    </div>
  </div>
</template>

<style lang="less">

.DirectoryCare {
  .menuDivider {
    margin: -23px 0px 2em 0px;
    border-width: 3px;
  }
}
</style>
