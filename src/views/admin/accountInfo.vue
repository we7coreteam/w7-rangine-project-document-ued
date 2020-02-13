<template>
  <el-container class="account-info">
    <el-aside class="admin-view-aside" :width="isCollapse ? '64px' : '240px'">
      <el-menu class="admin-view-menu"
        default-active="1"
        :router="true"
        :collapse="isCollapse">
        <el-menu-item index="1">
          <i class="wi wi-lock"></i>
          <span slot="title">账户信息</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <div class="page-head">账户信息</div>
      <div class="we7-panel-form">
        <div class="we7-panel-form__header">账户信息</div>
        <div class="we7-panel-form__body">
          <div class="we7-panel-form__item" v-if="UserInfo.user_source && UserInfo.user_source.source_name">
            <div class="we7-panel-form__label">已绑{{UserInfo.user_source.source_name}}</div>
            <div class="we7-panel-form__value">{{UserInfo.user_source.username}}</div>
          </div>
          <div class="we7-panel-form__item">
            <div class="we7-panel-form__label">账号</div>
            <div class="we7-panel-form__value">{{accountName}}</div>
            <div class="we7-panel-form__action">
              <el-tooltip effect="dark" content="编辑" placement="bottom">
                <i class="wi wi-edit wi-oper" @click="openDialog('name')"></i>
              </el-tooltip>
            </div>
          </div>
          <div class="we7-panel-form__item">
            <div class="we7-panel-form__label">密码</div>
            <div class="we7-panel-form__value">******</div>
            <div class="we7-panel-form__action">
              <el-tooltip effect="dark" content="编辑" placement="bottom">
                <i class="wi wi-edit wi-oper" @click="openDialog('pass')"></i>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
      <!-- 弹出框 -->
      <el-dialog class="we7-dialog" title="账号设置" :visible.sync="dialogVisible" :close-on-click-modal="false" center>
        <el-form :model="formData" ref="ruleForm" :rules="rules" status-icon label-width="105px" label-position="left">
          <template v-if="dialogType == 'name'">
            <el-form-item label="账号" prop="username">
              <el-input v-model="formData.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="old_userpass" v-if="!UserInfo.no_password">
              <el-input v-model="formData.old_userpass" show-password></el-input>
            </el-form-item>
          </template>
          <template v-if="dialogType == 'pass'">
            <el-form-item label="旧密码" prop="old_userpass" v-if="!UserInfo.no_password">
              <el-input v-model="formData.old_userpass" show-password></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="userpass">
              <el-input v-model="formData.userpass" show-password></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirm_userpass">
              <el-input v-model="formData.confirm_userpass" show-password></el-input>
            </el-form-item>
          </template>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="confirm">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.formData.confirm_userpass !== '') {
          this.$refs.ruleForm.validateField('confirm_userpass');
        }
        callback();
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.formData.userpass) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    }
    return {
      isCollapse: false,
      dialogVisible: false,
      dialogType: '',
      formData: {
        username: '',
        old_userpass: '',
        userpass: '',
        confirm_userpass: ''
      },
      rules: {
        userpass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        confirm_userpass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户账号', trigger: 'blur' }
        ],
        old_userpass: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters({ UserInfo: 'UserInfo' }),
    accountName() {
      return this.UserInfo.username
    }
  },
  methods: {
    openDialog(type) {
      this.dialogType = type
      if (type == 'name') {
        this.formData.username = this.accountName
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.ruleForm.resetFields()
      })
    },
    confirm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          let data = {}
          if (this.dialogType == 'name') {
            data = {
              username: this.formData.username
            }
          } else {
            data = {
              userpass: this.formData.userpass
            }
          }
          if (!this.UserInfo.no_password) {
            data['old_userpass'] = this.formData.old_userpass
          }
          this.$post('/common/auth/user/update', data)
            .then(() => {
              this.$message('修改成功！')
              if (this.dialogType == 'name') {
                this.accountName = this.formData.username
              }
              this.dialogVisible = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.account-info {
  .el-main {
    padding: 0 25px 0 15px;
  }
  .page-head {
    padding-bottom: 0;
  }
}
</style>