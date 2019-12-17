<template>
  <div class="container">
    <h3 class="page-head">
      <router-link to='/admin/user'><i class="el-icon-arrow-left"></i><span style="color:#4da4fb">用户管理</span></router-link>/<span>{{$route.params.id ? '编辑用户' : '添加用户'}}</span>
    </h3>
    <div class="title" v-if="!$route.params.id">
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
            <el-input v-model="formData.userpass" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm_userpass">
            <el-input v-model="formData.confirm_userpass" type="password"></el-input>
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
      if(this.$route.params.id) {
        this.user_id = this.$route.params.id
        this.firstPage = false
      }
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
</style>