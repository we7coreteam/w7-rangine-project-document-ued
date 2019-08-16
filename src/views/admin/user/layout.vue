<template>
  <el-container>
    <el-aside class="admin-view-aside" :width="isCollapse ? '64px' : '200px'">
      <el-menu class="admin-view-menu" :default-active="'/admin/user'" :router="true" :collapse="isCollapse">
        <el-menu-item index="/admin/document">
          <i class="el-icon-document"></i>
          <span slot="title">用户管理</span>
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