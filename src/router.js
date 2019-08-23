import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/admin/login',
      name: 'adminLogin',
      component: () => import(/* webpackChunkName: "about" */ './views/admin/login.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/document',
      component: () => import(/* webpackChunkName: "about" */ './views/admin/layout.vue'),
      children: [
        {
          path: 'document',
          name: 'document',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/document/layout.vue'),
          children: [
            {
              path: '',
              name: 'documentIndex',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/index.vue')
            },
            {
              path: ':id',
              name: 'manageSetting',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/manageSetting.vue')
            },
            {
              path: 'chapter/:id',
              name: 'chapter',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/chapter.vue')
            }
          ]
        },
        {
          path: 'user',
          name: 'user',
          redirect: 'user',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/user/layout.vue'),
          children: [
            {
              path: '',
              name: 'userIndex',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/user/index.vue')
            },
            {
              path: 'create',
              name: 'baseInfo',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/user/baseInfo.vue')
            },
            {
              path: ':id',
              name: 'baseInfoId',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/user/baseInfo.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/:id',
      name: 'home',
      component: () => import(/* webpackChunkName: "about" */ './views/home/index.vue')
    },
  ]
})
