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

const vm = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
export default vm;

// router.beforeEach((to, from, next) => {
//   const isSave = vm.$store.state.isSave;
//   console.log(123);
//   console.log(to);
//   console.log(from);
//
//   if (from.name == 'chapter') {
//     if (!isSave) {
//       vm.$store.state.saveDialogVisible = true;
//     } else {
//       next()
//     }
//   } else {
//     next()
//   }
// })
