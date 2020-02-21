<template>
  <el-container class="admin-view">
    <el-header :class="theme">
      <router-link :to="UserInfo.username ? '/admin' : ''" class="logo">
        <i class="wi wi-wendang-logo"></i>文档控制台
      </router-link>
      <div class="menu-line"></div>
      <div class="menu-icon"><i class="wi wi-shouye"></i></div>
      <i class="el-icon-arrow-right"></i>
      <div class="menu">
        <template v-if="!isRead">
          <router-link class="item" to="/admin/document">项目管理</router-link>
          <router-link class="item" to="/admin/user" v-if="UserInfo.acl && UserInfo.acl.has_manage">用户管理</router-link>
          <router-link class="item" to="/admin/setting" v-if="UserInfo.acl && UserInfo.acl.has_manage">系统设置</router-link>
          </template>
        <template v-else>
          <a :underline="false" class="item"
            v-for="(item, index) in menuList" :key="index"
            :href="item.url" target="_blank">
            {{item.name}}
          </a>
        </template>
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
    <div style="padding-top: 60px;">
      <router-view></router-view>
    </div>
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
      isRead: false, //true表示阅读模式，显示自定义菜单
      theme: '',
      menuList: []
    }
  },
  computed: {
    ...mapGetters({ UserInfo: 'UserInfo' })
  },
  watch: {
    $route(to, from) {
      // if (to.name == 'documentIndex' && from.name == 'homeChild') {
      //   this.isRead = false
      // }
      if (to.name == 'homeChild') {
        this.isRead = true
      } else {
        this.isRead = false
      }
      this.getCustomMenu()
    }
  },
  created() {
    this.$store.dispatch('getUserInfo')
    this.isReadFnc()
  },
  methods: {
    isReadFnc() {//F5刷新
      if (this.$route.name == 'homeChild') {
        this.isRead = true
      }
      this.getCustomMenu()
    },
    getCustomMenu() {
      this.$post('/menu/setting')
        .then(res => {
          this.theme = res.theme
          this.menuList = res.list
        })
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
  &>.el-header {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding: 0 50px;
    font-size: 14px;
    z-index: 9999;
    .logo {
      display: flex;
      font-size: 24px;
      .wi {
        font-size: 30px;
        padding-right: 20px;
      }
    }
    &.white {
      color: #4d4d4d;
      background-color: #ffffff;
      border-bottom: 1px solid #e5e5e5;
      .logo .wi {
        color: #3296fa;
      }
    }
    &.black {
      color: #fff;
      background-color: #383d41;
      .logo .wi{
        color: #f7f8fa;
      }
      .user {
        &:hover {
          background: #40485b;
        }
        #w7-nav-menu {
          color: #fff;
          background: #40485b;
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
    }
    .menu-line {
      margin-left: 30px;
      margin-right: 28px;
      width: 1px;
      height: 24px;
      background-color: #e5e5e5;
    }
    .menu-icon {
      margin-right: 10px;
      width: 24px;
      height: 24px;
      line-height: 24px;
      color: #999999;
      background-color: #f2f3f5;
      text-align: center;
      border-radius: 4px;
    }
    .el-icon-arrow-right {
      color: #d6d6d6;
    }
    .menu {
      flex: 1;
      width: 0;
    }
    .item {
      display: inline-block;
      padding: 0 20px;
      margin: 0 6px;
      &:hover, &.router-link-active {
        color: #3296fa;
      }
    }
    .user {
      width: 120px;
      line-height: 60px;
      text-align: center;
      cursor: pointer;
      &:hover {
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
        font-size: 14px;
        text-align: center;
        box-shadow: 0px 2px 10px 0px rgba(82,185,198,0.1);
        border-radius: 0;
        border: 0;
        z-index: 9;
        ul li:hover {
          color: #3296fa;
        }
      }
    }
  }
}
.admin-view {
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
  .w7-footer {
    &.float {
      margin-left: 260px;
    }
  }
}
</style>