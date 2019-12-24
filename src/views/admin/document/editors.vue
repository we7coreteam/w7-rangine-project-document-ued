<template>
  <div class="editors">
    <div class="chapter-title">{{ chapterName }}</div>
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
    <div>
      <el-button class="saveBtn" type="primary" @click="save">保存</el-button>
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
      content: '', //最终显示的html
      contentMd: '' //md格式的内容
    }
  },
  watch: {
    chapterId() {
      this.init()
    }
  },
  mounted() {
    let clientHeight = document.documentElement.clientHeight
    this.$refs.mavonEditor.$el.style.height = (clientHeight - 220) + 'px'
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
.editors {
  .v-note-wrapper {
    padding: 15px 0;
  }
}
.chapter-title {
  font-size: 20px;
  letter-spacing: 1px;
  color: #4d4d4d;
}
.saveBtn {
  padding: 9px 20px;
  height: 34px;
  border-radius: 2px;
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