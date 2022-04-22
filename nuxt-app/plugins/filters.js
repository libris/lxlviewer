import Vue from 'vue'

Vue.filter('replaceBaseWithApi', (uri) => {
  return uri.replace('https://id.kb.se', process.env.API_PATH);
});

Vue.filter('fixMarcUri', (uri) => {
  const newUri = uri.replace('/marc/', '/vocab/marc:');
  return newUri;
});
