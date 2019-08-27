<template>
  <div>
    <div class="chapter-title">{{ chapterName }}</div>
    <div class="chapter-date" v-show="!isEdit && chapterId">
      <p>
        <span v-if="chapterInfo.updated_at">更新时间：{{ chapterInfo.updated_at }}</span>
        <span v-if="chapterInfo.username">作者：{{ chapterInfo.username }}</span>
      </p>
      <button @click="edit">编辑</button>
    </div>
    <div class="editors">
      <div v-html="content" v-show="!isEdit"></div>
      <div class="editorBtn" v-show="isEdit">
        <el-button :type="layout == 1 ? 'primary' : ''" @click="layout = 1">Markdown编辑器</el-button>
        <el-button :type="layout == 2 ? 'primary' : ''" @click="layout = 2">UEditor编辑器</el-button>
      </div>
      <div class="mavon-editor" v-show="isEdit && layout == 1">
        <mavon-editor ref="mavonEditor"
          :boxShadow="false"
          :scrollStyle="true"
          :ishljs="true"
          v-model="contentMd"
          @imgAdd="$imgAdd"
          @imgDel="$imgDel"
          @save="save"></mavon-editor>
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
  props: ['chapterId', 'chapterName'],
  components: {
    VueUeditorWrap
  },
  data() {
    return {
      chapterInfo: {},
      isEdit: false,
      config: {
        autoHeightEnabled: false,// 编辑器不自动被内容撑高
        initialFrameHeight: '400',// 初始容器高度
        initialFrameWidth: '100%'// 初始容器宽度
      },
      content: '',//最终显示的html
      contentMd: '',//md格式的内容
      layout: 1//1 markdown 2 富文本
    }
  },
  methods: {
    init() {
      this.$post('/admin/chapter/get_content', {
        chapter_id: this.chapterId
      })
        .then(res => {
          this.isEdit = false
          if(!res) {
            this.content = ''
            return
          }
          this.chapterInfo = res
          if(res.layout == 1) {
            this.layout = 1
            this.content = this.$refs.mavonEditor.markdownIt.render(res.content)
            this.contentMd = res.content
          }else if (res.layout == 2) {
            this.layout = 2
            this.content = res.content
          }
        })
    },
    $imgAdd(pos, $file) {
      console.log(pos)
      console.log($file)
      // 第一步.将图片上传到服务器.
      var formdata = new FormData();
      formdata.append('file', $file);
      formdata.append('name', 12312);
      console.log(formdata.get('name'))
      this.$post('/admin/upload/image', formdata, {
         headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(res => {
          this.$refs.mavonEditor.$img2Url(pos, res.url);
        })
    },
    $imgDel() {

    },
    edit() {
      this.isEdit = !this.isEdit
      if(this.layout == 1) {
        this.content = ''
      }
      if(this.layout == 2) {
        this.contentMd = ''
      }
    },
    save() {
      console.log(this.chapterId)
      this.$post('/admin/chapter/save_content', {
        chapter_id: this.chapterId,
        layout: this.layout,
        content: this.layout == 1 ? this.contentMd : this.content
      })
        .then(res => {
          this.$message('保存成功！')
          this.chapterInfo.layout = res.layout
          if (this.chapterInfo.layout == 1) {
            this.content = this.$refs.mavonEditor.markdownIt.render(res.content)
            this.contentMd = res.content
          } else if (this.chapterInfo.layout == 2)  {
            this.content = res.content
          }
        })
    },
    back() {
      this.isEdit = false
      if (this.chapterInfo.layout == 1) {
        this.content = this.$refs.mavonEditor.markdownIt.render(this.contentMd)
      }
    }
  },
  watch: {
    chapterId() {
      this.init()
    }
  },
  mounted () {
    this.init()
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
  .saveBtn, .backBtn {
    margin-top: 10px;
    margin-right: 10px;
    height: 34px;
    border-radius: 2px;
    padding: 9px 20px;
  }
}
</style>