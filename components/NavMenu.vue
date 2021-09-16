<template>
  <div :class="{ 'collapse': !expanded }" class="navbar-collapse NavMenu" id="navbarNav">
    <ul class="navbar-nav">
      <li class="nav-item">
        <NuxtLink to="/" class="nav-link" :class="{'active': $route.name == 'find' || $route.name == 'index' }">Sök</NuxtLink>
      </li>
      <li class="nav-item">
        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">MARC-mappningar</a>
      </li>
      <li class="nav-item">
        <NuxtLink to="/vocab/" class="nav-link" :class="{'active': $route.name == 'vocab-term' }">Basvokabulär</NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink to="/doc/about" class="nav-link" :class="{'active': $route.path == '/doc/about' }">Om id.kb.se</NuxtLink>
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
  padding-left: 0.5em;
  padding-right: 0.5em;
  .nav-link {
    color: $gray-400 !important;
    padding-top: 0;
    padding-bottom: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    border: solid;
    border-width: 3px 0px;
    border-top-color: transparent;
    border-bottom-color: transparent;
    &:hover {
      color: $light !important;
      // border-bottom-color: $gray-600;
    }
    &.disabled {
      opacity: 0.5;
    }
    &.active {
      color: $light !important;
      border-bottom-color: $kb-secondary-turquoise;
    }
  }
}

</style>
