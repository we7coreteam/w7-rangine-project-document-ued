<template>
  <div class="chapter-warpper">
    <el-scrollbar>
      <el-container class="home-container">
        <el-aside class="w7-aside-home" width="220px">
          <div class="w7-aside-home-box">
            <p class="w7-aside-home-head">{{projectName}}</p>
            <div class="w7-aside-home-search">
              <el-autocomplete
                  popper-class="my-autocomplete"
                  v-model="filterWord"
                  :fetch-suggestions="querySearch"
                  :trigger-on-focus="false"
                  placeholder="搜索文档"
                  @select="handleSelect">
                <i
                    class="el-icon-search el-input__icon"
                    slot="suffix"
                >
                </i>
                <template slot-scope="{ item }">
                  <div class="name text-over">{{ item.name }}</div>
                </template>
              </el-autocomplete>
            </div>
            <el-scrollbar class="w7-aside-home-content">
              <el-tree class="w7-tree" :data="chapters" :props="defaultProps" empty-text=""
                       ref="chaptersTree"
                       node-key="id"
                       :highlight-current="true"
                       :default-expanded-keys="expandIdArray"
                       @node-click="handleNodeClick"
                       @node-expand="handleNodeExpand">
                <span class="custom-tree-node" v-if="node.label" :class="{doc: !data.is_dir}"
                      slot-scope="{ node, data }">
                  <div class="text-over">
                    <span :title="node.label">{{ node.label }}</span>
                  </div>
                </span>
              </el-tree>
            </el-scrollbar>
          </div>
        </el-aside>
        <el-main id="home-index">
          <!-- <div class="search">
            <el-input placeholder="请输入关键字搜索" v-model="keyword" @keyup.enter.native="search">
              <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
            </el-input>
          </div> -->
          <div class="line" v-if="!articleFlag"></div>
          <div class="warpper">
            <div class="article" v-show="articleFlag">
              <p class="title">{{ articleContent.name }}</p>
              <div class="info">
                <span class="time" v-show="articleContent.updated_at">更新时间：{{ articleContent.updated_at }}</span>
                <span class="author"
                      v-show="articleContent.author.username">作者：{{ articleContent.author.username }}</span>
                <div class="share" v-show="articleContent.content">
                  <el-tooltip effect="dark" content="分享到新浪微博" placement="bottom">
                    <div class="share-block" @click="shareToWeibo"><i class="wi wi-weibo"></i></div>
                  </el-tooltip>
                  <el-tooltip effect="dark" content="分享到微信" placement="bottom">
                    <div class="share-block" @click="showShareWechat = true"><i class="wi wi-weixin"></i></div>
                  </el-tooltip>
                  <el-tooltip effect="dark" content="分享到QQ" placement="bottom">
                    <div class="share-block" @click="shareToQQ"><i class="wi wi-qq"></i></div>
                  </el-tooltip>
                  <el-tooltip effect="dark" content="复制链接" placement="bottom">
                    <div class="share-block"
                         v-clipboard:copy="shareUrl"
                         v-clipboard:success="onCopy">
                      <i class="wi wi-link"></i>
                    </div>
                  </el-tooltip>
                  <el-tooltip effect="dark" :content="articleContent.star_id ? '取消星标' : '添加星标'" placement="bottom">
                    <div class="share-block"
                         :class="{'checked': articleContent.star_id}"
                         @click="operStar()">
                      <i class="wi wi-star"></i>
                    </div>
                  </el-tooltip>
                  <el-tooltip v-if="mockUrl" effect="dark" content="复制Mock链接" placement="bottom">
                    <div class="share-block"
                         v-clipboard:copy="mockUrl"
                         v-clipboard:success="onCopy">
                      <i class="wq-fuzhi wq"></i>
                    </div>
                  </el-tooltip>
                </div>
              </div>
              <div class="markdown-body">
                <div class="markdown-content" v-html="articleContent.content"></div>
                <el-scrollbar class="markdown-menu ">
                  <div class="js-toc toc toc-right"></div>
                </el-scrollbar>
              </div>
              <!-- <div class="markdown-bottom">
                <router-link class="prev item" v-if=""></router-link>
                <router-link class="nxet item"></router-link>
              </div> -->
              <mavon-editor ref="mavonEditor" v-show="false"></mavon-editor>
            </div>


            <div class="article-list" v-if="!articleFlag">
              <el-button class="back" type="text" @click="articleFlag = !articleFlag">返回</el-button>
              <p class="number-result">{{articleInfoList.length}}条结果"{{keyword}}"</p>
              <div class="list-content" v-for="articleInfo in articleInfoList" v-bind:key="articleInfo.id"
                   v-show="articleInfoList.length">
                <div class="header">
                  <p class="title" v-html="articleInfo.name"
                     @click="changeRoute(articleInfo.id, articleInfo.name, true)"></p>
                  <p class="info">
                    <span>作者：{{articleInfo.username}}</span>
                    <span>更新时间：{{articleInfo.updated_at}}</span>
                  </p>
                </div>
                <p class="content" v-html="articleInfo.content"
                   @click="changeRoute(articleInfo.id, articleInfo.name, true)"></p>
              </div>
              <p class="no-result" v-if="!articleInfoList.length">没有找到相关内容"{{keyword}}"</p>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-scrollbar>
    <el-backtop :bottom="100">
      <div class="w7-top">
        <i class="el-icon-arrow-up"></i>
        <p>TOP</p>
      </div>
    </el-backtop>
    <!-- 二维码 -->
    <div class="share-wechat" v-if="showShareWechat">
      <div class="head">
        <span>分享到微信朋友圈</span>
        <i class="el-icon-close" @click="showShareWechat = false"></i>
      </div>
      <qrcode-vue class="content" :value="shareUrl" :size="160" level="H"></qrcode-vue>
      <div class="foot">
        打开微信，点击底部的“发现”，<br/>使用“扫一扫”即可将网页分享至朋友圈。
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import QrcodeVue from 'qrcode.vue'
  import tocbot from 'tocbot'

  export default {
    name: 'homeChild',
    components: {
      QrcodeVue
    },
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
        expandIdArray: [],//需要展开的节点id
        keyword: '',
        articleFlag: true,//true显示文章内容 false显示搜索列表
        articleContent: {
          author: {},
          content: ''
        },
        articleInfoList: [],
        filterWord: '',
        shareUrl: '',
        showShareWechat: false,
        projectName: '',
        loading: '',
        mockUrl: ''
      }
    },
    computed: {
      ...mapGetters({UserInfo: 'UserInfo'})
    },
    watch: {
      $route: {
        handler: function (to) {
          if (!to.hash) {//点击右侧目录，不重新请求
            this.getArticle()
          }
        },
        deep: true
      }
    },
    created() {
      this.getDocumentName();
    },
    mounted() {
      // this.projectName = localStorage.projectName;
    },
    methods: {
      querySearch(queryString, cb) {
        // var restaurants = this.restaurants;
        console.log(queryString, this.getFilterList(queryString))
        var results = queryString ? this.getFilterList(queryString) : [];
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      getFilterList(name) {
        let array = this.chapters
        let filterList = []
        let ss = function (array) {
          array.forEach(chapter => {
            if (chapter.name && chapter.name.indexOf(name) > -1) {
              filterList.push({
                id: chapter.id,
                name: chapter.name
              })
            }
            if (chapter.children && chapter.children.length) {
              ss(chapter.children)
            }
          })
        }
        ss(array)
        return filterList
      },
      handleSelect(item) {
        this.$refs.chaptersTree.setCurrentKey(item.id)
        this.handleNodeClick(item)
        this.filterWord = ''
        this.filterList = []
      },
      getDocumentName() {
        this.$post('/document/detail', {
          document_id: this.document_id
        })
          .then(res => {
            this.document_name = res.data.name;
            this.getChapters()
          })
      },
      getChapters() {
        this.$post('/document/chapter/list', {
          document_id: this.$route.params.id
        }).then(res => {
          if (!res.data.length) {
            return
          }
          res.data.forEach(item => {
            if (item.is_dir && item.children.length == 0) {
              item.children.push({is_dir: false})
            } else {
              item.children.forEach(child => {
                if (child.is_dir && child.children.length == 0) {
                  child.children.push({
                    is_dir: false
                  })
                }
              })
            }
          })
          this.chapters = res.data;
          this.$nextTick(() => {
            if (this.$route.query.id) {
              //F5刷新
              this.selectChapterId = this.$route.query.id
              //递归找name
              let name = '';
              let getName = function (array, id) {
                array.forEach(chapters => {
                  if (!chapters.children.length) {
                    getName(chapters.children)
                  }
                  if (chapters.id == id) {
                    name = chapters.name
                    return
                  }
                })
              }
              getName(this.chapters, this.selectChapterId)
              this.selectNode(this.selectChapterId)
              document.title = name ? (name + ' — ' + this.document_name) : this.document_name
              this.getArticle()
            } else {
              // this.goDefaultChaper(res)
              if (res.data.length) {
                this.selectNode(res.data[0].id);
                this.handleNodeClick(res.data[0])
              }
            }
          })
        })
      },
      //判断是否有默认文档,有则选中
      goDefaultChaper(data, defaultId) {
        for (let i = 0; i < data.length; i++) {
          if (!data[i].is_dir) {
            if (data[i].default_show_chapter_id == data[i].id || defaultId == data[i].id) {
              this.selectChapterId = data[i].id
              this.changeRoute(this.selectChapterId, data[i].name, true)
              return
            }
          }
        }
        for (let j = 0; j < data.length; j++) {
          if (data[j].is_dir && data[j].children.length && data[j].children[0].id) {
            this.goDefaultChaper(data[j].children, data[j].default_show_chapter_id)
          }
        }
      },
      handleNodeClick(obj) {
        // 目录不显示内容，只展开收缩文件夹
        // this.changeRoute(obj.id, obj.name);
        if (!obj.is_dir) {
          this.changeRoute(obj.id, obj.name);
          // this.mockUrl = location.origin + `/admin/viewMock?chapter_id=${this.$route.query.id}&document_id=${this.$route.params.id}`
        }
      },
      handleNodeExpand(obj) {
        //若default_show_chapter_id大于0 则表明有默认文档
        if (obj.default_show_chapter_id) {
          this.selectNode(obj.default_show_chapter_id)
          this.changeRoute(obj.default_show_chapter_id, obj.name)
        }
      },
      changeRoute(id, name, handSelectNode) {
        if (id == this.$route.query.id) {
          this.getArticle()
        } else {
          this.selectChapterId = id
          this.$router.push({path: '/chapter/' + this.document_id, query: {id: this.selectChapterId}})
        }
        //菜单样式选择
        if (handSelectNode) {
          this.selectNode(this.selectChapterId)
        }
        //页面标题
        document.title = name + '-' + this.document_name
      },
      getArticle() {
        let data = {
          document_id: this.document_id,
          chapter_id: this.$route.query.id
        }
        if (this.$route.query.share_key) {
          data['share_key'] = this.$route.query.share_key
        }

        this.loading = this.$loading();

        this.$post('/document/chapter/detail', data).then(res => {
          if (res.code == 200) {
            this.articleContent = res.data;
            this.loading.close();
            if (res.data.api) {
              this.mockUrl = location.origin + `/document/mockApiReponse/${this.$route.params.id}` + '/' + res.data.api.url;
            } else {
              this.mockUrl = '';
            }
            if (res.data.document) {
              this.projectName = res.data.document.name;
            }
            // this.articleContent.content = res.content ? this.$refs.mavonEditor.markdownIt.render('<div class="markdown-content">\n \n'+res.content+'\n \n</div>' + '<div class="markdown-menu"><el-scrollbar>\n \n @[toc]( ) \n \n</el-scrollbar></div>\n \n' ) : ''
            this.articleContent.content = res.data.content ? this.$refs.mavonEditor.markdownIt.render(res.data.content) : ''
            this.$nextTick(() => {
              // let id = this.$route.hash.substr(1)
              // let jump = document.getElementById(id)
              // let total = jump.offsetTop
              // window.scroll({
              //   top: total
              // })
              this.initToc()
              let hash = this.$route.hash
              if (hash) {
                window.location.hash = ''
                window.location.hash = decodeURIComponent(hash)
              } else {
                window.scroll({
                  top: 0
                })
              }
            })
            this.articleFlag = true
            if (this.UserInfo.username) {
              this.getShareKey()
            } else {
              this.shareUrl = window.location.href
            }
          }
        })
      },
      initToc(option) {
        this.$nextTick(() => {
          var content = document.querySelector('.markdown-content')
          var headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6, h7')
          var headingMap = {}
          Array.prototype.forEach.call(headings, function (heading) {
            var id = heading.id ? heading.id : ('h' + heading.querySelector('a').id.replace(/[\!\@\#\$\%\^\&\*\(\)\:]/ig, ''))
            headingMap[id] = !isNaN(headingMap[id]) ? ++headingMap[id] : 0
            if (headingMap[id]) {
              heading.id = id + '-' + headingMap[id]
            } else {
              heading.id = id
            }
          })
          let defaultOption = {
            contentSelector: '.markdown-content',
            tocSelector: '.js-toc',
            headingSelector: 'h1, h2, h3 ',
            // scrollSmooth: !0,
            // scrollSmoothDuration: 500,
            // scrollContainer: '.js-toc',
            // scrollSmoothOffset: -80,
            // headingsOffset: -500,
            // hasInnerContainers: true,
            scrollEndCallback: () => {
              document.body.style.paddingBottom = '1px'
              document.querySelector('.markdown-menu .el-scrollbar__wrap').scrollTop = document.querySelector('.is-active-li') ? (document.querySelector('.is-active-li').offsetTop - 200) : 0
              setTimeout(() => {
                document.body.style.paddingBottom = 0
              }, 100)
            }
          }
          option = Object.assign(defaultOption, option)
          tocbot.init(option)
        })
      },
      selectNode(id) {
        this.$refs.chaptersTree.setCurrentKey(id)
        this.expandIdArray = []
        this.expandIdArray.push(id)
      },
      search() {
        if (this.keyword == "") {
          this.$message('搜索关键字不能为空！')
          return
        }
        this.$post('/document/chapter/search', {
          document_id: this.$route.params.id,
          keywords: this.keyword
        }).then(res => {
          this.articleFlag = false
          res.data.forEach(articleInfo => {
            articleInfo.content = this.$refs.mavonEditor.markdownIt.render(articleInfo.content)
            //html转成文字
            articleInfo.content = this.htmlToWord(articleInfo.content)
            //关键字变亮
            articleInfo.name = this.highlight(articleInfo.name)
            articleInfo.content = this.highlight(articleInfo.content)
          })
          this.articleInfoList = res.data;
        })
      },
      highlight(text) {
        var keyword = this.keyword
        text = text.split('')
        keyword = keyword.split('')
        var html = ''
        for (var i in text) {
          if (keyword.indexOf(text[i]) !== -1) {
            html = html + '<span class="highlight">' + text[i] + '</span>'
          } else {
            html = html + text[i]
          }
        }
        return html
      },
      htmlToWord(html) {
        var word = html.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ')
        return word
      },
      getShareKey() {
        this.$post('/admin/share/url', {
          chapter_id: this.$route.query.id,
          document_id: this.$route.params.id
        })
          .then(res => {
            this.shareUrl = res.data
          })
      },
      shareToWeibo() {
        var url = 'http://service.weibo.com/share/share.php?'
          + 'url=' + this.shareUrl
          + '&title=' + this.articleContent.name
        window.open(url, '_blank')
      },
      shareToQQ() {
        var url = 'https://connect.qq.com/widget/shareqq/index.html?'
          + 'url=' + this.shareUrl
          + '&title=' + this.articleContent.name
        window.open(url, '_blank')
      },
      onCopy() {
        this.$message.success('复制成功！')
      },
      operStar() {
        let url = this.articleContent.star_id ? '/admin/star/delete' : '/admin/star/add'
        let data = {
          document_id: this.$route.params.id
        }
        if (this.articleContent.star_id) {
          data['id'] = this.articleContent.star_id
        } else {
          data['chapter_id'] = this.$route.query.id
        }
        this.$post(url, data)
          .then(res => {
            this.articleContent.star_id = res.data.star_id || ''
          })
      }
    },
  }
</script>

<style lang="scss">
  body {
    background-color: #FFF
  }

  .transition--300 {
    transition: all 300ms ease-in-out
  }


  .toc {
    overflow-y: auto
  }

  .toc > .toc-list {
    overflow: hidden;
    position: relative
  }

  .toc > .toc-list li {
    list-style: none
  }

  .toc-list {
    margin: 0;
    padding-left: 10px
  }

  a.toc-link {
    color: currentColor;
    height: 100%
  }

  .is-collapsible {
    // max-height: 1000px;
    overflow: hidden;
    transition: all 300ms ease-in-out
  }

  .is-collapsed {
    max-height: 0
  }

  .is-position-fixed {
    position: fixed !important;
    top: 0
  }

  .is-active-link {
    // font-weight: 700
    color: #3296fa !important;
  }

  .toc-link::before {
    background-color: #EEE;
    content: ' ';
    display: inline-block;
    height: inherit;
    left: 0;
    margin-top: -8px;
    position: absolute;
    width: 2px
  }

  .is-active-link::before {
    background-color: #3296fa;
  }

  #home-index {
    min-height: calc(100vh - 140px);
  }

  .chapter-warpper {
    background: linear-gradient(to right, #f7f8fa 50%, #ffffff 50%);

    .share-wechat {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 10px;
      width: 240px;
      background: #fff;
      border: 1px solid #d8d8d8;
      z-index: 10000;
      font-size: 12px;

      .head {
        position: relative;
        height: 16px;
        font-weight: 700;
        line-height: 16px;
        color: #000;

        .el-icon-close {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 16px;
          cursor: pointer;
        }
      }

      .content {
        padding: 20px 40px;
      }

      .foot {
        line-height: 22px;
        color: #666;
      }
    }
  }

  .home-container {
    position: relative;

    .w7-aside-home {
      background-color: #f7f8fa;
      border-right: #f1f2f3 1px solid;
      min-width: 221px;
      width: calc(50% - 700px + 220px) !important;
      position: fixed;
      height: calc(100vh - 60px);

      .w7-aside-home-box {
        padding-left: calc(100% - 200px);
      }

      .w7-aside-home-head {
        font-size: 16px;
        padding: 40px 0 30px;
        font-weight: 600;
        text-align: center;
      }

      .w7-aside-home-search {
        position: relative;
        padding-bottom: 30px;
        margin-bottom: 20px;
        margin-right: 20px;
        border-bottom: 1px solid #e1e3e6;
      }

      .w7-aside-home-content {
        margin-top: 10px;
        height: calc(100vh - 280px);

        .el-scrollbar__wrap {
          overflow-x: auto;
        }
      }

      .w7-tree {
        font-size: 14px;
        background: #f7f8fa;

        .el-tree-node {
          &.is-expanded {
            .el-tree-node {
              .doc {
                &::before {
                  content: '';
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                  background-color: #C0C4CC;
                  margin-left: -4px;
                }

                &:hover {
                  &::before {
                    background-color: #3296fa;
                  }
                }
              }

              &.is-current {
                .doc {
                  &::before {
                    background-color: #3296fa;
                  }
                }
              }
            }
          }
        }

        .el-tree-node__content {
          position: relative;
          height: auto;
          overflow: hidden;

          &:hover {
            .custom-tree-node {
              color: #3296fa;
            }
          }

          .el-tree-node__expand-icon {
            padding: 0;
            padding-left: 5px;
            position: absolute;
            top: 8px;
            bottom: 0;
            z-index: 2;
            display: inline-block;
            font-size: 20px;

            &::before {
              top: 50%;
              transform: translateY(-50%);
              margin-top: -3px;
              position: absolute;
            }

            &.expanded {
              transform: unset;

              &::before {
                content: '\e790';
              }
            }
          }

          .custom-tree-node {
            flex: 1;
            display: flex;
            align-items: center;
            padding-left: 20px;
            z-index: 1;
            height: 40px;

            &.doc {
              z-index: 3;
            }

            .text-over {
              flex: 1;
              width: 0;
              margin-left: 10px;
              padding-right: 10px;
            }

            .el-icon-caret-right {
              margin-left: -20px;
              cursor: pointer;
              color: #C0C4CC;
              font-size: 12px;
              padding: 5px;
            }
          }
        }

        .is-current {
          > .el-tree-node__content {
            background-color: #f0f2f5;
            color: #017efb;
          }
        }
      }
    }

    .el-main {
      padding: 0;
      padding-left: calc(50% - 700px + 220px);
      background-color: #ffffff;
      height: 100%;
      @media (max-width: 1420px) {
        padding-left: 220px;
      }

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

      .line {
        border-bottom: solid 1px #eeeeee;
      }

      .warpper {
        font-size: 14px;
        color: #333333;
        margin-top: 48px;
        margin-left: 50px;
        max-width: 1200px;

        .markdown-body {
          .markdown-content {
            margin-right: 30px;
            padding-right: 290px;
            width: 100%;
          }

          .markdown-menu {
            width: 240px;
            font-size: 14px;
            line-height: 1;
            background-color: #fff;
            top: 100px;
            bottom: 160px;
            box-sizing: border-box;
            position: fixed;
            right: 26px;
            @media (min-width: 1600px) {
              left: calc(50% + 500px);
              right: unset;
            }

            .el-scrollbar__wrap {
              overflow-x: auto;
            }

            p:first-child, h3 {
              margin-top: 0;
              margin-bottom: 0;
              font-size: 0;
            }

            ul, li {
              list-style: none;
              padding: 0;
              margin-top: 0;
            }

            ul {
              padding-left: 20px;
            }

            a {
              color: #989898;
              padding: 8px 0;
              display: inline-block;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              width: 100%;

              &:hover {
                color: #3296fa;
                text-decoration: none;
              }
            }
          }
        }

        .article {
          .title {
            font-size: 20px;
          }

          .info {
            display: flex;
            align-items: center;
            margin: 15px 0 25px 0;
            padding-right: 290px;

            .time {
              margin-right: 40px;
            }

            .author {
              flex: 1;
            }

            .share {
              display: flex;

              &-block {
                margin-left: 5px;
                width: 30px;
                height: 30px;
                color: #989898;
                line-height: 27px;
                text-align: center;
                border: 1px solid #eeeeee;
                box-sizing: border-box;
                cursor: pointer;

                &:first-child {
                  margin-left: 0;
                }

                &:hover, &.checked {
                  border-color: #3296fa;
                }
              }
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

  .hljs {
    background: #eee !important;
    // color:#fff!important;
  }

  .markdown-body {
    .markdown-content {
      width: 0;

      *:focus {
        outline: none;
      }
    }

    code {
      background-color: #eee !important;
    }

    pre, .highlight pre {
      background-color: #eee !important;
    }
  }

  .w7-top {
    width: 40px;
    height: 42px;
    padding-top: 8px;
    background-color: #000;
    color: #fff;
    text-align: center;
    font-size: 10px;
    line-height: 1;

    i {
      font-size: 20px;
    }
  }

  /* 简单适配手机端 */
  @media screen and (max-width: 500px) {
    .admin-view > .el-header, .w7-aside-home, .markdown-menu, .share {
      display: none !important;
    }
    .admin-content {
      padding-top: 0 !important;
    }
    .home-container .el-main {
      padding-left: 0;
    }
    .chapter-warpper .warpper {
      margin-top: 0 !important;
      margin-left: 0 !important;
      padding: 20px;
    }
    .home-container .el-main .warpper .article .info {
      justify-content: space-between;
      padding-right: 0;
    }
    .home-container .el-main .warpper .article .info .time {
      margin-right: 0;
    }
    .home-container .el-main .warpper .article .info .author {
      text-align: right;
    }
  }
</style>