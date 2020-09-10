<template>
  <div>
    <div class="search-wrap">
      <div class="h1">{{document_name}}</div>
      <el-input placeholder="请输入内容" v-model="listQuery.keywords" class="input-wrap" @keyup.native.enter="getSearchResults">
        <img slot="prepend" @click="getSearchResults" src="@/assets/img/icon-search.png">
        <span slot="append" @click="getSearchResults">搜索</span>
      </el-input>
    </div>
    <div class="chapter-warpper">
      <el-scrollbar>
        <el-container class="home-container">
          <el-aside class="w7-aside-home" width="220px">
            <div class="w7-aside-home-box">
              <el-scrollbar class="w7-aside-home-content">
                <el-tree class="w7-tree"
                  v-if="chapters.length"
                  :data="chapters"
                  :props="defaultProps"
                  empty-text=""
                  ref="chaptersTree"
                  node-key="id"
                  :highlight-current="true"
                  :default-expanded-keys="expandIdArray"
                  @node-click="handleNodeClick"
                  @node-expand="handleNodeExpand">
                  <span class="custom-tree-node" v-if="node.label" :class="{doc: !data.is_dir}" slot-scope="{ node, data }">
                    <div class="text-over">
                      <span :title="node.label">{{ node.label }}</span>
                    </div>
                  </span>
                </el-tree>
              </el-scrollbar>
            </div>
          </el-aside>
          <el-main id="home-index">
            <div class="warpper">
              <div class="search-results">
                <mavon-editor ref="mavonEditor" v-show="false"></mavon-editor>
                <div class="total">搜索<span>“{{ listQuery.keywords }}”</span>的相关结果，共{{ total }}条</div>
                <div class="list">
                  <div class="con" v-for="(item, index) in list" :key="index" @click="goViewChapter(item)">
                    <div class="name" v-html="item.name"></div>
<!--
                    <div class="markdown-body">
                      <div class="markdown-content" v-html="item.content"></div>
                      <el-scrollbar class="markdown-menu">
                        <div class="js-toc toc toc-right"></div>
                      </el-scrollbar>
                    </div>
