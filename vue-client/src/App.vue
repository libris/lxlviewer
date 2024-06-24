<template>
  <GlobalMessages />
  <EnvironmentBanner />
  <navbar-component />
  <search-bar v-if="resourcesLoaded" :class="{ 'stick-to-top': stickToTop }" />

  <main
    class="MainContent"
    :style="{ 'margin-top': stickToTop ? `${searchBarHeight}px` : '0px' }"
    :class="{
      container: (!status.panelOpen && user.settings.fullSiteWidth === false),
      'container-fluid': (status.panelOpen || user.settings.fullSiteWidth),
      'debug-mode': user.settings.appTech,
    }">
    <div class="debug-mode-indicator" v-if="user.settings.appTech" @click="disableDebugMode">
      {{ translatePhrase('Debug mode activated. Click here to disable.') }}
    </div>

    <div v-if="status.loadingIndicators.length > 0" class="text-center MainContent-spinner">
      <Spinner size="3x" :message="translatePhrase(status.loadingIndicators[0])" />
    </div>

    <div v-if="resourcesLoadingError" class="ResourcesLoadingError">
      <i class="fa fa-warning fa-4x text-danger" />
      <div>
        <h2>Kunde inte hämta nödvändiga resurser</h2>
        <p>Testa att ladda om sidan.</p>
        <p>Om felet kvarstår, kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.</p>
      </div>
    </div>

    <router-view
      :key="$route.name"
      ref="routerView"
      v-if="resourcesLoaded"
      v-show="status.loadingIndicators.length === 0"
      @ready="onRouterViewReady"
    />
  </main>

  <portal-target name="sidebar" multiple />
  <footer-component />
  <notification-list />
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { RouterView } from 'vue-router';
import ComboKeys from 'combokeys';
import GlobalBind from 'combokeys/plugins/global-bind';
import { translatePhrase } from '@/utils/filters';
import * as DataUtil from '@/utils/data';
import * as LayoutUtil from '@/utils/layout';
import * as StringUtil from 'lxljs/string';

import i18n from '@/resources/json/i18n.json';
import displayGroupsJson from '@/resources/json/displayGroups.json';
import baseTemplates from '@/resources/json/baseTemplates.json';
import combinedTemplates from '@/resources/json/combinedTemplates.json';
import KeyBindings from '@/resources/json/keybindings.json';
import GlobalMessages from '@/components/layout/global-messages.vue';
import EnvironmentBanner from '@/components/layout/environment-banner.vue';
import Spinner from '@/components/shared/spinner.vue';
import NotificationList from '@/components/shared/notification-list.vue';
import Footer from '@/components/layout/footer.vue';
import SearchBar from '@/components/layout/search-bar.vue';
import Navbar from '@/components/layout/navbar.vue';

