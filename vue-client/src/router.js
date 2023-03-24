import Vue from 'vue';
import { createRouter, createWebHistory } from 'vue-router'
import * as StringUtil from 'lxljs/string';
import LandingPage from '@/views/LandingPage';
import Login from '@/views/Login';
import store from './store';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
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
      path: '/login/:state?',
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
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/user',
      name: 'User settings',
      component: () => import(/* webpackChunkName: "UserPage" */ './views/UserPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/create',
      name: 'Create new',
      component: () => import(/* webpackChunkName: "Create" */ './views/Create.vue'),
      meta: {
        requiresAuth: true,
      },
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
    {
      path: '/:fnurgel/:view',
      name: 'DocumentHistory',
      component: () => import(/* webpackChunkName: "Inspector" */ './views/Inspector.vue'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  // Remove trailing slashes from route path (if any)
  if (to.fullPath.length > 1 && to.fullPath.substring(to.fullPath.length - 1, to.fullPath.length) === '/') {
    next({
      path: to.fullPath.slice(0, -1),
    });
  }

  next();
});

router.beforeEach((to, from, next) => {
  const newToken = StringUtil.getParamValueFromUrl(to.hash, 'access_token');
  if (newToken) {
    localStorage.setItem('at', newToken);
  }

  store.dispatch('verifyUser').then(() => {
    // authed
    next();
  }, () => {
    // notAuthed
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (to.fullPath.indexOf('login') < 0) {
        localStorage.setItem('lastPath', to.fullPath);
      }

      next({
        path: '/login/expired',
      });
    } else {
      next();
    }
  });
});

export default router;
