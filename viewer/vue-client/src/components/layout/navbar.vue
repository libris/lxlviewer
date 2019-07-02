<script>
import { mapGetters } from 'vuex';
import { mixin as clickaway } from 'vue-clickaway';
import * as StringUtil from '@/utils/string';
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
      'user',
    ]),
    tabs() {
      const $directoryCareBadge = this.userCare.length === 0 ? '' : `<span class="badge badge-accent UserCare-badge">${this.userCare.length}</badge>`;
      const $directoryCare = `${StringUtil.getUiPhraseByLang('Directory care', this.user.settings.language)} ${$directoryCareBadge}`;
      const loggedInTabs = this.user.isLoggedIn ? [
        { id: 'Create new', text: 'Create new', link: '/create', icon: 'plus-square-o' },
        { id: 'Directory care', html: $directoryCare, link: '/directory-care', icon: 'flag' }, 
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
  },
  methods: {
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
    },
    hideUserMenu() {
      this.showUserMenu = false;
    },
  },
  watch: {
    '$route.path'() {
      this.hideUserMenu();
    },
  },
};
</script>

<template>
  <nav class="NavBar" id="NavBar" role="navigation" aria-labelledby="service-name">
    <div class="NavBar-container container">
      <div class="row">
        <div class="NavBar-brand col-xs-2 col-sm-1 hidden-md hidden-lg">
          <router-link to="/" class="NavBar-brandLink">
            <img class="NavBar-brandLogo" src="~kungbib-styles/dist/assets/kb_logo_white.svg" alt="Kungliga Bibliotekets logotyp">
          </router-link>
        </div>
        <div class="MainNav col-xs-8 col-sm-7 col-md-6 col-md-push-3">
        <tab-menu
          :tabs="tabs"
          :active="$route.name"
          :link="true"
          lookStyle="background"
          />
        </div>
        <ul class="MainNav-userWrapper col-xs-2 col-xs-push-0 col-sm-push-0 col-sm-4 col-md-3 col-md-push-3">
          <li class="MainNav-item" v-if="user.isLoggedIn">
            <span @click="toggleUserMenu">
              <user-avatar class="hidden-xs" :size="24" />
              <user-avatar class="visible-xs-block" :size="32" />
              <span class="MainNav-linkText userName hidden-xs">
              {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
              </span>
              <i class="fa fa-fw hidden-xs" :class="{ 'fa-caret-down': !isUserPage, 'active': showUserMenu }"></i>
            </span>
            <user-settings v-if="showUserMenu && !isUserPage" compact v-on-clickaway="hideUserMenu"/>
          </li>
          <li class="MainNav-item" v-if="!user.isLoggedIn">
            <a :href="`${settings.apiPath}/login/authorize`" class="MainNav-link">
              <span class="MainNav-linkText">{{"Log in" | translatePhrase}}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>


<style lang="less">
.NavBar {
  width: 100%;
  background-color: @bg-navbar;
  flex-shrink: 0; // fix ie flexbox height bug
  border: solid @brand-primary;
  border-width: 0px 0px 3px 0px;
  // line-height: 1.2;
  font-size: 3rem;
  @media screen and (min-width: @screen-sm) {
    font-size: unset;
    line-height: unset;
  }

  &-brand {
    height: 100%;
  }
  &-brandLink {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &-brandLogo {
    height: 1.6em;
    padding: 0.1em;
    @media screen and (min-width: @screen-sm){
      height: 2em;
      padding: 0;
      margin-top: 0.1em;
    }
  }
  &-container {
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
  height: 100%;
  list-style: none;

  @media screen and (max-width: @screen-md){
    align-items: flex-start;
    order: 3;
  }

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
    position: relative;
    text-transform: none;
    cursor: pointer;
    color: @white;
    list-style-type: none;

    &:last-of-type a {
      padding-right: 0;
    }
      
    @media screen and (max-width: @screen-sm-min) {
      display: inline;
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
    color: @white;
    font-size: 1.4rem;
    font-weight: 600;
  }
  &-link {
    display: block;

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

    &-tabList {
      margin-bottom: 0;
      margin-top: 0;
    }

  }
}
.UserCare {
  &-badge {
    margin-top: -0.3em;
  }
}

</style>
