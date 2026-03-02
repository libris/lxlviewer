import KbCookieConsent from '@kungbib/cookie-consent'

const cookieConsentConfig = {
  categories: {
    necessary: {
      readOnly: true,
      enabled: true
    },
    analytics: {
      autoClear: {
        cookies: [
          { name: /^_pk.*/ } // Matomo cookies
        ]
      }
    }
  },
  language: {
    translations: {
      sv: {
        consentModal: {
          title: 'Om användning av kakor',
          description:
            'Den här tjänsten använder kakor (cookies). Du kan välja vilka kakor som får användas.',
          acceptAllBtn: 'Tillåt alla',
          acceptNecessaryBtn: 'Tillåt endast nödvändiga',
          showPreferencesBtn: 'Inställningar'
        },
        preferencesModal: {
          title: 'Inställningar för kakor',
          acceptAllBtn: 'Tillåt alla',
          acceptNecessaryBtn: 'Tillåt endast nödvändiga',
          savePreferencesBtn: 'Spara och godkänn',
          sections: [
            {
              title: 'Om användning av kakor',
              description:
                'Kakor används för att tjänsten ska fungera och för att förbättra upplevelsen.'
            },
            {
              title: 'Nödvändiga kakor',
              description:
                'Dessa krävs för att tjänsten ska vara säker och fungera som den ska.',
              linkedCategory: 'necessary'
            },
            {
              title: 'Analytiska kakor',
              description:
                'Ger oss information om hur webbplatsen används så att vi kan förbättra den.',
              linkedCategory: 'analytics'
            },
            {
              title: 'Mer information',
              description:
                'Du kan alltid ändra dina val genom att klicka på “Hantera cookies” längst ner på sidan.'
            }
          ]
        }
      }
    }
  }
}

export default (context, inject) => {
  if (process.client) {
    // Initialize _paq queue before Matomo loads
    window._paq = window._paq || []
    
    // Store consent callbacks to use Matomo's setConsent method when available
    const matomoCallbacks = {
      onConsent: ({ cookie }) => {
        if (window.$nuxt && window.$nuxt.$matomo) {
          const hasAnalytics = cookie.categories.includes('analytics')
          window.$nuxt.$matomo.setConsent(hasAnalytics)
        }
      },
      onChange: ({ cookie }) => {
        if (window.$nuxt && window.$nuxt.$matomo) {
          const hasAnalytics = cookie.categories.includes('analytics')
          window.$nuxt.$matomo.setConsent(hasAnalytics)
        }
      }
    }
    
    // Merge callbacks into the config
    cookieConsentConfig.onConsent = matomoCallbacks.onConsent
    cookieConsentConfig.onChange = matomoCallbacks.onChange
    
    KbCookieConsent.run(cookieConsentConfig)
  }
}