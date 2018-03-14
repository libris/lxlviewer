// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import ComboKeys from 'combokeys';
import router from './router'
import store from '@/store/store';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import * as User from '@/models/user';
import FakedDisplayJson from '@/resources/json/fakedisplay.json';
import FieldComponent from '@/components/editorcomponents/field-component';
import KeyBindings from '@/resources/json/keybindings.json';

Vue.config.productionTip = false
Vue.use(Vuex);
Vue.component('field', FieldComponent);

Vue.filter('labelByLang', (label) => {
  return StringUtil.getLabelByLang(label, store.getters.user.settings.language, store.getters.resources.vocab, store.getters.settings.vocabPfx, store.getters.resources.context);
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

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  created() {
    this.initWarningFunc();
    this.initializeUser();
    Promise.all(this.getLdDependencies()).then((resources) => {
      store.dispatch('setContext', resources[2]['@context']);
      store.dispatch('setupVocab', resources[0]['@graph']);
      store.dispatch('setDisplay', FakedDisplayJson);
      store.dispatch('setForcedListTerms', resources[1]);
      store.dispatch('changeResourcesStatus', true);
    }, (error) => {
      console.warn(`The API (at ${this.settings.apiPath}) might be offline!`);
      store.dispatch('changeResourcesLoadingError', true);
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
      if (this.combokeys) {
        this.combokeys.detach();
      }
      this.combokeys = new ComboKeys(document.documentElement);
      require('combokeys/plugins/global-bind')(this.combokeys); // TODO: Solve with ES6 syntax
      const stateSettings = KeyBindings[state];
      if (typeof stateSettings !== 'undefined') {
        _.each(stateSettings, (value, key) => {
          if (value !== null && value !== '') {
            this.combokeys.bindGlobal(key.toString(), () => {
              const valueArray = value.split('|');
              if (state === 'overview') {
                this.$dispatch(valueArray[0], valueArray[1]);
              } else {
                this.$broadcast(valueArray[0], valueArray[1]);
              }
              return false;
            });
          }
        });
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTitle(this.$route);
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
  },
  methods: {
    initializeUser() {
      const userObj = User.getUserObject(window.userInfo || {});
      store.dispatch('setUser', userObj);
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
      if (!this.lxlDebug || navigator.userAgent.indexOf('PhantomJS') > -1) {
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
    getLdDependencies(fetchIndicator) {
      const promiseArray = [];
      const vocabPromise = VocabUtil.getVocab(this.settings.apiPath);
      promiseArray.push(vocabPromise);
      // const displayPromise = DisplayUtil.getDisplayDefinitions().then((display) => {
      //   this.display = display;
      // }, (error) => {
      //   console.log('getDisplayDefinitions', error);
      // });
      // promiseArray.push(displayPromise);
      const repeatablePromise = VocabUtil.getForcedListTerms(this.settings.apiPath);
      promiseArray.push(repeatablePromise);
      const contextPromise = VocabUtil.getContext(this.settings.apiPath);
      promiseArray.push(contextPromise);
      return promiseArray;
    }
  },
  store
})
