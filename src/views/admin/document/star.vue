<template>
  <div class="we7-document-star">
    <h3 class="page-head">
      我的星标
    </h3>
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
          <span class="name">{{ scope.row.name }}</span>
          <i class="wi wi-star color-yellow"></i>
          <div class="we7-label" v-if="!scope.row.is_public">
            <i class="wi wi-lock" ><span class="font">私有</span></i>
          </div>
        </div>
      </el-table-column>
      <el-table-column label="来自" prop="acl.name"></el-table-column>
      <el-table-column label="操作" align="right">
        <template slot-scope="scope">
          <el-button type="text" @click="aa(scope.row)">删除</el-button>
          <el-button type="text" @click="aa(scope.row)">取消星标/添加星标</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="btns">
      <el-pagination
        background
        @current-change = "getList"
        layout="prev, pager, next, total"
        prev-text="上一页"
        next-text="下一页"
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
        name: this.keyword
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.page_count
          this.total = res.total
          this.loading = false
        })
    },
    aa() {

    }
  }
}
</script>