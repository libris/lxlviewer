<template>
  <div :class="{ 'collapse': !expanded }" class="navbar-collapse NavMenu" id="navbarNav">
    <ul class="navbar-nav">
      <li class="nav-item">
        <NuxtLink to="/" class="nav-link">Sök</NuxtLink>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">MARC-mappningar</a>
      </li>
      <li class="nav-item">
        <NuxtLink to="/vocab/" class="nav-link">Basvokabulär</NuxtLink>
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
    expanded: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
.NavMenu {
  padding: 0.5em 0;
  &:not(.collapse) {
    .nav-item {
      text-align: center;
    }
  }
}
.nav-item {
  font-weight: 500;
}

</style>
