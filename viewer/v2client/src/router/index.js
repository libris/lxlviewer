import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import Find from '@/components/Find'
import Inspector from '@/components/Inspector'
import About from '@/components/About'
import Help from '@/components/Help'
import UserPage from '@/components/UserPage'
import Create from '@/components/Create'
import Login from '@/components/Login'
import NotFound from '@/components/NotFound'

Vue.use(Router)

export default new Router({
  mode: "history",
  base: "/katalogisering/",
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: LandingPage
    },
    {
      path: '/login/authorized',
      name: 'Authenticating',
      component: Login
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/search',
      redirect: '/search/libris'
    },
    {
      path: '/search/:perimeter/:query?',
      name: 'Search',
      component: Find
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/help/:section?',
      name: 'Help',
      component: Help
    },
    {
      path: '/user',
      name: 'User',
      component: UserPage
    },
    {
      path: '/create',
      name: 'Create',
      component: Create
    },
    {
      path: '/new',
      name: 'NewDocument',
      component: Inspector
    },
    {
      path: '/:fnurgel',
      name: 'Inspector',
      component: Inspector
    }
  ]
})
