<template>
  <div class="we7-document-involved">
    <div class="page-head">
      我参与的
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
          <span class="name" @click="readDoc(scope.row.id)">{{ scope.row.name }}</span>
          <i class="wi wi-star color-yellow" v-if="scope.row.star_id"></i>
          <div class="we7-label" v-if="!scope.row.is_public">
            <i class="wi wi-lock" ><span class="font">私有</span></i>
          </div>
        </div>
      </el-table-column>
      <el-table-column label="来自" prop="author.name"></el-table-column>
      <el-table-column label="操作" align="right">
        <div class="oper" slot-scope="scope">
          <el-tooltip effect="dark" :content="scope.row.star_id ? '取消星标' : '添加星标'" placement="bottom">
            <i class="wi wi-star" :class="{'checked': scope.row.star_id}" @click="operStar(scope.row)"></i>
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
      this.$post('/admin/document/all',{
        page: this.currentPage,
        name: this.keyword,
        only_reader: 1
      })
        .then(res => {
          this.docList = res.data.data;
          this.pageCount = res.data.page_count
          this.total = res.data.total
          this.loading = false
        })
    },
    operStar(row) {
      let url = row.star_id ? '/admin/star/delete' : '/admin/star/add'
      let mes = row.star_id ? '取消成功！' : '添加成功！'
      let data = {
        document_id: row.id
      }
      if (row.star_id) {
        data['id'] = row.star_id
      }
      this.$post(url, data)
        .then(res => {
          this.$message(mes)
          this.docList.forEach(doc => {
            if (doc.id == row.id) {
              doc.star_id = res.data.star_id || ''
              return
            }
          })
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