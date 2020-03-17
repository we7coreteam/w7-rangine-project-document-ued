<template>
  <div class="we7-document-recycle">
    <div class="page-head">
      回收站
    </div>
    <el-table class="w7-table" :data="docList"
      :header-cell-style="{background:'#f7f9fc',color:'#606266'}"
      empty-text="没有与搜索条件匹配的项">
      <el-table-column label="名称">
        <template slot-scope="scope">
          
        </template>
      </el-table-column>
      <el-table-column label="归属" prop="author.name"></el-table-column>
      <el-table-column label="删除时间">
        <template slot-scope="scope">
          
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right">
        <div class="oper" slot-scope="scope">
          <el-tooltip effect="dark" content="撤销" placement="bottom">
            <i class="wi wi-star" @click="revocation(scope.row.id)"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除记录" placement="bottom">
            <i class="wi wi-delete" @click="del(scope.row.id)"></i>
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
      this.$post('/admin/operate-log/all',{
        page: this.currentPage,
        name: this.keyword,
        time: this.time
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.page_count
          this.total = res.total
          this.loading = false
        })
    },
    revocation(id) {
      
    },
    del(id) {
      
    }
  }
}
</script>

<style lang="scss">
.we7-document-recycle {

}
</style>