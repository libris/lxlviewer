import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import Find from '@/components/Find'
import Inspector from '@/components/Inspector'
import About from '@/components/About'
import UserPage from '@/components/UserPage'

Vue.use(Router)

export default new Router({
  mode: "history",
  routes: [
    {
      path: '/',
      name: 'Home',
      component: LandingPage
    },
    {
      path: '/search/remote/:query?',
      name: 'SearchRemote',
      component: Find
    },
    {
      path: '/search/libris/:query?',
      name: 'SearchLibris',
      component: Find
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/user',
      name: 'User',
      component: UserPage
    },
    {
      path: '/:fnurgel',
      name: 'Inspector',
      component: Inspector
    },
  ]
})
