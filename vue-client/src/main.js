
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'whatwg-fetch';
import Vue from 'vue';
import { createApp } from 'vue';
import Vuex from 'vuex'; // eslint-disable-line import/no-duplicates
import { mapGetters } from 'vuex'; // eslint-disable-line import/no-duplicates
import { each } from 'lodash-es';
import VTooltip from 'v-tooltip';
import { FocusTrap } from 'focus-trap-vue';
import PortalVue from 'portal-vue';
import VueClipboard from 'vue-clipboard2';
import ComboKeys from 'combokeys';
import modernizr from 'modernizr'; // eslint-disable-line no-unused-vars
import moment from 'moment';
import 'moment/locale/sv';
import * as StringUtil from 'lxljs/string';
import App from './App';
import router from './router';
import store from './store';
import * as LayoutUtil from '@/utils/layout';
import * as DataUtil from '@/utils/data';
import Field from '@/components/inspector/field';
import EntitySummary from '@/components/shared/entity-summary';
import KeyBindings from '@/resources/json/keybindings.json';
import i18n from '@/resources/json/i18n.json';
import VueClickAway from "vue3-click-away";

const TooltipOptions = {
  popover: {
    defaultPlacement: 'bottom',
    // Use the `popoverClass` prop for theming
    defaultClass: 'vue-popover-theme',
    // Base class (change if conflicts with other libraries)
    defaultBaseClass: 'tooltip popover',
    // Wrapper class (contains arrow and inner)
    defaultWrapperClass: 'wrapper',
    // Inner content class
    defaultInnerClass: 'tooltip-inner popover-inner',
    // Arrow class
    defaultArrowClass: 'tooltip-arrow popover-arrow',
    // Class added when popover is open
    defaultOpenClass: 'open',
    defaultDelay: { show: 300, hide: 0 },
    defaultTrigger: 'hover focus',
    defaultOffset: 0,
    defaultContainer: 'body',
    defaultBoundariesElement: 'viewport',
    defaultPopperOptions: {},
    // Hides if clicked outside of popover
    defaultAutoHide: false,
    // Update popper on content resize
    defaultHandleResize: true,
  },
};

