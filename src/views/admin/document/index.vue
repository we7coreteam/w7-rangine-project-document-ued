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
      </div>
      <div class="card-box"
        v-loading="loading"
      >
        <div class="card-warpper">
          <div class="w7-card" :class="actClass+''+index%3"
            v-for="(item,index) in docList" :key="index"
            @click="goChapter(item.id)">
            <div class="w7-card-title">
              {{item.name}}
            </div>
            <div class="icon-box">
              <i class="el-icon-lock" v-if="item.has_read">
                <div class="pos-box">
                  <div class="arr-box">
                    <div class="arrow"></div>
                    <span>私有</span>
                  </div>
                </div>
              </i>
              <i class="el-icon-view" @click.stop="readDoc(item.id)">
                <div class="pos-box">
                  <div class="arr-box">
                    <div class="arrow"></div>
                    <span>预览</span>
                  </div>
                </div>
              </i>
              <i class="el-icon-s-tools" v-if="item.acl.has_manage" @click.stop="settingDoc(item.id)">
                <div class="pos-box">
                  <div class="arr-box">
                    <div class="arrow"></div>
                    <span>设置</span>
                  </div>
                </div>
              </i>
            </div>
          </div>
          <div class="w7-card add-btn" @click="dialogDocInfoVisible = true">
            新建项目
            <div class="add-box">
              <i class="el-icon-circle-plus"></i>
            </div>
          </div>
        </div>
      </div>
      <el-pagination
        background
        @current-change = "getList"
        layout="prev, pager, next, total"
        prev-text="上一页"
        next-text="下一页"
        :current-page.sync = "currentPage"
        :page-count="pageCount"
        :hide-on-single-page = "true"
        style="margin-top:20px"
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
    searchDoc() {
      this.loading = true
      this.$post('/admin/document/all',{
          keyword: this.keyword
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.page_count
          this.total = res.total
          this.loading = false
        })
    },
    createDoc() {
      this.$post('/admin/document/create', {
        name: this.name,
        is_public: this.radio
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
    readDoc(id) {
      let routeUrl = this.$router.resolve({
        path: "/chapter/" + id
      })
      window.open(routeUrl.href, '_blank')
    },
    settingDoc(id) {
      this.$router.push('/admin/document/' + id)
    },
    goChapter(id) {
      this.$router.push('/admin/document/chapter/' + id)
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
.card-warpper {
  display: flex;
  flex-wrap:wrap;
  margin: -35px -35px 0 -35px;
}
.w7-card{
  margin: 35px;
  padding:20px;
  width: 260px;
	height: 120px;
  color:#fff;
  border-radius:4px;
  position: relative;
  top:0;
  transition: 0.2s;
  &:hover{
    cursor:pointer;
    position: relative;
    top:-10px;
    box-shadow:0px 3px 18px 1px	rgba(194, 192, 192, 0.84);
  }
  i:hover {
    color: #606266;
  }
  .el-icon-lock:hover {
    color: #ffffff;
  }
}
.w7-card-title{
  width:100%;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
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
  margin-left: 20px;
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
.add-btn{
  background:#fff;
  border:1px solid #eee;
  color:#b6b5b5;
  position: relative;
  i:hover {
    color: #b6b5b5;
  }
}
.add-btn:hover{
  box-shadow:0px 3px 18px 1px	rgba(194, 192, 192, 0.84);
  animation:move 0.2s 1;
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