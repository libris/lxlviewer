<template>
  <div id="app">
    <navbar-component />
    <main class="container">
      <router-view v-if="resourcesLoaded" />
    </main>
    <div v-if="!resourcesLoaded">
      stuff is loading
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/layout/navbar';

export default {
  name: 'App',
  computed: {
    resourcesLoaded() {
      return this.$store.getters.resources.resourcesLoaded;
    }
  },
  components: {
    'navbar-component': Navbar
   },
}
</script>

<style lang="less">
@import "~bootstrap/less/bootstrap";
@import "~kungbib-styles/dist/less/kb-style";
@import "./less/main";

</style>
