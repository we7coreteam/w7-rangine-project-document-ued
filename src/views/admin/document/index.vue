<template>
  <div>
    <h3 class="page-head">
      普通文档
    </h3>
    <div class="search-box">
      <div class="demo-input-suffix">
        <el-input placeholder="请输入关键字搜索" v-model="keyword">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="searchDoc"></i>
        </el-input>
      </div>
      <div class="demo-input-btn">
        <el-button type="primary" @click="dialogDocInfoVisible = true">创建文档</el-button>
      </div>
    </div>
    <el-table class="w7-table" :data="docList" empty-text=""
        :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
      <el-table-column label="名称">
        <template slot-scope="scope">
          <i class="w7-icon-fileFolder"></i>
          <span style="margin-left: 10px">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" prop="username"></el-table-column>
      <!-- <el-table-column label="访问量" prop=""></el-table-column> -->
      <el-table-column label="创建时间" prop="created_at"></el-table-column>
      <el-table-column label="操作" align="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.has_creator != 3 || hasPrivilege == 1" @click="removeDoc(scope.row.id)">删除</el-button>
          <router-link
            :to="{path: 'document/chapter/' + scope.row.id}"
            class="el-button el-button--text">编辑</router-link>
          <router-link
            :to="{path: 'document/'+ scope.row.id}"
            class="el-button el-button--text" v-if="scope.row.has_creator != 3 || hasPrivilege == 1">
            管理设置
          </router-link>
          <el-button type="text" v-if="scope.row.has_creator != 3 || hasPrivilege == 1"
            :class="{redBtn: scope.row.is_show == 1}"
            @click="updateDoc(scope.row.id, scope.row.is_show)">{{scope.row.is_show == 2 ? "发布" : "取消发布"}}</el-button>
          <router-link :to="{path: '/'+ scope.row.id}" class="el-button el-button--text">
            阅读文档
          </router-link>
        </template>
      </el-table-column>
      <div class="nodata" slot="empty">
        <p>暂无可以查看管理的文档，请先操作<el-button type="text" @click="dialogDocInfoVisible = true">创建文档</el-button></p>
      </div>
    </el-table>
    <el-pagination
      background
      @current-change = "getList"
      layout="prev, pager, next, total"
      prev-text="上一页"
      next-text="下一页"
      :current-page.sync = "currentPage"
      :page-count="pageCount"
      :hide-on-single-page = "true"
    >
    </el-pagination>
    <!-- 基本信息弹出框 -->
    <el-dialog class="w7-dialog" title="创建文档" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false" center>
      <el-form :label-width="formLabelWidth">
        <el-form-item label="文档名称">
          <el-input v-model="name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="文档介绍">
          <el-input type="textarea" :rows="2" v-model="description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createDoc">确 定</el-button>
        <el-button @click="dialogDocInfoVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'docIndex',
  data() {
    return {
      hasPrivilege: '',//是否为超管
      keyword: '',
      docList: [],
      currentPage: 0,//当前页码
      pageCount: 0,//总页数
      total: 0,//总数
      name: '',
      description: '',
      dialogDocInfoVisible: false,//创建文档弹弹出框
      formLabelWidth: '120px'
    }
  },
  methods: {
    getList() {
      this.$post('/admin/document/getlist',{
        page: this.currentPage,
        keyword: this.keyword
      })
        .then(res => {
           this.docList = res.data
           this.pageCount = res.pageCount
           this.total = res.total
        })
    },
    searchDoc() {
      this.$post('/admin/document/search',{
        name: this.keyword
      })
        .then(res => {
           this.docList = res.data
           this.pageCount = res.pageCount
           this.total = res.total
        })
    },
    createDoc() {
      this.$post('/admin/document/create', {
        name: this.name,
        description: this.description
      })
        .then(() => {
          this.$message('创建成功！')
          this.dialogDocInfoVisible = false
          this.getList()
        })
    },
    removeDoc(id) {
      this.$confirm('确定删除该文档吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/document/del',{
          id: id
        })
          .then(() => {
            this.getList()
            this.$message('删除成功！')
          })
      })
    },
    updateDoc(id, isShow) {
      this.$post('/admin/document/update',{
          id: id,
          is_show: isShow == 1 ? 2 : 1
        })
          .then(() => {
            //修改docList
            this.docList.forEach(row => {
              if(row.id == id) {
                row.is_show = isShow == 1 ? 2 : 1
                return
              }
            });
          })
    }
  },
  created() {
    this.hasPrivilege = sessionStorage.getItem("has_privilege")
    this.getList()
  }
}
</script>
<style lang="scss" scoped>
.nodata {
  min-height: 400px;
  background-color: #fff;
  background-image:  url('~@/assets/img/nodata-bg.png');
  background-position:  center;
  background-repeat: no-repeat;
  p {
    padding-top: 280px;
    font-family: MicrosoftYaHei;
    font-size: 14px;
  }
}
.redBtn {
  color: #eb2e56;
}
.w7-icon-fileFolder:after {
  content:url('~@/assets/img/fileFolder-small.png')
}
</style>