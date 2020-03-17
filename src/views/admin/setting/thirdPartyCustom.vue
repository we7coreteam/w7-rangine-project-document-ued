<template>
  <div class="setting-thirdParty">
    <div class="page-head">自定义授权配置</div>
    <el-form :model="formData" ref="customForm" status-icon label-position="left">
      <div class="we7-panel-form" v-for="(item, index) in formData.customList" :key="index">
        <div class="we7-panel-form__header">
          自定义第三方授权配置
          <el-button type="text" @click="del(index)" v-if="index > 0">删除</el-button>
        </div>
        <div class="we7-panel-form__body edit">
          <el-form-item label="授权登录" label-width="290px">
            <el-switch v-model="item.setting.enable"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>
        </div>
        <div class="we7-panel-form__header">
          自定义第三方登陆配置
          <!-- <el-button type="text" @click="del(index)" v-if="index > 0">删除</el-button> -->
        </div>
        <div class="we7-panel-form__body edit">
          <!-- <el-form-item label="授权登录" label-width="290px">
            <el-switch v-model="item.setting.enable"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item> -->
          <el-form-item label="第三方名称" label-width="290px"
            :prop="'customList.' + index + '.setting.name'"
            :rules="rules.name">
            <el-input v-model="item.setting.name"></el-input>
          </el-form-item>
          <el-form-item label="LOGO" label-width="290px"
            :prop="'customList.' + index + '.setting.logo'"
            :rules="rules.logo">
            <el-upload
              class="avatar-uploader"
              action="/admin/upload/image"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-success="function (res, file) { return handleAvatarSuccess(res, file, index)}">
              <img v-if="item.setting.logo" :src="item.setting.logo" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="APPID" label-width="290px"
            :prop="'customList.' + index + '.setting.app_id'"
            :rules="rules.app_id">
            <el-input v-model="item.setting.app_id"></el-input>
          </el-form-item>
          <el-form-item label="SERCETkey" label-width="290px"
            :prop="'customList.' + index + '.setting.secret_key'"
            :rules="rules.secret_key">
            <el-input v-model="item.setting.secret_key"></el-input>
          </el-form-item>
          <el-form-item label="ACCESSTOKEN  API地址" label-width="290px"
            :prop="'customList.' + index + '.setting.access_token_url'"
            :rules="rules.access_token_url">
            <el-input v-model="item.setting.access_token_url"></el-input>
          </el-form-item>
          <el-form-item label="获取用户信息  API地址" label-width="290px"
            :prop="'customList.' + index + '.setting.user_info_url'"
            :rules="rules.user_info_url">
            <el-input v-model="item.setting.user_info_url"></el-input>
          </el-form-item>
        </div>
        <div class="we7-panel-form__header">
          <span>转换功能</span>
          <span><i class="el-icon-info"></i>文档系统需要用户名，id的字段名是username、uid，请根据第三方系统对应的字段名进行转换。</span>
        </div>
        <div class="we7-panel-form__body edit">
          <el-form-item label="uid" label-width="290px">
            <el-input v-model="item.convert.uid"></el-input>
          </el-form-item>
          <el-form-item label="username" label-width="290px">
            <el-input v-model="item.convert.username"></el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <el-button type="text" @click="add">+添加自定义授权</el-button>
    <el-button type="primary" @click="save">保存</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        customList: [
          {
            setting: {
              enable: 1
            },
            convert: {}
          }
        ]
      },
      rules: {
        name: [
          { required: true, message: '请填写第三方名称', trigger: 'blur' }
        ],
        logo: [
          { required: true, message: '请上传LOGO', trigger: 'blur' }
        ],
        app_id: [
          { required: true, message: '请填写APPID', trigger: 'blur' }
        ],
        secret_key: [
          { required: true, message: '请填写SERCETkey', trigger: 'blur' }
        ],
        access_token_url: [
          { required: true, message: '请填写ACCESSTOKEN', trigger: 'blur' }
        ],
        user_info_url: [
          { required: true, message: '请填写获取用户信息', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    add() {
      this.formData.customList.push({
        editStatus: true,
        setting: {
          enable: 1
        },
        convert: {}
      })
    },
    del(index) {
      this.formData.customList.splice(index, 1)
    },
    handleAvatarSuccess(response, file, index) {
      this.$set(this.formData.customList[index].setting, 'logo', response.data.url)
    },
    beforeAvatarUpload(file) {
      const isFormat = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isFormat) {
        this.$message.error('上传LOGO只支持jpg、jpeg、png格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传LOGO大小不能超过 2MB!');
      }
      return isFormat && isLt2M;
    },
    save() {
      this.$refs.customForm.validate((valid) => {
        if(valid) {
          let data = {
            setting: {
              ...this.formData.customList[0].setting
            },
            convert: {
              ...this.formData.customList[0].convert
            }
          }
          this.$post('/admin/third-party-login/add', data)
            .then(() => {
              this.$message('添加成功！')
              this.$emit('refreshMenu', true)
            })
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
}
</style>