<script>
import { mapGetters } from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import * as StringUtil from 'lxltools/string';
import UserAvatar from '@/components/shared/user-avatar';
import TabMenu from '@/components/shared/tab-menu';
import UserSettings from '@/components/usersettings/user-settings';

export default {
  name: 'navbar-component',
  mixins: [clickaway],
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
  },
  computed: {
    ...mapGetters([
      'userCare',
      'settings',
      'status',
      'user',
    ]),
    tabs() {
      const directoryCareBadge = {
        value: this.userCare.length === 0 ? '' : this.userCare.length,
        type: 'accent',
      };
      const $directoryCare = `${StringUtil.getUiPhraseByLang('Directory care', this.user.settings.language)}`;
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
        content: `${StringUtil.getUiPhraseByLang('To create concepts, you need to switch to a seal with correct authority.', this.user.settings.language)}`,
        show: this.showSigelHint,
        trigger: 'manual',
        placement: 'bottom',
        classes: 'with-accent',
      };
      return options;
    },
  },
  methods: {
    navigate(id) {
      for (const tab of this.tabs) {
        if (tab.id === id) {
          this.$router.push({ path: tab.link });
        }
      }
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    hideUserMenu() {
      this.showUserMenu = false;
    },
    login() {
      window.location = this.$store.getters.oauth2Client.token.getUri();
    },
  },
  watch: {
    '$route.path'() {
      this.hideUserMenu();
    },
    'status.hintSigelChange'(val) {
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
          <img class="NavBar-brandLogo" src="~kungbib-styles/dist/assets/kb_logo_white.svg" alt="Kungliga Bibliotekets logotyp">
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
          v-tooltip="tooltipOptions" >
          <div tabindex="0" @click="toggleUserMenu" @keyup.enter="toggleUserMenu">
            <user-avatar 
              class="hidden-xs" 
              :highlight="highlightNavItem && !isUserPage"
              :size="30" />
            <user-avatar 
              class="visible-xs-block" 
              :highlight="highlightNavItem && !isUserPage"
              :size="32" />
            <span class="MainNav-linkText userName hidden-sm">
            {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
            </span>
            <i class="fa fa-fw hidden-xs" :class="{ 'fa-caret-down': !isUserPage, 'active': showUserMenu }"></i>
          </div>
          <user-settings 
            v-if="showUserMenu && !isUserPage" 
            compact 
            v-on-clickaway="hideUserMenu" />
        </li>
        <li class="MainNav-item" v-if="!user.isLoggedIn">
            <span class="MainNav-link" @click="login" @keyup.enter="login">
              {{"Log in" | translatePhrase}}
            </span>
        </li>
      </ul>
    </div>
  </nav>
</template>


<style lang="less">
.NavBar {
  width: 100%;
  height: 4.8rem;
  background-color: @bg-navbar;
  flex-shrink: 0; // fix ie flexbox height bug
  font-size: 2.4rem;

  @media screen and (min-width: @screen-sm) {
    font-size: unset;
    line-height: unset;
  }

  &-brand {    
    margin-right: 2rem;
    @media screen and (min-width: @screen-sm) {
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
    @media screen and (min-width: @screen-sm){
      height: 2em;
      padding: 0;
      margin-top: 0.1em;
    }
  }
  &-container {
    display: flex;
    padding: 0 25px;
    height: 100%;
    @media screen and (max-width: @screen-lg){
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

    @media (max-width: @screen-sm) {
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
    color: @grey-light;
    list-style-type: none;

    &.highlight,
    &.active {
      color: @white;
    }
    &:last-of-type a {
      padding-right: 0;
    }
    
    @media (max-width: @screen-sm) {
      & .userName {
        display: none;
      }
    }
    
    @media (max-width: @screen-md) {
      font-size: 16px;
      font-size: 1.6rem;
    }
  }

  &-link, &-linkText {
    font-size: 1.4rem;
    font-weight: 600;
  }
  &-link {
    display: block;
    color: @grey-light;

    &:hover, 
    &:focus {
      color: @white;
      text-decoration: none;
    }

    i {
      color: @text-alt-sticky-bar;
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
