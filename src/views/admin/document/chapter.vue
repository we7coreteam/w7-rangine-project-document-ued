<template>
  <el-container>
    <el-aside>
      <el-tree :data="chapters" empty-text=""></el-tree>
    </el-aside>
    <el-main>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'chapter',
  data() {
    return {
      chapters: [],
      ccccc: ''
    }
  },
  methods: {
    getChapters() {
      this.$post('/admin/chapter/index', {
        document_id: this.$route.params.id
      })
        .then(res => {
           this.chapters = res
        })
    }
  },
  created() {
    this.getChapters()
  }
}
</script>
