import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import Find from '@/components/Find'
import Inspector from '@/components/Inspector'

Vue.use(Router)

export default new Router({
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
      path: '/:fnurgel',
      name: 'Inspector',
      component: Inspector
    }
  ]
})
