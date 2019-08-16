<template>
  <div>
    <h3 class="page-head">
      普通文档
    </h3>
    <div class="search-box">
      <div class="fl demo-input-suffix">
        <el-input
          placeholder="请输入关键字搜索"
          v-model="keyword"
         >
          <i slot="suffix" class="el-input__icon el-icon-search" @click="searchDoc"></i>
        </el-input>
      </div>
      <div class="fr">
        <el-button type="primary" @click="dialogDocInfoVisible = true">创建文档</el-button>
      </div>
    </div>
    <el-table :data="docList">
      <el-table-column label="名称" prop="name"></el-table-column>
      <el-table-column label="创建者" prop="username"></el-table-column>
      <!-- <el-table-column label="访问量" prop=""></el-table-column> -->
      <el-table-column label="创建时间" prop="created_at"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.has_creator != 3 ? true : false">删除</el-button>
          <router-link
            :to="{path: 'document/'+ scope.row.id}"
            class="el-button el-button--text">编辑</router-link>
          <router-link
            :to="{path: 'document/'+ scope.row.id}"
            class="el-button el-button--text" v-if="scope.row.has_creator != 3 ? true : false">
            管理设置
          </router-link>
          <el-button type="text" v-if="scope.row.has_creator != 3 ? true : false">发布</el-button>
          <el-button type="text">阅读文档</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      @current-change = "getList"
      layout="prev, pager, next, total"
      :current-page.sync = "currentPage"
      :page-count="pageCount"
    >
    </el-pagination>
    <!-- 基本信息弹出框 -->
    <el-dialog title="创建文档" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false" center>
      <el-form>
        <el-form-item label="文档名称" :label-width="formLabelWidth">
          <el-input v-model="name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="文档介绍" :label-width="formLabelWidth">
          <el-input type="textarea" :rows="2" v-model="description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createDoc">确 定</el-button>
        <el-button @click="dialogDocInfoVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'docIndex',
  data() {
    return {
      keyword: '',
      docList: [],
      currentPage: 1,//当前页码
      pageCount: 0,//总页数
      total: 0,//总数
      name: '',
      description: '',
      dialogDocInfoVisible: false,//创建文档弹弹出框
      formLabelWidth: '120px'
    }
  },
  methods: {
    getList() {
      this.$post('/admin/document/getlist',{
        page: this.currentPage,
        keyword: this.keyword
      })
        .then(res => {
           this.docList = res.data
           this.pageCount = res.pageCount
           this.total = res.total
        })
    },
    searchDoc() {
      this.$post('/admin/document/search',{
        name: this.keyword
      })
        .then(res => {
           this.docList = res.data
           this.pageCount = res.pageCount
           this.total = res.total
        })
    },
    createDoc() {
      this.$post('/admin/document/create', {
        name: this.name,
        description: this.description
      })
        .then(() => {
          this.$message('创建成功！')
          this.dialogDocInfoVisible = false
          this.getList()
        })
    }
  },
  created() {
    this.getList()
  }
}
</script>
<style lang="scss" scoped>
.demo-input-suffix {
  width: 240px;
}
.el-pagination {
  float:right;
  margin-right: 20px;
}
</style>