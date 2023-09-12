import { createApp } from 'vue'

import PortalVue from 'portal-vue';
import FloatingVue from 'floating-vue';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import { createPinia } from 'pinia';
import router from './router';

import App from './App.vue'

import '@/utils/icons';
import 'floating-vue/dist/style.css'

const app = createApp(App)

app.use(createPinia());
app.use(PortalVue);
app.use(FloatingVue);
app.use(router);

app.component('font-awesome-icon', FontAwesomeIcon);
app.component('font-awesome-layers', FontAwesomeLayers);

// Mount app
app.mount('#app');