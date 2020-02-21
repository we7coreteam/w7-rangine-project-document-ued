<template>
  <el-container class="admin-view">
    <el-header>
      <router-link :to="UserInfo.username ? '/admin' : ''" class="logo">
        <img src="~@/assets/img/logo.png" alt />文档控制台
      </router-link>
      <div class="menu">
        <router-link class="item" to="/admin/document">项目管理</router-link>
        <router-link class="item" to="/admin/user" v-if="UserInfo.acl && UserInfo.acl.has_manage">用户管理</router-link>
        <router-link class="item" to="/admin/setting" v-if="UserInfo.acl && UserInfo.acl.has_manage">系统设置</router-link>
      </div>
      <div class="user" v-if="UserInfo.username">
        <div class="username">{{UserInfo.username}}</div>
        <div id="w7-nav-menu" class="menu-bar">
          <ul class="menu-ul">
            <li class="menu__item" @click="goto">个人中心</li>
            <li class="menu__item" @click="exit">退出系统</li>
          </ul>
        </div>
      </div>
      <router-link class="item" to="/admin/login" v-if="!UserInfo.username">登录</router-link>
    </el-header>
    <router-view></router-view>
    <el-footer class="w7-footer" :class="$route.meta.footerClass" height="80px">
      Powered by<a href="https://www.w7.cc">微擎云计算©www.w7.cc</a>
    </el-footer>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'admin',
  data() {
    return {
      isNotRead: true //false表示阅读模式，隐藏菜单
    }
  },
  computed: {
    ...mapGetters({ UserInfo: 'UserInfo' })
  },
  watch: {
    $route(to, from) {
      if (to.name == 'documentIndex' && from.name == 'homeChild') {
        this.isNotRead = true
      } else if (to.name == 'homeChild') {
        this.isNotRead = false
      }
    }
  },
  created() {
    this.$store.dispatch('getUserInfo')
    this.isNotReadFnc()
  },
  methods: {
    isNotReadFnc() {
      //F5刷新
      this.isNotRead = this.$route.name == 'homeChild' ? false : true
    },
    goto() {
      this.$router.push({
        name: 'accountInfo'
      })
    },
    exit() {
      this.$post('/common/auth/logout')
        .then(() => {
          this.$router.push({
            name: 'adminLogin'
          })
          //清除cookie
          // var d = new Date()
          // d.setTime(d.getTime() + -1 * 24 * 60 * 60 * 1000)
          // var expires = 'expires=' + d.toUTCString()
          // document.cookie = 'PHPSESSID' + '=' + '' + '; ' + expires + '; path=/' //path=/是根路径
        }).catch(() => {
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-view {
  & > .el-header {
    .menu {
      flex: 1;
      width: 0;
    }
    .item {
      display: inline-block;
      padding: 0 20px;
      margin: 0 6px;
      &:hover,
      &.router-link-active {
        color: #3296fa;
      }
    }
  }
  .admin-view-aside {
    background-color: #f7f8fa;
  }
  .admin-view-menu {
    background-color: #f0f2f5;
    margin-top: 40px;
    .el-menu-item {
      height: 40px;
      line-height: 40px;
      i {
        font-size: 20px;
      }
    }
  }
  .el-main {
    padding: 30px;
  }
  .menu-bar {
    width: 120px;
  }
  .user {
    width: 120px;
    text-align: center;
    cursor: pointer;
    &:hover {
      background: #40485b;
      #w7-nav-menu {
        display: block;
      }
    }
    .username:hover {
      color: #3296fa;
    }
    #w7-nav-menu {
      display: none;
      position: absolute;
      top: 60px;
      right: 50px;
      background: #40485b;
      box-shadow: 0px 2px 10px 0px rgba(82,185,198,0.1);
      border-radius: 0;
      border: 0;
      font-size: 14px;
      color: #fff;
      text-align: center;
      ul {
        border-left: #383d41 3px solid;
        border-right: #383d41 3px solid;
        li:hover {
          color: #3296fa;
          background: #343b4e;
        }
      }
    }
  }
  .w7-footer {
    &.float {
      margin-left: 260px;
    }
  }
}
</style>