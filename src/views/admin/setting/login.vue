<template>
  <div class="setting-login">
    <div class="page-head">登录设置</div>
    <div class="we7-panel-form">
      <div class="we7-panel-form__header">登录方式设置</div>
      <div class="we7-panel-form__body">
        <div class="we7-panel-form__item">
          <div class="we7-panel-form__label">登录方式</div>
            <div class="we7-panel-form__value">
              <template v-if="loginMethod == 1">
                依赖第三方登录：{{default_login_name}}
              </template>
              <template v-else>
                文档系统登录：{{is_need_bind == '1' ? '第三方登录时需绑定用户自己创建的已有账号' : '第三方登录时系统自动创建一个账号对应'}}
              </template>
            </div>
            <div class="we7-panel-form__action">
              <el-tooltip effect="dark" content="编辑" placement="bottom">
                <i class="wi wi-edit" @click="dialogVisible = true"></i>
              </el-tooltip>
            </div>
        </div>
      </div>
    </div>
    <!-- 弹出框 -->
    <el-dialog class="we7-dialog" title="登录方式设置" :visible.sync="dialogVisible" :close-on-click-modal="false" center>
      <el-form label-width="120px" label-position="left">
        <el-form-item label="登录方式">
          <el-radio-group v-model="loginMethod" @change="change">
            <el-radio :label="0">文档系统登录</el-radio>
            <el-radio :label="1">依赖第三方登录</el-radio>
          </el-radio-group>
          <div class="we7-help-block">文档系统登录：登录时通过文档系统登录页面进行登录；依赖第三方登录：用户登录时跳转至第三方登录页面登录。</div>
        </el-form-item>
        <el-form-item label="第三方登录设置" v-if="loginMethod == 0">
          <el-select v-model="is_need_bind" placeholder="请选择">
            <el-option label="第三方登录时需绑定用户自己创建的已有账号" value="1"></el-option>
            <el-option label="第三方登录时系统自动创建一个账号对应" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择第三方" v-if="loginMethod == 1">
          <el-select v-model="default_login_channel" placeholder="请选择">
            <el-option
              v-for="item in thirdParty"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
          <div class="we7-help-block" v-if="thirdParty.length">用户使用该第三方登录时，系统将随机创建一个账号与该第三方账号绑定，用户可在账号信息中查看或修改。</div>
          <el-button class="textBtn" type="text" @click="goto" v-else>去配置第三方登录</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmBtn">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      loginMethod: 0,
      is_need_bind: '0',
      default_login_channel: '',
      default_login_name: '',
      thirdParty: [],
      thirdPartyFisrtId: ''//第一个第三方配置的id，用于所有授权登录为false的时候跳转
    }
  },
  created() {
    this.init()
    this.getThirdParty()
  },
  methods: {
    init() {
      this.$post('/admin/third-party-login/get-default-channel')
        .then(res => {
          if (res) {
            //default_login_channel  这个表示登录方式，如果是文档，为空，如果是第三方，传qq或者微信的id
            //is_need_bind  这个在选择文档登录的时候传，如果是true代表需要绑定
            if (res.default_login_channel) {
              this.loginMethod = 1
              this.default_login_channel = res.default_login_channel
            } else {
              this.is_need_bind = res.is_need_bind ? '1' : '0'
            }
          }
        })
    },
    getThirdParty() {
      this.$post('/admin/third-party-login/all')
        .then(res => {
          this.thirdParty = []
          for (const i in res) {
            if (i == 0) {
              this.thirdPartyFisrtId = res[i].id
            }
            if (this.default_login_channel == res[i].id) {
              this.default_login_name = res[i].name
            }
            if (res[i].enable) {
              this.thirdParty.push({
                id: res[i].id + '',
                name: res[i].name
              })
              if (!this.default_login_channel) {
                this.default_login_channel = res[i].id + ''
              }
            }
          }
        })
    },
    change(val) {
      if (val == 1 && !this.thirdParty.length) {
        this.getThirdParty()
      }
    },
    goto() {
      let routeUrl = this.$router.resolve({
        path: "/admin/setting/thirdParty?id=" + this.thirdPartyFisrtId
      })
      window.open(routeUrl.href, '_blank')
    },
    confirmBtn() {
      let data = {}
      if (this.loginMethod == 0) {
        data = {is_need_bind: this.is_need_bind}
      } else {
        data = {default_login_channel: this.default_login_channel}
      }
      this.$post('/admin/third-party-login/set-default-channel', data)
        .then(res => {
          this.$message('修改成功！')
          if (this.loginMethod == 1) {
            
          }
          this.dialogVisible = false
        })
    }
  }
}
</script>

<style lang="scss">
.setting-login {
  .page-head {
    padding-bottom: 0;
  }
  .textBtn {
    padding-left: 0;
  }
}
</style>