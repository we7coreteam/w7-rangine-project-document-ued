<template>
  <div class="container">
    <h3 class="page-head">
      <router-link to='/admin/user'><i class="el-icon-arrow-left"></i>用户管理</router-link>/<span style="color:#3296fa;">添加用户</span>
    </h3>
    <div class="title">
      <span class="active">1.添加成员</span>
      <div class="title-line"></div>
      <span :class="{ active:!firstPage }">2.设置权限</span>
    </div>
    <div class="content">
      <div v-if="firstPage">
        <el-form ref="form" :model="formData" label-width="80px" :label-position="'left'" style="width:420px;">
          <el-form-item label="用户账号">
            <el-input v-model="formData.username" ></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="formData.userpass" ></el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="formData.confirm_userpass" ></el-input>
          </el-form-item>
          <!-- <el-form-item label="备注">
            <el-input v-model="formData.remark" type="textarea" :rows="4" ></el-input>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="onSubmit">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <div class="select-power">
          <div>
            <span style="margin-right:70px">项目权限</span>
            <el-select v-model="docList.has_creator" placeholder="请选择">
              <el-option label="全部项目" value="1"></el-option>
              <el-option label="公有项目" value="2"></el-option>
              <el-option label="私有项目" value="3"></el-option>
            </el-select>
          </div>
          <div class="more-edit" @click="dialogEditInfoVisible = true">批量修改</div>
        </div>
        <el-table class="w7-table" :data="docList" empty-text="" ref="table" 
          :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column label="项目名称">
            <template slot-scope="scope">
              <i class="w7-icon-fileFolder"></i>
              <span style="margin-left: 10px">{{ scope.row.name }}</span>
              <div style="display:inline-block;padding:0 5px;margin-left: 20px;background:#fff1de;color:#ff8600;">
                <i class="el-icon-lock" ><span style="margin-left: 5px;">私有</span></i>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="权限" align="right">
            <template slot-scope="scope">
              <!-- <el-button type="text" v-if="scope.row.has_creator != 3 || UserInfo.has_privilege == 1" @click="removeDoc(scope.row.id)">删除</el-button>
              <router-link
                :to="{path: 'chapter/' + scope.row.id}"
                class="el-button el-button--text">编辑</router-link>
              <router-link
                :to="{path: 'document/'+ scope.row.id}"
                class="el-button el-button--text" v-if="scope.row.has_creator != 3 || UserInfo.has_privilege == 1">
                管理设置
              </router-link>
              <el-button type="text" v-if="scope.row.has_creator != 3 || UserInfo.has_privilege == 1"
                :class="{redBtn: scope.row.is_show == 1}"
                @click="updateDoc(scope.row.id, scope.row.is_show)">{{scope.row.is_show == 2 ? "发布" : "取消发布"}}</el-button>
              <el-button type="text" :class="{'is-disabled': scope.row.is_show == 2}" @click="readDoc(scope.row.id, scope.row.is_show)">阅读文档</el-button> -->
              <el-radio-group v-model="scope.row.has_creator" class="ownership">
                <el-radio v-model="scope.row.has_creator" label="1">
                  <!-- <span class="reader"> -->
                    阅读者
                    <!-- <div class="pos-box">
                      <div class="arr-box">
                        <div class="arrow"></div>
                        <span>仅可以阅读</span>
                      </div>
                    </div>
                  </span> -->
                </el-radio>
                <el-radio v-model="scope.row.has_creator" label="2">操作员</el-radio>
                <el-radio v-model="scope.row.has_creator" label="3">管理员</el-radio>
              </el-radio-group>
            </template>
          </el-table-column>
          <div class="nodata" slot="empty">
            <p>暂无可以查看管理的文档，请先操作<el-button type="text" @click="dialogDocInfoVisible = true">创建文档</el-button></p>
          </div>
        </el-table>
        <div class="btns">
          <el-button type="primary" @click="saveUser">保存</el-button>
          <el-pagination
            background
            @current-change = "getList"
            layout="prev, pager, next, total"
            prev-text="上一页"
            next-text="下一页"
            :current-page.sync = "currentPage"
            :page-count="pageCount"
            :hide-on-single-page = "true"
          >
          </el-pagination>
        </div>
        <!-- 批量修改弹出框 -->
        <el-dialog class="w7-dialog" title="批量修改" :visible.sync="dialogEditInfoVisible" :close-on-click-modal="false" center>
          <el-form label-width="120" style="margin-left:50px;">
            <el-form-item label="公有项目">
              <el-radio-group v-model="radio" class="ownership">
                <el-radio v-model="radio" label="1">管理员</el-radio>
                <el-radio v-model="radio" label="2">操作员</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="私有项目">
              <el-radio-group v-model="radio1" class="ownership">
                <el-radio v-model="radio1" label="1">管理员</el-radio>
                <el-radio v-model="radio1" label="2">操作员</el-radio>
                <el-radio v-model="radio1" label="3">阅读者</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="editInf">确 定</el-button>
            <el-button @click="dialogEditInfoVisible = false">取 消</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstPage: true,
      formData: {
        id : this.$route.params.id,
        username: '',
        userpass: '',
        confirm_userpass: '',
        remark: ''
      },
      docList: [],//用户列表
      currentPage: 0,//当前页码
      pageCount: 0,//总页数
      total: 0,//总数
      dialogEditInfoVisible: false,
      radio: "1",
      radio1: "1"
      // detailsList: [],//详情列表
    }
  },
  created() {
    // if(this.$route.params.id) {
    //   this.getDetailsUser()
    // }
    this.getList()
  },
  methods: {
    getList() {
      this.$post('/admin/document/getlist',{
        page: this.currentPage,
        name: this.keyword
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.pageCount
          this.total = res.total
        })
    },
    saveUser() {
      
    },
    editInf() {
      this.dialogEditInfoVisible = false;
    },
    // getDetailsList() {
    //   this.$post('/admin/document/getdetails ',{
    //     id: this.currentPage,
    //   })
    //     .then(res => {
    //       this.docList = res.data
    //       this.pageCount = res.pageCount
    //       this.total = res.total
    //     })
    // },
    onSubmit() {
      if(this.formData.userpass !== this.formData.confirm_userpass) {
        this.$message('两次密码不一致，请重新输入！')
        return
      }
      if (this.$route.params.id) {
        this.$post('/admin/user/update', this.formData)
          .then(() => {
            this.$message('修改成功！')
          })
      }else {
        this.$post('/admin/user/add', this.formData)
          .then(() => {
            this.$message('保存成功！')
          })
        }
        this.firstPage = false
    },
    getDetailsUser() {
      this.$post('/admin/user/detail-by-id',{
        id: this.formData.id
      })
        .then(res => {
          this.formData.username = res.username
          this.formData.remark = res.remark
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  padding:30px 40px 0 40px;
}
.title {
  width: 100%;
  height: 30px;
  font-size: 14px ;
  background-color: #f4f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  .title-line{
    width:110px;
    height:2px;
    background:#3296fa;
    margin:0 30px;
  }
  .active{
    color: #3296fa;
  }
}
.content {
  width: 100%;
  margin-top:32px;
  input {
    border-radius: 2px;
    border: solid 1px #eeeeee;
  }
  /deep/ .el-input__inner {
    height: 35px;
  }
  button {
    width: 120px;
    height: 35px;
    padding: 9px 20px;
  }
}
.reader:hover .pos-box{
  display: block;
}
.reader{
  display: inline-block;
  position: relative;
  .pos-box{
    position: absolute;
    top:20px;
    left:-10px;
    // display:none;
    text-align: center;
    width:80px;
    height:20px;
    line-height:20px;
    background: #000;
    color:#fff;
    font-size:14px;
    .arr-box{
      position: relative;
      width:100%;
      height:100%;
      box-sizing:border-box;
      background: #000;
      border:2px solid #000;
      .arrow{
        width: 0px;   
        height: 0px;   
        position: absolute;   
        border:5px solid transparent;
        border-bottom-color:#000;
        top:-10px;
        left:30%;
      }
    }
  }
}
.select-power{
  display: flex;
  justify-content: space-between;
  align-items: center;
  .more-edit{
    color:#3296fa;
    cursor:pointer;
  }
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
.w7-icon-fileFolder:after {
  content:url('~@/assets/img/fileFolder-small.png')
}
.el-table .cell{
  overflow:auto!important;
}
</style>