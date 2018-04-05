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
        case 'development':
          label += 'DEV ';
        break;
        case 'production':
        break;
        case 'staging':
          label += 'STG '
        break;
        case 'qa':
          label += 'QA '
        break;
        case 'testing':
          label += 'TEST ';
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
        <div class="col-xs-12 col-md-5">
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

        <div class="col-xs-12 col-md-7">
              <ul class="nav navbar-nav  MainNav">
                <li class="MainNav-item">
                  <router-link to="/help" class="MainNav-link">
                    <div class="MainNav-iconWrap" aria-hidden="true">
                      <i class="fa fa-question-circle"></i>
                    </div>
                    <span>{{"Help" | translatePhrase}}</span>
                  </router-link>
                </li>
                <li class="MainNav-item">
                  <router-link to="/search/libris" class="MainNav-link">
                    <div class="MainNav-iconWrap" aria-hidden="true">
                      <i class="fa fa-search"></i>
                    </div>
                    <span>{{"Search" | translatePhrase}}</span>
                  </router-link>
                </li>
                  <li class="MainNav-item">
                  <router-link to="/create" class="MainNav-link">
                    <div class="MainNav-iconWrap" aria-hidden="true">
                      <i class="fa fa-file-text"></i>
                    </div>
                    <span>{{"Create new" | translatePhrase}}</span>
                  </router-link>
                </li>
                <li class="MainNav-item" v-if="user">
                  <router-link to="/user" class="MainNav-link">
                    <div class="MainNav-iconWrap MainNav-iconWrap--userSettings">
                      <img class="MainNav-gravatar" :src="`https://www.gravatar.com/avatar/${user.emailHash}?d=mm&s=32`" alt="Avatar"/>
                    </div>
                    {{ user.fullName }} <span v-cloak class="sigelLabel">({{ user.settings.activeSigel }})</span>
                  </router-link>
                </li>
                <li class="MainNav-item" v-if="!user">
                  <a href="/login" class="MainNav-link">
                    <div class="MainNav-iconWrap" aria-hidden="true">
                      <i class="fa fa-fw fa-sign-in"></i>
                    </div>
                    <span>{{"Log in" | translatePhrase}}</span>
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
  z-index: 900;
  border: solid @border-navbar;
  background-color: @bg-navbar;
  border-width: 0px 0px @border-navbar-width 0px;
  box-shadow: @shadow-navbar;
  height: auto;

  @media screen and (max-width: @screen-sm-min) {
    padding: 0 20px;
  }

  &-brand {
    float: left;
    margin: 5px 10px 5px 0;
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
    color: @text-brand;
    cursor: pointer;
    height: 50px;
    float: right;
    font-size: 20px;
    font-size: 2rem;
    line-height: 20px;
    padding: 15px 5px;

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
  float: right;

  &-item {
    text-transform: none;
      
    @media screen and (max-width: @screen-sm-min) {
      display: inline;
    }
  }

  &-iconWrap {
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    line-height: 2em;
    margin-right: .25em;
    text-align: center;
    width: .8em;

    &--userSettings {
      height: 32px;   
      width: 32px;
      line-height: 20px;
    }
  }

  &-gravatar {
    border-radius: 80%;
  }

  &-link {
    color: #333;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    font-size: 1.6rem;

    &:hover, 
    &:focus {
      background-color: @bg-navbar-hover;
    }

    i {
      color: @text-alt-navbar;
    }
  }

  @media screen and (max-width: @screen-sm-min) {
    float: left;
  }
}

</style>