export default {
  name: 'App',
  data() {
    return {
      stickToTop: false,
      navBarBottomPos: 0,
      searchBarHeight: 0,
      userIdleTimer: 0,
    };
  },
  computed: {
    ...mapGetters([
      'settings',
      'user',
      'resources',
      'inspector',
      'resourcesLoaded',
      'resourcesLoadingError',
      'status',
      'userDatabase',
    ]),
  },
  watch: {
    '$route.params'() {
      this.updateTitle();
    },
    'inspector.title'() {
      this.updateTitle();
    },
    'status.helpSectionTitle'() {
      this.updateTitle();
    },
    'user.idHash'() {
      this.syncUserStorage();
    },
    'status.keybindState'(state) {
      // Bindings are defined in keybindings.json
      // if (this.combokeys) {
      //   this.combokeys.detach();
      // }

      this.combokeys = new ComboKeys(document.documentElement);
      GlobalBind(this.combokeys);
      const stateSettings = KeyBindings[state];

      if (typeof stateSettings !== 'undefined') {
        Object.entries(stateSettings).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            this.combokeys.bindGlobal(key.toString(), () => {
              this.$store.dispatch('pushKeyAction', value);
              return false;
            });
          }
        });
      }
    },
    '$route'(to, from) {
      this.$nextTick(() => {
        if (from.name !== null && to.name !== 'Search') {
          this.setFocusTarget();
        }
      });
    },
  },
  methods: {
    translatePhrase,
    ...mapActions([
      'setStatusValue',
      'pushLoadingIndicator',
      'removeLoadingIndicator',
      'setContext',
      'setupVocab',
      'setDisplay',
      'changeResourcesStatus',
      'changeResourcesLoadingError',
      'setTemplates',
      'initOauth2Client',
      'verifyUser',
      'loadUserDatabase',
      'setTranslations',
      'setResource',
      'setUser',
    ]),
    onRouterViewReady() {
      this.setFocusTarget();
    },
    setFocusTarget() {
      if (this.$refs.routerView == null) {
        return false;
      }

      // get component's "routeFocusTarget" ref
      // if not existent, use router view container
      const focusTarget = (this.$refs.routerView.$refs.componentFocusTarget !== undefined)
        ? this.$refs.routerView.$refs.componentFocusTarget
        : this.$refs.routerView.$el;

      // make focustarget programmatically focussable
      focusTarget.setAttribute('tabindex', '-1');

      // focus element
      focusTarget.focus({
        preventScroll: true,
      });

      // remove tabindex from focustarget.
      // reason: https://axesslab.com/skip-links/#update-3-a-comment-from-gov-uk
      focusTarget.removeAttribute('tabindex');
      return focusTarget;
    },
    setupIdleTimer() {
      // USER IDLE TIMER
      const updateTimer = 5;
      const resetTimer = () => {
        this.userIdleTimer = 0;
      };

      setInterval(() => {
        this.userIdleTimer += updateTimer;
        if (this.userIdleTimer > 5 && this.status.userIdle === false) {
          this.setStatusValue({
            property: 'userIdle',
            value: true,
          });
        } else if (this.userIdleTimer <= 5 && this.status.userIdle === true) {
          this.setStatusValue({
            property: 'userIdle',
            value: false,
          });
        }
      }, updateTimer * 1000);

      window.addEventListener('load', resetTimer, true);

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach((name) => {
        document.addEventListener(name, resetTimer, true);
      });
    },
    disableDebugMode() {
      const userObj = this.user;
      userObj.settings.appTech = false;
      this.$store.dispatch('setUser', userObj);
    },
    checkSearchBar(event) {
      const $SearchBar = document.getElementById('SearchBar');
      const elementsAboveSearchBar = document.getElementsByClassName('top-scroll-past');
      let margin = 0;

      for (let i = 0; i < elementsAboveSearchBar.length; i++) {
        margin += elementsAboveSearchBar[i].getBoundingClientRect().height;
      }

      if ($SearchBar) {
        this.searchBarHeight = $SearchBar.getBoundingClientRect().height;
      }

      if (event) {
        if (event.target.scrollingElement && event.target.scrollingElement.scrollTop > margin) {
          this.stickToTop = true;
        } else {
          this.stickToTop = false;
        }
      }
    },
    injectAnalytics() {
      // eslint-disable-next-line vue/max-len
      const analyticsString = 'var _paq=_paq||[];_paq.push(["trackPageView"]),_paq.push(["enableLinkTracking"]),function(){var e="//analytics.kb.se/";_paq.push(["setTrackerUrl",e+"matomo.php"]),_paq.push(["setSiteId","****"]);var a=document,p=a.createElement("script"),t=a.getElementsByTagName("script")[0];p.type="text/javascript",p.async=!0,p.defer=!0,p.src=e+"matomo.js",t.parentNode.insertBefore(p,t)}();';
      const scriptWithMatomoId = analyticsString.replace('****', this.settings.matomoId);
      const scriptTag = document.createElement('script');

      scriptTag.setAttribute('type', 'text/javascript');
      scriptTag.text = scriptWithMatomoId;

      document.head.appendChild(scriptTag);
    },
    verifyConfig() {
      if (!this.settings.apiPath || typeof this.settings.apiPath === 'undefined') {
        throw new Error('Missing API path in app-config');
      }
      if (!this.settings.verifyPath || typeof this.settings.verifyPath === 'undefined') {
        throw new Error('Missing AUTH path in app-config');
      }
      if (!this.settings.idPath || typeof this.settings.idPath === 'undefined') {
        throw new Error('Missing ID path in app-config');
      }
    },
    updateTitle() {
      const route = this.$route;
      let title = '';
      if (route.params.query) {
        const queryParts = route.params.query.split('&');
        for (const param of queryParts) {
          if (param[0] === 'q' && param[1] === '=') {
            title += `"${param.substr(2, param.length - 2)}"`;
          }
        }
      } else if (route.name === 'NewDocument') {
        title += StringUtil.getUiPhraseByLang('New record', this.user.settings.language, this.resources.i18n);
      } else if (route.name === 'Inspector') {
        if (this.inspector.title && this.inspector.title.length > 0) {
          title += this.inspector.title;
        } else {
          title += StringUtil.getUiPhraseByLang('Loading document', this.user.settings.language, this.resources.i18n);
        }
      } else if (route.name === 'Help') {
        title += this.status.helpSectionTitle;
      } else if (route.name === 'DocumentHistory') {
        title += StringUtil.getUiPhraseByLang('Version history', this.user.settings.language, this.resources.i18n);
      } else {
        title += StringUtil.getUiPhraseByLang(route.name, this.user.settings.language, this.resources.i18n);
      }
      if (route.name === 'Home' || !route.name) {
        title = this.settings.title;
      } else {
        title += ` | ${this.settings.title}`;
      }
      document.title = title;
    },
    initWarningFunc() {
      if (this.settings.environment === 'prod' || this.settings.environment === 'stg') {
        window.lxlWarning = () => {

        };
        window.lxlError = () => {

        };
        return;
      }
      window.lxlInfoStack = [];
      window.lxlInfo = (...strings) => {
        if (window.lxlInfoStack.indexOf(JSON.stringify(strings.join())) === -1) {
          window.lxlInfoStack.push(JSON.stringify(strings.join()));
          return console.log(...strings);
        }
        return false;
      };
      window.lxlWarnStack = [];
      window.lxlWarning = (...strings) => {
        if (window.lxlWarnStack.indexOf(JSON.stringify(strings.join())) === -1) {
          window.lxlWarnStack.push(JSON.stringify(strings.join()));
          return console.warn(...strings);
        }
        return false;
      };
      window.lxlErrorStack = [];
      window.lxlError = (...strings) => {
        if (window.lxlErrorStack.indexOf(JSON.stringify(strings.join())) === -1) {
          window.lxlErrorStack.push(JSON.stringify(strings.join()));
          return console.error(...strings);
        }
        return false;
      };
    },
    fetchHelpDocs() {
      if (import.meta.env.DEV && this.settings.mockHelp === true) {
        window.lxlInfo('🎭 MOCKING HELP FILE - Using file from local lxl-helpdocs repository');
        // eslint-disable-next-line import/no-extraneous-dependencies
        import('@/../../../lxl-helpdocs/build/help.json').then((module) => {
          this.$store.dispatch('setHelpDocs', module.default);
        });
      } else {
        fetch(`${this.settings.apiPath}/helpdocs/help.json`).then((result) => {
          if (result.status === 200) {
            result.json().then((body) => {
              this.$store.dispatch('setHelpDocs', body);
            });
          }
        }, (error) => {
          console.log('Couldn\'t fetch help documentation.', error);
        });
      }
    },
    getLdDependencies() {
      return [
        DataUtil.getVocab(this.settings.idPath),
        DataUtil.getContext(this.settings.idPath),
        DataUtil.getDisplayDefinitions(),
      ];
    },
    loadTemplates() {
      const templates = {
        base: baseTemplates,
        combined: combinedTemplates,
      };

      this.setTemplates(templates);
    },
    syncUserStorage() {
      const userStorageTotal = JSON.parse(localStorage.getItem('userStorage'));
      let userStorage = this.userStorage;
      if (userStorageTotal !== null && (userStorageTotal.hasOwnProperty(this.user.idHash) || userStorageTotal.hasOwnProperty(this.user.emailHash))) {
        userStorage = userStorageTotal[this.user.idHash] || userStorageTotal[this.user.emailHash];
      }
      this.$store.dispatch('setUserStorage', userStorage);
    },
  },
  mounted() {
    this.verifyUser().then(() => {
      this.$nextTick(() => {
        if (this.user.isLoggedIn) {
          this.loadUserDatabase();
        }
      });
    });
    this.initOauth2Client().catch(() => {});
    this.initWarningFunc();
    this.fetchHelpDocs();
    this.setTranslations(i18n);
    this.setResource({
      property: 'displayGroups',
      value: displayGroupsJson,
    });
    this.pushLoadingIndicator('Loading application');
    Promise.all(this.getLdDependencies()).then((resources) => {
      this.setContext(resources[1]['@context']);
      this.setupVocab(resources[0]['@graph']);
      this.setDisplay(resources[2]);
      this.changeResourcesStatus(true);
      this.removeLoadingIndicator('Loading application');
    }, (error) => {
      window.lxlWarning(`🔌 The API (at ${this.settings.apiPath}) might be offline! Error: ${error}`);
      this.changeResourcesLoadingError(true);
      this.removeLoadingIndicator('Loading application');
    });

    this.$nextTick(() => {
      this.setupIdleTimer();
      this.checkSearchBar();

      this.$store.dispatch('setStatusValue', {
        property: 'keybindState',
        value: 'default',
      });

      this.verifyConfig();
      this.loadTemplates();

      this.syncUserStorage();
      window.addEventListener('focus', () => {
        this.syncUserStorage();
        if (this.user.isLoggedIn) {
          this.$store.dispatch('loadUserDatabase');
        }
      });
      window.addEventListener('focus', () => {
        this.syncUserStorage();
        if (this.user.isLoggedIn) {
          this.$store.dispatch('loadUserDatabase');
        }
      });

      window.addEventListener('keydown', LayoutUtil.handleFirstTab);
      this.updateTitle();
      this.injectAnalytics();
    });

    window.addEventListener('scroll', (e) => {
      this.checkSearchBar(e);
    });
  },
  components: {
    'router-view': RouterView,
    SearchBar,
    'navbar-component': Navbar,
    'footer-component': Footer,
    'notification-list': NotificationList,
    EnvironmentBanner,
    GlobalMessages,
    Spinner,
  },
};
</script>

