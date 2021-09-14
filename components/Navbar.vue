<template>
  <nav class="Navbar navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <NuxtLink to="/" class="Navbar-brand navbar-brand">
        <Logo />
        id.kb.se <sup class="environment-label">{{ $config.environment }}</sup>
      </NuxtLink>
      <button class="navbar-toggler" type="button" @click="toggleExpanded" @keyup.enter="toggleExpanded" aria-controls="navbarNav" :aria-expanded="expanded" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <NavMenu :expanded="expanded" />
    </div>
  </nav>
</template>

<script>
import NavMenu from '@/components/NavMenu';
import Logo from '@/components/Logo';


export default {
  data() {
    return {
      expanded: false,
    }
  },
  computed: {
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    },
  },
  props: {
  },
  components: {
    NavMenu,
    Logo,
  }
}
</script>

<style lang="scss">
  .Navbar {
    padding: 0 !important;
    background-color: black;
    color: $kb-primary-white;
    .Navbar-brand {
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 1rem;
      font-weight: 500;
      img {
        margin-right: 0.5em;
        width: 2.5rem;
      }
      .environment-label {
        font-size: 50%;
        left: 0.25em;
        text-transform: uppercase;
      }
    }
  }

</style>
