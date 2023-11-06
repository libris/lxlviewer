<script>
import Find from './Find.vue';

export default {
  name: 'ChangeNotes',
  components: {
    Find,
  },
  computed: {
  },
  methods: {
  },
  mounted() {
  },
};
</script>

<template>
  <find v-if="$route.params.tool === 'changes'"></find>
</template>

<style lang="less">

</style>
