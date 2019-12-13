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
        <el-form ref="ruleForm" :model="formData" :rules="rules" label-width="80px" :label-position="'left'" style="width:420px;">
          <el-form-item label="用户账号" prop="username">
            <el-input v-model="formData.username" ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="userpass">
            <el-input v-model="formData.userpass" ></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm_userpass">
            <el-input v-model="formData.confirm_userpass" ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <permission :user_id="user_id"></permission>
      </div>
    </div>
  </div>
</template>

<script>
import permission from './permission'
export default {
  components: {
    permission
  },
  data() {
    var validatePass = (rule, val, callback) => {
      if (val === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.formData.confirm_userpass !== '') {
          this.$refs.ruleForm.validateField('confirm_userpass');
        }
        callback();
      }
    };
    var validatePass2 = (rule, val, callback) => {
      if (val === '') {
        callback(new Error('请再次输入密码'));
      } else if (val !== this.formData.userpass) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      rules: {
        username: [
          { required: true, message: '请输入用户账号', trigger: 'blur' }
        ],
        userpass: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ],
        confirm_userpass: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      },
      firstPage: true,
      formData: {
        id : this.$route.params.id,
        username: '',
        userpass: '',
        confirm_userpass: ''
      },
      user_id: ''//创建用户id
    }
  },
  created() {
  },
  methods: {
    onSubmit() {
      this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            this.$post('/admin/user/add', this.formData)
              .then((res) => {
                this.$message('创建成功！')
                this.user_id = res
                this.firstPage = false
              })
          }
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