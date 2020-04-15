<template>
  <div class="setting-store">
    <div class="page-head">腾讯云存储</div>
    <el-form ref="form" :model="formData" :rules="rules" label-position="left" class="we7-panel-form" :class="{'edit': editStatus}" label-width="120px">
      <div class="we7-panel-form__header">腾讯云存储</div>
      <div class="we7-panel-form__body">
        <el-form-item label="APPID" prop="app_id">
          <el-input v-model="formData.app_id" placeholder="APPID 是您项目的唯一ID" v-if="editStatus"></el-input>
          <span v-else>{{formData.app_id}}</span>
        </el-form-item>
        <el-form-item label="SecretID" prop="secret_id">
          <el-input v-model="formData.secret_id" placeholder="SecretID 是您项目的安全密钥，具有该账户完全的权限，请妥善保管" v-if="editStatus"></el-input>
          <span v-else>{{formData.secret_id}}</span>
        </el-form-item>
        <el-form-item label="SecretKEY" prop="secret_key">
          <el-input v-model="formData.secret_key" placeholder="SecretKEY 是您项目的安全密钥，具有该账户完全的权限，请妥善保管" v-if="editStatus"></el-input>
          <span v-else>{{formData.secret_key}}</span>
        </el-form-item>
        <el-form-item label="Bucket" prop="bucket">
          <el-input v-model="formData.bucket" placeholder="请保证bucket为可公共读取的" v-if="editStatus"></el-input>
          <span v-else>{{formData.bucket}}</span>
        </el-form-item>
        <el-form-item label="所属地域" prop="region">
          <el-select v-model="formData.region" placeholder="所属地域" v-if="editStatus">
            <el-option v-for="(region, key) in regionList" :value="key" :key="key" :label="region"></el-option>
          </el-select>
          <span v-else>{{regionList[formData.region]}}</span>
        </el-form-item>
        <el-form-item label="Url" prop="url">
          <el-input v-model="formData.url" placeholder="腾讯云支持用户自定义访问域名。注：url结尾不加 ‘/’例：http://abc.com" v-if="editStatus"></el-input>
          <span v-else>{{formData.url}}</span>
          <div class="">
            不填写则使用默认的地址<span v-if="formData.app_id && formData.region && formData.bucket">{{formData.bucket + '-' + formData.app_id + '.cos.'+ formData.region +'.myqcloud.com'}}</span>
          </div>
        </el-form-item>
        <el-form-item label="保存目录" prop="path">
          <el-input v-model="formData.path" placeholder="指定保存目录后，上传图片后会在COS中新建相应的目录，保存图片方便管理" v-if="editStatus"></el-input>
          <span v-else>{{formData.path}}</span>
        </el-form-item>
      </div>
    </el-form>
    <el-button type="primary" @click="editStatus = true" v-if="!editStatus">编辑</el-button>
    <template v-if="editStatus">
      <el-button type="primary" @click="onSubmit">保存</el-button>
      <el-button @click="editStatus = false">取消</el-button>
    </template>
  </div>
</template>

<script>
export default {
  data() {
    return {
      editStatus: false,
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
          // this.$post('/admin/setting/save', {'key': this.formData['key'], 'setting' : this.formData})
          this.$post('/admin/setting/save', {'key': 'cloud_cosv5', 'setting' : this.formData})
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

<style lang="scss">
.setting-store {
  .page-head {
    padding-bottom: 0;
  }
}
</style>