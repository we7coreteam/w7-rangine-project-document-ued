<template>
  <el-container class="admin-view">
    <el-header>
      <router-link to="/admin" class="logo">
        <img src="" alt="">文档控制台
      </router-link>
      <div class="menu">
        <router-link class="item" to="/admin/document">文档管理</router-link>
        <router-link class="item" to="/admin/document">用户管理</router-link>
      </div>
      <div class="user">
        Admin
      </div>
    </el-header>
    <router-view></router-view>
  </el-container>
</template>

<script>
export default {
  name: 'admin',
  data() {
    return {}
  },
  methods: {
    getUserInfo() {
      this.$post()
    }
  },
  created() {
    if(!window.localStorage.getItem('document_access_token')) {
      this.$router.push('/admin/login')
    }
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
    background-color: #383d41;
    color: #fff;
    line-height: 60px;
    font-size: 16px;
    display: flex;
    padding: 0 50px;
    .logo {
      font-size: 24px;
      color: #f7f8fa;
      margin-right: 20px;
    }
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
    min-height: calc(100vh - 60px);
    padding: 30px;
  }
}
</style>
