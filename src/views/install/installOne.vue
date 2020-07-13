<template>
  <div class="install">
    <div class="i-con">
      <div class="c-top">
        <template v-if="testLoading">
          <img src="@/assets/img/icon-1.png">正在进行安装环境检测，已检测<span class="num">{{ num }}</span>项参数
        </template>
        <template v-if="testSuccess">
          <img src="@/assets/img/icon-1.png">检测完成，已检测<span class="num">{{ num }}</span>项参数
        </template>
        <template v-if="testError">
          <img src="@/assets/img/icon-2.png">检测完成，<span class="num error">{{ errorNum }}</span>项参数不满足安装条件，请配置后重新检测！
        </template>
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
            <template v-if="item.id == 1">
              <img src="@/assets/img/icon-4.png">
            </template>
            <template v-else>
              <img v-if="item.enable" src="@/assets/img/icon-3.png">
              <img v-else src="@/assets/img/icon-4.png">
            </template>
            {{ item.result }}
          </span>
          <span class="l-right">
            <template v-if="item.id == 1">
              <a v-if="item.enable" href="###">修复异常</a>
            </template>
            <template v-else>
              <a v-if="!item.enable" href="###">修复异常</a>
            </template>
          </span>
        </li>
      </ul>
      <div class="c-bottom">
        <span class="btn" v-if="testError" @click="test">重新检测</span>
        <span class="btn" v-if="testSuccess" @click="nextStep">下一步</span>
      </div>
    </div>
  </div>
</template>

<script>
  import {systemDetection} from '@/api/api'

  export default {
    name: "installOne",
    data() {
      return {
        num: 0,
        errorNum: 0,
        list: '',
        localList: '',
        errorClass: false,
        testLoading: true,
        testSuccess: false,
        testError: false,
      }
    },
    created() {
      this.systemDetection();
    },
    methods: {
      systemDetection() {
        systemDetection().then(res => {
          if (res.code == 200) {
            for (const item of res.data) {
              if (item.id == 1 && !item.enable) {
                this.list = res.data.slice(1, res.data.length - 1);
                this.num = this.list.length;
              } else if (item.id == 1 && item.enable) {
                this.list = res.data.slice(0, 1);
                this.num = 1;
                this.errorNum = 1;
                this.testLoading = false;
                this.testSuccess = false;
                this.testError = true;
                return false
              }
            }
            let listError = [];
            this.list.forEach(item => {
              if (!item.enable) {
                listError.push(item);
              }
            })
            if (listError.length) {
              this.list = listError;
              this.testLoading = false;
              this.testSuccess = false;
              this.testError = true;
              this.errorNum = listError.length;
            } else {
              this.testLoading = false;
              this.testSuccess = true;
              this.testError = false;
            }
          } else {
            this.list = res.data;
          }
        }).catch(e => {
          console.log(e);
        })
      },
      // 重新检测
      test() {
        this.systemDetection();
      },
      // 下一步
      nextStep() {
        this.$router.push({name: 'installTwo'});
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
          font-size: 28px;

          img {
            margin-right: 10px;
          }

          .num {
            color: #39b54a;

            &.error {
              color: #e63d2e;
            }
          }
        }

        ul {
          padding: 50px 0 100px 50px;

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

        .c-bottom {
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;

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