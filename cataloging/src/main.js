import { createApp } from 'vue';
import PortalVue from 'portal-vue';
import { VTooltip } from 'floating-vue';
import { FocusTrap } from 'focus-trap-vue';
import 'floating-vue/dist/style.css';
import VueClipboard from 'vue-clipboard2';
import VueMatomo from 'vue-matomo'
import store from './store';
import router from './router';
import App from './App.vue';
import EntitySummary from './components/shared/entity-summary.vue';
import Field from './components/inspector/field.vue';
import CookieConsent from './plugins/cookie-consent.js'
import settings from './settings';

const app = createApp(App);

app.use(store);
app.use(PortalVue);
app.directive('tooltip', VTooltip);
app.component('FocusTrap', FocusTrap);
app.use(router);
router.app = app;
app.use(VueClipboard);

const matomoId = runtimeConfig.MATOMO_ID || import.meta.env.VITE_APP_MATOMO_ID;
matomoId && app.use(VueMatomo, {
  host: 'https://analytics.kb.se',
  siteId: matomoId,
  router: router,
  requireConsent: true
})
app.use(CookieConsent, settings.cookieConsent);

app.component('entity-summary', EntitySummary).component('field', Field);

// Mount app
app.mount('#app');
