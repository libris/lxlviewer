// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import store from '@/store/store';
import * as VocabUtil from '@/utils/vocab';
import * as DisplayUtil from '@/utils/display';
import * as StringUtil from '@/utils/string';
import FakedDisplayJson from '@/resources/json/fakedisplay.json';

Vue.config.productionTip = false
Vue.use(Vuex);

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
    Promise.all(this.getLdDependencies()).then(() => {
      store.dispatch('setContext', this.context);
      store.dispatch('setupVocab', this.vocab);
      store.dispatch('setDisplay', FakedDisplayJson);
      store.dispatch('setForcedSetTerms', this.forcedSetTerms);
      store.dispatch('changeResourcesStatus', true);
    });
    this.initWarningFunc();
  },
  watch: {
    '$route'(route) {
      this.updateTitle(route);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTitle(this.$route);
    })
  },
  computed: {
    user() {
      return this.$store.getters.user;
    }
  },
  methods: {
    updateTitle(route) {
      let title = '';
      if (route.params.query) {
        const queryParts = route.params.query.split('&');
        for (const param of queryParts) {
          if (param[0] === 'q' && param[1] === '=') {
            title += `"${param.substr(2, param.length -2)}"`;
          }
        }
      } else {
        title += StringUtil.getUiPhraseByLang(route.name, this.$store.getters.user.settings.language)
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
      const vocabPromise = VocabUtil.getVocab().then((vocab) => {
        this.vocab = vocab['@graph'];
      }, (error) => {
        console.log('getVocab resulted in', error);
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}` });
      });
      promiseArray.push(vocabPromise);
      // const displayPromise = DisplayUtil.getDisplayDefinitions().then((display) => {
      //   this.display = display;
      // }, (error) => {
      //   console.log('getDisplayDefinitions', error);
      // });
      // promiseArray.push(displayPromise);
      const repeatablePromise = VocabUtil.getForcedListTerms().then((result) => {
        this.forcedListTerms = result;
      }, (error) => {
        console.log('getForcedListTerms resulted in', error);
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}` });
      });
      promiseArray.push(repeatablePromise);
      const contextPromise = VocabUtil.getContext().then((context) => {
        this.context = context['@context'];
      }, (error) => {
        console.log('getContext resulted in', error);
        this.$store.dispatch('pushNotification', { color: 'red', message: `${StringUtil.getUiPhraseByLang('Something went wrong', this.user.settings.language)}. ${error}` });
      });
      promiseArray.push(contextPromise);
      return promiseArray;
    }
  },
  store
})
