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
      path: '/admin-login',
      name: 'adminLoginPage',
      component: () => import(/* webpackChunkName: "about" */ './views/admin/adminLogin.vue')
    },
    {
      path: '/bind',
      name: 'adminBind',
      component: () => import(/* webpackChunkName: "about" */ './views/admin/bind.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/document',
      component: () => import(/* webpackChunkName: "about" */ './views/layout.vue'),
      children: [
        {
          path: 'document',
          name: 'documentLayout',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/document/layout.vue'),
          children: [
            {
              path: '',
              name: 'documentIndex',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/manage.vue'),
            },
            {
              path: 'chapter/:id',
              name: 'chapter',
              meta:{
                footerClass: 'float'
              },
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/chapter.vue')
            },
            {
              path: 'recycle',
              name: 'documentRecycle',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/recycle.vue'),
            },
            {
              path: 'star',
              name: 'documentStar',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/star.vue'),
            },
            {
              path: 'history',
              name: 'documentHistory',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/history.vue'),
            },
            {
              path: 'involved',
              name: 'documentInvolved',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/document/involved.vue'),
            }
          ]
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
            },
            {
              path: 'third-party',
              name: 'settingThirdParty',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/setting/thirdParty.vue')
            },
            {
              path: 'third-party-custom',
              name: 'settingThirdPartyCustom',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/setting/thirdPartyCustom.vue')
            },
            {
              path: 'login',
              name: 'settingLogin',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/setting/login.vue')
            },
            {
              path: 'nav',
              name: 'settingNav',
              component: () => import(/* webpackChunkName: "about" */ './views/admin/setting/navigation.vue')
            }
          ]
        },
        {
          path: 'account-info',
          name: 'accountInfo',
          component: () => import(/* webpackChunkName: "about" */ './views/admin/accountInfo.vue')
        }
      ]
    },
    // {
    //   path: '/chapter/:id',
    //   name: 'home',
    //   redirect: 'home',
    //   component: () => import(/* webpackChunkName: "about" */ './views/home/layout.vue'),
    //   children: [
    //     {
    //       path: '',
    //       name: 'homeChild',
    //       component: () => import(/* webpackChunkName: "about" */ './views/home/index.vue')
    //     }
    //   ]
    // },
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
  ],
  scrollBehavior: (to) => {
    if (to.hash) {
      return {
        // 通过 to.hash 的值來找到对应的元素
        selector: to.hash
      }
    } else {
      return {
        x: 0,
        y: 0
      }
    }
  }
})
