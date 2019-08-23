<template>
  <div>
    <h3 class="page-head">
      <router-link to='/admin/document'><i class="el-icon-arrow-left"></i>普通文档</router-link>/管理设置
    </h3>
    <div class="doc-title">
      <p><span>{{ details.name }}</span></p>
      <router-link :to="{path:'chapter/'+ details.id}" class="el-button el-button--primary">进入文档</router-link>
    </div>
    <div class="content">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="first">
          <div class="tab-content-baseInfo">
            <table>
              <tr>
                <td class="title">文档名称</td>
                <td>{{ details.name }}</td>
                <td><el-button type="text" @click="modalShow('name')">修改</el-button></td>
              </tr>
              <tr>
                <td class="title">文档介绍</td>
                <td>{{ details.description }}</td>
                <td><el-button type="text" @click="modalShow('description')">修改</el-button></td>
              </tr>
            </table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="操作员管理" name="second" v-if="manageVisible">
          <div class="tab-content-manage">
            <el-table class="w7-table" :data="docuserList" ref="docuserTable" style="width: 100%">
              <el-table-column prop="username" label="名称"></el-table-column>
              <el-table-column prop="has_creator_name" label="权限信息"></el-table-column>
              <el-table-column align="right">
                <template slot="header">
                  <el-button type="text" @click="dialogAddManageVisible = true">添加操作员</el-button>
                </template>
                <template slot-scope="scope">
                  <el-button type="text" @click="removeManage(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 基本信息弹出框 -->
    <el-dialog class="w7-dialog" title="基本信息" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false" center>
      <el-form :model="details" :label-width="formLabelWidth">
        <el-form-item label="文档名称" v-if="docInfoVisible == 'name'">
          <el-input v-model="details.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="文档介绍" v-if="docInfoVisible == 'description'">
          <el-input type="textarea" :rows="2" v-model="details.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updateDocument">确 定</el-button>
        <el-button @click="dialogDocInfoVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 操作员弹出框 -->
    <el-dialog class="w7-dialog w7-dialog-user" title="添加账号操作员" :visible.sync="dialogAddManageVisible" :close-on-click-modal="false" center>
      <el-form :model="userInfo" :label-width="formLabelWidth">
        <el-form-item label="用户名">
          <el-input v-model="userInfo.username" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <el-table class="w7-table-small" :data="userList" height="250" ref="multipleTable"
       :header-cell-style="{background:'#f7f9fc',color:'#606266'}"
       @row-click="rowClick">
        <el-table-column prop="username" label="账号"></el-table-column>
      </el-table>
      <div class="w7-pagination">
        <el-pagination class="fr"
          background
          @current-change = "getuserlist"
          layout="prev, pager, next, total"
          :current-page.sync = "currentPageUser"
          :page-count="pageCountUser"
        >
        </el-pagination>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addManage">确 定</el-button>
        <el-button @click="dialogAddManageVisible = false">取 消</el-button>
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
      manageVisible: false,//操作员管理选项卡是否显示
      activeName: 'first',//tabs显示的选项卡名字
      details: '',//文档数据
      dialogDocInfoVisible: false,//基本信息弹弹出框
      formLabelWidth: '90px',
      docInfoVisible: '',//
      docuserList: [],//操作人数组
      dialogAddManageVisible: false,//添加操作人弹出框
      userInfo: {},
      userList: [],//所有用户
      pageCountUser: 0,//总页数
      currentPageUser: 1//当前页面
    }
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    // modalShow(type) {
    //   this.fileName = {
    //     label: 'M',
    //     key:
    //   }
    //   this.dialogDocInfoVisible = true;
    // },
    modalShow(labelname) {
      this.docInfoVisible = labelname
      this.dialogDocInfoVisible = true
    },
    getdetails() {
      this.$post('/admin/document/getdetails',{
        id: this.id
      })
        .then(res => {
          this.details = res
          this.manageVisible = res.has_creator != 3 ? true : false
          if(this.manageVisible) {
            this.getdocuserlist()
          }
        })
    },
    getdocuserlist() {
      this.$post('/admin/document/getdocuserlist',{
        id: this.id
      })
        .then(res => {
          this.docuserList = res
        })
    },
    updateDocument() {
      this.$post('/admin/document/update',{
        id: this.details.id,
        name: this.details.name,
        description: this.details.name
      })
        .then(() => {
          this.$message('修改成功！')
          this.dialogDocInfoVisible = false
        })
    },
    getuserlist() {
      this.$post('/admin/user/getuserlist',{
         page: this.currentPageUser
      })
        .then(res => {
          this.userList = res.data
          this.pageCountUser = res.pageCount
        })
    },
    removeManage(id) {
      this.$confirm('确定删除该操作员吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/auth/leave_document',{
          user_id: id,
          document_id: this.id
        })
          .then(() => {
            this.getdocuserlist()
            this.$message('删除成功！')
          })
      })
    },
    addManage() {
      this.$post('/admin/auth/invite_user',{
        user_id: this.userInfo.id,
        document_id: this.id
      })
        .then(() => {
          this.getdocuserlist()
          this.$message('添加成功！')
          this.dialogAddManageVisible = false
        })
    },
    rowClick(row) {
      this.userInfo = row
    }
  },
  created() {
    this.getdetails()
    this.getuserlist()
  }
}
</script>

<style lang="scss" scoped>
.doc-title {
  display: flex;
  justify-content:space-between;
	height: 100px;
  line-height: 100px;
	background-color: #f7f9fc;
  p {
    height: 100px;
    padding-left: 20px;
    font-family: PingFang-SC-Regular;
    font-size: 18px;
    letter-spacing: 1px;
    color: #4d4d4d;
    &:before {
      content: url('~@/assets/img/fileFolder-big.png');
    }
    span {
      padding-left: 28px;
    }
  }
  .el-button {
    margin: 33px 21px;
    height: 34px;
    border-radius: 2px;
    padding: 10px 20px;
  }
}
.content {
  margin-top: 20px;
  font-family: PingFang-SC-Regular;
  font-size: 14px;
	color: #4d4d4d;
  .title {
    color: #989898;
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
  padding: 0 20px;
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