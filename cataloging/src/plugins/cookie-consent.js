import KbCookieConsent from '@kungbib/cookie-consent';

export default {
  install: (app, pluginConfig) => {
      app.config.globalProperties.CookieConsent = KbCookieConsent;
      app.config.globalProperties.CookieConsent.run(pluginConfig);
  }
}
