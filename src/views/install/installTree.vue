<template>
  <div class="install">
    <div class="success">
      <div class="s-top">
        <div class="top"><i class="el-icon-success"></i>恭喜您，《文档管理系统》安装成功！</div>
        <div class="center">特别提醒：安装完毕，请复制命令到服务器手动重启服务</div>
        <div class="bottom" v-clipboard:copy="restart" v-clipboard:success="onCopy">重启服务：<span>sh restart.sh</span></div>
      </div>
      <div class="c-bottom">
        <span class="btn" @click="goLogin">进入管理中心</span>
      </div>
    </div>
  </div>
</template>

<script>
  import {install, installConfig, systemDetection} from '@/api/api'

  export default {
    name: "installTree",
    data: function () {
      return {
        restart: 'sh restart.sh',
        init: true,
        loading: false,
        success: false
      }
    },
    created() {
      // const port = location.port;
      this.ruleForm.api_host = location.origin + ':' + 99;
      // this.success = true
    },
    methods: {
      onCopy(){
        this.$message.success('复制成功');
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