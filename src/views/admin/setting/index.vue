<template>
  <div>
    <h3 class="page-head">
      <router-link to="/admin/setting">
        <i class="el-icon-arrow-left"></i>系统管理
      </router-link>/存储设置
    </h3>
    <div class="title">腾讯云存储</div>
    <div class="content">
      <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="APPID" prop="app_id">
          <el-input v-model="formData.app_id"></el-input>
          <span>APPID 是您项目的唯一ID</span>
        </el-form-item>
        <el-form-item label="SecretID" prop="secret_id">
          <el-input v-model="formData.secret_id"></el-input>
          <span>SecretID 是您项目的安全密钥，具有该账户完全的权限，请妥善保管</span>
        </el-form-item>
        <el-form-item label="SecretKEY" prop="secret_key">
          <el-input v-model="formData.secret_key"></el-input>
          <span>SecretKEY 是您项目的安全密钥，具有该账户完全的权限，请妥善保管</span>
        </el-form-item>
        <el-form-item label="Bucket" prop="bucket">
          <el-input v-model="formData.bucket"></el-input>
          <span>请保证bucket为可公共读取的</span>
        </el-form-item>
        <el-form-item label="所属地域" prop="region">
          <el-input v-model="formData.region"></el-input>
          <span>选择bucket对应的区域，如: ap-shanghai</span>
        </el-form-item>
        <el-form-item label="Url" prop="cdn">
          <el-input v-model="formData.cdn"></el-input>
          <span>腾讯云支持用户自定义访问域名。注：url开头加http://或https://结尾不加 ‘/’例：http://abc.com</span>
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
        key: 'cloud_cosv5',
        app_id: '',
        secret_id: '',
        secret_key: '',
        bucket: '',
        region: '',
        cdn: ''
      },
      rules: {
        app_id: [{ required: true, message: '请输入APPID', trigger: 'blur' }],
        secret_id: [{ required: true, message: '请输入SecretID', trigger: 'blur' }],
        secret_key: [{ required: true, message: '请输入SecretKEY', trigger: 'blur' }],
        bucket: [{ required: true, message: '请输入Bucket', trigger: 'blur' }],
        region: [{ required: true, message: '请输入Bucket所属地域', trigger: 'blur' }],
        cdn: [{ required: true, message: '请输入Url', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$post('/admin/setting/show', { key: 'cloud_cosv5' })
        .then(res => {
          this.formData.app_id = res.value.app_id
          this.formData.secret_id = res.value.secret_id
          this.formData.secret_key = res.value.secret_key
          this.formData.bucket = res.value.bucket
          this.formData.region = res.value.region
          this.formData.cdn = res.value.app_id
        })
        .catch(() => {})
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$post('/admin/setting/save', this.formData)
            .then(() => {
              this.$message('保存成功！')
            })
            .catch(() => {
              this.$message('保存失败！')
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  width: 100%;
  height: 30px;
  font-size: 14px;
  color: #3296fa;
  line-height: 30px;
  background-color: #f4f5f9;
  text-align: center;
}
.content {
  width: 800px;
  margin-top: 69px;
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