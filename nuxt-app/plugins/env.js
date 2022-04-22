import {each} from "lodash-es";

export function hostPath() {
  const baseUri = siteConfig()['id']['baseUri'];
  return translateAliasedUri(baseUri);
}

export function siteConfig() {
  return JSON.parse(process.env.SITE_CONFIG);
}

export function translateAliasedUri(uri) {
  if (typeof uri == 'undefined' || uri.length === 0) {
    return null;
  }
  let translatedUri = uri
  each(JSON.parse(process.env.SITE_ALIAS || '{}'), (from, to) => {
    if (uri.startsWith(from)) {
      translatedUri = uri.replace(from, to);
      return false;
    }
    return true;
  });
  return translatedUri;
}
