<template>
  <el-container class="admin-view">
    <el-header>
      <router-link to="/admin" class="logo">
        <img src="~@/assets/img/logo.png" alt="">文档控制台
      </router-link>
      <div class="menu">
        <router-link class="item" to="/admin/document" v-if="isNotRead">文档管理</router-link>
        <router-link class="item" to="/admin/user" v-if="UserInfo.has_privilege == 1 && isNotRead">用户管理</router-link>
      </div>
      <div class="user">
        {{UserInfo.username}}
        <div id="w7-nav-menu" class="menu-bar">
          <ul class="menu-ul">
            <li class="menu__item" @click="exit">退出系统</li>
          </ul>
        </div>
      </div>
    </el-header>
    <router-view></router-view>
  </el-container>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  name: 'admin',
  data() {
    return {
      isNotRead: true//false表示阅读模式，隐藏菜单
    }
  },
  methods: {
    isNotReadFnc() {//F5刷新
      this.isNotRead = this.$route.query.id ? false : true
    },
    exit() {
      this.$router.push({
        name: 'adminLogin'
      })
      //清除cookie
      var d = new Date();
      d.setTime(d.getTime() + (-1*24*60*60*1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = 'PHPSESSID' + "=" + '' + "; " + expires+"; path=/";//path=/是根路径
    }
  },
  computed: {
    ...mapGetters({UserInfo: 'UserInfo'})
  },
  watch: {
    $route(to,from){
      console.log(to.name);
      console.log(from.name);
      if(to.name == 'documentIndex' && from.name == 'homeChild') {
        this.isNotRead = true
      }else if(to.name == 'homeChild') {
        this.isNotRead = false
      }
    }
  },
  created() {
    this.$store.dispatch('getUserInfo')
    this.isNotReadFnc()
  }
}
</script>

<style lang="scss">
.page-head {
  font-size: 20px;
  font-weight: 300;
  margin: 0;
  padding: 0;
}
.admin-view {
  &>.el-header {
    .menu {
      flex: 1;
      width: 0;
      .item {
        display: inline-block;
        padding: 0 20px;
        margin: 0 6px;
        &:hover,&.active {
          color: #3296fa;
        }
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
}
</style>