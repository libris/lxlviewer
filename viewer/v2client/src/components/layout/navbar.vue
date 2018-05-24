<script>

export default {
  name: 'navbar-component',
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    environmentLabel() {
      let label = '';
      switch(this.settings.environment) {
        case 'dev':
          label += 'DEV ';
        break;
        case '':
        break;
        case 'stg':
          label += 'STG '
        break;
        case 'qa':
          label += 'QA '
        break;
        case 'local':
          label += 'LOCAL ';
        break;
      }
      label += this.settings.version;
      return label;
    }
  }
}
</script>

<template>
  <nav class="NavBar" aria-labelledby="service-name">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 col-md-4 col-lg-5">
          <div class="NavBar-brand" role="banner">
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

        <div class="col-xs-12 col-md-8 col-lg-7">
          <ul class="MainNav">
            <li class="MainNav-item">
              <router-link to="/help" class="MainNav-link">
                <div class="MainNav-iconWrap" aria-hidden="true">
                  <i class="fa fa-question-circle"></i>
                </div>
                <span class="MainNav-linkText">{{"Help" | translatePhrase}}</span>
              </router-link>
            </li>
            <li class="MainNav-item">
              <router-link to="/search/libris" class="MainNav-link">
                <div class="MainNav-iconWrap" aria-hidden="true">
                  <i class="fa fa-search"></i>
                </div>
                <span class="MainNav-linkText">{{"Search" | translatePhrase}}</span>
              </router-link>
            </li>
              <li class="MainNav-item" v-if="user.isLoggedIn">
              <router-link to="/create" class="MainNav-link">
                <div class="MainNav-iconWrap" aria-hidden="true">
                  <i class="fa fa-file-text"></i>
                </div>
                <span class="MainNav-linkText">{{"Create new" | translatePhrase}}</span>
              </router-link>
            </li>
            <li class="MainNav-item" v-if="user.isLoggedIn">
              <router-link to="/user" class="MainNav-link">
                <div class="MainNav-iconWrap MainNav-iconWrap--userSettings">
                  <img class="MainNav-gravatar" :src="`https://www.gravatar.com/avatar/${user.emailHash}?d=mm&s=32`" alt="Avatar"/>
                </div>
                <span class="MainNav-linkText">
                {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
                </span>
              </router-link>
            </li>
            <li class="MainNav-item" v-if="!user.isLoggedIn">
              <a :href="`${settings.apiPath}/login/authorize`" class="MainNav-link">
                <div class="MainNav-iconWrap" aria-hidden="true">
                  <i class="fa fa-fw fa-sign-in"></i>
                </div>
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
  border: solid @border-navbar;
  background-color: @bg-navbar;
  border-width: 0px 0px @border-navbar-width 0px;
  box-shadow: @shadow-navbar;
  height: auto;

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
    color: @text-brand;
    cursor: pointer;
    float: right;
    font-size: 18px;
    font-size: 1.8rem;
    line-height: 20px;
    padding: 5px;

    @media (min-width: 768px) {
      padding: 15px 5px;
      height: 50px;
    }

    @media (min-width: 1200px) {
      font-size: 20px;
      font-size: 2rem;
    }

    &:hover {
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
  float: left;
  border-top: 1px solid @black;
  width: 100%;
  list-style: none;
  padding: 5px 0 0;
  margin: 5px 0 5px;

  @media (min-width: 992px) {
    float: right;
    border-top: 0;
    margin: 0;
    padding: 0;
    text-align: right;
  }

  &-item {
    text-transform: none;
    display: inline-block;
    max-height: 60px;
    margin-top: -2px;
      
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
      height: 30px;   
      width: 30px;
    }
  }

  &-gravatar {
    border-radius: 80%;
  }

  &-link {
    color: #333;
    cursor: pointer;
    font-size: 16px;
    font-size: 1.6rem;
    padding: 5px;
    display: block;

    &:hover, 
    &:focus {
      background-color: @bg-navbar-hover;
      text-decoration: none;
    }

    i {
      color: @text-alt-navbar;
    }

    @media (min-width: 992px) {
      padding: 20px 15px 12px;
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
}

</style>
