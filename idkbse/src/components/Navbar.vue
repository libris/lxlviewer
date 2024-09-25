<template>
  <nav class="Navbar navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <div class="Navbar-brandContainer">
        <NuxtLink v-if="appState.domain === settings.defaultSite" to="/" class="Navbar-brand navbar-brand">
          <Logo />
          {{ siteTitle }}
        </NuxtLink>
        <a v-else href="/" class="Navbar-brand navbar-brand">
          <Logo />
          {{ siteTitle }}
        </a>
        <span class="environment-label">
          {{ versionInfo }}
        </span>
      </div>
      <button class="navbar-toggler" type="button" @click="toggleExpanded" @keyup.enter="toggleExpanded" aria-controls="navbarNav" :aria-expanded="expanded" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <NavMenu :expanded="expanded" @nav="collapse" />
    </div>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';
import NavMenu from '@/components/NavMenu';
import Logo from '@/components/Logo';


export default {
  data() {
    return {
      expanded: false,
      defaultSite: this.$config.defaultSite,
      siteConfig: this.$config.siteConfig,
      environment: this.$config.environment
    }
  },
  computed: {
    ...mapGetters(['settings', 'appState']),
    gitDescribe() {
      return JSON.parse(this.settings.gitDescribe);
    },
    hash() {
      const hash = this.gitDescribe.hash;
      return hash.substr(1, hash.length);
    },
    siteTitle() {
      return this.siteConfig[this.appState.domain].title || this.defaultSite;
    },
    version() {
      return this.settings.version;
    },
    versionInfo() {
      return `${this.environmentLabel.toUpperCase()} ${this.version}`;
    },
    environmentLabel() {
      if (this.environment !== 'prod') {
        return this.environment;
      }
      return '';
    },
  },
  methods: {
    expand() {
      this.expanded = true;
    },
    collapse() {
      this.expanded = false;
    },
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
    &-brandContainer {
      margin-right: 1rem;
      display: flex;
      align-items: center;
      .environment-label {
        font-size: 0.6rem;
        font-weight: bold;
        position: relative;
        top: -0.75em;
        color: $light;
        text-decoration: none;
        text-transform: uppercase;
      }
    }
    .Navbar-brand {
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 1rem;
      font-weight: 500;
      margin-right: 0;
      img {
        margin-right: 0.5em;
        width: 2.5rem;
      }
    }
  }

</style>
