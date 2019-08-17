<template>
  <div>
    <h3 class="page-head">
      <router-link to='/admin/user'><i class="el-icon-arrow-left"></i></router-link>用户管理/基本信息
    </h3>
    <div class="title">基本信息</div>
    <div style="width: 500px;">
      <el-form ref="form" :model="formData" label-width="80px" :label-position="'left'">
        <el-form-item label="用户账号">
          <el-input v-model="formData.username" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.userpass" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="formData.confirm_userpass" size="mini"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="4" size="mini"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id : this.$route.params.id,
      formData: {
        username: '',
        userpass: '',
        confirm_userpass: '',
        remark: ''
      }
    }
  },
  methods: {
    // TODO userpass confirm_userpass id????
    onSubmit() {
      if(this.formData.userpass !== this.formData.confirm_userpass) {
        this.$message('两次密码不一致，请重新输入！')
        return
      }
      this.$post('/admin/user/adduser',{
        username: this.formData.username,
        userpass: this.formData.userpass,
        remark: this.formData.remark
      })
        .then(() => {
          this.$message('保存成功！')
        })
    },
    getDetailsUser() {
      this.$post('/admin/user/detailsuser',{
        id: this.id
      })
        .then(res => {
          this.formData.username = res.username
          this.formData.remark = res.remark
        })
    }
  },
  created() {
    // TODO {}
    if(this.id) this.getDetailsUser()
  }
}
</script>

<style lang="scss" scoped>
  .title {
    width: 100%;
    height: 30px;
    font-size: 20px ;
    color: #3296fa;
    line-height: 30px;
    background: grey;
    text-align: center;
  }
</style>