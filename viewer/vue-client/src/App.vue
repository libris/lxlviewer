<template>
  <div id="app" class="App">
    <global-message />
    <navbar-component />
    <div class="debug-mode-indicator" v-if="user.settings.appTech" @click="disableDebugMode">
      {{ 'Debug mode activated. Click here to disable.' | translatePhrase }}
    </div>
    <main class="MainContent" :class="{ 'container': !status.panelOpen, 'container-fluid': status.panelOpen, 'debug-mode': user.settings.appTech }" role="main">
        <div v-if="status.loadingIndicators.length > 0" class="text-center MainContent-spinner">
          <vue-simple-spinner size="large" :message="status.loadingIndicators[0] | translatePhrase"></vue-simple-spinner>
        </div>
        <div v-if="resourcesLoadingError" class="ResourcesLoadingError">
          <i class="fa fa-warning fa-4x text-danger"></i>
          <div>
            <h2>Kunde inte hämta nödvändiga resurser</h2>
            <p>Testa att ladda om sidan.</p>
            <p>Om felet kvarstår, kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.</p>
          </div>
        </div>
        <router-view v-if="resourcesLoaded" />
    </main>
    <portal-target name="sidebar" multiple />
    <footer-component></footer-component>
    <notification-list></notification-list>
  </div>
</template>

<script>
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import NotificationList from '@/components/shared/notification-list';
import GlobalMessage from '@/components/layout/global-msg';
import VueSimpleSpinner from 'vue-simple-spinner';

export default {
  name: 'App',
  computed: {
    inspector() {
      return this.$store.getters.inspector;
    },
    user() {
      return this.$store.getters.user;
    },
    status() {
      return this.$store.getters.status;
    },
    resourcesLoaded() {
      return this.$store.getters.resources.resourcesLoaded;
    },
    resourcesLoadingError() {
      return this.$store.getters.resources.loadingError;
    },
  },
  watch: {
  },
  methods: {
    disableDebugMode() {
      const userObj = this.user;
      userObj.settings.appTech = false;
      this.$store.dispatch('setUser', userObj);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'default', 
      });
    });
  },
  components: {
    'navbar-component': Navbar,
    'footer-component': Footer,
    'notification-list': NotificationList,
    'global-message': GlobalMessage,
    'vue-simple-spinner': VueSimpleSpinner,
  },
};
</script>

<style lang="less">
@import "~bootstrap/less/bootstrap";
@import "~font-awesome/css/font-awesome.css";
@import (css) url(//fonts.googleapis.com/css?family=Open+Sans:400italic,700,400);

// BOOTSTRAP UNSET START
.dropdown-menu > li > a {
  font-weight: unset;
}
// BOOTSTRAP UNSET END

body {
  line-height: 1.6;
  font-size: 16px;
  color: @black;
}

h1, h2, h3, h4 {
  font-weight: 700;
}
h1 {
  font-size: 36px;
}
h2 {
  font-size: 30px;
}
h3 {
  font-size: 24px;
}
h4 {
  font-size: 20px;
}

#app {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  font-family: @font-family-base;

  .fade-enter-active, .fade-leave-active {
    transition-property: opacity;
    transition-duration: .25s;
  }

  .fade-enter-active {
    transition-delay: .25s;
  }

  .fade-enter, .fade-leave-active {
    opacity: 0
  }
  .ResourcesLoadingError {
    display: flex;
    align-items: center;
    justify-content: center;
    i {
      margin-right: 0.5em;
    }
  }
}

.debug-mode-indicator {
  width: 100%;
  height: 2em;
  text-align: center;
  background-color: @brand-warning;
  cursor: pointer;
  box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.25);
  font-variant: all-small-caps;
  color: #222222;
  font-weight: bold;
  &:hover {
    background-color: darken(@brand-warning, 10%);
  }
}

.MainContent {
  flex: 1 0 auto;

  &.container-fluid {
    margin-right: 0px;
    margin-left: 0px;
  }

  &-spinner {
    margin-top: 2em;
  }

  @media screen and (max-width: @screen-lg-min){
    width: 100%;
  }
}

// ----------- LINKS ----------------
body a,
.link {
  color: @link-color;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: @link-hover-color;
    text-decoration: underline;
  }
}