<style lang="less">
@import "~bootstrap/less/bootstrap";
@import "~font-awesome/css/font-awesome.css";

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
  background-color: @grey-lighter;
  opacity: 1;
  &:hover,
  &:focus {
    background-color: @grey-lighter;
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

.btn-info {
  @base-color: @brand-info;
  background-color: @white;
  border: 1px solid;
  border-color: @base-color;
  color: @black;
  &:focus {
    background-color: @white;
    color: @black;
  }
  &:hover, &:active {
    background-color: darken(@white, 5%) !important;
    color: @black !important;
  }
  &:active {
    box-shadow: inset 0 0 0.5rem 0 rgba(0, 0, 0, 0.4);
    color: @black;
  }
}

.btn-transparent, .btn-transparent:focus, .btn-transparent:active {
  border: 1px solid @black;
  font-weight: 700;
  background-color: transparent;
  &:hover {
    background-color: fadeout(@neutral-color, 70%);
  }
}

.btn-primary {
  background-color: @btn-primary;
  &:hover {
    background-color: @btn-primary--hover;
    border-color: @btn-primary--hover;
  }
}

.btn-grey {
  color: white;
  background-color: @grey;
  &:hover,
  &:focus {
    color: white;
    background-color: @grey-darker;
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

&.btn--as-link {
  color: @link-color;
  text-align: left;
  padding: 0;
  background: transparent;
  font-weight: normal;
  &:focus,
  &:hover {
    color: @link-hover-color;
    background-color: transparent;
    text-decoration: underline;
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

html {
  height: 100%;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: greyscale;
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
    border: 1px solid @grey;
    background-color: @grey-lighter;
    padding: 25px;
    width: 800px;
    margin: auto;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.15);
  }
}

.vue-simple-spinner {
  border-color: @brand-primary @grey-lighter @grey-lighter !important;
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
  background-color: @site-body-background;
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

.user-is-tabbing {
  button, .MainNav-userDropdown, a, h1, h2, h3, h4, h5, span {
    &:focus {
      .focus-mixin-bg();
      * {
        .focus-mixin-bg();
      }
    }
  }
  input, textarea, img, select, .ItemEntity, .ItemLocal, .EntityAction, .ItemSibling, .icon, .icon i, li, i.fa, div {
    &:focus {
      .focus-mixin-border();
    }
  }
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
    color: @grey;
    color: @grey-transparent;
    transition: color .2s ease, background-color .2s ease;

    &:hover {
        color: @grey-darker;
        color: @grey-darker-transparent;
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
        color: @grey-lighter-transparent;
        cursor: not-allowed;
    }

    &.is-added {
        color: @grey-light;
        cursor: not-allowed;
    }
}

// ------------- BADGE ----------------

.badge {
  background-color: @badge-color;
  background-color: @badge-color-transparent;
  color: @grey-darker;
  color: @grey-darker-transparent;
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
    text-transform: uppercase !important;
    color: @grey-darker;
    font-size: 13px;
    font-size: 1.3rem;
    font-weight: 600;

    &--light {
      &:extend(.uppercaseHeading);
      font-size: 12px;
      font-size: 1.2rem;
      color: @grey-dark;
      color: @grey-dark-transparent;
    }

    &--bold {
      &:extend(.uppercaseHeading);
      font-weight: 700;
    }
    &--large {
      &:extend(.uppercaseHeading);
      font-size: 1.8rem;
    }
    &--secondary {
      color: @grey;
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
      outline: 2px solid @focus-color-border; //fallback for IE & Edge
      outline: auto @focus-color-border;
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
      color: @grey-darker;
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
    color: @grey;
  }

  &::-ms-clear {
    display: none; // remove cross from IE
  }
}

// ------------ CARDS --------------

.card {
  border: 1px solid @grey-lighter;

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

// ------------ HISTORY --------------

.is-diff-added {
  @base-color: @form-add;
  background-color: @base-color !important;
}

.is-diff-removed {
  @base-color: @remove;
  border: 1px dashed !important;
  border-color: @base-color !important;
  background-color: @form-remove !important;
}

.is-diff-modified {
  @base-color: @brand-primary-orange;
  border: 1px dashed !important;
  border-color: @base-color !important;
  background-color: @form-modified !important;
}
</style>
