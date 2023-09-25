<script>
import { translatePhrase } from '@/utils/filters';
import { mapState } from 'pinia';
import { useResourcesStore } from '@/stores/resources';
import { useStatusStore } from '@/stores/status';
import { useUserStore } from '@/stores/user';
import { useSettingsStore } from '@/stores/settings';
import * as StringUtil from 'lxljs/string';
import UserAvatar from '@/components/shared/user-avatar.vue';
import TabMenu from '@/components/shared/tab-menu.vue';
import UserSettings from '@/components/usersettings/user-settings.vue';
import { Dropdown } from 'floating-vue';
import { useOauthStore } from '@/stores/oauth';

export default {
  name: 'navbar-component',
  data() {
    return {
      hasAvatar: true,
      showUserMenu: false,
      showSigelHint: false,
      highlightNavItem: false,
    };
  },
  components: {
    'user-avatar': UserAvatar,
    'tab-menu': TabMenu,
    UserSettings,
    Dropdown,
  },
  computed: {
    ...mapState(useResourcesStore, ['i18n']),
    ...mapState(useStatusStore, ['hintSigelChange']),
    ...mapState(useUserStore, ['user', 'userFlagged']),
    ...mapState(useSettingsStore, ['settings']),
    ...mapState(useOauthStore, ['oauthClient']),
    tabs() {
      const directoryCareBadge = {
        value: this.userFlagged.length === 0 ? '' : this.userFlagged.length,
        type: 'accent',
      };
      const $directoryCare = `${StringUtil.getUiPhraseByLang('Directory care', this.user.settings.language, this.i18n)}`;
      const loggedInTabs = this.user.isLoggedIn ? [
        { id: 'Create new', text: 'Create new', link: '/create', icon: 'plus-square-o' },
        { id: 'Directory care', html: $directoryCare, link: '/directory-care', icon: 'flag', badge: directoryCareBadge }, 
      ] : [];
      const tabs = [
        { id: 'Home', text: 'Start', link: '/', icon: 'home' },
        { id: 'Search', text: 'Search', link: '/search/libris', icon: 'search' },
        ...loggedInTabs,
        { id: 'Help', text: 'Help', link: '/help', icon: 'question-circle' }, 
      ];
      return tabs;
    },
    environmentLabel() {
      if (this.settings.environment !== 'prod') {
        return this.settings.environment;
      }
      return '';
    },
    isUserPage() {
      return this.$route.path === '/user';
    },
    tooltipOptions() {
      const options = {
        content: `${StringUtil.getUiPhraseByLang('To create concepts, you need to switch to a seal with correct authority.', this.user.settings.language, this.i18n)}`,
        show: this.showSigelHint,
        trigger: 'manual',
        placement: 'bottom',
        classes: 'with-accent',
      };
      return options;
    },
  },
  methods: {
    translatePhrase,
    navigate(id) {
      for (const tab of this.tabs) {
        if (tab.id === id) {
          this.$router.push({ path: tab.link });
        }
      }
    },
    login() {
      window.location = this.oauthClient.token.getUri();
    },
  },
  watch: {
    'hintSigelChange'(val) {
      this.showSigelHint = val;
    },
  },
};
</script>

<template>
  <nav class="NavBar top-scroll-past" id="NavBar" aria-labelledby="service-name">
    <div class="NavBar-container" :class="{ 'container': user.settings.fullSiteWidth === false, 'container-fluid': user.settings.fullSiteWidth }">
      <div class="NavBar-brand">
        <router-link to="/" class="NavBar-brandLink">
          <img class="NavBar-brandLogo" src="~kungbib-styles/lib/assets/kb_logo_white.svg" alt="Kungliga Bibliotekets logotyp">
        </router-link>
      </div>

      <div class="MainNav">
        <tab-menu
          :tabs="tabs"
          :active="$route.name"
          :class="'extra-spacing'"
          @go="navigate"
          :link="true"
          lookStyle="dark"
        />
      </div>

      <ul class="MainNav-userWrapper">
        <li
          class="MainNav-item" 
          :class="{ 'active': showUserMenu && !isUserPage, 'highlight': highlightNavItem && !isUserPage }" 
          @mouseover="highlightNavItem = true"
          @mouseleave="highlightNavItem = false"
          @focus="highlightNavItem = true"
          @blur="highlightNavItem = false"
          v-if="user.isLoggedIn"
          v-tooltip="tooltipOptions"
        >
          <Dropdown>
            <div tabindex="0">
              <user-avatar
                class="d-none d-sm-inline-block" 
                :highlight="highlightNavItem && !isUserPage"
                :size="30"
              />

              <user-avatar
                class="d-inline-block d-sm-none"
                :highlight="highlightNavItem && !isUserPage"
                :size="32"
              />

              <span class="MainNav-linkText userName d-none d-md-inline-block">
                {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
              </span>

              <font-awesome-icon
                :icon="['fas', 'caret-down']"
                class="d-none d-sm-inline-block"
                v-if="!isUserPage"
                :class="{ 'active': showUserMenu }"
              />
            </div>

            <template #popper>
              <user-settings
                v-if="!isUserPage"
                compact
              />
            </template>
          </Dropdown>
        </li>

        <li class="MainNav-item" v-if="!user.isLoggedIn">
            <span class="MainNav-link" @click="login" @keyup.enter="login">
              {{translatePhrase("Log in")}}
            </span>
        </li>
      </ul>
    </div>
  </nav>
</template>


<style lang="scss">
.NavBar {
  width: 100%;
  height: 4.8rem;
  background-color: $bg-navbar;
  flex-shrink: 0; // fix ie flexbox height bug
  font-size: 2.4rem;

  @include media-breakpoint-up(sm) {
    font-size: unset;
    line-height: unset;
  }

  &-brand {    
    margin-right: 2rem;

    @include media-breakpoint-up(sm) {
      display: none;
    }
  }
  &-brandLink {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-brandLogo {
    height: 1.6em;
    width: 1.6em;
    padding: 0.1em;

    @include media-breakpoint-up(sm) {
      height: 2em;
      padding: 0;
      margin-top: 0.1em;
    }
  }
  &-container {
    display: flex;
    padding: 0 25px;
    height: 100%;

    @include media-breakpoint-down(lg) {
      flex-wrap: wrap;
      width: 100% !important;
    }
  }
}

.MainNav {
  display: flex;
  flex: 1;
  align-items: center;
  height: 100%;
  list-style: none;

  &-userWrapper {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    margin: 0px;

    @include media-breakpoint-down(sm) {
      padding: 0;
    }
  }

  &-item {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 0.2em;
    position: relative;
    text-transform: none;
    cursor: pointer;
    color: $grey-light;
    list-style-type: none;

    &.highlight,
    &.active {
      color: $white;
    }
    &:last-of-type a {
      padding-right: 0;
    }

    @include media-breakpoint-down(sm) {
      & .userName {
        display: none;
      }
    }

    @include media-breakpoint-down(md) {
      font-size: 16px;
      font-size: 1.6rem;
    }

    .fa-caret-down {
      margin-left: .65rem;
    }
  }

  &-link, &-linkText {
    font-size: 1.4rem;
    font-weight: 600;
  }
  &-link {
    display: block;
    color: $grey-light;

    &:hover, 
    &:focus {
      color: $white;
      text-decoration: none;
    }

    svg {
      color: $text-alt-sticky-bar;
    }
  }

  &-linkText {
    .MainNav-link:hover & {
      text-decoration: underline;
    }
  }

  @media print {
    display: none;
  }

  & .TabMenu {
    margin-bottom: 0;
    margin-top: 0;
  }
}
</style>
