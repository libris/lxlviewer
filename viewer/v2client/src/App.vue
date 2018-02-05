<template>
  <div id="app">
    <router-view v-if="resourcesLoaded" />
    <div v-if="!resourcesLoaded">
      stuff is loading
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  computed: {
    resourcesLoaded() {
      return this.$store.getters.resources.resourcesLoaded;
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
