<template>
  <div class="container-fluid">
    <h1>Query: {{ $route.query }}</h1>
  </div>
</template>

<script>
import about from '../about.vue'
  export default {
  components: { about },
    // page properties go here
  }
</script>

<style>
</style>