<template>
  <div class="container">
    <h3 class="page-head">
      项目管理
    </h3>
    <div class="container-box">
      <div class="search-box">
        <div class="demo-input-suffix">
          <el-input placeholder="请输入文档名称或创建者名称" v-model="keyword" @keyup.enter.native="searchDoc">
            <i slot="suffix" class="el-input__icon el-icon-search" @click="searchDoc"></i>
          </el-input>
        </div>
        <!-- <div class="demo-input-btn">
          <el-button type="primary" @click="dialogDocInfoVisible = true">创建文档</el-button>
        </div> -->
      </div>
      <div class="card-box" 
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <el-row :gutter="70" type="flex" justify="start" style="flex-wrap:wrap;">
          <el-col :span="4" v-for="(item,index) in docList" :key="index">
            <div class="w7-card" :class="actClass+''+index%3">
              <div class="w7-card-title">
                {{item.name}}
              </div>
              <div class="icon-box">
                <i class="el-icon-lock">
                  <div class="pos-box">
                    <div class="arr-box">
                      <div class="arrow"></div>
                      <span>私有</span>
                    </div>
                  </div>
                </i>
                <i class="el-icon-view">
                  <div class="pos-box">
                    <div class="arr-box">
                      <div class="arrow"></div>
                      <span>预览</span>
                    </div>
                  </div>
                </i>
                <i class="el-icon-s-tools">
                  <div class="pos-box">
                    <div class="arr-box">
                      <div class="arrow"></div>
                      <span>设置</span>
                    </div>
                  </div>
                </i>
              </div>
            </div>
          </el-col>
          <el-col :span="4">
            <div class="add-btn">
              新建项目
              <div class="add-box" @click="dialogDocInfoVisible = true">
                <i class="el-icon-circle-plus"></i>
              </div>
              <div class="icon-box">
                <i class="el-icon-lock">
                  <div class="pos-box">
                    <div class="arr-box">
                      <div class="arrow"></div>
                      <span>私有</span>
                    </div>
                  </div>
                </i>
                <i class="el-icon-view">
                  <div class="pos-box">
                    <div class="arr-box">
                      <div class="arrow"></div>
                      <span>预览</span>
                    </div>
                  </div>
                </i>
                <i class="el-icon-s-tools">
                  <div class="pos-box">
                    <div class="arr-box">
                      <div class="arrow"></div>
                      <span>设置</span>
                    </div>
                  </div>
                </i>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <el-table class="w7-table" :data="docList" empty-text=""
          v-loading="loading"
          element-loading-text="加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
        <el-table-column label="名称">
          <template slot-scope="scope">
            <i class="w7-icon-fileFolder"></i>
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建者" prop="username"></el-table-column>
        <el-table-column label="创建时间" prop="created_at"></el-table-column>
        <el-table-column label="操作" align="right">
          <template slot-scope="scope">
            <el-button type="text" v-if="scope.row.has_creator != 3 || UserInfo.has_privilege == 1" @click="removeDoc(scope.row.id)">删除</el-button>
            <router-link
              :to="{path: 'chapter/' + scope.row.id}"
              class="el-button el-button--text">编辑</router-link>
            <router-link
              :to="{path: 'document/'+ scope.row.id}"
              class="el-button el-button--text" v-if="scope.row.has_creator != 3 || UserInfo.has_privilege == 1">
              管理设置
            </router-link>
            <el-button type="text" v-if="scope.row.has_creator != 3 || UserInfo.has_privilege == 1"
              :class="{redBtn: scope.row.is_show == 1}"
              @click="updateDoc(scope.row.id, scope.row.is_show)">{{scope.row.is_show == 2 ? "发布" : "取消发布"}}</el-button>
            <el-button type="text" :class="{'is-disabled': scope.row.is_show == 2}" @click="readDoc(scope.row.id, scope.row.is_show)">阅读文档</el-button>
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
        style="margin:0"
      >
      </el-pagination>
      <!-- 基本信息弹出框 -->
      <el-dialog class="w7-dialog" title="创建项目" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false" center>
        <el-form :label-width="formLabelWidth">
          <el-form-item label="项目名称">
            <el-input v-model="name" autocomplete="off"></el-input>
          </el-form-item>
          <el-radio-group v-model="radio" class="ownership">
            <el-radio v-model="radio" label="1">公开项目</el-radio>
            <el-radio v-model="radio" label="2">私有项目</el-radio>
          </el-radio-group>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="createDoc">确 定</el-button>
          <el-button @click="dialogDocInfoVisible = false">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  name: 'docIndex',
  data() {
    return {
      radio: '1',
      loading: false,
      keyword: '',
      docList: [],
      currentPage: 0,//当前页码
      pageCount: 0,//总页数
      total: 0,//总数
      name: '',
      description: '',
      dialogDocInfoVisible: false,//创建文档弹弹出框
      formLabelWidth: '120px',
      actClass:"actClass",
    }
  },
  computed: {
      ...mapGetters({UserInfo: 'UserInfo'})
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      this.$post('/admin/document/getlist',{
        page: this.currentPage,
        name: this.keyword
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.pageCount
          this.total = res.total
          this.loading = false
        })
    },
    searchDoc() {
      this.loading = true
      this.$post('/admin/document/getlist',{
        name: this.keyword
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.pageCount
          this.total = res.total
          this.loading = false
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
        this.$post('/admin/document/delete',{
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
    },
    readDoc(id, isShow) {
      if(isShow == 2) {
        this.$message('请先发布文档！')
        return
      }
      let routeUrl = this.$router.resolve({
        path: "/chapter/" + id
      })
      window.open(routeUrl.href, '_blank')
    }
  }
}
</script>
<style lang="scss" scoped>
.container{
  padding:30px 40px 0 40px;
}
.page-head{
  font-weight:400;
}
.container-box{
  padding-left:20px;
}
.el-icon-search{
  color:#3f9dfa;
}
.w7-card{
  height:120px;
  color:#fff;
  padding:20px;
  margin-bottom:70px;
  border-radius:4px;
  position: relative;
  top:0;
  transition: 0.2s;
}
.w7-card-title{
  wwidth:100%;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.w7-card:hover{
  box-shadow:0px 3px 18px 1px	rgba(194, 192, 192, 0.84);
  position: relative;
  top:-10px;
}
.actClass0{
  background: #ffae2b;
}
.actClass1{
  background: #4096f9;
}
.actClass2{
  background: #fa7475;
}
.card-box{
  margin-top:30px;
}
.w7-card:hover .icon-box{
  display:block;
}
.icon-box{
  position:absolute;
  right:20px;
  bottom:20px;
  display:none;
}
.icon-box i{
  position: relative;
}
.icon-box i:hover .pos-box{
  display:block;
}
.icon-box i .pos-box{
  position: absolute;
  top:20px;
  left:-10px;
  display:none;
  text-align: center;
  width:40px;
  height:20px;
  line-height:16px;
  background: #000;
  color:#fff;
  font-size:14px;
}
.icon-box i .pos-box .arr-box{
  position: relative;
  width:100%;
  height:100%;
  box-sizing:border-box;
  background: #000;
  border:2px solid #000;
}
.icon-box i .arrow{
  width: 0px;   
  height: 0px;   
  position: absolute;   
  border:5px solid transparent;
  border-bottom-color:#000;
  top:-10px;
  left:30%;
}
.el-icon-view{
  margin:0 20px;
}
.add-btn{
  height:118px;
  padding:20px;
  background:#fff;
  border:1px solid #eee;
  color:#b6b5b5;
  border-radius:4px;
  position: relative;
}
.add-btn:hover{
  box-shadow:0px 3px 18px 1px	rgba(194, 192, 192, 0.84);
  position: relative;
  top:-10px;
  animation:move 0.2s 1;
}
.add-btn:hover .icon-box{
  display:block;
}
.add-box{
  font-size:60px;
  position: absolute;
  top:50%;
  left:50%;
  transform: translate(-50%,-50%);
}
.ownership{
  margin-left:120px;
}
.el-dialog__footer{
  border-top:1px solid #eee;
}
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