a:focus {
  outline: none;
}

// ----------- BUTTON ----------------

button, .btn-primary, .btn-primary:hover, .btn-primary:focus {
    color: @white;
}

button {
  color:#444;
  border:none;
  border-radius: 2px;
  background:#ccc;
  padding: 0 0.4em;
  font-weight:bold;
  &:hover {
  background: #ddd;
  color:#222;
  }
  &:focus {
  background:#bbb;
  }
}

.btn,
.btn[disabled] {
  border: 0;
  box-shadow: @shadow-panel;
  transition: background-color 0.1s ease;
}

.btn:focus,
.btn:active:focus {
  outline: 0;
}

.btn[disabled],
.btn.disabled {
  background-color: @gray-lighter;
  opacity: 1;
  &:hover, 
  &:focus {
    background-color: @gray-lighter;
  }

  &.btn-primary {
    background-color: fadeout(@btn-primary, 35%);
    box-shadow: none;
  }
}

.btn-primary {
  background-color: @btn-primary;
  &:hover {
    background-color: @btn-primary--hover;
    border-color: @btn-primary--hover;
  }
}

.btn-gray {
  color: white;
  background-color: @gray;
  &:hover, 
  &:focus {
    color: white;
    background-color: @gray-darker;
  }
}

.btn-danger {
  &:hover {
    background-color: @danger-alter;
  }
}

//btn sizes

.btn-mixin(@width, @height, @fsize){
  min-width: @width;
  height: @height;
  font-size: @fsize;
  font-weight: 600;
}

.btn--lg {
  .btn-mixin(275px, auto, 20px);

  @media screen and (max-width: @screen-sm-min){
    .btn--md
  }
}

.btn--md {
  .btn-mixin(150px, 30px, 16px);
  padding: 0 15px;

  @media screen and (max-width: @screen-sm-min){
    .btn--sm
  }
}

.btn--sm {
  .btn-mixin(150px, 26px, 13px);
  padding: 3px 10px;
}

@import (css) url(//fonts.googleapis.com/css?family=Open+Sans:600);

html {
  height: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-y: scroll;
  &.ie11 {
    main {
      margin-bottom: 75vh;
    }
  }
  &.no-flexbox {
    .container {
      display: none;
    }
    #oldbrowsermsg {
      padding: 25px;
      display: block !important;
    }
  }
}

[v-cloak] {
  display: none;
}

main {
  margin-top: 30px;
  margin-bottom: 100px;
}

#oldbrowsermsg {
  width: 100%;
  padding: 3em 0em;
  div {
    border: 1px solid @gray;
    background-color: @gray-lighter;
    padding: 25px;
    width: 800px;
    margin: auto;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.15);
  }
}

.vue-simple-spinner {
  border-color: @brand-primary @gray-lighter @gray-lighter !important;
}

#body-blocker {
  display: none;
  z-index: @backdrop-z;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
}
html.scroll-lock {
  overflow: hidden;
}

body {
  position: relative;
  background-color: @bg-site;
  background-image: @bg-img;
  height: 100vh;
  display: flex;
  flex-direction: column;
  -ms-overflow-style: scrollbar;
  
  .facet-container {
    opacity: 1;
    transition: 0.3s ease width 0s, 0.3s ease opacity 0.3s;
    &.facet-hidden {
      width: 0%;
      opacity: 0;
    }
  }
}

// ----------- VARIOUS ----------------
* {
  outline: none;
}
.user-is-tabbing *:focus {
  outline: 2px solid #8cc9c9; //fallback for IE & Edge
  outline: auto darkcyan;
}

// ------------ UTILS ------------------
.rotate {
  transition: 0.25s ease;
}

.rotate-90 {
  -ms-transform: rotate(90deg); /* IE 9 */
  -webkit-transform: rotate(90deg); /* Chrome, Safari, Opera */
  transform: rotate(90deg);
}
.rotate-180 {
  -ms-transform: rotate(180deg); /* IE 9 */
  -webkit-transform: rotate(180deg); /* Chrome, Safari, Opera */
  transform: rotate(180deg);
}
.rotate-270 {
  -ms-transform: rotate(270deg); /* IE 9 */
  -webkit-transform: rotate(270deg); /* Chrome, Safari, Opera */
  transform: rotate(270deg);
}

