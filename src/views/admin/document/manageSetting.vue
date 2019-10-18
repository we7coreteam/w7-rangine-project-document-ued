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
            <i :class="iconClass" class="icon-own"></i><span>{{ownTitle}}</span>
          </div>
        </div>
      </div>
      <!-- <router-link :to="{path:'chapter/'+ details.id}" class="el-button el-button--primary">进入文档</router-link> -->
      <div class="operation">
        <span>设为私有项目</span>
        <span>重命名</span>
        <router-link :to="{path: '/admin/chapter/' + this.$route.params.id}"><span>编辑文档</span></router-link>
      </div>
    </div>
    <div class="operator-management">
      <div>操作员管理</div>
      <el-button type="primary" @click="dialogAddManageVisible = true">添加操作员</el-button>
    </div>
    <div class="content">
      <div class="tab-content-manage">
        <el-table :header-cell-style="{background:'#f7f9fc',color:'#606266'}" :data="docuserList" ref="docuserTable" style="width: 100%" >
          <el-table-column prop="username" label="名称"></el-table-column>
          <el-table-column prop="has_creator_name" label="身份">
            <template slot-scope="scope">
              <div
                :class="scope.row.has_creator_name === '管理员' ? 'admin' : 'other'"
                >{{scope.row.has_creator_name}}</div>
            </template>
          </el-table-column>
          <el-table-column align="right">
            <!-- <template slot="header">
              <el-button type="text" @click="dialogAddManageVisible = true">添加操作员</el-button>
            </template> -->
            <template slot-scope="scope">
              <el-button type="text" @click="dialogOpeInfoVisible = true">编辑</el-button>
              <el-button type="text" @click="removeManage(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 基本信息弹出框 -->
    <el-dialog class="w7-dialog" title="基本信息" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false" center>
      <el-form :model="details" :label-width="formLabelWidth">
        <el-form-item label="文档名称" v-if="docInfoVisible == 'name'">
          <el-input v-model="name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="文档介绍" v-if="docInfoVisible == 'description'">
          <el-input type="textarea" :rows="2" v-model="description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updateDocument">确 定</el-button>
        <el-button @click="dialogDocInfoVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 操作员弹出框 -->
    <el-dialog class="w7-dialog w7-dialog-user" title="添加账号操作员" :visible.sync="dialogAddManageVisible" :close-on-click-modal="false" center>
      <!-- <el-form :model="userInfo" :label-width="formLabelWidth">
        <el-form-item label="用户名">
          <el-input v-model="userInfo.username" autocomplete="off"></el-input>
        </el-form-item>
      </el-form> -->
      <div class="demo-input-suffix">
        <!-- <span>用户名</span> -->
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
        <el-pagination class="fr"
          background
          :hide-on-single-page="true"
          @current-change="getuserlist"
          layout="prev, pager, next, total"
          :current-page.sync="currentPageUser"
          :page-count="pageCountUser"
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
          <el-radio v-model="radio" label="1">管理员</el-radio>
          <el-radio v-model="radio" label="2">操作员</el-radio>
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
      radio: "1",
      ownTitle: "公开",
      iconClass: "el-icon-unlock",
      id: this.$route.params.id,//文档id
      manageVisible: false,//操作员管理选项卡是否显示
      details: '',//文档数据
      name: '',//弹出框文档名称
      description: '',//弹出框文档介绍
      dialogOpeInfoVisible: false,//编辑操作员弹框
      dialogDocInfoVisible: false,//基本信息弹弹出框
      formLabelWidth: '90px',
      docInfoVisible: '',//
      docuserList: [],//操作人数组
      dialogAddManageVisible: false,//添加操作人弹出框
      keyword: '',//添加操作人搜索
      userList: [],//所有用户
      pageCountUser: 0,//总页数
      currentPageUser: 1//当前页面
    }
  },
  methods: {
    modalShow(labelname) {
      this.docInfoVisible = labelname
      this.dialogDocInfoVisible = true
      if (labelname == 'name') {
        this.name = this.details.name
      } else {
        this.description = this.details.description
      }
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
        console.log(this.$route.params)
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
        name: this.name ? this.name : this.details.name,
        description: this.description ? this.description : this.details.description
      })
        .then(() => {
          this.$message('修改成功！')
          this.details.name = this.name ? this.name : this.details.name
          this.details.description = this.description ? this.description : this.details.description
          this.dialogDocInfoVisible = false
          this.name = ''
          this.description = ''
        })
    },
    getuserlist() {
      this.$post('/admin/user/getuserlist',{
         username: this.keyword,
         page: this.currentPageUser
      })
        .then(res => {
          this.userList = res.data
          this.pageCountUser = res.pageCount
        })
    },
    editOpe() {
      console.log(233)
      this.dialogOpeInfoVisible = false
    },
    editManage() {

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
    addManage(userId) {
      this.$post('/admin/auth/invite_user',{
        user_id: userId,
        document_id: this.id
      })
        .then(() => {
          this.getdocuserlist()
          this.$message('添加成功！')
          this.dialogAddManageVisible = false
        })
    },
    rowClick(row) {
      this.addManage(row.id)
    }
  },
  created() {
    this.getdetails()
    // this.getuserlist()
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
    padding-right:20px;
    span{
      margin-left:40px;
      color:#3296fa;
      font-size:14px;
    }
  }
  .el-button {
    margin: 33px 21px;
    height: 34px;
    border-radius: 2px;
    padding: 10px 20px;
  }
}
.operator-management{
    width:100%;
    height:76px;
    font-size:14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
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