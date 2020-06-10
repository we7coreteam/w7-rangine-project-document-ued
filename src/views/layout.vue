<template>
  <el-container class="admin-view">
    <el-header :class="NavMenu.theme">
      <router-link :to="UserInfo.username ? '/admin' : ''" class="logo">
        <i class="wi wi-wendang-logo"></i>文档控制台
      </router-link>
      <template v-if="docName">
        <div class="menu-line"></div>
        <div class="menu-icon" @click="goto('admin')"><i class="wi wi-shouye"></i></div>
        <i class="el-icon-arrow-right"></i>
      </template>
      <div class="menu">
        <template v-if="!isRead && !docName">
          <router-link class="item" to="/admin/document">项目管理</router-link>
          <router-link class="item" to="/admin/user" v-if="UserInfo.acl && UserInfo.acl.has_manage">用户管理</router-link>
          <router-link class="item" to="/admin/setting" v-if="UserInfo.acl && UserInfo.acl.has_manage">系统设置</router-link>
        </template>
        <template v-else-if="!isRead && docName">
          <span class="doc-name">{{docName}}</span>
        </template>
        <template v-else>
          <a :underline="false" class="item"
            v-for="(item, index) in NavMenu.list" :key="index"
            :href="item.url" target="_blank">
            {{item.name}}
          </a>
        </template>
      </div>
      <div class="user" v-if="UserInfo.username">
        <div class="username text-over" :title="UserInfo.username">{{UserInfo.username}}</div>
        <div id="w7-nav-menu" class="menu-bar">
          <ul class="menu-ul">
            <li class="menu__item" @click="goto('accountInfo')">个人中心</li>
            <li class="menu__item" @click="exit">退出系统</li>
          </ul>
        </div>
      </div>
      <router-link class="item" to="/admin/login" v-if="!UserInfo.username">登录</router-link>
    </el-header>
    <div class="admin-content">
      <router-view></router-view>
    </div>
    <el-footer class="w7-footer" :class="$route.meta.footerClass" height="80px">
      <div class="footer-law"><p>Copyright © 2018 宿州市涛盛网络科技有限公司 www.w7.cc All Rights Reserved </p><p>网站备案：皖ICP备17004788号-1&nbsp;&nbsp;增值电信业务经营许可证：皖B2-20200003&nbsp;&nbsp;<a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=34130202000406" target="_blank"><img src="//cdn.w7.cc/new/img/icon/bei.png?imageView2/5/w/14/h/14" alt="">&nbsp;&nbsp;皖公网安备 34130202000406号</a>&nbsp;&nbsp;<a href="http://www.cyberpolice.cn" target="_blank"><img src="//cdn.w7.cc/new/img/icon/jubao.png?imageView2/5/w/14/h/14" alt="">&nbsp;&nbsp;网络违法犯罪举报网站</a></p></div>
    </el-footer>
  </el-container>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {logout} from '@/api/api'

  export default {
  name: 'admin',
  data() {
    return {
      isRead: false, //true表示阅读模式，显示自定义菜单
      docName: '',
    }
  },
  computed: {
    ...mapGetters(['UserInfo', 'NavMenu'])
  },
  watch: {
    $route(to) {
      if (to.name == 'homeChild') {
        this.isRead = true
      } else {
        this.isRead = false
        if (to.name == 'manageSetting' || to.name == 'chapter') {
          this.getDocName()
        } else {
          this.docName = ''
        }
      }
      // this.getCustomMenu()
    }
  },
  created() {
    this.$store.dispatch('getUserInfo')
    this.$store.dispatch('getNavMenu')
    this.isReadFnc()
  },
  methods: {
    isReadFnc() {//F5刷新
      if (this.$route.name == 'homeChild') {
        this.isRead = true
      }
      if (this.$route.name == 'manageSetting' || this.$route.name == 'chapter') {
        this.getDocName()
      } else {
        this.docName = ''
      }
    },
    getDocName() {
      this.$post('/admin/chapter/detail', {
        document_id: this.$route.params.id
      })
        .then(res => {
          this.docName = res.data.name
        })
    },
    goto(name) {
      this.$router.push({
        name: name
      })
    },
    exit() {
      logout().then(res => {
        alert(1);
        if (res.code == 200) {
          this.$router.push({name: 'adminLoginPage'});
        }
      })
      // window.location.href = window.location.origin + "/common/auth/logout"
    },
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
    z-index: 999;
    background-color: #fff;

    .logo {
      margin-right: 20px;
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
      #w7-nav-menu, #w7-nav-menu ul {
        background-color: #ffffff;
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
            background-color: #40485b;
            li:hover {
              color: #3296fa;
              background: #343b4e;
            }
          }
        }
      }
    }
    .menu-line {
      margin-left: 10px;
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
      cursor: pointer;
      &:hover {
        color: #ffffff;
        background-color: #3296fa;
      }
    }
    .el-icon-arrow-right {
      color: #d6d6d6;
    }
    .menu {
      flex: 1;
      width: 0;
      .doc-name {
        margin-left: 10px;
      }
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
        background-color: #fff;
        display: none;
        position: fixed;
        top: 60px;
        right: 50px;
        font-size: 14px;
        text-align: center;
        box-shadow: 0 2px 10px 0 rgba(82,185,198,.1);
        border-radius: 0;
        border: 0;
        z-index: 9999;
        border-radius: 10px;

        ul {
          margin: 0;
          padding: 7px 0;
        }
        li {
          list-style: none;
          line-height: 32px;
        }
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
  .admin-content {
    padding-top: 60px;
  }
  .w7-footer {
    padding-left: 200px;
    line-height: 30px;

    .footer-law {
      width: 100%;
      color: #616161;
      text-align: center;
      font-size: 14px;
      padding-bottom: 20px;
    }
  }
}
</style>