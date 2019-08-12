import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/:id',
      name: 'home',
      component: () => import(/* webpackChunkName: "about" */ './views/home/index.vue')
    },
    {
      path: '/admin/login',
      name: 'adminLogin',
      component: () => import(/* webpackChunkName: "about" */ './views/admin/login.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import(/* webpackChunkName: "about" */ './views/admin/layout.vue'),
      children: [
        {
          path: 'document',
          name: 'document',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/document/layout.vue'),
          redirect: 'document',
          children: [
            {
              path: '',
              name: 'documentIndex',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/index.vue'),
            },
            {
              path: ':id',
              name: 'documentIndex',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/chapter.vue'),
            }
          ]
        }
      ]
    }
  ]
})
