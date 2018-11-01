// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import PortalVue from 'portal-vue';
import ComboKeys from 'combokeys';
import router from './router'
import store from '@/store/store';
import * as VocabUtil from '@/utils/vocab';
import * as LayoutUtil from '@/utils/layout';
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import * as HttpUtil from '@/utils/http';
import * as User from '@/models/user';
import Field from '@/components/inspector/field';
import KeyBindings from '@/resources/json/keybindings.json';

Vue.config.productionTip = false
Vue.use(Vuex);
Vue.use(PortalVue);
Vue.component('field', Field);

Vue.filter('labelByLang', (label) => {
  return StringUtil.getLabelByLang(label, store.getters.user.settings.language, store.getters.resources.vocab, store.getters.resources.context);
});

Vue.filter('asAppPath', (path) => {
  const appPaths = store.getters.settings.appPaths;
  let newPath = '';
  for (const key of Object.keys(appPaths)) {
    newPath = path.replace(key, appPaths[key]);
  }
  return newPath;
});

Vue.filter('asFnurgelLink', (id) => {
  if (!id || typeof id === undefined) {
    return '';
  }
  const parts = id.split('/');
  const fnurgel = '/' + parts[parts.length-1];
  return fnurgel;
});

Vue.filter('removeDomain', (value) => {
  return StringUtil.removeDomain(value, store.getters.settings.removableBaseUris);
});
Vue.filter('translatePhrase', (string) => {
  return StringUtil.getUiPhraseByLang(string, store.getters.user.settings.language);
});
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

