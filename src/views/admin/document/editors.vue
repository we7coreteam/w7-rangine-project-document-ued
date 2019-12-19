<template>
  <div>
    <div class="chapter-title">{{ chapterName }}</div>
    <div class="chapter-date" v-show="!isEdit && chapterId">
      <p>
        <span v-if="chapterInfo.updated_at">更新时间：{{ chapterInfo.updated_at }}</span>
        <span v-if="chapterInfo.author">作者：{{ chapterInfo.author.username }}</span>
      </p>
      <button @click="isEdit = true">编辑</button>
    </div>
    <div class="editors">
      <div class="chapter-warpper">
        <div class="chapter-content markdown-body" v-html="content" v-show="!isEdit"></div>
        <div class="chapter-menu" v-if="showMenu"></div>
      </div>
      <div class="mavon-editor" v-show="isEdit">
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
      <el-button class="saveBtn" type="primary" @click="save" v-if="isEdit">保存</el-button>
      <el-button class="backBtn" @click="isEdit = false" v-if="isEdit">返回</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['chapterId', 'chapterName'],
  data() {
    return {
      code_style:"tomorrow-night-blue",
      chapterInfo: {
        updated_at: '',
        username: ''
      },
      isEdit: false,
      content: '', //最终显示的html
      contentMd: '', //md格式的内容
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
        if (!res.content) {
          this.content = ''
          this.contentMd = ''
          return
        }
        this.chapterInfo = res
        this.content = this.$refs.mavonEditor.markdownIt.render(res.content)
        this.contentMd = res.content
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
    save() {
      this.$post('/admin/chapter/save', {
        document_id: this.$route.params.id,
        chapter_id: this.chapterId,
        content: this.contentMd
      }).then(() => {
        this.$message('保存成功！')
        this.init()
      })
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
  .mavon-editor {
    .v-note-wrapper {
      height: 500px;
    }
  }
  .saveBtn, .backBtn {
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
}
.markdown-body code{
  background-color:#eee!important;
}
.markdown-body .highlight pre, .markdown-body pre{
  background-color:#eee!important;
}
</style>