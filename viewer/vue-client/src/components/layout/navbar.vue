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
      const tabs = [
        { id: 'Home', text: 'Start', link: '/' },
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
  <nav class="NavBar" id="NavBar" role="navigation" aria-labelledby="service-name">
    <div class="NavBar-container container">
      <div class="MainNav col-md-6 col-md-push-3">
      <tab-menu
        v-if="user.isLoggedIn"
        :tabs="tabs"
        :active="$route.name"
        :link="true"
        lookStyle="background"
        />
      </div>
      <ul class="MainNav-userWrapper col-md-3">
        <li class="MainNav-item">
          <router-link to="/help" class="MainNav-link">
            <span class="MainNav-linkText">{{"Help" | translatePhrase}}</span>
          </router-link>
        </li>
        <li class="MainNav-item" v-if="user.isLoggedIn">
          <span @click="toggleUserMenu">
            <user-avatar :size="24" />
            <span class="MainNav-linkText userName">
            {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
            </span>
            <i class="fa fa-fw" :class="{ 'fa-caret-down': !isUserPage, 'active': showUserMenu }"></i>
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
  height: 40px;
  background-color: @bg-navbar;
  flex-shrink: 0; // fix ie flexbox height bug
  border: solid @brand-primary;
  border-width: 0px 0px 3px 0px;

  &-container {
    padding: 0 25px;
    display: flex;
    height: 100%;
    align-items: center;
    
    @media screen and (min-width: @screen-sm){
      padding: 0 15px;
    }
    @media screen and (max-width: @screen-lg){
      flex-wrap: wrap;
      width: 100% !important;
    }
  }
}

.MainNav {
  display: flex;
  flex: 1;
  list-style: none;

  @media screen and (max-width: @screen-md){
    min-width: 100%;
    border-top: 1px solid @gray-light;
    align-items: flex-start;
    order: 3;
  }

  &-userWrapper {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
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

    &-tab {
      margin: 0;
      font-size: 16px;
      font-size: 1.6rem;
      color: @white;
    }
  }
}
.UserCare {
  &-badge {
    margin-top: -0.3em;
  }
}

</style>
