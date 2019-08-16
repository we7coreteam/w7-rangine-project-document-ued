import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './utils/axios'
import { Form, FormItem } from 'element-ui'
import { Tabs, TabPane } from 'element-ui'
import { Input } from 'element-ui'
import { Button, Link } from 'element-ui'
import { Icon } from 'element-ui'
import { Message } from 'element-ui'
import { Container, Aside, Main, Header, Menu, MenuItem, MenuItemGroup } from 'element-ui'
import { Table, TableColumn } from 'element-ui'
import { Tree } from 'element-ui'
import { Pagination } from 'element-ui'
import { Dialog } from 'element-ui'
import './assets/scss/element-variables.scss'
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Input)
Vue.use(Icon)
Vue.use(Button)
Vue.use(Link)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Header)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Tree)
Vue.use(Pagination)
Vue.use(Dialog)

Vue.prototype.$message = Message;
Vue.prototype.$http = axios;
Vue.prototype.$post = axios.post;
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
