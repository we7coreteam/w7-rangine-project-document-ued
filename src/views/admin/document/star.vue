<template>
  <div class="we7-document-star">
    <div class="page-head">
      我的星标
    </div>
    <div class="search-box">
      <div class="demo-input-suffix">
        <el-input v-model="keyword" placeholder="请输入文档名称" clearable @keyup.enter.native="getList">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="getList"></i>
        </el-input>
      </div>
    </div>
    <el-table class="w7-table" :data="docList" ref="multipleTable"
      :header-cell-style="{background:'#f7f9fc',color:'#606266'}"
      empty-text="没有与搜索条件匹配的项">
      <el-table-column label="文档名称">
        <div class="doc-icons" slot-scope="scope">
          <i class="wi wi-document color-blue"></i>
          <span class="name" @click="readDoc(scope.row.document_id)">{{ scope.row.name }}</span>
          <i class="wi wi-star color-yellow"></i>
          <div class="we7-label" v-if="!scope.row.is_public">
            <i class="wi wi-lock" ><span class="font">私有</span></i>
          </div>
        </div>
      </el-table-column>
      <el-table-column label="来自" prop="author.name"></el-table-column>
      <el-table-column label="操作" align="right">
        <div class="oper" slot-scope="scope">
          <el-tooltip effect="dark" content="取消星标" placement="bottom">
            <i class="wi wi-star checked" @click="cancel(scope.row.document_id)"></i>
          </el-tooltip>
        </div>
      </el-table-column>
    </el-table>
    <div class="btns">
      <el-pagination
        background
        @current-change = "getList"
        layout="prev, pager, next, total"
        prev-text="上一页"
        next-text="下一页"
        :page-size="15"
        :current-page.sync = "currentPage"
        :page-count="pageCount"
        :total="total"
        :hide-on-single-page = "true"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      loading: false,
      docList: [],//数据列表
      currentPage: 1,//当前页码
      pageCount: 0,//总页数
      total: 0//总数
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.$post('/admin/star/all',{
        page: this.currentPage,
        name: this.keyword
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.page_count
          this.total = res.total
          this.loading = false
        })
    },
    cancel(id) {
       this.$post('/admin/star/delete',{
        document_id: id
      })
        .then(() => {
          this.getList()
          this.$message('取消成功！')
        })
    },
    readDoc(id) {
      let routeUrl = this.$router.resolve({
        path: "/chapter/" + id
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>

<style lang="scss">
</style>