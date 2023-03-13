<template>
  <div :class="{ 'collapse': !expanded }" class="navbar-collapse NavMenu" id="navbarNav">
    <ul class="navbar-nav" v-if="appState.domain === $config.defaultSite">
      <li class="nav-item">
        <NuxtLink @click.native="linkActivated" to="/" class="nav-link" :class="{'active': $route.name == 'find' || $route.name == 'index' }">{{ translateUi('Search') }}</NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink @click.native="linkActivated" to="/vocab/" class="nav-link" :class="{'active': $route.name == 'vocab-term' || $route.name == 'vocab' }">{{ translateUi('Vocabulary') }}</NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink @click.native="linkActivated" to="/marcframe/" class="nav-link" tabindex="-1" :class="{'active': $route.name.startsWith('marcframe') }">{{ translateUi('MARC mappings') }}</NuxtLink>
      </li>
      <li class="nav-item">
        <NuxtLink @click.native="linkActivated" to="/doc/about" class="nav-link" :class="{'active': $route.path == '/doc/about' }">{{ translateUi('About id.kb.se') }}</NuxtLink>
      </li>
    </ul>
    <ul v-else></ul>
    <ul class="navbar-nav">
      <li class="nav-item LanguageSelect">
        <i class="bi bi-globe"></i>
        <a class="LanguageSelect-item" :class="{ 'active': settings.language == 'sv' }" href="#" @click="setSwedish">sv</a>
        |
        <a class="LanguageSelect-item" :class="{ 'active': settings.language == 'en' }" href="#" @click="setEnglish">en</a>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

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
  computed: {
    ...mapGetters(['appState']),
  },
  methods: {
    linkActivated() {
      this.$emit('nav');
    },
    setSwedish() {
      localStorage.setItem('activeLanguageChoice', 'sv');
      this.discoverLanguage();
    },
    setEnglish() {
      localStorage.setItem('activeLanguageChoice', 'en');
      this.discoverLanguage();
    },
    discoverLanguage() {
      const fromLocalStorage = localStorage.getItem('activeLanguageChoice');
      if (fromLocalStorage) {
        this.setLanguage(fromLocalStorage);
      } else if (navigator.language) {
        const langCode = navigator.language.split('-')[0];
        console.log("langCode was", langCode);
        if (langCode == 'sv') {
          console.log("Activating Swedish");
          this.setLanguage(langCode);
        } else {
          console.log("Activating English");
          this.setLanguage('en');
        }
      }
    },
    setLanguage(langCode) {
      this.$store.dispatch('setLanguage', langCode);
    }
  },
  mounted() {
    this.discoverLanguage();
  },
}
</script>

<style lang="scss">
.NavMenu {
  padding: 0.5em 0;
  justify-content: space-between;
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
      @media (min-width: 992px) {
        border-bottom-color: $kb-secondary-turquoise;
      }
    }
  }
}

.LanguageSelect {
  color: $light;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 5.5em;
  >:first-child {
    margin-right: 0.2em;
  }
  &-item {
    text-decoration: none;
    font-weight: 400;
    color: $light;
    &:hover {
      color: $light;
    }
    &.active {
      font-weight: 700;
    }
  }
}

</style>
