<template>
  <div class="layout-container container">
    <div class="page-head">用户管理</div>
    <div class="search-box">
      <div class="search-box-input">
        <el-input v-model="keyword" class="demo-input-suffix" placeholder="请输入用户名称" clearable @keyup.enter.native="search">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
        </el-input>
      </div>
      <div class="demo-input-btn">
        <router-link to="user/create" type="button" class="el-button el-button--primary we7-button-normal">创建用户</router-link>
      </div>
    </div>
    <el-table class="w7-table" :data="userList" ref="multipleTable"
      :header-cell-style="{background:'#f7f9fc',color:'#606266'}"
      empty-text="没有与搜索条件匹配的项">
      <el-table-column label="账号" prop="username"></el-table-column>
      <el-table-column label="添加时间" prop="created_at" sortable column-key="date">
        <template slot-scope="scope">
          <div v-if="UserInfo.id != scope.row.id">{{scope.row.created_at}}</div>
        </template>
      </el-table-column>
      <el-table-column label="身份" prop="role"></el-table-column>
      <el-table-column label="管理权限">
        <template slot-scope="scope">
          <span>{{scope.row.manage_doc_count}}个文档</span>
        </template>
      </el-table-column>
      <el-table-column label="操作权限">
        <template slot-scope="scope">
          <span>{{scope.row.operate_doc_count}}个文档</span>
        </template>
      </el-table-column>
      <el-table-column label="仅阅读">
        <template slot-scope="scope">
          <span>{{scope.row.read_doc_count}}个文档</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right">
        <div class="oper" slot-scope="scope">
          <el-tooltip effect="dark" content="设置" placement="bottom">
            <i class="wi wi-tools" @click="openEditorUser(scope.row)"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="权限管理" placement="bottom">
            <i class="wi wi-quanxian2" @click="openPermission(scope.row.id)"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除" placement="bottom">
            <i class="wi wi-delete" @click="deleteSelectRows(scope.row.id)" v-if="UserInfo.id != scope.row.id"></i>
          </el-tooltip>
        </div>
      </el-table-column>
    </el-table>
    <div class="btns">
      <el-pagination
        background
        @current-change = "getuserlist"
        layout="prev, pager, next, total"
        prev-text="上一页"
        next-text="下一页"
        :current-page.sync = "currentPage"
        :page-count="pageCount"
        :total="total"
        :hide-on-single-page = "true"
      >
      </el-pagination>
    </div>
    <!-- 设置 -->
    <el-dialog class="w7-dialog" title="账号设置" :visible.sync="dialogEditUserVisible" :close-on-click-modal="false" center>
      <el-form :model="formData" label-width="105px" label-position="left">
        <el-form-item label="用户名">
          <el-input v-model="formData.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.userpass" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="formData.userpass_confirmation" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editorUser">确 定</el-button>
        <el-button @click="dialogEditUserVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      keyword: '',
      userList: [],//用户列表
      currentPage: 1,//当前页码
      pageCount: 0,//总页数
      total: 0,//总数
      // showPermission: false,//显示权限设置
      // userId: '',//选中的用户id
      dialogEditUserVisible: false,//账号设置
      formData: {
        id: '',
        username: '',
        userpass: '',
        userpass_confirmation: ''
      }
    }
  },
  computed: {
    ...mapGetters({ UserInfo: 'UserInfo' })
  },
  created() {
    this.$store.dispatch('getUserInfo')
    this.getuserlist()
  },
  methods: {
    search() {
      this.currentPage = 1
      this.getuserlist()
    },
    getuserlist() {
      this.$post('/admin/user/search', {
        page: this.currentPage,
        username: this.keyword
      }).then(res => {
         this.userList = res.data.data
         this.currentPage = res.data.page_current
         this.pageCount = res.data.pageCount
         this.total = res.data.total
      })
    },
    openEditorUser(row) {
      this.formData.id = row.id
      this.formData.username = row.username
      this.dialogEditUserVisible = true
    },
    editorUser() {
      this.$post('/admin/user/update-by-id', this.formData)
        .then(() => {
          this.$message('修改成功！')
          this.getuserlist()
          this.dialogEditUserVisible = false
        })
    },
    openPermission(id) {
      this.$router.push('/admin/user/' + id)
    },
    deleteSelectRows(id) {
      this.$confirm('此操作将永久删除用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$post('/admin/user/delete-by-ids',{
            ids: id
          })
            .then(res => {
              this.$message(res)
              this.getuserlist()
              this.selectRowID = ''
            })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  padding: 0 40px;
}
.el-input__icon{
  color:#3296fa;
}
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