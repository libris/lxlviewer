import Vue from 'vue'

import { translateAliasedUri } from './env';

Vue.filter('translateAliasedUri', (uri) => {
  return translateAliasedUri(uri);
});

Vue.filter('fixMarcUri', (uri) => {
  const newUri = uri.replace('/marc/', '/vocab/marc:');
  return newUri;
});
