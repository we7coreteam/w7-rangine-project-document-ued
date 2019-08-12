<template>
  <div>
    <el-button @click="add">添加</el-button>
  </div>
</template>

<script>
export default {
  name: 'chapter',
  data() {
    return {
      menu: {}
    }
  },
  methods: {
    getMenu() {
      this.$http.get('/admin/chapter/index', {
        params: {
          document_id: this.$route.params.id
        }
      })
        .then(res => {
          this.menu = res
        })
    },
    add() {
      this.$post('/admin/chapter/create', {
        document_id: this.$route.params.id,
        parent_id: 0,
        name: '章节1',
        sort: 1
      })
        .then(() => {
          this.getMenu()
          this.$message('添加成功')
        })
    }
  },
  created() {
    this.getMenu()
  }
}
</script>
