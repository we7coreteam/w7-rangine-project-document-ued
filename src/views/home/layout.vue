<template>
  <el-container class="admin-view">
    <el-header class="f-between">
      <router-link to="/admin" class="logo">
        <img src="~@/assets/img/logo.png" alt="">文档控制台
      </router-link>
      <div class="user">
        {{userInfo.username}}
        <div id="w7-nav-menu" class="menu-bar">
          <ul class="menu-ul">
            <li class="menu__item" @click="exit">退出系统</li>
          </ul>
        </div>
      </div>
    </el-header>
    <router-view></router-view>
    <el-footer class="w7-footer" height="14px">
      Powered by <a href="https://www.w7.cc">微擎云计算©www.w7.cc</a>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  name: 'admin',
  data() {
    return {
      userInfo: ''
    }
  },
  methods: {
    getUserInfo() {
      this.$post('/admin/user/getuser')
        .then(res => {
          this.userInfo = res
        })
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
  created() {
    this.getUserInfo()
  }
}
</script>

<style lang="scss">
.f-between {
  justify-content:space-between;
}
</style>