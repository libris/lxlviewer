import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import Find from '@/components/Find'
import Inspector from '@/components/Inspector'
import About from '@/components/About'
import Help from '@/components/Help'
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
      path: '/help',
      name: 'Help',
      component: Help
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
