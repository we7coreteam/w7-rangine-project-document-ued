<template>
  <div class="editors">
    <mavon-editor
        ref="mavonEditor"
        :boxShadow="false"
        :scrollStyle="true"
        :ishljs="true"
        :codeStyle="code_style"
        :navigation="false"
        v-model="contentMd"
        @imgAdd="$imgAdd"
        @input="input"
    >
      <!--@save="save"-->
    </mavon-editor>
    <div>
      <!--<el-button class="saveBtn" type="primary" @click="save">保存</el-button>-->
    </div>
  </div>
</template>

<script>
  export default {
    props: ['chapter_id', 'markDownContent'],
    data() {
      return {
        code_style: "tomorrow-night-blue",
        chapterInfo: {
          name: '',
          updated_at: '',
          username: ''
        },
        contentMd: '', //md格式的内容
        old_contentMd: '',
        timer: '' //定时器
      }
    },
    watch: {
      'markDownContent' (val) {
        // console.log('val');
        this.contentMd = val;
      }
    },
    mounted() {
      let clientHeight = document.documentElement.clientHeight
      this.$refs.mavonEditor.$el.style.height = (clientHeight - 310) + 'px'
    },
    destroyed() {},
    methods: {
      input () {
        this.$emit('input', this.contentMd);
      },

      $imgAdd(pos, $file) {
        // 第一步.将图片上传到服务器.
        var formdata = new FormData()
        formdata.append('file', $file)
        formdata.append('document_id', this.$route.params.id);
        formdata.append('chapter_id', this.chapter_id);
        this.$post('/admin/upload/image', formdata, {
          headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => {
            // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
            this.$refs.mavonEditor.$img2Url(pos, res.data.url)
          }).catch(function (error) {
            console.log('发生错误！', error)
          })
      },
    }
  }
</script>

<style lang="scss" scoped>
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
    font-size: 20px;
    letter-spacing: 1px;
    color: #4d4d4d;
  }
</style>