const app = createApp({
    extends: App,
    created() {
      store.dispatch('verifyUser').then(() => {
        this.$nextTick(() => {
          store.dispatch('loadUserDatabase');
        });
      }).catch(() => {});
      store.dispatch('initOauth2Client').catch(() => {});
      this.initWarningFunc();
      this.fetchHelpDocs();
      store.dispatch('setTranslations', i18n);
      store.dispatch('setResource', {
        property: 'displayGroups',
        value: require('@/resources/json/displayGroups.json'),
      });
      store.dispatch('pushLoadingIndicator', 'Loading application');
      Promise.all(this.getLdDependencies()).then((resources) => {
        store.dispatch('setContext', resources[1]['@context']);
        store.dispatch('setupVocab', resources[0]['@graph']);
        store.dispatch('setDisplay', resources[2]);
        store.dispatch('changeResourcesStatus', true);
        store.dispatch('removeLoadingIndicator', 'Loading application');
      }, (error) => {
        window.lxlWarning(`🔌 The API (at ${this.settings.apiPath}) might be offline! Error: ${error}`);
        store.dispatch('changeResourcesLoadingError', true);
        store.dispatch('removeLoadingIndicator', 'Loading application');
      });
    },
    watch: {
      '$route'() {
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
        require('combokeys/plugins/global-bind')(this.combokeys); // TODO: Solve with ES6 syntax
        const stateSettings = KeyBindings[state];
          
        if (typeof stateSettings !== 'undefined') {
          each(stateSettings, (value, key) => {
            if (value !== null && value !== '') {
              this.combokeys.bindGlobal(key.toString(), () => {
                this.$store.dispatch('pushKeyAction', value);
                return false;
              });
            }
          });
        }
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.verifyConfig();
        this.loadTemplates();
        
        // Sync user storage initially and trigger it again every focus event
        this.syncUserStorage();
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
    },
    computed: {
      ...mapGetters([
        'settings',
        'user',
        'inspector',
        'resources',
        'status',
        'userStorage',
      ]),
    },
    methods: {
      syncUserStorage() {
        const userStorageTotal = JSON.parse(localStorage.getItem('userStorage'));
        let userStorage = this.userStorage;
        if (userStorageTotal !== null && (userStorageTotal.hasOwnProperty(this.user.idHash) || userStorageTotal.hasOwnProperty(this.user.emailHash))) {
          userStorage = userStorageTotal[this.user.idHash] || userStorageTotal[this.user.emailHash];
        }
        this.$store.dispatch('setUserStorage', userStorage);
      },
      injectAnalytics() {
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
        if (route.name === 'Home' || route.name === null) {
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
        if (this.settings.mockHelp) {
          window.lxlInfo('🎭 MOCKING HELP FILE - Using file from local lxl-helpdocs repository');
          store.dispatch('setHelpDocs', require('@/../../../lxl-helpdocs/build/help.json'));
        } else {
          fetch(`${this.settings.apiPath}/helpdocs/help.json`).then((result) => {
            if (result.status === 200) {
              result.json().then((body) => {
                store.dispatch('setHelpDocs', body);
              });
            }
          }, (error) => {
            console.log('Couldn\'t fetch help documentation.', error);
          });
        }
      },
      loadTemplates() {
        const templates = {
          base: require('@/resources/json/baseTemplates'),
          combined: require('@/resources/json/combinedTemplates'),
        };
        store.dispatch('setTemplates', templates);
      },
      getLdDependencies() {
        const promiseArray = [];
        const vocabPromise = DataUtil.getVocab(this.settings.idPath);
        promiseArray.push(vocabPromise);
        const contextPromise = DataUtil.getContext(this.settings.idPath);
        promiseArray.push(contextPromise);
        const displayPromise = DataUtil.getDisplayDefinitions();
        promiseArray.push(displayPromise);
        return promiseArray;
      },
    },
  })
  .use(router)
  .use(store)
  .use(Vuex)
  .use(PortalVue)
  .use(VTooltip, TooltipOptions)
  .use(VueClipboard)
  .use(VueClickAway)
  //.component('v-popover', VTooltip.VPopover)
  .component('FocusTrap', FocusTrap)
  .component('field', Field)
  .component('entity-summary', EntitySummary)
  .mixin({
    methods: {
      translate(string) {
        return StringUtil.getUiPhraseByLang(string, this.settings.language, store.getters.resources.i18n);
      },
      getKeybindText(eventName) {
        return LayoutUtil.getKeybindingText(eventName);
      },
    },
  })

  app.config.globalProperties.$moment = moment;
  moment.locale('sv');

  app.config.globalProperties.$filters = {
    translatePhrase(string) {
      return StringUtil.getUiPhraseByLang(string, store.getters.user.settings.language, store.getters.resources.i18n);
    },
    labelByLang(label) {
      return StringUtil.getLabelByLang(label, store.getters.user.settings.language, store.getters.resources);
    },
    asAppPath(path) {
      const appPaths = store.getters.settings.appPaths;
      let newPath = '';
      for (const key of Object.keys(appPaths)) {
        newPath = path.replace(key, appPaths[key]);
      }
      return newPath;
    },
    convertResourceLink(uri) {
      if (uri === null || typeof uri === 'undefined' || uri.length === 0) {
        throw new Error('Filter "convertResourceLink" was called without input');
      }
      return DataUtil.translateAliasedUri(uri);
    },
    asFnurgelLink(id) {
      if (!id || typeof id === 'undefined') {
        return '';
      }
      const parts = id.split('/');
      const fnurgel = `/${parts[parts.length - 1]}`;
      return fnurgel;
    },
    removeDomain(value) {
      StringUtil.removeDomain(value, store.getters.settings.removableBaseUris);
    },
    capitalize(value) {
      if (!value) return '';
      let newValue = value;
      newValue = newValue.toString();
      return newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }
  }

  app.mount('#app')

/*

Vue.mixin({
  methods: {
    translate(string) {
      return StringUtil.getUiPhraseByLang(string, this.settings.language, store.getters.resources.i18n);
    },
    getKeybindText(eventName) {
      return LayoutUtil.getKeybindingText(eventName);
    },
  },
});
*/