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
import KbCookieConsent from '@kungbib/cookie-consent';

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

KbCookieConsent.run({
  categories: {
    //necessary: {
    //  readOnly: true,
    //  enabled: true
    //},
    analytics: {
      autoClear: {
        cookies: [
          {
            // Matomo cookies
            name: /^_pk.*/
          }
        ]
      }
    }
  },
  language: {
    translations: {
      sv: {
        preferencesModal: {
          sections: [
            {
              title: "Om användning av kakor",
              description: "Den här tjänsten använder kakor (cookies). En kaka är en liten textfil som lagras i besökarens dator. KB:s tjänster är designade för att minska risken för spridning av dina uppgifter. Informationen som lagras via kakor kan aldrig användas av tredje part i marknadsföringssyfte."
            },
            //{
            //  title: "Nödvändiga kakor",
            //  description: "Dessa kakor krävs för att tjänsten ska vara säker och fungera som den ska. Därför går de inte att inaktivera.",
            //  linkedCategory: "necessary", // här länkar vi samman beskrivningen med respektive kategori
            //},
            {
              title: "Analytiska kakor",
              description:
                "Kakor som ger oss information om hur webbplatsen används som gör att vi kan underhålla, driva och förbättra användarupplevelsen.",
              linkedCategory: "analytics"
            },
            {
              title: "Mer information",
              description: "Du kan alltid ändra dina val genom att klicka på “Hantera cookies” längst ner på sidan i sidfoten."
            }
          ]
        }
      }
    }
  },
  onConsent: ({ cookie }) => {
    if (cookie.categories.includes('analytics')) {
      window._paq = window._paq || [];
      window._paq.push(['rememberConsentGiven']);
    }
  },
  onChange: ({ cookie }) => {
    if (cookie.categories.includes('analytics')) {
      window._paq = window._paq || [];
      window._paq.push(['rememberConsentGiven']);
    } else {
      window._paq.push(['forgetConsentGiven']);
    }
  }
});

app.component('entity-summary', EntitySummary).component('field', Field);

// Mount app
app.mount('#app');
