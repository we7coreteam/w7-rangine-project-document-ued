import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    UserInfo: {},
    NavMenu: {}
  },
  getters: {
    UserInfo(state) {
      return state.UserInfo
    },
    NavMenu(state) {
      return state.NavMenu
    }
  },
  mutations: {
    setUserInfo(state, data) {
      state.UserInfo = data
    },
    setNavMenu(state, data) {
      state.NavMenu = data
    }
  },
  actions: {
    getUserInfo(context) {
      Axios.post('/common/auth/user')
        .then(res => {
          if (res.data.code == '444') {
            context.commit('setUserInfo', {
              has_privilege: '',
              username: ''
            })
          } else {
            context.commit('setUserInfo', res.data.data)
          }
        })
    },
    getNavMenu(context) {
      Axios.post('/menu/setting')
        .then(res => {
          console.log(111)
          if (res.data.code == '444') {
            context.commit('setNavMenu', {
              theme: '',
              list: []
            })
          } else {
            context.commit('setNavMenu', res.data.data)
          }
        })
    }
  }
})
