<template>
  <el-container class="setting">
    <el-aside class="admin-view-aside" :width="isCollapse ? '64px' : '200px'">
      <el-menu
        class="admin-view-menu"
        :default-active="'/admin/setting'"
        :router="true"
        :collapse="isCollapse"
      >
        <el-menu-item index="/admin/setting">
          <i class="el-icon-document"></i>
          <span slot="title">存储设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
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

<style lang="scss">
.setting {
  height: calc(100vh - 90px);
  .admin-view-aside {
    border-right: solid 1px #e6e6e6;
    .el-menu {
      border-right: 0;
    }
  }
}
</style>