<script>
import UserAvatar from '@/components/shared/user-avatar';

export default {
  name: 'navbar-component',
  data() {
    return {
      hasAvatar: true,
    };
  },
  components: {
    'user-avatar': UserAvatar,
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    environmentLabel() {
      if (this.settings.environment !== 'prod') {
        return this.settings.environment;
      }
      return '';
    },
  },
};
</script>

<template>
  <nav class="NavBar" role="navigation" aria-labelledby="service-name">
    <div class="NavBar-container container">
      <div class="row">
        <div class="col-xs-12 col-sm-5">
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
        </div>

        <div class="col-xs-12 col-sm-7">
          <ul class="MainNav">
            <li class="MainNav-item">
              <router-link to="/help" class="MainNav-link">
                <span class="MainNav-linkText">{{"Help" | translatePhrase}}</span>
              </router-link>
            </li>
            <li class="MainNav-item">
              <router-link to="/search/libris" class="MainNav-link">
                <span class="MainNav-linkText">{{"Search" | translatePhrase}}</span>
              </router-link>
            </li>
              <li class="MainNav-item" v-if="user.isLoggedIn">
              <router-link to="/create" class="MainNav-link">
                <span class="MainNav-linkText">{{"Create new" | translatePhrase}}</span>
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
    </div>
  </nav>
</template>


<style lang="less">
.NavBar {
  width: 100%;
  // border: solid @border-navbar;
  background-color: @bg-navbar;
  // border-width: 0px 0px @border-navbar-width 0px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3);
  height: auto;

  &-container {
    padding: 0 25px;
    
    @media screen and (min-width: @screen-sm){
      padding: 0 15px;
    }
    @media screen and (max-width: @screen-lg){
      width: 100%;
    }
  }

  &-brand {
    float: left;
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

    @media (min-width: @screen-md) {
      font-size: 24px;
      font-size: 2.4rem;
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
  float: left;
  border-top: 1px solid @gray-light;
  width: 100%;
  list-style: none;
  padding: 5px 0 0;
  margin: 5px 0 5px;

  @media (min-width: @screen-sm) {
    float: right;
    border-top: 0;
    margin-top: 10px;
    padding: 0;
    text-align: right;
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

  &-iconWrap {
    display: inline-block;
    width: 30px;
    height: 24px;
    border-radius: 50%;
    line-height: 1;
    margin-right: 5px;
    text-align: center;
    width: .8em;

    &--userSettings {
      height: 32px;   
      width: 32px;
      position: relative;
    }
  }

  &-link {
    color: @black;
    cursor: pointer;
    font-size: 16px;
    font-size: 1.6rem;
    padding: 5px 0px;
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
    }

    @media (min-width: @screen-md) {
      padding: 15px;
      font-size: 18px;
      font-size: 1.8rem;
    }
  }

  &-linkText {
    .MainNav-link:hover & {
      text-decoration: underline;
    }
  }

  @media screen and (max-width: @screen-sm-min) {
    float: left;
    padding: 5px 0px;
  }

  @media print {
    display: none;
  }
}

</style>
