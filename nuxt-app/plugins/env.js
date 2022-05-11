import { each, findKey } from "lodash-es";

const SITE_ALIAS = JSON.parse(process.env.SITE_ALIAS || '{}');
const SITE_CONFIG = JSON.parse(process.env.SITE_CONFIG);

export function defaultHostPath() {
  return hostPath(defaultSite())
}

export function hostPath(site) {
  const baseUri = siteConfig()[site]['baseUri'];
  return translateAliasedUri(baseUri);
}

export function siteConfig() {
  return SITE_CONFIG;
}

export function translateAliasedUri(uri) {
  if (typeof uri == 'undefined' || uri.length === 0) {
    return null;
  }
  let translatedUri = uri
  each(SITE_ALIAS, (from, to) => {
    if (uri.startsWith(from)) {
      translatedUri = uri.replace(from, to);
      return false;
    }
    return true;
  });
  return translatedUri;
}

export function defaultSite() {
  return process.env.DEFAULT_SITE || 'id.kb.se';
}

export function activeSite(xForwardedHost) {
  if (!xForwardedHost) {
    return defaultSite();
  }

  return findKey(siteConfig(), c => xForwardedHost.startsWith(host(translateAliasedUri(c.baseUri)))) || defaultSite();
}

function host(url) {
  return new URL(url).host;
}
