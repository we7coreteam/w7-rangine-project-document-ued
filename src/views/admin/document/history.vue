<template>
  <div class="we7-document-history">
    <div class="page-head">
      历史查看
    </div>
    <div class="search-box">
      <div class="demo-input-suffix">
        <el-input v-model="keyword" placeholder="请输入文档名称" clearable @keyup.enter.native="getList">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="getList"></i>
        </el-input>
      </div>
      <el-select v-model="time" placeholder="请选择" @change="getList">
        <el-option label="全部" value="0"></el-option>
        <el-option label="一周前" value="7"></el-option>
        <el-option label="一月前" value="30"></el-option>
        <el-option label="三月前" value="90"></el-option>
    </el-select>
    </div>
    <el-table class="w7-table" :data="docList" ref="multipleTable"
      :header-cell-style="{background:'#f7f9fc',color:'#606266'}"
      empty-text="没有与搜索条件匹配的项">
      <el-table-column label="文档名称">
        <div class="doc-icons" slot-scope="scope">
          <i class="wi wi-document color-blue"></i>
          <span class="name" @click="readDoc(scope.row.id)">{{ scope.row.name }}</span>
          <i class="wi wi-star color-yellow" v-if="scope.row.has_star"></i>
          <div class="we7-label" v-if="!scope.row.is_public">
            <i class="wi wi-lock" ><span class="font">私有</span></i>
          </div>
        </div>
      </el-table-column>
      <el-table-column label="来自" prop="author.name"></el-table-column>
      <el-table-column label="时间">
        <template slot-scope="scope">
          {{ timestampFormat(scope.row.time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="right">
        <div class="oper" slot-scope="scope">
          <el-tooltip effect="dark" :content="scope.row.has_star ? '取消星标' : '添加星标'" placement="bottom">
            <i class="wi wi-star" :class="{'checked': scope.row.has_star}" @click="operStar(scope.row)"></i>
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
      time: '',
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
      this.$post('/admin/document/operate-log',{
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
    timestampFormat( timeString ) {
      var timestamp = Date.parse(timeString)/1000
      function zeroize( num ) {
          return (String(num).length == 1 ? '0' : '') + num;
      }

      var curTimestamp = parseInt(new Date().getTime() / 1000); //当前时间戳
      var timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数

      var curDate = new Date( curTimestamp * 1000 ); // 当前时间日期对象
      var tmDate = new Date( timestamp * 1000 );  // 参数时间戳转换成的日期对象

      var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
      var H = tmDate.getHours(), i = tmDate.getMinutes();

      if ( timestampDiff < 60 ) { // 一分钟以内
        return "刚刚";
      } else if( timestampDiff < 3600 ) { // 一小时前之内
        return Math.floor( timestampDiff / 60 ) + "分钟前";
      } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
        return '今天' + zeroize(H) + ':' + zeroize(i);
      } else {
        var oneDayDate = new Date( (curTimestamp - 86400) * 1000 ); // 参数中的时间戳加一天转换成的日期对象
        if ( oneDayDate.getFullYear() == Y && oneDayDate.getMonth()+1 == m && oneDayDate.getDate() == d ) {
          return '昨天' + zeroize(H) + ':' + zeroize(i);
        } else {
          return  Y + '年' + zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
        }
      }
    },
    del(id) {
      this.$confirm('是否要删除该条记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/document/delete-operate-log',{
          document_id: id
        })
          .then(() => {
            this.getList()
            this.$message('删除记录成功！')
          })
      })
    },
    operStar(row) {
      let url = row.has_star ? '/admin/star/delete' : '/admin/star/add'
      let mes = row.has_star ? '取消成功！' : '添加成功！'
      this.$post(url, {
        document_id: row.id
      })
        .then(() => {
          this.$message(mes)
          this.docList.forEach(doc => {
            if (doc.id == row.id) {
              doc.has_star = !doc.has_star
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
.we7-document-history {
  .search-box {
    padding-left: 20px;
    justify-content: flex-start;
    .demo-input-suffix {
      margin-right: 20px;
    }
  }
}
</style>