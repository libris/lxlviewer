import { createApp } from 'vue';
import PortalVue from 'portal-vue';
import { VTooltip, Dropdown } from 'floating-vue'
import 'floating-vue/dist/style.css';
import VueClipboard from 'vue-clipboard2'
import store from './store';
import router from './router';
import moment from 'moment';
import 'moment/locale/sv';
import App from './App.vue';
import EntitySummary from './components/shared/entity-summary.vue';
import Field from './components/inspector/field.vue';

const app = createApp(App);

app.use(store);
app.use(PortalVue);
app.directive('tooltip', VTooltip);
app.component('VDropdown', Dropdown);
app.use(router);
app.use(VueClipboard);

// TODO: Replace Moment with date-fns or similar as momentjs is seen as legacy
moment.locale('sv');
app.config.globalProperties.$moment = moment;

app.component('entity-summary', EntitySummary).component('field', Field);

// Mount app
app.mount('#app');
