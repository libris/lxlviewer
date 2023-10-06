import { createApp } from 'vue'

import PortalVue from 'portal-vue';
import FloatingVue from 'floating-vue';
import { createPinia } from 'pinia';
import router from './router';

import App from './App.vue'
import EntitySummary from './components/shared/entity-summary.vue';
import Field from './components/inspector/field.vue';

import 'floating-vue/dist/style.css'

const app = createApp(App);

app.use(createPinia());
app.use(PortalVue);
app.use(FloatingVue);
app.use(router);

app.component('entity-summary', EntitySummary).component('field', Field);

// Mount app
app.mount('#app');