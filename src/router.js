import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import I18n from './views/I18n.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/i18n',
      name: 'i18n',
      component: () => import(/* webpackChunkName: "about" */ './views/I18n.vue')
    }
  ]
})
