<template>
  <div class="install">
    <div class="i-con" v-if="init">
      <div class="c-top">
        <div class="t-tit">配置数据库参数</div>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="200px">
          <el-form-item label="服务器地址" prop="api_host">
            <el-input v-model="ruleForm.api_host" placeholder="示例：200.64.35.80:8080"></el-input>
          </el-form-item>
<!--
          <el-form-item label="服务器端口号" prop="server_port">
            <el-input v-model="ruleForm.server_port"></el-input>
          </el-form-item>
-->
<!--
          <el-form-item label="缓存驱动" prop="cache_driver">
            <el-select v-model="ruleForm.cache_driver" placeholder="请选择缓存驱动">
              <el-option label="default" value="default"></el-option>
              <el-option label="redis" value="redis"></el-option>
            </el-select>
          </el-form-item>
-->
          <template v-if="ruleForm.cache_driver == 'redis'">
            <el-form-item label="redis缓存服务器地址" prop="cache_host">
              <el-input v-model="ruleForm.cache_host" placeholder="示例：127.0.0.1:6739"></el-input>
            </el-form-item>
<!--
            <el-form-item label="redis缓存服务器端口号" prop="cache_port">
              <el-input v-model="ruleForm.cache_port"></el-input>
            </el-form-item>
-->
          </template>
          <el-form-item label="数据库名称" prop="db_database">
            <el-input v-model="ruleForm.db_database"></el-input>
          </el-form-item>
          <el-form-item label="数据库地址" prop="db_host">
            <el-input v-model="ruleForm.db_host" placeholder="示例：200.64.35.80:8080"></el-input>
          </el-form-item>
<!--
          <el-form-item label="数据库端口" prop="db_port">
            <el-input v-model="ruleForm.db_port"></el-input>
          </el-form-item>
