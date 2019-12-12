<template>
  <div class="admin-login">
    <div class="login-box">
      <h2>文档管理系统</h2>
      <el-tabs v-model="active">
        <el-tab-pane label="账号登录" name="first">
          <div class="login-form">
            <el-input v-model="formData.username" prefix-icon="el-icon-user-solid" placeholder="用户名/手机号"></el-input>
            <el-input type="password" v-model="formData.userpass" prefix-icon="el-icon-s-goods" placeholder="输入密码"></el-input>
            <el-input v-model="formData.code" prefix-icon="el-icon-s-goods" placeholder="输入图形验证码" @keyup.enter.native="login">
              <img :src="code" @click="getCode" slot="append" alt="">
            </el-input>
          </div>
          <div class="login-action">
            <el-button type="text" @click="showFind">找回密码?</el-button>
          </div>
          <el-button class="login-btn" @click="login">登录</el-button>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="footer">
      Powered by <a href="https://www.w7.cc">微擎云计算©www.w7.cc</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'adminLogin',
  data() {
    return {
      active: 'first',
      code: '',
      formData: {
        username: '',
        userpass: '',
        code: ''
      }
    }
  },
  methods: {
    showFind() {
      this.$message({message: '请联系管理员修改或使用密码找回工具修改'})
    },
    getCode() {
      this.$post('/common/verifycode/image')
        .then(res => {
          if(res.img) {
            this.code = res.img
            // this.formData.imgcodeKey = res.imgcodeKey
          }
        })
    },
    login() {
      for(let index in this.formData) {
        if(!this.formData[index]) {
          this.$message('请填写完整表单')
          return false
        }
      }
      this.$post('/common/auth/login', this.formData)
        .then(res => {
          let msg = this.$message('登录成功')
          setTimeout(() => {
            msg.close()
            this.$router.push('/admin/document')
          }, 500)
        }).catch(() => {
          this.getCode()
        })
    }
  },
  created() {
    this.getCode()
  }
}
</script>

<style lang="scss">
.admin-login {
  min-height: 100vh;
  background-color: #fff;
  background-image:  url('~@/assets/img/login-bg.png');
  background-position:  center;
  background-size: cover;
  background-repeat: space;
  position: relative;
  font-size: 14px;
  line-height: 1;
  .login-box {
    width: 470px;
    margin: 0 auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    h2 {
      margin: 0;
      color: #4d4d4d;
      font-size: 56px;
      font-weight: 100;
      text-align: center;
      margin-bottom: 30px;
    }
  }
  .el-tabs {
    &__header {
      text-align: center;
      margin-bottom: 0;
    }
    &__nav-wrap {
      display: inline-block;
      &::after {
        display: none;
      }
    }
  }
  .login-form {
    .el-input {
      margin-top: 30px;
      input {
        border-radius: 0;
        border-left: 0;
        border-right: 0;
        border-top: 0;
        outline: 0;
        color: #a1a1a1;
        padding-left: 50px;
        &:focus {
          border-color: #DCDFE6;
        }
      }
      &__icon {
        color: #a1a1a1;
        font-size: 20px;
      }
      .el-input-group__append {
        background-color: unset;
        border-radius: 0;
        border-left: 0;
        border-right: 0;
        border-top: 0;
        padding: 0;
        img {
          width: 62px;
          height: 32px;
          cursor: pointer;
        }
      }
    }
  }
  .login-action {
    text-align: right;
    margin-top: 60px;
  }
  .login-btn {
    display: block;
    width: 100%;
    border-radius: 25px;
    color: #4d4d4d;
    padding: 0;
    height: 50px;
    line-height: 50px;
    margin-top: 50px;
  }
  .footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 30px;
    text-align: center;
    color: #999;
    font-size: 14px;
    // a {
    //   color: #4d4d4d;
    // }
  }
}
</style>


