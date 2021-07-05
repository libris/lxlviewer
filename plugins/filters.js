import Vue from 'vue'

Vue.filter('filterBaseUri', (uri) => {
  return uri.replace('https://id.kb.se/', '/');
});