.display-block {
  display: block !important;
}


// ------------- ICONS ----------------
.icon {
    color: @gray;
    color: @gray-transparent;
    cursor: pointer;
    transition: color .2s ease, background-color .2s ease;

    &:hover {
        color: @gray-darker;
        color: @gray-darker-transparent;
    }

    &--primary {
        color: @btn-primary;

        &:hover {
            color: @btn-primary--hover;
        }
    }

    &--white {
      color: @white;
      &:hover {
        color: @white;
      }
    }

    &--sm {
        font-size: 16px;
    }

    &--md {
        font-size: 20px;
    }
    
    &--lg {
        font-size: 30px;
    }

    &.is-disabled {
        color: @gray-lighter-transparent;
        cursor: not-allowed;
    }

    &.is-added {
        color: @gray-light;
        cursor: not-allowed;
    }
}

// ------------- BADGE ----------------

.badge {
  background-color: @gray-lighter;
  color: @gray-darker;
}

// ---------- TYPOGRAPHY -------------
// ----------- HEADINGS ----------------
h1, h2, h3, h4 {
  font-weight: 600;
  color: @black;
}
  
h1 {
    margin: 10px 0;
}

.mainTitle {
  margin: 0 0 20px 0;
}

// smaller uppercase headings
.uppercaseHeading {
    text-transform: uppercase;
    color: @gray-darker;
    font-size: 14px;
    font-size: 1.4rem;
    font-weight: 600;
  
    &--light {
      &:extend(.uppercaseHeading);
      font-size: 12px;
      font-size: 1.2rem;
      color: @gray-dark;
      color: @gray-dark-transparent;
    }

    &--bold {
      &:extend(.uppercaseHeading);
      font-weight: 700;
    }
}

// -------- FORM -------------

// CHECKBOX
.customCheckbox {
  &-input {
    margin-right: 0.2em;
    position: absolute;
    opacity: 0;

    &:checked + .customCheckbox-icon::before {
      content: "\f14a";
      color: @brand-primary;
    }

    .user-is-tabbing &:focus + .customCheckbox-icon {
      outline: 2px solid #8cc9c9; //fallback for IE & Edge
      outline: auto darkcyan;
    }
  }

  &-icon {
    padding: 0 3px;
    margin-left: -3px;
    display: inline-block;

    &::before {
      content: "\f096";
      font-family: "FontAwesome";
      display: inline-block;
      font-size: 18px;
      font-size: 1.8rem;
      color: @gray-darker;
      width: 18px;
    }
  }
}

// SELECT
.customSelect {
  height: 30px;
  min-width: 150px;
  font-size: 16px;
  font-size: 1.6rem;
  font-weight: 500;
  background-color: @white;
  color: @black;
  border: 1px solid @gray-light;
  box-shadow: @shadow-panel;
  text-align-last: center;
}

//TEXT INPUT
.customInput {
  display: flex;
  justify-content: space-between;
  height: 42px;
  min-width: 75%;
  flex-grow: 1;
  font-size: 20px;
  font-size: 2rem;
  line-height: 1.2;
  color: @black;
  border: 1px solid @gray-light;
  border-radius: 4px;

  &::placeholder,
  input::placeholder  {
    font-style: italic;
    color: @gray;
  }

  &:focus {
    border: 1px solid @brand-primary;
    outline: 0;
    box-shadow: none;
  }
}

// ------------ CARDS --------------

.card {
  border: 1px solid @gray-lighter;

  &-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.5em 1em 0em 1em;
    flex-grow: 1;
    width: 100%;
  }

  &-text {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &-title {
    display: block;
    font-size: 20px;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.2;
    margin: 10px 0 10px 0;
  }

  &-descr {
    font-size: 16px;
    font-size: 1.6rem;
    line-height: 27px;
    margin-bottom: 10px;
    width: 100%;
  }

  &-link {
    font-size: 18px;
    font-size: 1.8rem;
    font-weight: 600;
    line-height: 27px;
    text-align: center;
    padding: 10px 0;
    margin: 0.25em 0;
    width: 100%;
    
    &.active {
      color: @white;
      background: @brand-primary;
      &:hover {
          text-decoration: none;
      }
    }
  }
}

</style>
