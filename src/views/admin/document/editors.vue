<template>
  <div class="editors">
    <div class="chapter-title">{{ chapterInfo.name }}</div>
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
  props: ['chapterId', 'chapterIsDir', 'firstClickDoc'],
  data() {
    return {
      code_style:"tomorrow-night-blue",
      chapterInfo: {
        name: '',
        updated_at: '',
        username: ''
      },
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
    this.$refs.mavonEditor.$el.style.height = (clientHeight - 310) + 'px'
  },
  methods: {
    init() {
      if (this.chapterIsDir) {
        return
      }
      this.$post('/admin/chapter/content', {
        document_id: this.$route.params.id,
        chapter_id: this.chapterId
      }).then(res => {
        this.chapterInfo = res
        this.contentMd = res.content || ''
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
    margin: 30px 0;
    z-index: 10;
    .v-note-panel {
      .v-note-show {
        max-width: 760px;
      }
    }
  }
}
.chapter-title {
  padding-top: 10px;
  font-size: 20px;
  letter-spacing: 1px;
  color: #4d4d4d;
}
</style>