import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import * as StringUtil from 'lxljs/string';

import LandingPage from '../views/LandingPage.vue';
import Login from '../views/Login.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
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
			component: () => import('../views/About.vue'),
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
			component: () => import('../views/Find.vue'),
		},
		{
			path: '/help/:section?',
			name: 'Help',
			component: () => import('../views/Help.vue'),
		},
		{
			path: '/directory-care',
			redirect: '/directory-care/holdings',
		},
		{
			path: '/directory-care/:tool?',
			name: 'Directory care',
			component: () => import('../views/DirectoryCare.vue'),
			meta: {
				requiresAuth: true,
			},
		},
		{
			path: '/user',
			name: 'User settings',
			component: () => import('../views/UserPage.vue'),
			meta: {
				requiresAuth: true,
			},
		},
		{
			path: '/create',
			name: 'Create new',
			component: () => import('../views/Create.vue'),
			meta: {
				requiresAuth: true,
			},
		},
		{
			path: '/new',
			name: 'NewDocument',
			component: () => import('../views/Inspector.vue'),
		},
		{
			path: '/:fnurgel',
			name: 'Inspector',
			component: () => import('../views/Inspector.vue'),
		},
		{
			path: '/:fnurgel/:view',
			name: 'DocumentHistory',
			component: () => import('../views/Inspector.vue'),
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

// TODO: Fix this router middleware
router.beforeEach((to, from, next) => {
	console.log('is working?', to, from);
	const userStore = useUserStore();
	const newToken = StringUtil.getParamValueFromUrl(to.hash, 'access_token');
	if (newToken) {
		localStorage.setItem('at', newToken);
	}

	userStore.verifyUser().then(() => {
		// authed
		next();
	}, () => {
		// Not authed
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