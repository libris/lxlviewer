import { each, findKey } from "lodash-es";

export function hostPath(site, siteAlias, siteConfig) {
  const baseUri = siteConfig[site]['baseUri'];
  return translateAliasedUri(baseUri, siteAlias);
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
  return translatedUri;
}

export function encodeSpecialChars(path) {
  if (typeof path !== 'string') {
    return '';
  }
  return path
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/&/g, '%26')
    .replace(/,/g, '%2C');
}

export function activeSite(xForwardedHost, siteAlias, siteConfig, defaultSite) {
  if (!xForwardedHost) {
    return defaultSite;
  }

  return findKey(siteConfig, c => xForwardedHost.startsWith(host(translateAliasedUri(c.baseUri, siteAlias)))) || defaultSite;
}

function host(url) {
  return new URL(url).host;
}
