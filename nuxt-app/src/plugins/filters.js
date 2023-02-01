import Vue from 'vue'

Vue.filter('fixMarcUri', (uri) => {
  const newUri = uri.replace('/marc/', '/vocab/marc:');
  return newUri;
});
