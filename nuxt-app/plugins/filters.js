import Vue from 'vue'
import envComputer from '@/plugins/env';

Vue.filter('replaceBaseWithApi', (uri) => {
  return uri.replace('https://id.kb.se', process.env.API_PATH);
});

Vue.filter('fixMarcUri', (uri) => {
  const newUri = uri.replace('/marc/', '/vocab/marc:');
  return newUri;
});
