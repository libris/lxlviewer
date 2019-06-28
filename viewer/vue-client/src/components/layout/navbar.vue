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
      const $directoryCareBadge = this.userCare.length === 0 ? '' : `<span class="badge badge-accent">${this.userCare.length}</badge>`;
      const $directoryCare = `${StringUtil.getUiPhraseByLang('Directory care', this.user.settings.language)} ${$directoryCareBadge}`;
      const tabs = [
        { id: 'Search', text: 'Search', link: '/search/libris' },
        { id: 'Create new', text: 'Create new', link: '/create' },
        { id: 'Directory care', html: $directoryCare, link: '/directory-care' }, 
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
  <nav class="NavBar" role="navigation" aria-labelledby="service-name">
    <div class="NavBar-container container">
      <div class="NavBar-brand">
        <router-link to="/" class="NavBar-brandLink">
          <img class="NavBar-brandLogo" src="~kungbib-styles/dist/assets/kb_logo_black.svg" alt="Kungliga Bibliotekets logotyp">
        </router-link>
        <router-link to="/" class="NavBar-brandTitle" :title="`Version ${settings.version}`">
          <span id="service-name">{{ settings.title }}</span>
          <span class="NavBar-envLabel">
          {{ environmentLabel }} {{ settings.version }}
          </span>
        </router-link>
      </div>
      <div class="MainNav" v-if="user.isLoggedIn">
      <tab-menu
        :tabs="tabs"
        :active="$route.name"
        :link="true"
        />
      </div>
      <ul class="MainNav-userWrapper">
        <li class="MainNav-item">
          <router-link to="/help" class="MainNav-link">
            <span class="MainNav-linkText">{{"Help" | translatePhrase}}</span>
          </router-link>
        </li>
        <li class="MainNav-item" v-if="user.isLoggedIn">
          <span @click="toggleUserMenu">
            <user-avatar :size="32" />
            <span class="MainNav-linkText userName">
            {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
            </span>
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
  </nav>
</template>


<style lang="less">
.NavBar {
  width: 100%;
  background-color: @bg-navbar;
  box-shadow: @shadow-navbar;
  flex-shrink: 0; // fix ie flexbox height bug
  height: auto;

  &-container {
    padding: 0 25px;
    display: flex;
    align-items: center;
    
    @media screen and (min-width: @screen-sm){
      padding: 0 15px;
    }
    @media screen and (max-width: @screen-lg){
      flex-wrap: wrap;
      width: 100% !important;
    }
  }

  &-brand {
    display: flex;
    flex: 1;
    margin: 10px 0 5px;
  }

  &-brandLogo {
    display: inline-block;
    margin: 4px 0 0;
    vertical-align: middle;
    width: 80%;
  }

  &-brandLink {
    display: inline-block;
    width: 50px;
  }

  &-brandTitle {
    color: @black;
    cursor: pointer;
    float: right;
    font-size: 18px;
    font-size: 1.8rem;
    line-height: 20px;
    padding: 15px 5px;
    height: 50px;

    &:hover,
    &:focus,
    &:active,
    &:visited {
      color: @black;
      text-decoration: none;
    }

    .container-fluid {
      padding: 0 30px 0 15px;
    }
  }

  &-envLabel {
    display: block;
    color: @text-brand-env;
    font-size: 0.5em;
    font-weight: bold;
    float: right;
    margin: -0.5em 0px 0px 0.5em;
    text-transform: uppercase;
  }
}

.MainNav {
  display: flex;
  flex: 1;
  list-style: none;
  margin: 10px 0 5px;
  padding: 10px 0;

  @media screen and (max-width: @screen-md){
    min-width: 100%;
    border-top: 1px solid @gray-light;
    align-items: flex-start;
    order: 3;
  }

  &-userWrapper {
    margin: 10px 0 5px;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;

    @media (max-width: @screen-sm) {
      padding: 0;
    }
  }

  &-item {
    position: relative;
    text-transform: none;
    display: inline-block;
    max-height: 60px;
    margin-top: -2px;
    cursor: pointer;
    font-size: 18px;
    font-size: 1.8rem;
    padding: 15px 10px;

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

  &-link {
    color: @black;
    display: block;

    &:hover, 
    &:focus {
      color: inherit;
      text-decoration: none;
    }

    i {
      color: @text-alt-navbar;
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
      max-width: 300px;

    &-tabList {
      margin-bottom: 0;
      margin-top: 0;
    }

    &-tab {
      margin: 0;
      font-size: 16px;
      font-size: 1.6rem;
      color: @black;
    }

    &-underline {
      top: 29px;
    }
  }
}
</style>
