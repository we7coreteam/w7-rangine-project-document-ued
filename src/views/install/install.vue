<template>
  <div class="install-wrap">
    <div class="install">
      <div class="i-header">
        <span @click="goIndex"><img src="@/assets/img/icon-5.png">文档管理系统</span>
      </div>
      <router-view></router-view>
    </div>
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
    padding-top: 50px;

    .install {
      width: 1200px;
      margin: 0 auto;

      .i-header {
        font-size: 32px;
        color: #333;
        margin-bottom: 50px;

        span {
          display: flex;
          align-items: center;
          cursor: pointer;

          img {
            margin-right: 10px;
          }
        }
      }
    }
  }
</style>