import Vue from 'vue'
import Router from 'vue-router'
import LandingPage from '@/components/LandingPage'
import FindTest from '@/components/FindTest'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage
    },
    {
      path: '/FindTest',
      name: 'FindTest',
      component: FindTest
    }
  ]
})
