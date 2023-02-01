import { hostPath, translateAliasedUri, encodeSpecialChars, activeSite } from '../plugins/env';

export default (context, inject) => {
  if (Object.keys(context.$config.siteConfig).length === 0) {
    throw 'env.XL_SITE_CONFIG not defined (fix for development: copy .env.in to .env)'
  }

  inject('defaultHostPath', () => hostPath(context.$config.defaultSite, context.$config.siteAlias, context.$config.siteConfig));
  inject('translateAliasedUri', uri => translateAliasedUri(uri, context.$config.siteAlias)),
  inject('encodeSpecialChars', path => encodeSpecialChars(path)),
  inject('activeSite', xForwardedHost => activeSite(xForwardedHost, context.$config.siteAlias, context.$config.siteConfig,  context.$config.defaultSite))
}