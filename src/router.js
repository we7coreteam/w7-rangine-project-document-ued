import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'adminLogin',
      component: () => import(/* webpackChunkName: "about" */ './views/admin/login.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/document',
      component: () => import(/* webpackChunkName: "about" */ './views/layout.vue'),
      children: [
        {
          path: 'document',
          name: 'documentIndex',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/document/index.vue'),
          // children: [
          //   {
          //     path: ':id',
          //     name: 'manageSetting',
          //     component: () => import(/* webpackChunkName: "about" */ './views/admin/document/manageSetting.vue')
          //   },
          //   {
          //     path: 'chapter/:id',
          //     name: 'chapter',
          //     component: () => import(/* webpackChunkName: "about" */ './views/admin/document/chapter.vue')
          //   },
          // ]
        },
        {
          path: 'document/:id',
          name: 'manageSetting',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/document/manageSetting.vue')
        },
        {
          path: 'document/chapter/:id',
          name: 'chapter',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/document/chapter.vue')
        },
        {
          path: 'user',
          name: 'userIndex',
          // redirect: 'user',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/user/index.vue'),
          // children: [
          //   {
          //     path: '',
          //     name: 'userIndex',
          //     component: () => import(/* webpackChunkName: "about" */ './views/admin/user/index.vue')
          //   },
          //   {
          //     path: 'create',
          //     name: 'baseInfo',
          //     component: () => import(/* webpackChunkName: "about" */ './views/admin/user/baseInfo.vue')
          //   },
          //   {
          //     path: ':id',
          //     name: 'baseInfoId',
          //     component: () => import(/* webpackChunkName: "about" */ './views/admin/user/baseInfo.vue')
          //   }
          // ]
        },
        {
          path: 'user/create',
          name: 'baseInfo',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/user/baseInfo.vue')
        },
        {
          path: 'user/:id',
          name: 'userInfo',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/user/baseInfo.vue')
        },
        {
          path: 'user/:id',
          name: 'baseInfoId',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/user/baseInfo.vue')
        },
        {
          path: 'setting',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/setting/layout.vue'),
          children: [
            {
              path: '',
              name: 'settingIndex',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/setting/index.vue')
            }
          ]
        },
      ]
    },
    {
      path: '/chapter/:id',
      name: 'home',
      redirect: 'home',
      component: () => import(/* webpackChunkName: "about" */ './views/layout.vue'),
      children: [
        {
          path: '',
          name: 'homeChild',
          component: () => import(/* webpackChunkName: "about" */ './views/home/index.vue')
        }
      ]
    },
    {
      path: '*',
      redirect: '/admin/document',
      // component: () => import(/* webpackChunkName: "about" */ './views/admin/layout.vue')
    }
  ]
})
