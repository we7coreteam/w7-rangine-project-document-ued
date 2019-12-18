<template>
  <div>
    <div class="chapter-title">{{ chapterName }}</div>
    <div class="chapter-date" v-show="!isEdit && chapterId">
      <p>
        <span v-if="chapterInfo.updated_at">更新时间：{{ chapterInfo.updated_at }}</span>
        <span v-if="chapterInfo.author">作者：{{ chapterInfo.author.username }}</span>
      </p>
      <button @click="edit">编辑</button>
    </div>
    <div class="editors">
      <div class="chapter-warpper">
        <div class="chapter-content" :class="{'markdown-body': layout == 1}" v-html="content" v-show="!isEdit"></div>
        <div class="chapter-menu" v-if="showMenu"></div>
      </div>
      <div class="editorBtn" v-show="isEdit">
        <el-button :type="layout == 1 ? 'primary' : ''" @click="layout = 1">Markdown编辑器</el-button>
        <el-button :type="layout == 2 ? 'primary' : ''" @click="layout = 2">UEditor编辑器</el-button>
      </div>
      <div class="mavon-editor" v-show="isEdit && layout == 1">
        <mavon-editor
          ref="mavonEditor"
          :boxShadow="false"
          :scrollStyle="true"
          :ishljs="true"
          :codeStyle="code_style"
          :navigation="false"
          v-model="contentMd"
          @imgAdd="$imgAdd"
          @save="save"
        >
        </mavon-editor>
      </div>
      <div v-show="isEdit && layout == 2">
        <vue-ueditor-wrap v-model="content" :config="config"></vue-ueditor-wrap>
      </div>
      <el-button class="saveBtn" type="primary" @click="save" v-if="isEdit">保存</el-button>
      <el-button class="backBtn" @click="back" v-if="isEdit">返回</el-button>
    </div>
  </div>
</template>

<script>
import VueUeditorWrap from 'vue-ueditor-wrap'
export default {
  props: ['chapterId', 'chapterName', 'clickSum'],
  components: {
    VueUeditorWrap
  },
  data() {
    return {
      code_style:"tomorrow-night-blue",
      chapterInfo: {
        updated_at: '',
        username: '',
        layout: 1
      },
      isEdit: false,
      config: {
        autoHeightEnabled: false, // 编辑器不自动被内容撑高
        initialFrameHeight: '400', // 初始容器高度
        initialFrameWidth: '100%', // 初始容器宽度
        serverUrl: '/admin/upload/image?document_id='+this.$route.params.id+'&chapter_id='+this.chapterId // 上传文件接口
      },
      content: '', //最终显示的html
      contentMd: '', //md格式的内容
      layout: 1, //1 markdown 2 富文本
      showMenu: false//是否显示菜单div
    }
  },
  watch: {
    chapterId() {
      this.init()
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.$post('/admin/chapter/content', {
        document_id: this.$route.params.id,
        chapter_id: this.chapterId
      }).then(res => {
        this.isEdit = this.clickSum == 1 ? true : false
        if (!res) {
          this.chapterInfo = {
            updated_at: '',
            username: '',
            layout: 1
          }
          this.content = ' '
          this.contentMd = ' '
          return
        }
        this.chapterInfo = res
        if (res.layout == 1) {
          this.layout = 1
          this.content = this.$refs.mavonEditor.markdownIt.render(res.content)
          this.contentMd = res.content
        } else if (res.layout == 2) {
          this.layout = 2
          this.content = res.content
        } else {
          this.chapterInfo = {
            updated_at: '',
            username: '',
            layout: 1
          }
          this.content = ''
          this.contentMd = ''
        }
      })
    },
    $imgAdd(pos, $file) {
      // 第一步.将图片上传到服务器.
      var formdata = new FormData()
      formdata.append('file', $file)
      formdata.append('document_id', this.$route.params.id)
      formdata.append('chapter_id', this.chapterId)
      this.$post('/admin/upload/image', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(res => {
          // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
          this.$refs.mavonEditor.$img2Url(pos, res.data.url)
        })
        .catch(function(error) {
          console.log('发生错误！', error)
        })
    },
    edit() {
      this.isEdit = !this.isEdit
      if (this.layout == 1) {
        this.content = ''
      }
      if (this.layout == 2) {
        this.contentMd = ''
      }
    },
    save() {
      this.$post('/admin/chapter/save', {
        document_id: this.$route.params.id,
        chapter_id: this.chapterId,
        layout: this.layout,
        content: this.layout == 1 ? this.contentMd : this.content
      }).then(() => {
        this.$message('保存成功！')
        // this.chapterInfo = res
        // if (this.chapterInfo.layout == 1) {
        //   this.content = this.$refs.mavonEditor.markdownIt.render(res.content)
        //   this.contentMd = res.content
        // } else if (this.chapterInfo.layout == 2) {
        //   this.content = res.content
        // }
      })
    },
    back() {
      this.init()
      this.isEdit = false
      // if (this.chapterInfo.layout == 1) {
      //   this.content = this.$refs.mavonEditor.markdownIt.render(this.contentMd)
      // }
    }
  }
}
</script>

<style lang="scss">
.chapter-title {
  font-size: 20px;
  letter-spacing: 1px;
  color: #4d4d4d;
}
.chapter-date {
  display: flex;
  justify-content: space-between;
  margin-top: 48px;
  font-size: 14px;
  p span {
    padding-right: 40px;
  }
  button {
    width: 120px;
    height: 35px;
    background-color: #ddedfd;
    border-radius: 2px;
    border: solid 1px #3296fa;
    cursor: pointer;
    &:hover {
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
    }
  }
}
.editors {
  width: 100%;
  height: 100%;
  padding: 15px 0;
  .chapter-warpper {
    position: relative;
    display: flex;
    .chapter-content {
      flex: 1;
    }
    .chapter-menu {
      flex: 0 0 350px;
    }
  }
  .editorBtn {
    padding-bottom: 15px;
    button {
      height: 35px;
      padding: 9px 20px;
      // background-color: #ddedfd;
      border-radius: 2px;
      // border: solid 1px #3296fa;
      cursor: pointer;
      &:hover {
        color: #fff;
        background-color: #409eff;
        border-color: #409eff;
      }
    }
  }
  .mavon-editor {
    .v-note-wrapper {
      height: 500px;
    }
  }
  .saveBtn,
  .backBtn {
    margin-top: 10px;
    margin-right: 10px;
    height: 34px;
    border-radius: 2px;
    padding: 9px 20px;
  }
}
.list-paddingleft-2{
  list-style-type: circle !important;
}
.hljs{
  background:#eee!important;
  // color:#fff!important;
}
.markdown-body code{
  background-color:#eee!important;
  // color:#fff;
}
.markdown-body .highlight pre, .markdown-body pre{
  background-color:#eee!important;
  // color:#fff;
}
</style>