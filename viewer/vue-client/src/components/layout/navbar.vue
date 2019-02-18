<script>
import UserAvatar from '@/components/shared/user-avatar';
import TabMenu from '@/components/shared/tab-menu';

export default {
  name: 'navbar-component',
  data() {
    return {
      hasAvatar: true,
    };
  },
  components: {
    'user-avatar': UserAvatar,
    'tab-menu': TabMenu,
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    environmentLabel() {
      let label = '';
      switch (this.settings.environment) {
        case 'dev':
          label += 'DEV ';
          break;
        case '':
          break;
        case 'stg':
          label += 'STG ';
          break;
        case 'qa':
          label += 'QA ';
          break;
        case 'local':
          label += 'LOCAL ';
          break;
        default:
          break;
      }
      label += this.settings.version;
      return label;
    },
    tabs() {
      const tabList = [{ id: 'Search', text: 'Search' }];
      if (this.user.isLoggedIn) {
        tabList.push(
          { id: 'Create new', text: 'Create new' },
          { id: 'Directory care', text: 'Directory care' }, 
        );
      }
      return tabList;
    },
  },
  methods: {
    tabChange(id) {
      this.$router.push({ name: id });
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
          <span id="service-name">Libris katalogisering</span>
          <span class="NavBar-envLabel">
          {{ environmentLabel }}
          </span>
        </router-link>
      </div>
      <div class="MainNav">
        <tab-menu
          :tabs="tabs"
          :active="$route.name"
          @go="tabChange" />
        <ul class="MainNav-userWrapper">
          <li class="MainNav-item">
            <router-link to="/help" class="MainNav-link">
              <span class="MainNav-linkText">{{"Help" | translatePhrase}}</span>
            </router-link>
          </li>
          <li class="MainNav-item" v-if="user.isLoggedIn">
            <router-link to="/user" class="MainNav-link">
              <user-avatar :size="32" />
              <span class="MainNav-linkText">
              {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
              </span>
            </router-link>
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
  box-shadow: @shadow-navbar;
  height: auto;

  &-container {
    padding: 0 25px;
    display: flex;
    align-items: center;
    
    @media screen and (min-width: @screen-sm){
      padding: 0 15px;
    }
    @media screen and (max-width: @screen-lg){
      width: 100% !important;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &-brand {
    display: flex;
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
    width: 30px;
    
    @media (min-width: 768px) {
      width: 50px;
    }
  }

  &-brandTitle {
    color: @black;
    cursor: pointer;
    float: right;
    font-size: 18px;
    font-size: 1.8rem;
    line-height: 20px;
    padding: 5px;

    &:hover,
    &:focus,
    &:active,
    &:visited {
      color: @black;
      text-decoration: none;
    }

    @media (min-width: 768px) {
      padding: 15px 5px;
      height: 50px;
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
  justify-content: flex-end;
  align-items: center;
  flex-direction: column;
  border-top: 1px solid @gray-light;
  list-style: none;
  padding: 5px 0 0;
  margin: 5px 0 5px;

  @media (min-width: @screen-lg) {
    border-top: 0;
    margin-top: 10px;
    padding: 0;
    flex-direction: row;
  }

  @media screen and (max-width: @screen-lg){
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  @media screen and (max-width: @screen-sm) {
    flex-direction: column;
    align-items: flex-start;
  }

  &-userWrapper {
    margin: 0;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    order: -1;

    @media (max-width: @screen-sm) {
      padding: 0;
    }

    @media (min-width: @screen-sm) {
      order: 0
    }
  }

  &-item {
    text-transform: none;
    display: inline-block;
    max-height: 60px;
    margin-top: -2px;

    &:last-of-type a {
        padding-right: 0;
    }
      
    @media screen and (max-width: @screen-sm-min) {
      display: inline;
    }
  }

  // &-iconWrap {
  //   display: inline-block;
  //   width: 30px;
  //   height: 24px;
  //   border-radius: 50%;
  //   line-height: 1;
  //   margin-right: 5px;
  //   text-align: center;
  //   width: .8em;

  //   &--userSettings {
  //     height: 32px;   
  //     width: 32px;
  //     position: relative;
  //   }
  // }

  &-link {
    color: @black;
    cursor: pointer;
    font-size: 16px;
    font-size: 1.6rem;
    padding: 15px 10px;
    display: block;

    &:hover, 
    &:focus {
      color: inherit;
      text-decoration: none;
    }

    i {
      color: @text-alt-navbar;
    }

    @media (min-width: @screen-sm) {
      padding: 15px 10px;
      font-size: 18px;
      font-size: 1.8rem;
    }

    @media (min-width: @screen-md) {
      padding: 15px;
    }
  }

  &-linkText {
    .MainNav-link:hover & {
      text-decoration: underline;
    }
  }

  @media screen and (max-width: @screen-sm-min) {
    padding: 5px 0px;
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
      top: 28px;
    }
  }
}

</style>
