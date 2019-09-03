<template>
  <el-container class="home-container">
    <el-aside class="w7-aside-home" width="350px">
      <p class="w7-aside-home-head">目录</p>
      <el-tree class="w7-tree" :data="chapters" :props="defaultProps" empty-text=""
        ref="chaptersTree"
        node-key="id"
        :highlight-current="true"
        :default-expanded-keys="expandIdArray"
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
            <span v-show="articleContent.updated_at">更新时间：{{ articleContent.updated_at }}</span>
            <span v-show="articleContent.username">作者：{{ articleContent.username }}</span>
          </p>
          <div :class="{'markdown-body': articleContent.layout == 1}" v-html="articleContent.content"></div>
          <mavon-editor ref="mavonEditor" v-show="false"></mavon-editor>
        </div>
        <div class="article-list" v-if="!articleFlag">
          <el-button class="back" type="text" @click="articleFlag = !articleFlag">返回</el-button>
          <p class="number-result">{{articleInfoList.length}}条结果"{{keyword}}"</p>
          <div class="list-content" v-for="articleInfo in articleInfoList" v-bind:key="articleInfo.id" v-show="articleInfoList.length">
            <div class="header">
              <p class="title" v-html="articleInfo.name" @click="changeRoute(articleInfo.id)"></p>
              <p class="info">
                <span>作者：{{articleInfo.username}}</span>
                <span>更新时间：{{articleInfo.updated_at}}</span>
              </p>
            </div>
            <p class="content" v-html="articleInfo.content" @click="changeRoute(articleInfo.id)"></p>
          </div>
          <p class="no-result" v-if="!articleInfoList.length">没有找到相关内容"{{keyword}}"</p>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      document_id: this.$route.params.id,
      document_name: '',
      chapters: [],//左侧目录
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      selectChapterId: '',//左侧文档id(选中节点)
      selectChapterName: '',//左侧文档name(选中节点)
      expandIdArray:[],//需要展开的节点id
      keyword: '',
      articleFlag: true,//true显示文章内容 false显示搜索列表
      articleContent: {},
      articleInfoList: []
      }
  },
  methods: {
    getDocumentName() {
      this.$post('/client/document/getdetails', {
        document_id: this.document_id
      })
        .then(res => {
          this.document_name = res.name
          this.getChapters()
        })
    },
    getChapters() {
      this.$post('/client/chapters', {
        document_id: this.$route.params.id
      })
        .then(res => {
          if(!res.length) {return}
          this.chapters = res
          this.$nextTick(() => {
            //如果没有id,那么tree默认选中第一个
            if (this.$route.query.id) {
              this.selectChapterId = this.$route.query.id
              this.getArticle()
            } else {
              this.selectChapterId = this.chapters[0].id
              this.changeRoute(this.selectChapterId)
            }
          })
        })
    },
    handleNodeClick(obj) {
      this.changeRoute(obj.id)
    },
    changeRoute(id) {
        this.selectChapterId = id
        this.$router.push({ path: '/'+ this.document_id, query: {id: this.selectChapterId} })
    },
    getArticle() {
      this.$post('/client/detail', {
        document_id: this.document_id,
        id: this.selectChapterId
      })
        .then(res => {
          //菜单样式选择
          this.selectNode(this.selectChapterId)
          //页面标题
          document.title = res.name + ' — '+ this.document_name
          this.articleContent = res
          if (this.articleContent.layout == 1) {
            this.articleContent.content = this.$refs.mavonEditor.markdownIt.render(res.content)
          }
          this.articleFlag = true
        })
    },
    selectNode(id) {
      this.$refs.chaptersTree.setCurrentKey(id)
      this.expandIdArray = []
      this.expandIdArray.push(id)
    },
    search() {
      if(this.keyword == "") {
        this.$message('搜索关键字不能为空！')
        return
      }
      this.$post('/client/search', {
        document_id: this.$route.params.id,
        keywords: this.keyword
      })
        .then(res => {
          this.articleFlag = false
          res.forEach(articleInfo => {
            if (articleInfo.layout == 1) {
              articleInfo.content = this.$refs.mavonEditor.markdownIt.render(articleInfo.content)
            }
            //html转成文字
            articleInfo.content = this.htmlToWord(articleInfo.content)
            //关键字变亮
            articleInfo.name = this.highlight(articleInfo.name)
            articleInfo.content = this.highlight(articleInfo.content)
          })
          this.articleInfoList = res
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
    },
    htmlToWord(html) {
      var word = html.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi,'').replace(/<[^>]+?>/g,'').replace(/\s+/g,' ').replace(/ /g,' ').replace(/>/g,' ')
      return word
    }
  },
  watch: {
    $route: {
      handler: function(){
        this.getArticle()
      },
      deep: true// 深度观察监听
    },

  },
  created () {
    this.getDocumentName()
  }
}
</script>

<style lang="scss">
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
              cursor: pointer;
            }
            .info {
              padding-top: 7px;
              span {
                margin-left: 23px;
                color: #999999;
              }
            }
          }
          .content {
            color: #999999;
            line-height: 24px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            margin-left: 0;
            cursor: pointer;
          }
        }
        .no-result {
          padding: 200px 0;
          color: #8d8d8d;
          font-size: 24px;
          font-weight: 400;
          font-style: normal;
          text-align: center;
          line-height: 40px;
          height: 40px;
        }
      }
    }
  }
}
</style>