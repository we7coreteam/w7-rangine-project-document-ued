<template>
  <div>
    <h3 class="page-head">
      <router-link to='/admin/user'><i class="el-icon-arrow-left"></i>用户管理</router-link>/基本信息
    </h3>
    <div class="title">基本信息</div>
    <div class="content">
      <el-form ref="form" :model="formData" label-width="80px" :label-position="'left'">
        <el-form-item label="用户账号">
          <el-input v-model="formData.username" ></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.userpass" ></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="formData.confirm_userpass" ></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="4" ></el-input>
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
      formData: {
        id : this.$route.params.id,
        username: '',
        userpass: '',
        confirm_userpass: '',
        remark: ''
      }
    }
  },
  methods: {
    onSubmit() {
      if(this.formData.userpass !== this.formData.confirm_userpass) {
        this.$message('两次密码不一致，请重新输入！')
        return
      }
      this.$post('/admin/user/adduser', this.formData)
        .then(() => {
          this.$message('保存成功！')
        })
    },
    getDetailsUser() {
      this.$post('/admin/user/detailsuser',{
        id: this.formData.id
      })
        .then(res => {
          this.formData.username = res.username
          this.formData.remark = res.remark
        })
    }
  },
  created() {
    if(this.$route.params.id) {
      this.getDetailsUser()
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  width: 100%;
  height: 30px;
  font-size: 14px ;
  color: #3296fa;
  line-height: 30px;
  background-color: #f4f5f9;
  text-align: center;
}
.content {
  width: 500px;
  margin-top:69px;
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