-->
          <el-form-item label="数据库用户名" prop="db_username">
            <el-input v-model="ruleForm.db_username"></el-input>
          </el-form-item>
          <el-form-item label="数据库密码" prop="db_password">
            <el-input v-model="ruleForm.db_password"></el-input>
          </el-form-item>
          <el-form-item label="数据库表前缀" prop="db_prefix">
            <el-input v-model="ruleForm.db_prefix"></el-input>
          </el-form-item>
          <el-form-item label="管理员账户" prop="admin_username">
            <el-input v-model="ruleForm.admin_username" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="管理员密码" prop="admin_password">
            <el-input v-model="ruleForm.admin_password" placeholder=""></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="c-bottom">
        <span class="btn" @click="submit('ruleForm')">安装文档系统</span>
      </div>
    </div>
    <div class="i-con" v-if="loading">
      <div class="c-top">
        <div class="t-tit">正在安装文档系统</div>
        <div class="loading">
          <img src="@/assets/img/img-1.png">
          <div class="text">正在安装<i class="el-icon-loading"></i></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {install, installConfig, systemDetection} from '@/api/api'
  import vm from '@/main'

  export default {
    name: "installTwo",
    data: function () {
      var validateApi_host = (rule, value, callback) => {
        let has = value.lastIndexOf(':');
        let hasHttp = value.lastIndexOf('http');
        if (has < 0) {
          has = false
        } else if (has == 4) {
          has = false
        } else if (has == 5) {
          has = false
        } else {
          has = true
        }
        if (value === '' || !has || hasHttp < 0) {
          callback(new Error('请输入正确的服务器地址与端口号'));
        } else {
          callback();
        }
      };
      return {
        restart: 'sh restart.sh',
        init: true,
        loading: false,
        ruleForm2: {
          api_host: '',
          // server_port: '99',
          cache_driver: 'redis',
          cache_host: '127.0.0.1:6379',
          // cache_port: '6379',
          db_host: '127.0.0.1:3306',
          // db_port: '3306',
          db_username: '',
          db_password: '',
          db_database: 'document',
          db_prefix: 'ims_',
          admin_username: '',
          admin_password: '',
          option: 'check'
        },
        ruleForm: {
          api_host: '',
          // server_port: '99',
          cache_driver: 'redis',
          cache_host: '127.0.0.1:6379',
          // cache_port: '6379',
          db_host: '127.0.0.1:3306',
          // db_port: '3306',
          db_username: '',
          db_password: '',
          db_database: 'document',
          db_prefix: 'ims_',
          admin_username: '',
          admin_password: '',
          option: 'check'
        },
        rules: {
          api_host: [
            // {required: true, message: '服务器地址必填', trigger: 'blur'},
            {validator: validateApi_host, trigger: 'blur'}
          ],
          server_port: [
            {required: true, message: '服务器端口号必填', trigger: 'blur'},
          ],
          cache_driver: [
            {required: true, message: '请选择活动区域', trigger: 'change'}
          ],
          cache_host: [
            {required: true, message: '缓存服务器地址必填', trigger: 'blur'},
          ],
          cache_port: [
            {required: true, message: '缓存服务器端口号必填', trigger: 'blur'},
          ],
          db_host: [
            {required: true, message: '数据库地址必填', trigger: 'blur'},
          ],
          db_port: [
            {required: true, message: '数据库端口必填', trigger: 'blur'},
          ],
          db_username: [
            {required: true, message: '数据库用户名必填', trigger: 'blur'},
          ],
          db_password: [
            {required: true, message: '数据库密码必填', trigger: 'blur'},
          ],
          db_database: [
            {required: true, message: '数据库名称必填', trigger: 'blur'},
          ],
          db_prefix: [
            {required: true, message: '数据库表前缀必填', trigger: 'blur'},
          ],
          admin_username: [
            {required: true, message: '管理员账户必填', trigger: 'blur'},
          ],
          admin_password: [
            {required: true, message: '管理员密码必填', trigger: 'blur'},
          ]
        }
      }
    },
    created() {
      // const port = location.port;
      this.ruleForm.api_host = location.origin + ':' + 99;
    },
    beforeRouteEnter(to, from, next) {
      systemDetection().then(res => {
        if (res.code == 200) {
          for (const item of res.data) {
            if (item.id == 1 && !item.enable) {
              next()
            } else if (item.id == 1 && item.enable == 1) {
              vm.$router.push({name: 'installOne'})
            } else if (item.id == 1 && item.enable == 2) {
              vm.$router.push({name: 'adminLoginPage'})
            }
          }
        }
      }).catch(e => {
        console.log(e);
      })
    },
    methods: {
      onCopy(){
        this.$message.success('复制成功');
      },
      submit(formName) {
        const  This = this;
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const res1 = await install(this.ruleForm);
            if (res1.code === 200) {
              try {
                This.init = false;
                This.loading = true;
                this.ruleForm.option = 'send';
                try {
                  const res2 = await install(this.ruleForm);
                  if (res2.code == 200) {
                    This.loading = false;
                    This.init = false;
                    localStorage.db_database = '';
                    localStorage.db_database = this.ruleForm.db_database;
                    setTimeout(() => {
                      This.$router.push({name: 'installTree'});
                    }, 500)
                  }
                } catch (e) {
                  console.log(e);
                  This.init = true;
                  This.loading = false;
                  this.ruleForm.option = 'check';
                }
              } catch (e) {
                console.log(e);
                This.init = true;
                This.loading = false;
              }
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        })
      },
      goLogin() {
        installConfig().then(res => {
          if (res.code == 200) {
            const db_username = localStorage.db_database;
            if (db_username == res.data.db_database && res.data.is_install) {
              this.$router.push({name: 'adminLoginPage'})
            } else {
              this.$message.error({
                message: '请先重启服务后进入管理中心',
              });
            }
          }
        }).catch(e => {
          console.log(e);
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .install {
    .i-header {
      font-size: 32px;
      color: #333;
      display: flex;
      align-items: center;
      margin-bottom: 50px;

      img {
        margin-right: 10px;
      }
    }

    .i-con {
      display: flex;
      align-items: center;
      flex-flow: column;

      .c-top {
        width: 650px;
        margin-bottom: 50px;

        .t-tit {
          text-align: right;
          margin-bottom: 50px;
          color: #333;
          font-size: 28px;
        }

        .loading {
          display: flex;
          flex-flow: column;
          align-items: center;

          img {
            margin-bottom: 20px;
          }

          .text {
            color: #333;
            display: flex;
            align-items: center;

            i {
              margin-left: 5px;
              font-size: 20px;
            }
          }
        }

        /deep/ {
          .el-form-item__label {
            padding-right: 30px;
          }

          .el-select {
            width: 100%;
          }
        }
      }

      .c-bottom {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 70px;

        .btn {
          color: #fff;
          background-color: #3296fa;
          width: 270px;
          line-height: 60px;
          text-align: center;
          cursor: pointer;
        }
      }
    }

    .success {
      display: flex;
      align-items: center;
      flex-flow: column;
      justify-content: center;
      padding-top: 150px;

      .s-top {
        margin-bottom: 30px;

        .top {
          font-size: 30px;
          color: #333;
          margin-bottom: 20px;

          i {
            color: #3bb64c;
            font-size: 30px;
            margin-right: 10px;
          }
        }

        .center {
          margin-bottom: 10px;
          padding-left: 45px;
        }

        .bottom {
          display: flex;
          align-items: center;
          padding-left: 125px;

          span {
            background-color: #d9dde0;
            color: #333;
            padding: 5px 45px;
            font-size: 14px;
            border: 1px solid #ddd;
            cursor: pointer;
          }
        }

      }

      .c-bottom {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 70px;

        .btn {
          color: #fff;
          background-color: #3296fa;
          width: 270px;
          line-height: 60px;
          text-align: center;
          cursor: pointer;
        }
      }
    }
  }
</style>