<template>
  <div class="admin-login">
    <div class="login-box">
      <h2>文档管理系统</h2>
      <el-tabs v-model="active">
        <el-tab-pane label="账号登录" name="account">
          <div class="login-form">
            <el-input v-model="formData.username" prefix-icon="el-icon-user-solid" placeholder="用户名/手机号"></el-input>
            <el-input type="password" v-model="formData.userpass" prefix-icon="el-icon-s-goods" placeholder="输入密码"></el-input>
            <el-input class="code-input" v-model="formData.code" prefix-icon="el-icon-s-goods" placeholder="输入图形验证码" @keyup.enter.native="login">
              <img :src="code" @click="getCode" slot="append" alt="">
            </el-input>
          </div>
          <div class="login-thirdParty" v-if="thirdPartyList.length">
            <span class="title">第三方账号登录</span>
            <div class="icon-list">
              <img class="icon-block"
                   v-for="icon in thirdPartyList" :key="icon.name"
                   :src="icon.logo"
                   :title="icon.name"
                   @click="thirdPartyIconClick(icon.redirect_url)">
            </div>
          </div>
          <!-- <div class="login-action">
            <el-button type="text" @click="showFind">找回密码?</el-button>
          </div> -->
          <el-button class="login-btn" @click="login">登录</el-button>
        </el-tab-pane>
<!--
        <el-tab-pane label="手机快捷登录" name="phone">
          <div class="login-form">
            <el-input v-model="formData.phone" prefix-icon="el-icon-user-solid" placeholder="请输入手机号"></el-input>
            <el-input class="code-input" v-model="formData.phoneCode" prefix-icon="el-icon-s-goods" placeholder="请输入短信验证码" @keyup.enter.native="login"></el-input>
          </div>
          <div class="login-thirdParty" v-if="thirdPartyList.length">
            <span class="title">第三方账号登录</span>
            <div class="icon-list">
              <img class="icon-block"
                   v-for="icon in thirdPartyList" :key="icon.name"
                   :src="icon.logo"
                   :title="icon.name"
                   @click="thirdPartyIconClick(icon.redirect_url)">
            </div>
          </div>
          &lt;!&ndash; <div class="login-action">
            <el-button type="text" @click="showFind">找回密码?</el-button>
          </div> &ndash;&gt;
          <el-button class="login-btn" @click="login">登录</el-button>
        </el-tab-pane>
-->
      </el-tabs>
    </div>
    <div class="footer">
      Powered by <a href="https://www.w7.cc">微擎云计算©www.w7.cc</a>
    </div>
  </div>
</template>

<script>
  import axios from '@/utils/fetch'
  import {systemDetection} from '@/api/api'
  import vm from '@/main'

  export default {
  name: 'adminLoginPage',
  data() {
    return {
      autofocus: false,
      active: 'account',
      code: '',
      formData: {
        username: '',
        userpass: '',
        code: '',
        phone: '',
        phoneCode: ''
      },
      thirdPartyList: []
    }
  },
  beforeRouteEnter(to, from, next) {
    let code = to.query.code//第三方登录成功之后返回的code
    let redirect_url = to.query.redirect_url//需要跳转的url
    let app_id = to.query.app_id
    // console.log(10);
    if (code) {
      // debugger
      axios.post('/common/auth/third-party-login', {
        code,
        app_id
      }).then(res => {
        if (res && res.is_need_bind) {//跳转到绑定
          next('/bind')
        } else {
          if (!redirect_url) {
            // console.error(2)
            next('/admin/document')
          } else {
            // console.error(3)
            window.open(redirect_url, '_self')
          }
        }
      }).catch(() => {
        next('/admin-login')
      })
    } else {
      // debugger
      // console.error(6)
      // console.log(6)
      systemDetection().then(res => {
        if (res.code == 200) {
          for (const item of res.data) {
            if (item.id == 1 && !item.enable) {
              // console.log('router');
              // console.log(vm);
              vm.$router.push({name: 'install'})
              next()
            } else if (item.id == 1 && item.enable) {
              // if (process.env.NODE_ENV) {
              if (process.env.NODE_ENV == 'production') {
                console.log('production');
                axios.post('/common/auth/default-login-url').then(res => {
                  if (res.data) {
                    window.open(res.data, '_self')
                  } else {
                    next()
                  }
                })
              } else {
                // console.error(7)
                next()
              }
            }
          }
        }
      }).catch(e => {
        console.log(e);
      })
    }
  },
  created() {
    // this.systemDetection();
    this.getCode();
    this.getThirdParty();
  },
  methods: {
    // 验证是否安装文档，未安装，跳转到安装页面
    systemDetection() {
      systemDetection().then(res => {
        if (res.code == 200) {
          for (const item of res.data) {
            if (item.id == 1 && !item.enable) {
              this.$router.push({name: 'install'})
            }
          }
        }
      }).catch(e => {
        console.log(e);
      })
    },
    showFind() {
      this.$message({message: '请联系管理员修改或使用密码找回工具修改'})
    },
    getCode() {
      this.$post('/common/verifycode/image')
        .then(res => {
          if(res.code == 200) {
            this.code = res.data.img
          } else {
            this.$message.error(res.message);
          }
        })
    },
    login() {
      this.$post('/common/auth/login', this.formData).then(() => {
        let msg = this.$message('登录成功')
        setTimeout(() => {
          msg.close();
          const href = localStorage.recordHref;
          if (href) {
            // this.$router.push({name: href});
            location.href = href;
          } else {
            this.$router.push('/admin/document')
          }
        }, 500)
      }).catch(() => {
        this.formData.code = ''
        document.getElementsByClassName("el-input__inner")[2].focus()
        this.getCode()
      })
    },
    getThirdParty() {
      console.log('redirect_url');
      console.log(localStorage.redirect_url);
      this.$post('/common/auth/method', {
        redirect_url: localStorage.recordHref || this.$route.query.redirect_url
      }).then(res => {
        this.thirdPartyList = res.data || []
      })
    },
    thirdPartyIconClick(url) {
      window.open(url, '_self')
    }
  }
}
</script>