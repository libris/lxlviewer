import { createApp } from 'vue'

import PortalVue from 'portal-vue';
import FloatingVue from 'floating-vue';
import { createPinia } from 'pinia';
import router from './router';

import App from './App.vue'

import 'floating-vue/dist/style.css'
// import './styles/main.scss';

const app = createApp(App)

app.use(createPinia());
app.use(PortalVue);
app.use(FloatingVue);
app.use(router);

// Mount app
app.mount('#app');