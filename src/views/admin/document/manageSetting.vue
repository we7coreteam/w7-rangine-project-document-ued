<template>
  <div class="container">
    <h3 class="page-head">
      <router-link to='/admin/document'><i class="el-icon-arrow-left"></i><span style="color:#4da4fb">项目管理</span></router-link>/设置
    </h3>
    <div class="doc-title">
      <div class="title-box">
        <img src="~@/assets/img/fileFolder-big.png" alt="">
        <div class="title-text">
          <div>
            {{ details.name }}
          </div>
          <div>
            <i :class="iconClass" class="icon-own"></i>
            <span>{{this.details.is_public == 1 ? '公有' : '私有'}}</span>
          </div>
        </div>
      </div>
      <div class="operation">
        <el-button type="text" v-if="details.acl && details.acl.has_manage" @click="editIsPublic">
          {{this.details.is_public == 1 ? '设为私有项目' : '设为公开项目'}}
        </el-button>
        <el-button type="text" v-if="details.acl && details.acl.has_edit" @click="dialogRenameVisible = true">重命名</el-button>
        <router-link class="el-button el-button--text" v-if="details.acl && details.acl.has_edit" :to="{path: 'chapter/' + this.$route.params.id}"><span>编辑文档</span></router-link>
        <el-button type="text" v-if="details.acl && details.acl.has_delete" @click="delDoc">删除</el-button>
      </div>
    </div>
    <div class="operator-management">
      <div>操作员管理</div>
      <el-button type="primary" @click="dialogAddManageVisible = true">添加操作员</el-button>
    </div>
    <div class="content">
      <div class="tab-content-manage">
        <el-table :header-cell-style="{background:'#f7f9fc',color:'#606266'}" :data="details.operator" ref="docuserTable" style="width: 100%" >
          <el-table-column prop="username" label="名称"></el-table-column>
          <el-table-column prop="acl.name" label="身份"></el-table-column>
          <el-table-column align="right">
            <template slot-scope="scope">
              <el-button type="text" @click="openEditManage(scope.row)" v-if="details.acl.has_manage">编辑</el-button>
              <el-button type="text" @click="removeManage(scope.row.id)" v-if="details.acl.has_manage">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 重命名弹出框 -->
    <el-dialog class="w7-dialog" title="重命名" :visible.sync="dialogRenameVisible" :close-on-click-modal="false" center>
      <el-form label-width="100px">
        <el-form-item label="新的文档名称">
          <el-input v-model="newDocName"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editRename">确 定</el-button>
        <el-button @click="dialogRenameVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 操作员弹出框 -->
    <el-dialog class="w7-dialog w7-dialog-user" title="添加账号操作员" :visible.sync="dialogAddManageVisible" :close-on-click-modal="false" center>
      <div class="demo-input-suffix">
        <el-input placeholder="搜索用户名" v-model="keyword" @keyup.enter.native="getuserlist">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="getuserlist"></i>
        </el-input>
      </div>
      <el-table class="w7-table-small" height="250"
        :data="userList"
        ref="multipleTable"
        :header-cell-style="{background:'#f7f9fc',color:'#606266'}"
        @row-click="rowClick">
        <el-table-column prop="username" label="账号"></el-table-column>
        <el-table-column prop="created_at" label="添加时间"></el-table-column>
      </el-table>
      <div class="w7-pagination">
        <el-pagination
          background
          :hide-on-single-page="true"
          @current-change="getuserlist"
          layout="prev, pager, next, total"
          :current-page.sync="currentPageUser"
          :page-count="pageCountUser"
          :total = "totalUser"
        >
        </el-pagination>
      </div>
      <div slot="footer" class="dialog-footer">
        <!-- <el-button type="primary" @click="addManage">确 定</el-button> -->
        <el-button @click="dialogAddManageVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 编辑操作员 -->
    <el-dialog class="w7-dialog" title="编辑操作员" :visible.sync="dialogOpeInfoVisible" :close-on-click-modal="false" center>
      <el-form style="display:flex;justify-content:center;">
        <span style="margin-right:30px;">操作员权限</span>
        <el-radio-group v-model="radio">
          <el-radio v-for="item in role_list" :label="item.id" :key="item.id">{{item.name}}</el-radio>
        </el-radio-group>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editOpe">确 定</el-button>
        <el-button @click="dialogOpeInfoVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'manageSetting',
  data() {
    return {
      id: this.$route.params.id,//文档id
      activeName: 'first',//tabs显示的选项卡名字
      details: '',//文档数据
      dialogRenameVisible: false,//重命名弹出框
      newDocName: '',//文档新名称
      selectRow: '',//选中行的数据
      dialogOpeInfoVisible: false,//编辑操作员弹框
      formLabelWidth: '90px',
      docuserList: [],//操作人数组
      dialogAddManageVisible: false,//添加操作人弹出框
      keyword: '',//添加操作人搜索
      userList: [],//所有用户
      pageCountUser: 0,//总页数
      currentPageUser: 1,//当前页面
      totalUser: 0,//总个数
      role_list: [],//操作员的可选权限
      radio: "1",//操作员权限
    }
  },
  computed: {
    iconClass() {
      return this.details.is_public == 1 ? 'el-icon-unlock' : 'el-icon-lock'
    }
  },
  created() {
    this.getdetails()
    this.getuserlist()
  },
  methods: {
    getdetails() {
      this.$post('/admin/document/detail',{
        document_id : this.id
      })
        .then(res => {
          this.details = res
          this.role_list = res.role_list
        })
    },
    editIsPublic() {
      this.$post('/admin/document/update', {
        document_id: this.details.id,
        is_public: this.details.acl.has_read ? 2 : 1
      })
        .then(() => {
          this.$message({ type: 'success', message: '修改成功!'})
          this.details.is_public = this.details.is_public == 1 ? 2 : 1
        })
    },
    editRename() {
      this.$post('/admin/document/update', {
        document_id: this.details.id,
        name: this.newDocName
      })
        .then(() => {
          this.$message({ type: 'success', message: '修改成功!'})
          this.details.name = this.newDocName
          this.dialogRenameVisible = false
          this.newDocName = ''
        })
    },
    delDoc() {
      this.$confirm('此操作将永久删除该文档, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/document/delete', {
          document_id: this.details.id
        })
          .then(() => {
            this.$message({ type: 'success', message: '删除成功!'})
            this.$router.push('/admin/document/')
          })
      }).catch(() => {
      })
    },
    getuserlist() {
      this.$post('/admin/user/search',{
        username: this.keyword,
        page: this.currentPageUser
      })
        .then(res => {
          this.userList = res.data
          this.pageCountUser = res.pageCount
          this.currentPageUser = res.page_current
          this.totalUser = res.total
        })
    },
    openEditManage(row) {
      this.selectRow = row
      this.radio = row.acl.role
      this.dialogOpeInfoVisible = true
    },
    editOpe() {
      this.$post('/admin/document/operator',{
        user_id: this.selectRow.id,
        document_id: this.id,
        permission: this.radio
      })
        .then(() => {
          this.getdetails()
          this.dialogOpeInfoVisible = false
        })
    },
    removeManage(id) {
      this.$confirm('确定删除该操作员吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/document/operator',{
          user_id: id,
          document_id: this.id
        })
          .then(() => {
            this.getdetails()
            this.$message('删除成功！')
          })
      })
    },
    addManage(userId) {
      this.$post('/admin/document/operator',{
        user_id: userId,
        document_id: this.id,
        permission : 2,
      })
        .then(() => {
          this.getdetails()
          this.$message('添加成功！')
          this.dialogAddManageVisible = false
        })
    },
    rowClick(row) {
      this.addManage(row.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  padding:30px 40px 0 40px;
}
.doc-title {
  display: flex;
  justify-content:space-between;
	height: 100px;
	background-color: #f7f9fc;
  .title-box {
    height: 100px;
    padding: 20px;
    padding-top: 30px;
    font-family: PingFang-SC-Regular;
    font-size: 14px;
    letter-spacing: 1px;
    color: #4d4d4d;
    box-sizing: border-box;
    img{
      float:left;
      vertical-align: middle;
    }
    .title-text{
      margin-left: 26px;
      float:left;
      .icon-own{
        color:#38b677;
        margin-right: 10px;
      }
    }
  }
  .operation{
    line-height: 100px;
    padding-right: 20px;
    .el-button + .el-button {
        margin-left: 40px;
    }
  }
}
.operator-management{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 20px;
    height:76px;
    font-size:14px;
  }
.content {
  font-family: PingFang-SC-Regular;
  font-size: 14px;
	color: #4d4d4d;
  .title {
    color: #989898;
  }
  .admin{
    width:80px;
    height:30px;
    box-sizing:border-box;
    border:1px solid #4dc88a;
    background:#c1fbde;
    color:#4dc88a;
    font-size:14px;
    text-align: center;
    line-height:30px;
    border-radius:4px;
  }
}
.tab-content-baseInfo {
  table {
    width: 100%;
    tr {
      height: 78px;
      border-bottom: #f7f9fc 1px solid !important;
      td:nth-child(1) {
        width: 90px;
      }
      td:nth-child(2) {
        width: calc(100% - 140px);
      }
      td:nth-child(3) {
        width: 50px;
      }
    }
  }
}
.w7-dialog-user {
  /deep/ .el-dialog__body {
    padding-bottom: 0;
  }
  .el-form-item__content .el-input {
    width: 95%;
  }
}
.w7-table /deep/ .el-table__header thead tr th:nth-last-child(2) > .cell {
  padding-right: 0;
}
.w7-table-small {
  // padding: 0 20px;
  margin: 30px 0;
  /deep/ th {
    padding: 5px 0 !important;
  }
  /deep/ td {
    padding: 7px 0 !important;
  }
}
.w7-pagination {
  overflow: hidden;
  .el-pagination {
    margin-top: 10px;
    margin-right: 10px;
  }
}
</style>