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
          <div class="we7-panel-form__item">
            <div class="we7-panel-form__label">账号</div>
              <div class="we7-panel-form__value"></div>
          </div>
          <div class="we7-panel-form__item">
            <div class="we7-panel-form__label">密码</div>
              <div class="we7-panel-form__value"></div>
              <div class="we7-panel-form__action">
                <el-tooltip effect="dark" content="编辑" placement="bottom">
                  <i class="wi wi-edit" @click="dialogVisible = true"></i>
                </el-tooltip>
              </div>
          </div>
        </div>
      </div>
      <!-- 弹出框 -->
      <el-dialog class="we7-dialog" title="账号设置" :visible.sync="dialogVisible" :close-on-click-modal="false" center>
        <el-form :model="formData" label-width="105px" label-position="left">
          <el-form-item label="旧密码">
            <el-input v-model="formData.userpass_old"></el-input>
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="formData.userpass" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="formData.confirm_userpass" type="password"></el-input>
          </el-form-item>
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
export default {
  data() {
    return {
      isCollapse: false,
      dialogVisible: false,
      formData: {}
    }
  },
  created() {
    // this.init()
  },
  methods: {
    init() {
      this.$post('/admin/third-party-login/add')
        .then(() => {
          
        })
    },
    confirm() {
      
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