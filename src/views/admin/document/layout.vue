<template>
  <el-container>
    <el-aside class="admin-view-aside" :width="isCollapse ? '65px' : '240px'">
      <el-menu class="admin-view-menu" :default-active="active" :router="true" :collapse="isCollapse">
        <el-menu-item index="/admin/document">
          <i class="wi wi-folder"></i>
          <span slot="title">我的文档管理</span>
        </el-menu-item>
        <div class="line"></div>
        <el-menu-item index="/admin/document/star">
          <i class="wi wi-star"></i>
          <span slot="title">我的星标</span>
        </el-menu-item>
        <el-menu-item index="/admin/document/history">
          <i class="wi wi-waiting"></i>
          <span slot="title">历史查看</span>
        </el-menu-item>
        <el-menu-item index="/admin/document/involved">
          <i class="wi wi-wocanyude"></i>
          <span slot="title">我参与的</span>
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
      active: '/admin/document',
      isCollapse: false
    }
  },
  // methods: {
  //   setIsCollapse() {
  //     this.isCollapse = this.$route.name === 'chapter' ? true : false
  //   }
  // },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.active = to.path
    })
  },
  // watch: {
  //   "$route": "setIsCollapse"
  // }
}
</script>

<style lang="scss" scoped>
.el-menu {
  margin: 25px 20px;
  border-right: 0;
  .el-menu-item {
    margin: 10px 0;
    height: 40px;
    line-height: 40px;
    &.is-active {
      color: #4096f9;
      background-color: #e6f2ff;
      border-radius: 4px;
    }
    i {
      margin-right: 20px;
      font-size: 18px;
    }
  }
}
.line {
  margin: 18px 0;
  height: 1px;
	background-color: #f7f9fc;
}
.el-main {
  padding: 0 40px 0 0;
}
</style>
