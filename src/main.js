import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './utils/fetch'
import ElementUI from 'element-ui';
import mavonEditor from 'mavon-editor'
import VueClipboard from 'vue-clipboard2'
import 'element-ui/lib/theme-chalk/index.css'
import 'mavon-editor/dist/css/index.css'
import './assets/scss/element-variables.scss'

let Mock = require('mockjs')
Vue.use(ElementUI)
Vue.use(mavonEditor)
Vue.use(VueClipboard)

Vue.prototype.$http = axios;
Vue.prototype.$post = axios.post;
Vue.prototype.$mock = Mock;
Vue.config.productionTip = false;

const vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

export default vm;

router.beforeEach((to, from, next) => {
  // console.log(to);
  // console.log(from);
  if (to.name == 'adminLoginPage') {
    const recordHref = location.href;
    localStorage.recordHref = recordHref;
  }
  next();
  // setTimeout(() => {
  //   const recordHref = location.href;
  //   console.log(recordHref);
  //   if(recordHref.indexOf('admin-login') == -1) {
  //     localStorage.recordHref = recordHref;
  //   }
  // }, 500);
})