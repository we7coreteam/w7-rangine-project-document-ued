import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './utils/axios'
import ElementUI from 'element-ui';
import mavonEditor from 'mavon-editor'
import VueClipboard from 'vue-clipboard2'
import 'element-ui/lib/theme-chalk/index.css'
import 'mavon-editor/dist/css/index.css'
import './assets/scss/element-variables.scss'

Vue.use(ElementUI)
Vue.use(mavonEditor)
Vue.use(VueClipboard)

Vue.prototype.$http = axios;
Vue.prototype.$post = axios.post;
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
