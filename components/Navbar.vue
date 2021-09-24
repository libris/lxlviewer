<template>
  <nav class="Navbar navbar navbar-expand-lg navbar-dark">
    <div class="container-fluid">
      <div class="Navbar-brandContainer">
        <NuxtLink to="/" class="Navbar-brand navbar-brand">
          <Logo />
          id.kb.se
        </NuxtLink>
        <span class="environment-label" v-if="gitDescribe.distance == 0">
          {{ versionInfo }}
        </span>
        <a class="environment-label" v-if="gitDescribe.distance !== 0" target="_blank" :href="`https://github.com/libris/id.kb.se/commit/${this.hash}`">
          {{ versionInfo }}
        </a>
      </div>
      <button class="navbar-toggler" type="button" @click="toggleExpanded" @keyup.enter="toggleExpanded" aria-controls="navbarNav" :aria-expanded="expanded" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <NavMenu :expanded="expanded" />
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
    }
  },
  computed: {
    ...mapGetters(['settings']),
    gitDescribe() {
      return JSON.parse(this.settings.gitDescribe);
    },
    hash() {
      const hash = this.gitDescribe.hash;
      return hash.substr(1, hash.length);
    },
    version() {
      return this.settings.gitDescribe.distance !== 0 ? this.hash : this.settings.gitDescribe.tag;
    },
    versionInfo() {
      return `${this.environmentLabel.toUpperCase()} ${this.version}`;
    },
    environmentLabel() {
      if (this.settings.environment !== 'prod') {
        return this.settings.environment;
      }
      return '';
    },
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
    &-brandContainer {
      margin-right: 1rem;
      display: flex;
      align-items: center;
      .environment-label {
        font-size: 0.6em;
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
