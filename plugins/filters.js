import Vue from 'vue'

Vue.filter('removeBaseUri', (uri) => {
  return uri.replace('https://id.kb.se/', '/');
});
Vue.filter('replaceBaseWithApi', (uri) => {
  return uri.replace('https://id.kb.se', process.env.API_PATH);
});