window.addEventListener("beforeunload", (e) => {
  const path = `${window.location.pathname.replace('/katalogisering', '')}${window.location.search}`;
  localStorage.setItem('lastPath', path);
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  created() {
    this.initWarningFunc();
    this.fetchHelpDocs();
    store.dispatch('pushLoadingIndicator', 'Loading application');
    Promise.all(this.getLdDependencies()).then((resources) => {
      store.dispatch('setContext', resources[2]['@context']);
      store.dispatch('setupVocab', resources[0]['@graph']);
      store.dispatch('setDisplay', resources[1]);
      store.dispatch('changeResourcesStatus', true);
      store.dispatch('removeLoadingIndicator', 'Loading application');
    }, (error) => {
      window.lxlWarning(`🔌 The API (at ${this.settings.apiPath}) might be offline!`);
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
    'status.keybindState'(state) {
      // Bindings are defined in keybindings.json
      // if (this.combokeys) {
      //   this.combokeys.detach();
      // }

      this.combokeys = new ComboKeys(document.documentElement);
      require('combokeys/plugins/global-bind')(this.combokeys); // TODO: Solve with ES6 syntax
      const stateSettings = KeyBindings[state];
        
      if (typeof stateSettings !== 'undefined') {
    
        _.each(stateSettings, (value, key) => {

          if (value !== null && value !== '') {
        
            this.combokeys.bindGlobal(key.toString(), (e) => {
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
      if (this.$route.name === 'Authenticating') {
        const token = StringUtil.getParamValueFromUrl(this.$route.hash, 'access_token');
        localStorage.setItem('at', token);
        this.verifyUser(token, true);
      } else {
        const token = localStorage.getItem('at');
        if (token) {
          this.verifyUser(token, false);
        } else {
          const userObj = User.getUserObject();
          store.dispatch('setUser', userObj);
        }
      }
      window.addEventListener('keydown', LayoutUtil.handleFirstTab);
      this.updateTitle();
      this.injectAnalytics();
    })
  },
  computed: {
    settings() {
      return this.$store.getters.settings;
    },
    user() {
      return this.$store.getters.user;
    },
    inspector() {
      return this.$store.getters.inspector;
    },
    status() {
      return this.$store.getters.status;
    }
  },
  methods: {
    injectAnalytics() {
      const analyticsString = 'var _paq=_paq||[];_paq.push(["trackPageView"]),_paq.push(["enableLinkTracking"]),function(){var e="//analytics.kb.se/";_paq.push(["setTrackerUrl",e+"piwik.php"]),_paq.push(["setSiteId","****"]);var a=document,p=a.createElement("script"),t=a.getElementsByTagName("script")[0];p.type="text/javascript",p.async=!0,p.defer=!0,p.src=e+"piwik.js",t.parentNode.insertBefore(p,t)}();';
      const scriptWithPiwikId = analyticsString.replace('****', this.settings.piwikID);
      const scriptTag = document.createElement('script');

      scriptTag.setAttribute('type', 'text/javascript');
      scriptTag.text = scriptWithPiwikId;
      
      document.head.appendChild(scriptTag);
    },
    verifyConfig() {
      if (!this.settings.apiPath || typeof this.settings.apiPath === 'undefined') {
        throw new Error('Missing API path in app-config');
      }
      if (!this.settings.authPath || typeof this.settings.authPath === 'undefined') {
        throw new Error('Missing AUTH path in app-config');
      }
      if (!this.settings.idPath || typeof this.settings.idPath === 'undefined') {
        throw new Error('Missing ID path in app-config');
      }
    },
    verifyUser(token, initial) {
      let userObj = User.getUserObject();
      HttpUtil.get({ url: this.settings.authPath, token }).then((result) => {
        userObj = User.getUserObject(result.user);
        userObj.token = token;
        store.dispatch('setUser', userObj);
        if (initial) {
          this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('You were logged in', this.settings.language)}!` });
          const lastPath = localStorage.getItem('lastPath');
          if (
            typeof lastPath !== 'undefined' &&
            lastPath !== '/user' &&
            lastPath !== '/login' && 
            lastPath !== '/login/authorized'
          ) {
            localStorage.removeItem('lastPath');
            this.$router.push({ path: lastPath });
          } else {
            this.$router.push({ path: '/' });
          }
        }
      }, (error) => {
        store.dispatch('setUser', userObj);
        localStorage.removeItem('at');
      });
    },
    updateTitle() {
      const route = this.$route;
      let title = '';
      if (route.params.query) {
        const queryParts = route.params.query.split('&');
        for (const param of queryParts) {
          if (param[0] === 'q' && param[1] === '=') {
            title += `"${param.substr(2, param.length -2)}"`;
          }
        }
      } else if (route.name === 'NewDocument') {
        title += StringUtil.getUiPhraseByLang('New record', this.$store.getters.user.settings.language);
      } else if (route.name === 'Inspector') {
        title += this.inspector.title;
      } else {
        title += StringUtil.getUiPhraseByLang(route.name, this.$store.getters.user.settings.language);
      }
      title += ` | ${this.$store.getters.settings.title}`;
      document.title = title;
    },
    initWarningFunc() {
      if (!this.settings.environment === 'development' || navigator.userAgent.indexOf('PhantomJS') > -1) {
        window.lxlWarning = function (...strings) {
          return;
        }
        window.lxlError = function (...strings) {
          return;
        }
        return;
      }
      window.lxlWarnStack = [];
      window.lxlWarning = function (...strings) {
        if (window.lxlWarnStack.indexOf(JSON.stringify(strings.join())) === -1) {
          window.lxlWarnStack.push(JSON.stringify(strings.join()));
          return console.warn('%c LXL ', 'background: #009788; color: #fff;', ...strings);
        }
      };
      window.lxlErrorStack = [];
      window.lxlError = function (...strings) {
        if (window.lxlErrorStack.indexOf(JSON.stringify(strings.join())) === -1) {
          window.lxlErrorStack.push(JSON.stringify(strings.join()));
          return console.error('%c LXL ERROR ', 'background: #a50000; color: #fff;', ...strings);
        }
      };
    },
    fetchHelpDocs() {
      fetch(`${this.settings.apiPath}/helpdocs/help.json`).then((result) => {
        if (result.status == 200) {
          result.json().then((body) => {
            store.dispatch('setHelpDocs', body);
          });
        }
      }, (error) => {
        console.log(error);
      });
    },
    getLdDependencies(fetchIndicator) {
      const promiseArray = [];
      const vocabPromise = VocabUtil.getVocab(this.settings.apiPath);
      promiseArray.push(vocabPromise);
      const displayPromise = DisplayUtil.getDisplayDefinitions(this.settings.idPath);
      promiseArray.push(displayPromise);
      const contextPromise = VocabUtil.getContext(this.settings.idPath);
      promiseArray.push(contextPromise);
      return promiseArray;
    }
  },
  store
})
