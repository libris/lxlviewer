import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import Find from '@/components/Find'
import Inspector from '@/components/Inspector'
import About from '@/components/About'

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
      path: '/search/:query?',
      name: 'Search',
      component: Find
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/:fnurgel',
      name: 'Inspector',
      component: Inspector
    },
  ]
})
