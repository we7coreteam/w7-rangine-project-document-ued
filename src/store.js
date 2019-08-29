import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    UserInfo: {}
  },
  getters: {
		UserInfo(state) {
      return state.UserInfo
    }
  },
  mutations: {
    setUserInfo(state, data) {
			state.UserInfo = data
    }
  },
  actions: {
    getUserInfo(context) {
      Axios.post('/admin/user/getuser')
      .then(res => {
        context.commit('setUserInfo', res.data.data)
      })
    }
  }
})
