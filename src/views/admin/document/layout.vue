<template>
  <el-container>
    <el-aside class="admin-view-aside" :width="isCollapse ? '65px' : '200px'">
      <el-menu class="admin-view-menu" :default-active="'/admin/document'" :router="true" :collapse="isCollapse">
        <el-menu-item index="/admin/document">
          <i class="el-icon-document"></i>
          <span slot="title">文档管理</span>
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
  },
  methods: {
    setIsCollapse() {
      this.isCollapse = this.$route.name === 'chapter' ? true : false
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.isCollapse = to.name === 'chapter' ? true : false
    })
  },
  watch: {
    "$route": "setIsCollapse"
  }
}
</script>
