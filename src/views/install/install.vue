<template>
  <div class="install-wrap">
    <div class="i-header">
      <span @click="goIndex"><i class="wi wi-wendang-logo"></i>文档控制台</span>
    </div>
    <div class="install-con">
      <router-view></router-view>
    </div>
    <footer>
      <div class="footer-law"><p>Copyright © 2018 宿州市涛盛网络科技有限公司 www.w7.cc All Rights Reserved </p><p>网站备案：皖ICP备17004788号-1&nbsp;&nbsp;增值电信业务经营许可证：皖B2-20200003&nbsp;&nbsp;<a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=34130202000406" target="_blank"><img src="//cdn.w7.cc/new/img/icon/bei.png?imageView2/5/w/14/h/14" alt="">&nbsp;&nbsp;皖公网安备 34130202000406号</a>&nbsp;&nbsp;<a href="http://www.cyberpolice.cn" target="_blank"><img src="//cdn.w7.cc/new/img/icon/jubao.png?imageView2/5/w/14/h/14" alt="">&nbsp;&nbsp;网络违法犯罪举报网站</a></p></div>
    </footer>
  </div>
</template>

<script>
  export default {
    name: "install",
    data() {
      return {}
    },
    created() {
    },
    methods: {
      goIndex() {
        this.$router.push('/admin')
      }
    }
  }
</script>

<style scoped lang="scss">
  .install-wrap {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: #fff url("~@/assets/img/login-bg.png") no-repeat center / cover;
    left: 0;
    top: 0;

    .i-header {
      font-size: 24px;
      color: #333;
      margin-bottom: 50px;
      height: 60px;
      display: flex;
      align-items: center;
      padding-left: 50px;

      span {
        display: flex;
        align-items: center;
        cursor: pointer;

        .wi-wendang-logo {
          margin-right: 20px;
          font-size: 30px;
        }
      }
    }

    .install-con {
      width: 1200px;
      margin: 0 auto;
    }

    footer {
      line-height: 30px;
      padding-bottom: 20px;
      text-align: center;
      color: #616161;
      font-size: 14px;
    }
  }
</style>