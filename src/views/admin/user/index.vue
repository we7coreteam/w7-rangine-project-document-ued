<template>
  <div>
    <h3 class="page-head">
      用户管理
    </h3>
    <div class="search-box">
      <div class="demo-input-suffix">
        <el-input placeholder="请输入用户名称"  v-model="keyword">
        <i slot="suffix" class="el-input__icon el-icon-search" @click="searchUser"></i>
        </el-input>
      </div>
      <div class="demo-input-btn">
        <router-link to="user/create" type="button" class="el-button el-button--primary">添加用户</router-link>
      </div>
    </div>
    <el-table class="w7-table" :data="userList" ref="multipleTable" @selection-change="handleSelectionChange"
      :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="账号" prop="username"></el-table-column>
      <el-table-column label="添加时间" prop="created_at"
        sortable
        column-key="date"
      >
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <router-link :to="{path:'user/'+ scope.row.id}" class="el-button el-button--text">编辑</router-link>
          <el-button type="text" @click="deleteRow(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
      <el-button class="fl" @click="toggleSelectAll()">全选</el-button>
      <el-button class="fl" @click="deleteSelectRows()">批量删除</el-button>
      <el-pagination class="fr"
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
      selectFlag: true//全选反选
    }
  },
  methods: {
    searchUser() {
      this.currentPage = 1
      this.$post('/admin/user/searchuser',{
        page: this.currentPage,
        keywords: this.keyword
      })
        .then(res => {
           this.userList = res.data
           this.pageCount = res.pageCount
           this.total = res.total
        })
    },
    getuserlist() {
      this.$post('/admin/user/getuserlist',{
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
    },
    toggleSelectAll() {
      if (this.userList) {
        this.userList.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row, this.selectFlag)
        })
        this.selectFlag = !this.selectFlag
      }
    },
    deleteSelectRows() {
      this.$confirm('此操作将永久删除用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$post('/admin/user/deluser',{
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
    }
  },
  created() {
    this.getuserlist()
  }
}
</script>

<style lang="scss" scoped>
.w7-table /deep/ .el-table__header thead tr th:nth-last-child(2) > .cell {
  text-align: left !important;
}
</style>