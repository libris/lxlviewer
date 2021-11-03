import Vue from 'vue'
import envComputer from '@/plugins/env';

Vue.filter('translateUriEnv', (uri) => {
  return uri.replace('https://id.kb.se', envComputer(process.env.ENV));
});

Vue.filter('removeBaseUri', (uri) => {
  const envHost = envComputer(process.env.ENV);
  if (uri.includes(envHost)) {
    return uri.replace(envHost, '/');
  }
  return uri.replace('https://id.kb.se/', '/');
});
Vue.filter('replaceBaseWithApi', (uri) => {
  return uri.replace('https://id.kb.se', process.env.API_PATH);
});

Vue.filter('fixMarcUri', (uri) => {
  const newUri = uri.replace('/marc/', '/vocab/marc:');
  return newUri;
});
