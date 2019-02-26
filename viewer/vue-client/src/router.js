import Vue from 'vue';
import Router from 'vue-router';
import LandingPage from '@/views/LandingPage';
import Login from '@/views/Login';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } 
    return { x: 0, y: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: LandingPage,
    },
    {
      path: '/about',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
    {
      path: '/login/authorized',
      name: 'Authenticating',
      component: Login,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/search',
      redirect: '/search/libris',
    },
    {
      path: '/search/:perimeter?',
      name: 'Search',
      component: () => import(/* webpackChunkName: "Find" */ './views/Find.vue'),
    },
    {
      path: '/help/:section?',
      name: 'Help',
      component: () => import(/* webpackChunkName: "Help" */ './views/Help.vue'),
    },
    {
      path: '/directory-care',
      redirect: '/directory-care/holdings',
    },
    {
      path: '/directory-care/:tool?',
      name: 'Directory care',
      component: () => import(/* webpackChunkName: "UserPage" */ './views/DirectoryCare.vue'),
    },
    {
      path: '/user',
      name: 'User settings',
      component: () => import(/* webpackChunkName: "UserPage" */ './views/UserPage.vue'),
    },
    {
      path: '/create',
      name: 'Create new',
      component: () => import(/* webpackChunkName: "Create" */ './views/Create.vue'),
    },
    {
      path: '/new',
      name: 'NewDocument',
      component: () => import(/* webpackChunkName: "Inspector" */ './views/Inspector.vue'),
    },
    {
      path: '/:fnurgel',
      name: 'Inspector',
      component: () => import(/* webpackChunkName: "Inspector" */ './views/Inspector.vue'),
    },
  ],
});
