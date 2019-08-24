<template>
  <el-container class="admin-view">
    <el-header class="f-between">
      <router-link to="/admin" class="logo">
        <img src="~@/assets/img/logo.png" alt="">文档控制台
      </router-link>
      <div class="user">
        Admin
      </div>
    </el-header>
    <el-container class="home-container">
      <el-aside class="w7-aside-home" width="350px">
        <p class="w7-aside-home-head">目录</p>
        <el-tree class="w7-tree" :data="chapters" :props="defaultProps" empty-text=""
          ref="chaptersTree"
          node-key="id"
          :highlight-current="true"
          @node-click="handleNodeClick">
          <span class="custom-tree-node" slot-scope="{ node }">
            <span>{{ node.label }}</span>
          </span>
        </el-tree>
      </el-aside>
      <el-main>
        <div class="search">
          <el-input placeholder="请输入关键字搜索" v-model="keyword">
            <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
          </el-input>
        </div>
        <div class="line" v-if="!articleFlag"></div>
        <div class="content">
          <div class="article" v-show="articleFlag">
            <p class="title">{{ articleContent.name }}</p>
            <p class="info">
              <span>更新时间：{{ articleContent.updated_at }}</span>
              <span>作者：Admin</span>
            </p>
            <div v-html="articleContent.content"></div>
            <div class="up-down">
              <el-button type="text" v-show="articleContent.previous_chapter_id > 0">
                <i class="el-icon-arrow-left"></i>上一篇：{{articleContent.previous_chapter_name}}
              </el-button>
              <el-button type="text" v-show="articleContent.previous_chapter_id == 0" disabled>没有上一章了</el-button>
              <el-button type="text" v-show="articleContent.next_chapter_id == 0" disabled>没有下一章了</el-button>
              <el-button v-show="articleContent.next_chapter_id > 0" type="text">
                下一篇：{{articleContent.next_chapter_name}}<i class="el-icon-arrow-right"></i>
              </el-button>
            </div>
          </div>
          <div class="article-list" v-if="!articleFlag">
            <el-button class="back" type="text" @click="articleFlag = !articleFlag">返回</el-button>
            <p class="number-result">4条结果“云服务”</p>
            <div class="list-content">
              <div class="header">
                <p class="title">为什么云服务操作困难？</p>
                <p class="info">
                  <span>更新时间：</span>
                  <span>作者：Admin</span>
                </p>
              </div>
              <p class="content">
                的复合型的开云服务路附近宽宏大量副科级哈迪斯扣积分换老师打飞机独给对方加孤苦伶仃发几个带来云服务利守空房好的老师开放好东的方云服务递费葫芦岛市会计分录的买房就是靠劳动纠是纷
西大家是的房交会的刷卡缴费后开始交电话费科技收到货款附近金凤凰SDK解放后开始登记后方可抵扣积分换款式的经费和会计师大会 几号发的时刻将发挥科技收到回复...
              </p>
              <p class="from">来源：入门指引-域名网站-使用规则</p>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
    <el-footer class="w7-footer" height="14px">
      Powered by <a href="https://www.w7.cc">微擎云计算©www.w7.cc</a>
    </el-footer>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      chapters: [],//左侧目录
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      keyword: '',
      articleFlag: false,//true显示文章内容 false显示搜索列表
      articleContent: {
        name: "标题标题章节名称",
        updated_at: "2019-08-30 12:35:23",
        content: '',
        previous_chapter_id: 2,
        previous_chapter_name: "山海经",
        next_chapter_id: 0,
        next_chapter_name: ""
      }
    }
  },
  methods: {
    getChapters() {
      this.$post('/admin/chapter/index', {
        document_id: this.$route.params.id
      })
        .then(res => {
          this.chapters = res
          this.$nextTick(() => {
            this.defaultSelectNode()
          })
        })
    },
    handleNodeClick(obj) {
      this.$post('/client/detail', {
        document_id: this.$route.params.id,
        id: obj.id
      })
        .then(res => {
          this.articleContent = res
        })
    },
    defaultSelectNode() {
      //tree默认选中第一个
      this.$refs.chaptersTree.setCurrentKey( this.chapters[0].id )
      this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
    },
    search() {
      this.$post('/client/search', {
        document_id: this.$route.params.id,
        keywords: this.keyword
      })
        .then(res => {
          this.articleFlag = false
          console.log(res)
        })
    },
    highlight(text) {
      var keyword = this.keyword
      text = text.split('')
      keyword = keyword.split('')
      var html = ''
      for(var i in text) {
          if(keyword.indexOf(text[i]) !== -1) {
              html = html + '<span class="highlight">' + text[i] +'</span>'
          } else {
              html = html + text[i]
          }
      }
      return html
  }
  },
  created () {
    this.getChapters()
  }
}
</script>

<style lang="scss">
.f-between{
  justify-content:space-between;
}
.home-container {
  width: 90%;
  max-width: 1600px;
  margin: 50px auto 0;
  .w7-aside-home {
    background-color: #f7f8fa;
    border-right: #f1f2f3 1px solid;
    .w7-aside-home-head {
      font-size: 23px;
      padding: 48px 0 48px 40px;
    }
    .w7-tree {
      font-size: 17px;
      background: #f7f8fa;
      .el-tree-node__content {
        padding-top: 10px !important;
        padding-bottom: 10px !important;
        .el-tree-node__expand-icon {
          margin-left: 40px;
        }
      }
      .is-current {
        > .el-tree-node__content{
          background-color: #f0f2f5;
          color: #017efb;
        }
      }
    }
  }
  .el-main {
    padding: 0;
    .search {
      width: 100%;
      padding-bottom: 20px;
      text-align: right;
      input {
        width: 380px;
        height: 34px;
        border: solid 1px #eeeeee;
        border-radius: 0;
      }
      i {
        line-height: 34px;
      }
    }
    .line{
      border-bottom: solid 1px #eeeeee;
    }
    .content {
      font-size: 14px;
      color: #333333;
      margin-left: 50px;
      .article {
        .title {
          font-size: 20px;
        }
        .info {
          margin: 15px 0 25px 0;
          span {
            margin-right: 40px;
          }
        }
        .up-down {
          display: flex;
          justify-content: space-between;
          margin: 45px 0 20px 0;
        }
      }
      .article-list {
        .highlight {
          color: #3296fa;
        }
        .back {
          margin-top: 30px;
        }
        .number-result {
          margin-top: 10px;
          margin-bottom: 50px;
        }
        .list-content {
          margin-bottom: 60px;
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .title {
              font-size: 20px;
            }
            .info {
              span {
                margin-left: 23px;
                color: #999999;
              }
            }
          }
          .content, .from {
            color: #999999;
            line-height: 24px;
          }
          .from {
            margin-top: 18px;
          }
        }
      }
    }
  }
}

</style>