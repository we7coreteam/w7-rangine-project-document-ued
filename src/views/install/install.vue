<template>
  <div class="install-wrap">
    <div class="install">
      <div class="i-header">
        <img src="@/assets/img/icon-5.png">文档管理系统
      </div>
      <div class="i-con">
        <div class="c-top">
          <img src="@/assets/img/icon-1.png">正在进行安装环境检测，已检测{{ num }}项参数
        </div>
        <ul>
          <li class="li1">
            <span class="l-left">检测参数</span>
            <span class="l-center">检测结果</span>
            <span class="l-right">处理方式</span>
          </li>
          <li v-for="(item, index) in list" :key="index">
            <span class="l-left">{{ item.name }}</span>
            <span class="l-center">
              <img v-if="item.enable" src="@/assets/img/icon-3.png">
              <img v-else src="@/assets/img/icon-4.png">
              {{ item.result }}
            </span>
            <span class="l-right">
              <a v-if="!item.result" href="###">修复异常</a>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import {systemDetection} from '@/api/api'

  export default {
    name: "install",
    data() {
      return {
        num: 0,
        list: '',
        localList: ''
      }
    },
    created() {
      this.systemDetection();
    },
    methods: {
      systemDetection() {
        systemDetection().then(res => {
          if (res.code == 200) {
            this.list = res.data;
          } else {
            this.list = res.data;
          }
        }).catch(e => {
          console.log(e);
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  ul,li {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .install-wrap {
    position: fixed;
    width: 100%;
    height: 100%;
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
        display: flex;
        align-items: center;
        margin-bottom: 50px;

        img {
          margin-right: 10px;
        }
      }

      .i-con {
        .c-top {
          display: flex;
          align-items: center;
          padding-left: 40px;

          img {
            margin-right: 10px;
          }
        }

        ul {
          padding: 50px 0 50px 50px;

          li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 20px;

            &.li1 {
              color: #999;
              margin-bottom: 30px;
              font-size: 16px;
            }

            .l-left {
              width: 250px;
            }

            .l-center {
              flex: 1;
              display: flex;
              align-items: center;

              img {
                margin-right: 10px;
              }
            }

            .l-right {
              width: 100px;
              text-align: right;

              a {
                color: #3296fa;
              }
            }
          }
        }
      }
    }
  }
</style>