<template>
  <div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav">
      <li class="nav-item">
        <NuxtLink to="/" class="nav-link">Sök</NuxtLink>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">MARC-mappningar</a>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Basvokabulär</a>
      </li>
      <li class="nav-item">
        <NuxtLink to="/doc/about" class="nav-link">Om id.kb.se</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false
    }
  },
  props: {
  },
}
</script>

<style lang="scss">

</style>
