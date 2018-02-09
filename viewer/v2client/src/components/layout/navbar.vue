<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-header" role="banner">
          <div class="navbar-brand navbar-logo">
            <router-link to="/">
              <img src="~kungbib-styles/dist/assets/kb_logo_black.svg" alt="Kungliga Bibliotekets logotyp">
            </router-link>
          </div>
          <router-link to="/" class="navbar-brand" :title="`Version ${settings.version}`">
              Libris katalogisering
            <span class="environment-label">
              {{ environmentLabel }}
            </span>
          </router-link>
        </div>
        <ul class="nav navbar-nav pull-right">
          <li class="navbar-item">
            <a href="/help">
              <div class="navbar-circle">
                <i class="fa fa-question-circle" aria-hidden="true"></i>
              </div>
              <span>{{"Help" | translatePhrase}}</span></a>
          </li>
          <li class="navbar-item">
          <router-link to="/search">
            <div class="navbar-circle">
              <i class="fa fa-search" aria-hidden="true"></i>
            </div>
            <span>{{"Search" | translatePhrase}}</span>
            </router-link>
          </li>
          <li class="navbar-item">
            <a href="/createnew">
              <div class="navbar-circle">
                <i class="fa fa-file-text" aria-hidden="true"></i>
              </div>
              <span>{{"Create new" | translatePhrase}}</span>
            </a>
          </li>
          <li class="navbar-item user-settings">
            <a href="/usersettings">
              <div class="navbar-circle">
                <img class="user-gravatar" src="" />
              </div>
              USER_NAME <span v-cloak class="sigelLabel">(ACTIVE_SIGEL)</span>
            </a>
          </li>
          <li class="navbar-item"><a href="/login">
            <div class="navbar-circle">
              <i class="fa fa-fw fa-sign-in"></i>
            </div>
            <span>{{"Log in" | translatePhrase}}</span></a>
          </li>
        </ul>
    </div>
  </nav>
</template>

<script>

export default {
  name: 'navbar-component',
  computed: {
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

<style lang="less">

.navbar {
  width: 100%;
  z-index: 900;
  border: solid @border-navbar;
  background-color: @bg-navbar;
  border-width: 0px 0px @border-navbar-width 0px;
  box-shadow: @shadow-navbar;
  min-height: 62px;
  @media screen and (max-width: @screen-sm-min) {
    padding: 0 20px;
  }
  .navbar-circle {
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: @grey-lighter;
    line-height: 2em;
    margin-right: 0.25em;
    text-align: center;
    .user-gravatar {
      border-radius: 50%;
    }
  }
  .container-fluid {
    padding: 0 30px 0 15px;
  }
  .navbar-nav {
    .navbar-item {
      text-transform: none;
      &.user-settings {
        .navbar-circle {
          width: 2.2em;
        }
      }
      .navbar-circle {
        width: 0.8em;
        background-color: transparent;
      }
    }
    a {
      cursor: pointer;
      &:hover, &:focus {
        background-color: @bg-navbar-hover;
      }
      i {
        color: @text-alt-navbar;
      }
    }
    text-transform: uppercase;
    font-weight: 600;
    font-size: 14px;
    .dropdown {
      text-shadow: none;
      .dropdown-menu {
        li {
          a {
            color: @text-alt-navbar;
            i {
              color: @green;
            }
          }
        }
        font-size: 12px;
      }
      li:hover {
        a {
          color: @text-alt-navbar;
        }
      }
    }
  }
}

.navbar-header {
  margin-left: 1em;
  padding: 0.3em;
  .navbar-brand {
    font-size: 18px;
    color: @text-brand;
  }
  .environment-label {
    text-transform: uppercase;
    font-size: 0.5em;
    color: @text-brand-env;
    font-weight: bold;
    display: block;
    margin: -0.5em 0px 0px 0.5em;
    float: right;
  }
}



</style>
