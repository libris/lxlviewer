<template>
  <div id="app" class="App">
    <global-message />
    <navbar-component />
    <search-bar v-if="resourcesLoaded" :class="{ 'stick-to-top': stickToTop }" />
    <main class="MainContent" :style="{ 'margin-top': stickToTop ? `${searchBarHeight}px` : '0px' }" :class="{ 'container': !status.panelOpen, 'container-fluid': status.panelOpen, 'debug-mode': user.settings.appTech }">
      <div class="debug-mode-indicator" v-if="user.settings.appTech" @click="disableDebugMode">
        {{ 'Debug mode activated. Click here to disable.' | translatePhrase }}
      </div>
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
import VueSimpleSpinner from 'vue-simple-spinner';
import { mapGetters } from 'vuex';
import Navbar from '@/components/layout/navbar';
import SearchBar from '@/components/layout/search-bar';
import Footer from '@/components/layout/footer';
import NotificationList from '@/components/shared/notification-list';
import GlobalMessage from '@/components/layout/global-msg';

export default {
  name: 'App',
  data() {
    return {
      stickToTop: false,
      navBarBottomPos: 0,
      searchBarHeight: 0,
    };
  },
  computed: {
    ...mapGetters([
      'settings',
      'user',
      'resourcesLoaded',
      'resourcesLoadingError',
      'status',
    ]),
  },
  watch: {
  },
  methods: {
    disableDebugMode() {
      const userObj = this.user;
      userObj.settings.appTech = false;
      this.$store.dispatch('setUser', userObj);
    },
    checkSearchBar(event) {
      const $SearchBar = document.getElementById('SearchBar');
      const $NavBar = document.getElementById('NavBar');
      if ($SearchBar) {
        this.searchBarHeight = $SearchBar.getBoundingClientRect().height;
      }
      if ($NavBar) {
        this.navBarBottomPos = $NavBar.offsetHeight;
      }
      if (event) {
        if (event.target.scrollingElement && event.target.scrollingElement.scrollTop > this.navBarBottomPos) {
          this.stickToTop = true;
        } else {
          this.stickToTop = false;
        }
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.checkSearchBar();
      this.$store.dispatch('setStatusValue', { 
        property: 'keybindState', 
        value: 'default', 
      });
    });
    window.addEventListener('scroll', (e) => {
      this.checkSearchBar(e);
    });
  },
  components: {
    SearchBar,
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

// BOOTSTRAP OVERRIDE START
@media (max-width: @screen-md-min) {
   .container {
      width: 100%;
   }
}
// BOOTSTRAP OVERRIDE END

.row {
  height: 100%;
}

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
    top: 0;
    width: 100vw;
    height: 100vh;
    background-color: #ffffffeb;
    left: 0;
    position: fixed;
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
  &.sticky-is-active {
  }

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

.btn {
  .icon {
    color: @white !important;
  }
}

.btn,
.btn[disabled] {
  border: 0;
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
  &.btn-light {
    opacity: 0.7;
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

.btn-light {
  color: lighten(@black, 15%);
  background-color: darken(@white, 5%);
  &:focus {
    color: lighten(@black, 15%);
    background-color: darken(@white, 5%);
  }
  &:hover {
    color: lighten(@black, 15%);
    background-color: darken(@white, 10%);
  }
}

&.btn-hollow {
  background-color: transparent;
  &:focus,
  &:hover {
    color: lighten(@black, 15%);
    background-color: darken(@white, 5%);
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
  .btn-mixin(150px, 32px, 14px);
  padding: 0 15px;

  &-icon {
    padding: 0.25em 0.5em;
    min-width: 0;
  }

  .icon {
    margin-right: 8px;
  }

  @media screen and (max-width: @screen-sm-min){
    .btn--sm
  }
}

.btn--sm {
  .btn-mixin(150px, 26px, 13px);
  padding: 3px 10px;
  box-shadow: none;
}

.btn--auto {
  min-width: auto;
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
  // margin-top: 30px;
  // margin-bottom: 100px;
  min-height: 100%;
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

    &--xs {
      font-size: 12px;
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
  background-color: @badge-color;
  background-color: @badge-color-transparent;
  color: @gray-darker;
  color: @gray-darker-transparent;
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
  margin: 0 0 0.1em 0;
}

// smaller uppercase headings
.uppercaseHeading {
    text-transform: uppercase;
    color: @gray-darker;
    font-size: 13px;
    font-size: 1.3rem;
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
    &--large {
      &:extend(.uppercaseHeading);
      font-size: 1.8rem;
    }
}

// -------- FORM -------------

// CHECKBOX
.customCheckbox {
  &-input {
    margin-right: 0.2em;
    position: absolute;
    opacity: 0;
    height: 1.6em;

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
  line-height: 3.2rem;
  font-weight: 500;
  font-size: 16px;
  font-size: 1.6rem;
  color: @black;
  border: none;
  width: 100%;
  border-radius: @form-radius;
  // border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  text-align: left;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: @grey-lightest;
  background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' height='10px' width='15px'%3E%3Ctext x='0' y='10' fill='gray'%3E%E2%96%BE%3C/text%3E%3C/svg%3E");
  background-repeat: no-repeat, repeat;
  background-position: right 0.5em top 50%, 0 0;
  background-size: 1em auto, 100%;
  padding-left: 0.8em;
  padding-right: 1.8em;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &::-ms-expand{
    display: none;
  }
}

//TEXT INPUT
.customInput {
  display: flex;
  justify-content: space-between;
  height: 42px;
  flex-grow: 1;
  font-size: 16px;
  font-size: 1.6rem;
  width: 100%;
  border-radius: @form-radius;
  background-color: @grey-lightest;
  line-height: 1.2;
  color: @black;
  border-color: transparent;
  padding: 0 0.5em;

  &::placeholder,
  input::placeholder  {
    color: @gray;
  }

  &:focus {
    // border: 1px solid @brand-primary;
    // outline: 0;
    // box-shadow: none;
  }

  &::-ms-clear {
    display: none; // remove cross from IE
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
