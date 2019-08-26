<template>
  <el-container class="admin-view">
    <el-header class="f-between">
      <router-link to="/admin" class="logo">
        <img src="~@/assets/img/logo.png" alt="">文档控制台
      </router-link>
      <div class="user">
        Admin
      </div>
    </el-header>
    <router-view></router-view>
    <el-footer class="w7-footer" height="14px">
      Powered by <a href="https://www.w7.cc">微擎云计算©www.w7.cc</a>
    </el-footer>
  </el-container>
</template>

<style lang="scss">
.f-between {
  justify-content:space-between;
}
</style>