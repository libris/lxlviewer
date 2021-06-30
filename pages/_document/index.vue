<template>
  <div class="container-fluid">
    <h1>Document: {{ $route.params.document }}!</h1>
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