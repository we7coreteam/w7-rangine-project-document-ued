<template>
  <el-container>
    <el-aside class="admin-view-aside" :width="isCollapse ? '64px' : '200px'">
      <el-menu class="admin-view-menu" :default-active="'/admin/user'" :router="true" :collapse="isCollapse">
        <el-menu-item index="/admin/user">
          <i class="el-icon-document"></i>
          <span slot="title">用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer class="w7-footer" height="14px">
        Powered by <a href="https://www.w7.cc">微擎云计算©www.w7.cc</a>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false
    }
  }
}
</script>