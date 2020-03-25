<template>
  <div class="editors">
    <div class="chapter-title">{{ chapterInfo.name }}</div>
    <div id="editor"></div>
    <el-button class="saveBtn" type="primary" @click="save">保存</el-button>
  </div>
</template>

<script>
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import Editor from '@toast-ui/editor';

import 'highlight.js/styles/github.css';
import codeSyntaxHightlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import hljs from 'highlight.js';

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
      contentMd: '', //md格式的内容
      timer: '', //定时器
      editor: ''
    }
  },
  watch: {
    chapterId() {
      this.init()
    }
  },
  mounted() {
    this.initEditor()
  },
  destroyed() {
    //清除定时器
    clearInterval(this.timer)
  },
  methods: {
    initEditor() {
      var clientHeight = document.documentElement.clientHeight
      var height = (clientHeight - 310) + 'px'
      Editor.setLanguage('zh-CN', {
        Markdown: 'Markdown',
        WYSIWYG: '所见即所得',
        Write: '编辑',
        Preview: '预览',
        Headings: '标题',
        Paragraph: '文本',
        Bold: '加粗',
        Italic: '斜体字',
        Strike: '删除线',
        Code: '内嵌代码',
        Line: '水平线',
        Blockquote: '引用块',
        'Unordered list': '无序列表',
        'Ordered list': '有序列表',
        Task: '任务',
        Indent: '缩进',
        Outdent: '减少缩进',
        'Insert link': '插入链接',
        'Insert CodeBlock': '插入代码块',
        'Insert table': '插入表格',
        'Insert image': '插入图片',
        Heading: '标题',
        'Image URL': '图片网址',
        'Select image file': '选择图片文件',
        Description: '说明',
        OK: '确认',
        More: '更多',
        Cancel: '取消',
        File: '文件',
        URL: 'URL',
        'Link text': '链接文本',
        'Add row': '添加行',
        'Add col': '添加列',
        'Remove row': '删除行',
        'Remove col': '删除列',
        'Align left': '左对齐',
        'Align center': '居中对齐',
        'Align right': '右对齐',
        'Remove table': '删除表格',
        'Would you like to paste as table?': '需要粘贴为表格吗?',
        'Text color': '文字颜色',
        'Auto scroll enabled': '自动滚动已启用',
        'Auto scroll disabled': '自动滚动已禁用',
        'Choose language': '选择语言'
      })
      this.editor = new Editor({
        el: document.querySelector('#editor'),
        previewStyle: 'vertical',
        height: height,
        initialValue: '',
        language: 'zh-CN',
        // plugins: [chart, codeSyntaxHighlight, colorSyntax, tableMergedCell, uml],
        plugins: [[codeSyntaxHightlight, { hljs }]],
        hooks: {
          addImageBlobHook: (file, callback) => {
            const formData = new FormData()
            formData.append('file', file)
            this.$post('/admin/upload/image', formData)
              .then(res => {
                callback(res.data.url, file.name)
              })
              .catch(function(error) {
                console.log('上传失败，请稍后重试', error)
              })
          }
        }
      })
    },
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
        this.editor.setMarkdown(this.contentMd, true)
        clearInterval(this.timer) //清除定时器
        this.$nextTick(() => {
          this.timer = setInterval(() => {
            this.save()
          }, 3 * 60 * 1000);
        })
      })
    },
    save() {
      this.$post('/admin/chapter/save', {
        document_id: this.$route.params.id,
        chapter_id: this.chapterId,
        content: this.editor.getMarkdown()
      }).then(() => {
        this.$message('保存成功！')
      })
    }
  }
}
</script>

<style lang="scss">
.editors {
  #editor {
    margin: 30px 0;
  }
}
.chapter-title {
  padding-top: 10px;
  font-size: 20px;
  letter-spacing: 1px;
  color: #4d4d4d;
}
</style>