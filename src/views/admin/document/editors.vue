<template>
  <div class="editors">
    <div v-html="content" v-show="!isEdit"></div>
    <div class="btn" v-show="isEdit">
      <el-button @click="layout = 1">Markdown编辑器</el-button>
      <el-button @click="layout = 2">富文本编辑器</el-button>
    </div>
    <div id="mavon-editor" v-show="isEdit && layout == 1">
      <mavon-editor ref="mavonEditor"
        :toolbars="toolbars"
        :boxShadow="false"
        :scrollStyle="true"
        :ishljs="true"
        @save="saveBtn"></mavon-editor>
    </div>
    <div v-show="isEdit && layout == 2">

    </div>
    <!-- <el-button type="primary" @click="saveBtn">保存</el-button> -->
  </div>
</template>

<script>
export default {
  props: ['chapterId', 'isEdit'],
  data() {
    return {
      toolbars: {
          bold: true, // 粗体
          italic: true, // 斜体
          header: true, // 标题
          underline: true, // 下划线
          strikethrough: true, // 中划线
          mark: true, // 标记
          superscript: true, // 上角标
          subscript: true, // 下角标
          quote: true, // 引用
          ol: true, // 有序列表
          ul: true, // 无序列表
          link: true, // 链接
          imagelink: true, // 图片链接
          code: true, // code
          table: true, // 表格
          fullscreen: true, // 全屏编辑
          readmodel: true, // 沉浸式阅读
          htmlcode: true, // 展示html源码
          help: true, // 帮助
          undo: true, // 上一步
          redo: true, // 下一步
          trash: true, // 清空
          save: true, // 保存（触发events中的save事件）
          navigation: true, // 导航目录
          alignleft: true, // 左对齐
          aligncenter: true, // 居中
          alignright: true, // 右对齐
          subfield: true, // 单双栏模式
          preview: true, // 预览
      },
      content: '',
      dataChapterId: undefined,
      layout: 1//1 markdown 2 富文本
    }
  },
  methods: {
    init() {
      this.$post('/admin/chapter/get_content', {
        chapter_id: this.dataChapterId
      })
        .then(res => {
          if(!res) {
            this.content = ''
            return
          }
          if(res.layout == 1) {
            this.content = this.$refs.mavonEditor.markdownIt.render(res.content)
          }
        })
    },
    saveBtn(value) {
      this.$post('/admin/chapter/save_content', {
        chapter_id: this.dataChapterId,
        layout: 1,
        content: value
      })
        .then(res => {
          console.log(res)
          this.$message('保存成功！')
        })
    }
  },
  watch:{
    chapterId:function(newData){
      this.dataChapterId = newData
      this.init()
    }
  }
}
</script>

<style lang="scss">
.editors {
  width: 100%;
  height: 100%;
  padding: 15px 0;
  .btn {
    padding-bottom: 15px;
    button {
      height: 35px;
      padding: 9px 20px;
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
}
</style>