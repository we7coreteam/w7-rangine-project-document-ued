<template>
  <el-container class="layout-container admin-setting">
    <el-aside class="admin-view-aside" :width="isCollapse ? '64px' : '240px'">
      <el-menu class="admin-view-menu"
        :default-active="active"
        :router="true"
        :collapse="isCollapse">
        <el-menu-item index="/admin/setting">
          <i class="wi wi-cunchushebei"></i>
          <span slot="title">存储设置</span>
        </el-menu-item>
        <el-submenu index="1">
          <template slot="title">
            <i class="wi wi-system-login-settings"></i>
            <span>第三方登录设置</span>
          </template>
          <template v-for="(menu, index) in thirdPartyLoginMenu">
            <el-menu-item :index="'/admin/setting/third-party?id='+ menu.id" :key="index">
              <span class="menu-name">{{menu.name}}授权配置</span>
            </el-menu-item>
          </template>
          <el-menu-item index="/admin/setting/third-party-custom">自定义授权配置</el-menu-item>
        </el-submenu>
        <el-menu-item index="/admin/setting/login">
          <i class="wi wi-system-login-settings"></i>
          <span slot="title">登录设置</span>
        </el-menu-item>
        <el-menu-item index="/admin/setting/nav">
          <i class="wi wi-wi-system-nav-settings"></i>
          <span slot="title">导航设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view @refreshMenu="refreshMenu"></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      active: '/admin/setting',
      isCollapse: false,
      thirdPartyLoginMenu: []
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.active = to.path
    })
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$post('/admin/third-party-login/all')
        .then(res => {
          this.thirdPartyLoginMenu = res
        })
    },
    refreshMenu(bool) {
      if (bool) {
        this.init()
      }
    }
  }
}
</script>

<style lang="scss">
.admin-setting {
  .el-menu-item {
    .menu-name {
      display: inline-block;
      max-width: 130px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .el-main {
    padding: 0 25px 0 15px;
  }
}
</style>