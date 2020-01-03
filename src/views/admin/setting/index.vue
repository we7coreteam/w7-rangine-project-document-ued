<template>
  <div>
    <!-- <h3 class="page-head">
      <router-link to="/admin/setting">
        <i class="el-icon-arrow-left"></i>系统管理
      </router-link>/存储设置
    </h3> -->
    <div class="title">腾讯云存储</div>
    <div class="content">
      <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="APPID" prop="app_id">
          <el-input v-model="formData.app_id" placeholder="APPID 是您项目的唯一ID"></el-input>
        </el-form-item>
        <el-form-item label="SecretID" prop="secret_id">
          <el-input v-model="formData.secret_id" placeholder="SecretID 是您项目的安全密钥，具有该账户完全的权限，请妥善保管"></el-input>
        </el-form-item>
        <el-form-item label="SecretKEY" prop="secret_key">
          <el-input v-model="formData.secret_key" placeholder="SecretKEY 是您项目的安全密钥，具有该账户完全的权限，请妥善保管"></el-input>
        </el-form-item>
        <el-form-item label="Bucket" prop="bucket">
          <el-input v-model="formData.bucket" placeholder="请保证bucket为可公共读取的"></el-input>
        </el-form-item>
        <el-form-item label="所属地域" prop="region">
          <!-- <el-input v-model="formData.region"></el-input> -->
          <el-select v-model="formData.region" placeholder="所属地域">
            <el-option v-for="(region, key) in regionList" :value="key" :key="key" :label="region"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Url" prop="url">
          <el-input v-model="formData.url" placeholder="腾讯云支持用户自定义访问域名。注：url结尾不加 ‘/’例：http://abc.com"></el-input>
          <div class="">不填写则使用默认的地址<span v-if="formData.app_id && formData.region && formData.bucket">{{formData.bucket + '-' + formData.app_id + '.cos.'+ formData.region +'.myqcloud.com'}}</span>
          </div>
        </el-form-item>
         <el-form-item label="保存目录" prop="path">
          <el-input v-model="formData.path" placeholder="指定保存目录后，上传图片后会在COS中新建相应的目录，保存图片方便管理"></el-input>
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
        url: '',
        path: ''
      },
      regionList: {
        'ap-beijing-1': '北京一区',
        'ap-beijing': '北京',
        'ap-shanghai': '上海（华东）',
        'ap-guangzhou': '广州（华南)',
        'ap-chengdu': '成都（西南）',
        'ap-chongqing': '重庆',
        'ap-shenzhen-fsi': '深圳金融',
        'ap-shanghai-fsi': '深圳金融',
        'ap-beijing-fsi': '北京金融',
        'ap-hongkong': '中国香港',
        'ap-singapore': '新加坡',
        'ap-mumbai': '孟买',
        'ap-seoul': '首尔',
        'ap-bangkok': '曼谷',
        'ap-tokyo': '东京',
        'na-siliconvalley': '硅谷',
        'na-ashburn': '弗吉尼亚',
        'na-toronto': '多伦多',
        'eu-frankfurt': '法兰克福',
        'eu-moscow': '莫斯科',
      },
      rules: {
        app_id: [{ required: true, message: '请输入APPID', trigger: 'blur' }],
        secret_id: [{ required: true, message: '请输入SecretID', trigger: 'blur' }],
        secret_key: [{ required: true, message: '请输入SecretKEY', trigger: 'blur' }],
        bucket: [{ required: true, message: '请输入Bucket', trigger: 'blur' }],
        region: [{ required: true, message: '请输入Bucket所属地域', trigger: 'blur' }],
        // cdn: [{ required: true, message: '请输入Url', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$post('/admin/setting/cos', {})
        .then(res => {
          this.formData = Object.assign(this.formData, res.setting);
          this.formData.key = res.key
        })
        .catch(() => {})
    },
    onSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$post('/admin/setting/save', {'key': this.formData['key'], 'setting' : this.formData})
            .then(() => {
              this.$message('保存成功！')
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
  width: 900px;
  margin-top: 69px;
  input {
    border: solid 1px #eeeeee;
  }
  /deep/ .el-input__inner {
    height: 35px;
  }
}
</style>