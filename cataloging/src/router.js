import { createRouter, createWebHistory } from 'vue-router';
import * as StringUtil from 'lxljs/string';

// Import views
import LandingPage from '@/views/LandingPage.vue';
import Login from '@/views/Login.vue';
import store from './store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash };
    }
    return { top: 0, left: 0 };
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
      component: () => import('@/views/About.vue'),
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
      path: '/search/:perimeter',
      name: 'Search',
      component: () => import('@/views/Find.vue'),
    },
    {
      path: '/help/:section?',
      name: 'Help',
      component: () => import('@/views/Help.vue'),
    },
    {
      path: '/directory-care',
      redirect: '/directory-care/changes',
    },
    {
      path: '/directory-care/:tool',
      name: 'Directory care',
      component: () => import('@/views/DirectoryCare.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/directory-care/bulkchanges/:fnurgel',
      name: 'Bulkchanges',
      component: () => import('@/views/DirectoryCare.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/user',
      name: 'User settings',
      component: () => import('@/views/UserPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/create',
      name: 'Create new',
      component: () => import('@/views/Create.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/new',
      name: 'NewDocument',
      component: () => import('@/views/Inspector.vue'),
    },
    {
      path: '/:fnurgel',
      name: 'Inspector',
      component: () => import('@/views/Inspector.vue'),
    },
    {
      path: '/:fnurgel/:view',
      name: 'DocumentHistory',
      component: () => import('@/views/Inspector.vue'),
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
    if (to.fullPath.indexOf('login') < 0) {
      localStorage.setItem('lastPath', to.fullPath);
    }

    if (to.matched.some((record) => record.meta.requiresAuth)) {
      next({
        path: '/login/expired',
      });
    } else {
      next();
    }
  });
});

router.beforeEach((to, from, next) => {
  if (to.fullPath === '/directory-care/changes' && from.path.includes('/directory-care/changes')) {
    next({
      name: to.name,
      query: from.query,
    });
  } else {
    next();
  }
});

// Avoid going to bulkchanges/new with no template data loaded
router.beforeEach((to, from, next) => {
  if (to.fullPath === '/directory-care/bulkchanges/new' && from?.fullPath !== ('/directory-care/bulkchanges')) {
    next({
      path: '/directory-care/bulkchanges',
    });
  } else {
    next();
  }
});

export default router;
