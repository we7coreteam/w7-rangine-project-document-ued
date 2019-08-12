<template>
  <div>
    <h3 class="page-head">
      普通文档
    </h3>
    <div class="search-box"></div>
    <el-table :data="docList">
      <el-table-column label="名称" prop="name"></el-table-column>
      <el-table-column label="创建者" prop="username"></el-table-column>
      <!-- <el-table-column label="访问量" prop=""></el-table-column> -->
      <el-table-column label="创建时间" prop="created_at"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row">删除</el-button>
          <router-link :to="'/admin/document/' + scope.row.id" class="el-button el-button--text">编辑</router-link>
          <el-button type="text">管理设置</el-button>
          <el-button type="text">发布</el-button>
          <el-button type="text">阅读文档</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'docIndex',
  data() {
    return {
      docList: []
    }
  },
  methods: {
    getList() {
      this.$http.get('/admin/document/getlist')
        .then(res => {
          delete res.is_show
          for(let i in res) {
            this.docList.push(res[i])
          }
          // this.docList = res
        })
    }
  },
  created() {
    this.getList()
  }
}
</script>
