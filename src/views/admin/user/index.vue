<template>
  <div>
    <h3 class="page-head">
      用户管理
    </h3>
    <div class="search-box">
      <div class="demo-input-suffix">
        <el-input placeholder="请输入用户名称"  v-model="keyword" @keyup.enter.native="searchUser">
        <i slot="suffix" class="el-input__icon el-icon-search" @click="searchUser"></i>
        </el-input>
      </div>
      <div class="demo-input-btn">
        <router-link to="user/create" type="button" class="el-button el-button--primary">添加用户</router-link>
      </div>
    </div>
    <el-table class="w7-table" :data="userList" ref="multipleTable" @select="handleSelectionChange"
      :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="账号" prop="username"></el-table-column>
      <el-table-column label="添加时间" prop="created_at" sortable column-key="date">
        <template slot-scope="scope">
          <div v-if="scope.row.username != 'admin'">{{scope.row.created_at}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right">
        <template slot-scope="scope">
          <router-link :to="{path:'user/'+ scope.row.id}" class="el-button el-button--text">编辑</router-link>
          <el-button type="text" v-if="scope.row.username != 'admin'" @click="deleteRow(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="btns">
      <el-checkbox v-model="selectAll" @change="toggleSelectAll()">全选</el-checkbox>
      <el-button type="primary" @click="deleteSelectRows()">批量删除</el-button>
      <el-pagination
      background
      @current-change = "getuserlist"
      layout="prev, pager, next, total"
      prev-text="上一页"
      next-text="下一页"
      :current-page.sync = "currentPage"
      :page-count="pageCount"
    >
    </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      userList: [],//用户列表
      selectRowIDs: [],//选中多行id的集合
      selectRowID: '',//选中单行id
      currentPage: 1,//当前页码
      pageCount: 0,//总页数
      total: 0,//总数
      selectAll: false//全选反选
    }
  },
  methods: {
    searchUser() {
      this.currentPage = 1
      this.$post('/admin/user/search',{
        page: this.currentPage,
        username: this.keyword
      })
        .then(res => {
           this.userList = res.data
           this.pageCount = res.pageCount
           this.total = res.total
        })
    },
    getuserlist() {
      this.$post('/admin/user/search',{
        page: this.currentPage
      })
        .then(res => {
           this.userList = res.data
           this.pageCount = res.pageCount
           this.total = res.total
        })
    },
    handleSelectionChange(val) {
      this.selectRowIDs = []
      for (let i = 0; i < val.length; i++) {
        this.selectRowIDs.push(val[i].id)
      }
      this.selectAll = this.selectRowIDs.length == this.userList.length
    },
    toggleSelectAll() {
      if (this.userList) {
        this.userList.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row, this.selectAll)
        })
      }
    },
    deleteSelectRows() {
      this.$confirm('此操作将永久删除用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$post('/admin/user/deleteuser',{
            ids: this.selectRowID ? this.selectRowID : JSON.stringify(this.selectRowIDs).slice(1, JSON.stringify(this.selectRowIDs).length -1)
          })
            .then(() => {
              this.$message('删除成功！')
              this.getuserlist()
              this.selectRowID = ''
            })
        })
    },
    deleteRow(id) {
      this.selectRowID = id
      this.deleteSelectRows()
    }
  },
  created() {
    this.getuserlist()
  }
}
</script>

<style lang="scss" scoped>
.btns {
  margin-top: 20px;
  button {
    margin: 0 20px;
    padding: 12px 30px;
  }
  .el-pagination {
    margin-top:0;
  }
}
</style>