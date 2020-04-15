<template>
  <div class="editor-wrap">
    <mavon-editor
        :ref="editorRef"
        :boxShadow="false"
        :scrollStyle="true"
        :ishljs="true"
        :navigation="false"
        v-model="contentMd"
        v-bind="$attrs"
        @imgAdd="$imgAdd"
        v-on="$listeners"
        @change="change">
      <template slot="left-toolbar-after">
        <i class="el-icon-menu" @click="setContent()"></i>
      </template>
    </mavon-editor>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: String
  },
  data() {
    return {
      editorRef: 'editorRef',
      code_style: '',
      contentMd: ''
    }
  },
  computed: {
  },
  methods: {
    $imgAdd(pos, $file) {
      // 第一步.将图片上传到服务器.
      var formdata = new FormData()
      formdata.append('file', $file)
      this.$post('/admin/upload/image', formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
        .then(res => {
          // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
          this.$refs[this.editorRef].$img2Url(pos, res.url)
        })
        .catch(function(error) {
          console.log('发生错误！', error)
        })
    },
    setContent() {
      this.$refs[this.editorRef].insertText(this.$refs[this.editorRef].getTextareaDom(), {
           prefix: '@[toc](',
           subfix: ')',
           str: '目录'
         })
    },
    change() {
      this.$emit('change', this.contentMd)
    },
  },
  watch: {
    value(val) {
      if(val) {
        this.contentMd = val
      }
    }
  }
}
</script>

<style>

</style>