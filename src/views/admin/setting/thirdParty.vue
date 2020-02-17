<template>
  <div class="setting-thirdParty">
    <div class="page-head">{{formData.setting.name}}授权设置</div>
    <el-form class="we7-panel-form" status-icon label-position="left" label-width="290px"
      :model="formData"
      ref="thirdPartyForm"
      :rules="rules">
      <div class="we7-panel-form__header">
        {{formData.setting.name}}登录配置
        <el-button type="text" @click="editStatus = true">编辑</el-button>
      </div>
      <div class="we7-panel-form__body">
        <el-form-item :label="formData.setting.name + '授权登录'" :class="{'no-border-bottom': editStatus}">
          <el-switch v-model="formData.setting.enable"
            :active-value="1"
            :inactive-value="0"
            @change="change">
          </el-switch>
        </el-form-item>
        <el-form-item label="第三方名称" :class="{'no-border-bottom': editStatus}" prop="setting.name">
          <el-input v-model="formData.setting.name" v-if="editStatus"></el-input>
          <span v-else>{{formData.setting.name}}</span>
        </el-form-item>
        <el-form-item label="LOGO" :class="{'no-border-bottom': editStatus}" prop="setting.logo"
          v-if="!formData.is_default">
          <el-upload
            class="avatar-uploader"
            action="/admin/upload/image"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
             v-if="editStatus">
            <img v-if="formData.setting.logo" :src="formData.setting.logo" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <img :src="formData.setting.logo" class="avatar" v-else>
        </el-form-item>
        <el-form-item label="APPID" :class="{'no-border-bottom': editStatus}" prop="setting.app_id">
          <el-input v-model="formData.setting.app_id" v-if="editStatus"></el-input>
          <span v-else>{{formData.setting.app_id}}</span>
        </el-form-item>
        <el-form-item label="SERCETkey" :class="{'no-border-bottom': editStatus}" prop="setting.secret_key">
          <el-input v-model="formData.setting.secret_key" v-if="editStatus"></el-input>
          <span v-else>{{formData.setting.secret_key}}</span>
        </el-form-item>
        <el-form-item label="ACCESSTOKEN  API地址" :class="{'no-border-bottom': editStatus}" prop="setting.access_token_url">
          <el-input v-model="formData.setting.access_token_url" v-if="editStatus"></el-input>
          <span v-else>{{formData.setting.access_token_url}}</span>
        </el-form-item>
        <el-form-item label="获取用户信息  API地址" :class="{'no-border-bottom': editStatus}" prop="setting.user_info_url">
          <el-input v-model="formData.setting.user_info_url" v-if="editStatus"></el-input>
          <span v-else>{{formData.setting.user_info_url}}</span>
        </el-form-item>
      </div>
      <template v-if="!formData.is_default">
        <div class="we7-panel-form__header">转换功能</div>
        <div class="we7-panel-form__body">
          <el-form-item label="uid" :class="{'no-border-bottom': editStatus}">
            <el-input v-model="formData.convert.uid" v-if="editStatus"></el-input>
            <span v-else>{{formData.convert.uid}}</span>
          </el-form-item>
          <el-form-item label="username" :class="{'no-border-bottom': editStatus}">
            <el-input v-model="formData.convert.username" v-if="editStatus"></el-input>
            <span v-else>{{formData.convert.username}}</span>
          </el-form-item>
        </div>
      </template>
    </el-form>
    <template v-if="editStatus">
      <el-button type="primary" @click="save">保存</el-button>
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
        is_default: false,
        setting: {
          name: '',
          enable: '',
          logo: '',
          app_id: '',
          secret_key: '',
          access_token_url: '',
          user_info_url: ''
        },
        convert: {
          uid: '',
          username: ''
        }
      },
      rules: {
        'setting.name': [
          { required: true, message: '请填写第三方名称', trigger: 'blur' }
        ],
        'setting.logo': [
          { required: true, message: '请上传LOGO', trigger: 'blur' }
        ],
        'setting.app_id': [
          { required: true, message: '请填写APPID', trigger: 'blur' }
        ],
        'setting.secret_key': [
          { required: true, message: '请填写SERCETkey', trigger: 'blur' }
        ],
        'setting.access_token_url': [
          { required: true, message: '请填写ACCESSTOKEN', trigger: 'blur' }
        ],
        'setting.user_info_url': [
          { required: true, message: '请填写获取用户信息', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    $route: {
      handler: function(){
        this.init()
      },
      deep: true
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$post('/admin/third-party-login/detail', {
        id: this.$route.query.id
      })
        .then(res => {
          this.formData.is_default = res.is_default
          this.formData.setting = {
            name: res.setting.name || '',
            enable: res.setting.enable || '',
            logo: res.setting.logo || '',
            app_id: res.setting.app_id || '',
            secret_key: res.setting.secret_key || '',
            access_token_url: res.setting.access_token_url || '',
            user_info_url: res.setting.user_info_url || ''
          }
          this.formData.convert = res.convert || {}
        })
    },
    handleAvatarSuccess(res) {
      this.formData.setting.logo = res.data.url
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    change() {
      let flag = false
      for (const key in this.formData.setting) {
        if (!this.formData.setting[key] && key != 'enable') {
          flag = true
          break
        }
      }
      if (flag) {
        this.$message('请填写必填项！')
        this.formData.setting.enable = this.formData.setting.enable == 1 ? 0 : 1
        return
      }
      let data = {
        id: this.$route.query.id,
        setting: {
          ...this.formData.setting
        }
      }
      if (!this.formData.is_default) {
        data['convert'] = {
          ...this.formData.convert
        }
      }
      this.$post('/admin/third-party-login/update', data)
        .then(() => {
          this.$message('修改成功！')
        })
    },
    save() {
      this.$refs.thirdPartyForm.validate((valid) => {
        if (valid) {
          let data = {
            id: this.$route.query.id,
            setting: {
              ...this.formData.setting
            }
          }
          if (!this.formData.is_default) {
            data['convert'] = {
              ...this.formData.convert
            }
          }
          this.$post('/admin/third-party-login/update', data)
            .then(() => {
              this.$message('修改成功！')
              this.editStatus = false
            })
        } else {
          this.editStatus = true
        }
      })
    }
  }
}
</script>

<style lang="scss">
.setting-thirdParty {
  .page-head {
    padding-bottom: 0;
  }
  .no-border-bottom {
    border-bottom: 0;
  }
}
</style>