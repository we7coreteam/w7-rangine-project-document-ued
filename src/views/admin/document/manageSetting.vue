<template>
  <div>
    <h3 class="page-head">
      <router-link to='/admin/document'><i class="el-icon-arrow-left"></i></router-link>普通文档/管理设置
    </h3>
    <div class="title">
      <i class="fl el-icon-folder-opened"></i>{{ details.name }}
       <router-link :to="{path:'chapter/'+ details.id}" class="fr el-button el-button--primary">进入文档</router-link>
    </div>
    <div class="content">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="first">
          <div class="tab-content-baseInfo">
            <table>
              <tr>
                <td>文档名称</td>
                <td>{{ details.name }}</td>
                <td><el-button type="text" @click="nameShow">修改</el-button></td>
              </tr>
              <tr>
                <td>文档介绍</td>
                <td>{{ details.description }}</td>
                <td><el-button type="text" @click="descriptionShow">修改</el-button></td>
              </tr>
            </table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="操作员管理" name="second" v-if="manageVisible">
          <div class="tab-content-manage">
            <el-table :data="docuserList" style="width: 100%">
              <el-table-column prop="username" label="名称"></el-table-column>
              <el-table-column prop="has_creator_name" label="权限信息"></el-table-column>
              <el-table-column align="right">
                <template slot="header">
                  <el-button type="text" @click="dialogAddManageVisible = true">添加操作员</el-button>
                </template>
                <template slot-scope="scope">
                  <el-button type="text" @click="updateManageInfo(scope.row.id, scope.row.username)">修改</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 基本信息弹出框 -->
    <el-dialog title="基本信息" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false" center>
      <el-form :model="details">
        <el-form-item label="文档名称" :label-width="formLabelWidth" v-if="nameVisible">
          <el-input v-model="details.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="文档介绍" :label-width="formLabelWidth" v-if="descriptionVisible">
          <el-input type="textarea" :rows="2" v-model="details.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updateDocument">确 定</el-button>
        <el-button @click="dialogDocInfoVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 操作员弹出框 -->
    <el-dialog title="添加账号操作员" :visible.sync="dialogAddManageVisible" :close-on-click-modal="false" center>
      <el-form>
        <el-form-item label="用户名" :label-width="formLabelWidth">
          <el-input autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updateManage">确 定</el-button>
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
      formLabelWidth: '120px',
      nameVisible: true,//基本信息弹弹出框---文档名称
      descriptionVisible: true,//基本信息弹弹出框---文档介绍
      docuserList: [],//操作人数组
      dialogAddManageVisible: false//添加操作人弹出框
    }
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
    nameShow() {
      this.dialogDocInfoVisible = true
      this.nameVisible = true
      this.descriptionVisible = false
    },
    descriptionShow() {
      this.dialogDocInfoVisible = true
      this.nameVisible = false
      this.descriptionVisible = true
    },
    getdetails() {
      this.$post('/admin/document/getdetails',{
        id: this.id
      })
        .then(res => {
          this.details = res
          this.manageVisible = res.has_creator != 3 ? true : false
          if(this.manageVisible)  this.getdocuserlist()
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
    updateManageInfo(id, name) {
      console.log(id + '------' + name)
    },
    updateManage() {

    }
  },
  created() {
    this.getdetails()
  }
}
</script>

<style lang="scss" scoped>
.title {
  height: 50px;
  line-height: 50px;
  background: grey;
  i {
    line-height: 50px;
  }
}
.tab-content-baseInfo {
  table {
    width: 100%;
    td:nth-child(1) {
      width: 100px;
    }
    td:nth-child(2) {
      width: calc(100% - 150px);
    }
    td:nth-child(3) {
      width: 50px;
    }
  }
}
</style>