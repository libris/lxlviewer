import { each, findKey } from "lodash-es";
if (!process.env.XL_SITE_CONFIG) {
  throw 'env.XL_SITE_CONFIG not defined (fix for development: copy .env.in to .env)'
}

//const SITE_ALIAS = JSON.parse(process.env.XL_SITE_ALIAS || '{}');
const SITE_CONFIG = JSON.parse(process.env.XL_SITE_CONFIG);

export function defaultHostPath() {
  //console.log('runtime config', getFoo());
  return hostPath(defaultSite())
}

export function hostPath(site) {
  const baseUri = siteConfig()[site]['baseUri'];
  return translateAliasedUri(baseUri);
}

export function siteConfig() {
  return SITE_CONFIG;
}

export function translateAliasedUri(uri, siteAlias) {
  if (typeof uri == 'undefined' || uri.length === 0) {
    return null;
  }
  let translatedUri = uri
  each(siteAlias, (from, to) => {
    if (uri.startsWith(from)) {
      translatedUri = uri.replace(from, to);
      return false;
    }
    return true;
  });
  console.log("translateAliasedUri: ", translatedUri)
  return translatedUri;
}

export function encodeSpecialChars(path) {
  if (typeof path !== 'string') {
    return '';
  }
  return path
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/&/g, '%26');
}

export function defaultSite(sitename) {
  return sitename || process.env.DEFAULT_SITE || 'id.kb.se';
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
