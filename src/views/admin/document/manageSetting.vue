<template>
  <div class="container">
    <div class="page-head">
      <router-link to='/admin/document'><i class="el-icon-arrow-left"></i><span style="color:#4da4fb">项目管理</span></router-link>/设置
    </div>
    <div class="doc-title">
      <div class="title-box">
        <i class="wi wi-folder"></i>
        <div class="title-text">
          <div>
            {{ details.name }}
          </div>
          <div>
            <i :class="iconClass" class="icon-own"></i>
            <span>{{details.is_public ? '公有' : '私有'}}</span>
          </div>
        </div>
      </div>
      <div class="operation">
        <el-button type="text" v-if="!details.is_public" @click="dialogShareVisible = true">分享设置</el-button>
        <el-button type="text" v-if="details.acl && details.acl.has_manage" @click="editIsPublic">
          {{details.is_public ? '设为私有项目' : '设为公开项目'}}
        </el-button>
        <el-button type="text" v-if="details.acl && details.acl.has_edit" @click="dialogRenameVisible = true">重命名</el-button>
        <router-link class="el-button el-button--text" v-if="details.acl && details.acl.has_edit" :to="{path: 'chapter/' + this.$route.params.id}"><span>编辑文档</span></router-link>
        <el-button type="text" v-if="details.acl && details.acl.has_delete" @click="delDoc">删除</el-button>
      </div>
    </div>
    <div class="operator-management">
      <div>操作员管理</div>
      <el-button class="we7-button-normal" type="primary" @click="openAddmanage">添加操作权限</el-button>
    </div>
    <div class="content">
      <div class="tab-content-manage">
        <el-table class="w7-table" :header-cell-style="{background:'#f7f9fc',color:'#606266'}" :data="details.operator" ref="docuserTable">
          <el-table-column prop="username" label="名称" width="300px"></el-table-column>
          <el-table-column label="身份" align="center">
            <template slot-scope="scope">
              <div class="manage" v-if="scope.row.acl.role == 1">{{scope.row.acl.name}}</div>
              <template v-else>{{scope.row.acl.name}}</template>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="right">
            <div class="oper" slot-scope="scope">
              <el-tooltip effect="dark" content="编辑" placement="bottom">
                <i class="wi wi-edit" @click="openEditManage(scope.row)" v-if="details.acl.has_manage && scope.row.acl.role != 1"></i>
              </el-tooltip>
              <el-tooltip effect="dark" content="删除" placement="bottom">
                <i class="wi wi-delete" @click="removeManage(scope.row.id)" v-if="details.acl.has_manage && scope.row.acl.role != 1"></i>
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 分享设置 -->
    <el-dialog class="w7-dialog" title="分享设置" :visible.sync="dialogShareVisible" :close-on-click-modal="false" center>
      <el-form label-width="105px" label-position="left">
        <el-form-item label="私有文档查看">
          <el-radio v-model="radioShare" label="1">仅限有权限者查看</el-radio>
          <el-radio v-model="radioShare" label="2">点击链接登录后查看</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmShare">确 定</el-button>
        <el-button @click="dialogShareVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 重命名弹出框 -->
    <el-dialog class="w7-dialog" title="重命名" :visible.sync="dialogRenameVisible" :close-on-click-modal="false" center>
      <el-form label-width="105px" label-position="left" @submit.native.prevent>
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
    <el-dialog class="w7-dialog w7-dialog-user" title="添加操作员" :visible.sync="dialogAddManageVisible" :close-on-click-modal="false" center>
      <el-form label-width="105px" label-position="left">
        <el-form-item label="用户名">
          <el-input v-model="addManageName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="操作员权限">
          <el-radio-group v-model="radio">
            <el-radio v-for="item in role_list" :label="item.id" :key="item.id">{{item.name}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addManage">确 定</el-button>
        <el-button @click="dialogAddManageVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 编辑操作员 -->
    <el-dialog class="w7-dialog" title="编辑操作员" :visible.sync="dialogOpeInfoVisible" :close-on-click-modal="false" center>
      <el-form label-width="105px" label-position="left">
        <el-form-item label="操作员权限">
          <el-radio-group v-model="radio">
            <el-radio v-for="item in role_list" :label="item.id" :key="item.id">{{item.name}}</el-radio>
          </el-radio-group>
        </el-form-item>
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
      dialogShareVisible: false,//分享设置弹出框
      radioShare: '1',
      dialogRenameVisible: false,//重命名弹出框
      newDocName: '',//文档新名称
      selectRow: '',//选中行的数据
      dialogOpeInfoVisible: false,//编辑操作员弹框
      formLabelWidth: '90px',
      docuserList: [],//操作人数组
      dialogAddManageVisible: false,//添加操作人弹出框
      addManageName: '',//添加操作人搜索
      role_list: [],//操作员的可选权限
      radio: "1",//操作员权限
    }
  },
  computed: {
    iconClass() {
      return this.details.is_public ? 'el-icon-unlock' : 'el-icon-lock'
    }
  },
  created() {
    this.getdetails()
  },
  methods: {
    getdetails() {
      this.$post('/admin/document/detail',{
        document_id : this.id
      })
        .then(res => {
          this.details = res
          this.role_list = res.role_list
          this.radioShare = res.login_preview ? '2' : '1'
        })
    },
    editIsPublic() {
      this.$post('/admin/document/update', {
        document_id: this.details.id,
        is_public: this.details.is_public ? 2 : 1
      })
        .then(() => {
          this.$message({ type: 'success', message: '修改成功!'})
          this.getdetails()
        })
    },
    confirmShare() {
      this.$post('/admin/document/update', {
        document_id: this.details.id,
        login_preview: this.radioShare
      })
        .then(() => {
          this.$message({ type: 'success', message: '修改成功!'})
          this.dialogShareVisible = false
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
    openAddmanage() {
      this.addManageName = ''
      this.radio = this.role_list[0].id
      this.dialogAddManageVisible = true
    },
    addManage() {
      this.$post('/admin/document/operator',{
        user_name: this.addManageName,
        document_id: this.id,
        permission : this.radio,
      })
        .then(() => {
          this.getdetails()
          this.$message('添加成功！')
          this.dialogAddManageVisible = false
        })
        .catch(() => {
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
  padding:0 15px 0 25px;
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
    .wi-folder {
      font-size: 40px;
      color: #ffcd2c;
    }
    .title-text{
      display: inline-block;
      margin-left: 26px;
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
      margin-left: 0;
    }
  }
}
.operator-management{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 20px;
    height:80px;
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
.w7-dialog-user {
  /deep/ .el-dialog__body {
    padding-bottom: 0;
  }
  .el-form-item__content .el-input {
    width: 95%;
  }
}
.w7-pagination {
  overflow: hidden;
  .el-pagination {
    margin-top: 10px;
    margin-right: 10px;
  }
}
.w7-table {
  margin-top: 0;
  .manage {
    margin: 0 auto;
    width: 78px;
    line-height: 28px;
    color: #45bb7f;
    text-align: center;
    background-color: #c1fbde;
    border: 1px solid #4dc88a;
    border-radius: 4px;
  }
}
</style>