-->
                    <div class="content" v-html="item.content"></div>
                    <div class="navigation">
                      <template v-for="(item2, j) in item.navigation">
                        <span>{{ item2 }}</span>
                        <span style="margin: 0 3px" v-if="j < item.navigation.length-1">></span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pagination-wrap">
                <el-pagination
                    background
                    :hide-on-single-page="total <= 10"
                    :current-page.sync="listQuery.page"
                    :page-sizes="[10,20,30]"
                    :page-size="listQuery.page_size"
                    :layout="paginationLayouts"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
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
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import {getDocumentDetail, getSearchResults} from '@/api/api'

  export default {
    name: 'searchResults',
    data() {
      return {
        document_id: '',
        document_name: '',
        chapters: [],//左侧目录
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        selectChapterId: '',//左侧文档id(选中节点)
        expandIdArray: [],//需要展开的节点id
        loading: '',
        total: 0,
        list: [],
        listQuery: {
          page: 1,
          page_size: 10,
          keywords: '',
          document_id: ''
        }
      }
    },
    computed: {
      ...mapGetters({UserInfo: 'UserInfo'}),
      paginationLayouts() {
        return this.total && (this.total / this.listQuery.page_size) > 1 ? 'total, sizes, prev, pager, next, jumper' : 'total, sizes'
      }
    },
    watch: {
    },
    created() {
      this.init();
    },
    mounted() {
    },
    methods: {
      init() {
        this.listQuery.document_id = this.$route.query.id;
        this.document_id = this.$route.query.id;
        this.listQuery.keywords = this.$route.query.keywords;
        getDocumentDetail({
          document_id: this.listQuery.document_id
        }).then(res => {
          this.document_name = res.data.name;
          this.getChapters()
        })
        this.getSearchResults();
      },
      getSearchResults() {
        const keywords = this.listQuery.keywords.toLowerCase();
        const id = this.listQuery.document_id;
        this.$router.push({query: {id, keywords}})
        getSearchResults(this.listQuery).then(res => {
          this.total = res.data.total;
          this.list = res.data.data;
          // str.match(/[^\x00-\xff]+(：|:)+([^\x00-\xff]|\w|-)+(\s|[\r\n])*/g)
          if (this.list.length) {
            this.list.forEach(item => {
              // console.log('mavonEditor');
              // console.log(this.$refs.mavonEditor);
              // item.content = this.$refs.mavonEditor.markdownIt.render(item.content)
              // //html转成文字
              // item.content = this.htmlToWord(item.content)
              // //关键字变亮
              // item.name = this.highlight(item.name)
              // item.content = this.highlight(item.content)
              const reg = "/" + keywords + "/gi";
              if (item.content) {
                // 过滤特殊字符
                item.content = item.content.replace(/[\-\_\,\!\|\~\`\(\)\#\$\%\^\&\*\{\}\:\;\"\<\>\?]/g, '');
                // 字母转小写
                item.content = item.content.replace(/^[A-Za-z]+$/g,function($1){return $1.toLowerCase()});
                // 过滤图片地址
                item.content = item.content.replace(/(cdn\.w7\.cc)(.|\/)+\.(jpg|png|jpeg)/g,'');

                console.log(item.content);
                const hasKeywords = item.content.indexOf(keywords);
                if (hasKeywords != -1) {
                  item.content = item.content.substr(item.content.indexOf(keywords), 400) + '...'
                } else {
                  item.content = item.content.substr(0, 400) + '...';
                }
                item.content = item.content.replace(eval(reg),`<span style="color: #ff3939">${keywords}</span>`);
              }
              if (item.name) {
                item.name = item.name.replace(eval(reg),`<span style="color: #ff3939">${keywords}</span>`);
              }
              if (item.navigation) {
                item.navigation = item.navigation.split('>')
                // console.log(item.navigation);
              }
            })
            console.log('list');
            console.log(this.list);
          }
        }).catch(e => {
          console.log(e);
        })
      },
      getChapters() {
        this.$post('/document/chapter/list', {
          document_id: this.document_id
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
              // this.getArticle()
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
              // this.initToc()
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
          keywords: this.listQuery.keywords
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
            scrollSmooth: true,
            // scrollSmoothDuration: 500,
            // scrollContainer: '.js-toc',
            scrollSmoothOffset: -260,
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
      },
      goViewChapter(item) {
        this.$router.push({path: '/chapter/' + this.document_id, query: {id: item.chapter_id}})
        // this.$router.push({
        //   path: '/chapter/',
        //   params: {id: this.document_id},
        //   query: {id: item.id}
        // })http://localhost:8080/chapter/155?id=1033
      },
      handleSizeChange(val) {
        this.listQuery.page_size = val
        this.getSearchResults()
      },
      handleCurrentChange(val) {
        this.listQuery.page = val
        this.getSearchResults()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .w7-aside-home-content {
    /deep/ {
      .el-scrollbar__view {
        border: 1px solid #eee;
        border-radius: 5px;

        .el-tree-node__expand-icon {
          position: absolute;
          right: 0;
          /*top: 8px;*/
          z-index: 2;
          font-size: 16px;
          color: #606266;
          font-size: 16px;

          &::before {
            top: 0 !important;
            transform: translateY(0) !important;
            margin-top: 0 !important;
            position: static !important;
            content: '\e6e0';
            font-size: 16px;
          }

          &.expanded {
            transform: unset;

            &::before {
              content: '\e790';
            }
          }
        }

        .el-tree-node__expand-icon.is-leaf {
          color: transparent;
        }

        .custom-tree-node {
          border-bottom: 1px solid #eee;
          padding-left: 10px !important;
          /*color: #333;*/
        }

        .el-tree {
          .el-tree-node:nth-last-child(2) {
            .custom-tree-node {
              border-bottom: none;
            }
          }
        }

        .el-tree-node__expand-icon.expanded::before {
          content: '\e6df' !important;
        }
        .w7-tree .is-current > .el-tree-node__content {
          /*background-color: #fcfcfc !important;*/
        }
      }
    }
  }

  .search-results {
    min-height: 600px;

    .total {
      margin-bottom: 25px;
      color: #333;

      span {
        color: #ff3939;
      }
    }

    .con {
      margin-bottom: 25px;

      .name {
        font-size: 18px;
        color: #333;
        margin-bottom: 10px;
        cursor: pointer;
      }

      .content {
        color: #666;
        line-height: 1.6;
        cursor: pointer;
        margin-bottom: 8px;
      }

      .navigation {
        color: #666;
        line-height: 1.6;
        cursor: pointer;
        &:hover {
          color: #3296fa;
      }
      }
    }
  }

  .pagination-wrap {
    overflow: hidden;
    margin-bottom: 50px;
  }
</style>

<style lang="scss">
  body {
    background-color: #FFF
  }

  .search-wrap {
    background: url("~@/assets/img/bg-1.png") no-repeat center;
    height: 180px;
    position: fixed;
    width: 100%;
    top: 60px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column;

    .h1 {
      font-size: 24px;
      color: #555;
      margin-bottom: 10px;
    }

    .input-wrap {
      width: 670px;

      .el-input-group__prepend {
        background-color: #fff;
        padding: 0 10px 0 20px;
        align-items: center;

        img {
          position: relative;
          top: 2px;
        }
      }

      .el-input-group__append {
        background-color: #fff;
        padding: 0;
        color: #333;
        cursor: pointer;
        span {
          display: flex;
          align-items: center;
          padding: 0 35px;
          height: 100%;
        }
      }

      .el-input__inner {
        height: 48px;
        line-height: 46px;
        border-left: none;

        &:focus {
          border-color: #dcdfe6;
        }
        &:hover {
          border-color: #dcdfe6;
        }
      }
    }
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
    /*min-height: calc(100vh - 140px);*/
  }

  .chapter-warpper {
    /*background: linear-gradient(to right, #f7f8fa 50%, #ffffff 50%);*/
    margin-top: 180px;

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
      /*background-color: #f7f8fa;*/
      /*border-right: #f1f2f3 1px solid;*/
      min-width: 221px;
      width: calc(50% - 700px + 220px) !important;
      position: fixed;
      top: 270px;
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
        /*margin-top: 10px;*/
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
      /*height: 100%;*/
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
        margin-top: 40px;
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
            top: 260px;
            /*bottom: 160px;*/
            box-sizing: border-box;
            position: fixed;
            z-index: 1000;
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
