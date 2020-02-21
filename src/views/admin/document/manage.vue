<template>
  <div class="container">
    <div class="page-head">项目管理</div>
    <div class="container-box">
      <div class="search-box">
        <div class="demo-input-suffix">
          <el-input v-model="keyword" placeholder="请输入文档名称" clearable @keyup.enter.native="getList">
            <i slot="suffix" class="el-input__icon el-icon-search" @click="getList"></i>
          </el-input>
        </div>
      </div>
      <div class="card-box" v-loading="loading">
        <div class="card-warpper">
          <div class="w7-card"
            v-for="(item,index) in docList" :key="index"
            @click="goChapter(item.id)">
            <div class="w7-card-title">{{item.name}}</div>
            <!-- <div class="w7-card-time">今天12：12 创建</div> -->
            <div class="icon-box">
              <el-tooltip effect="dark" content="私有" placement="bottom" v-if="!item.is_public">
                <i class="wi wi-lock"></i>
              </el-tooltip>
              <el-tooltip effect="dark" content="转让项目" placement="bottom" v-if="item.acl.has_manage">
                <i class="wi wi-transfer" @click.stop="transferDoc(item.id)"></i>
              </el-tooltip>
              <el-tooltip effect="dark" content="预览" placement="bottom">
                <i class="wi wi-view" @click.stop="readDoc(item.id)"></i>
              </el-tooltip>
              <el-tooltip effect="dark" content="进入管理" placement="bottom" v-if="item.acl.has_manage">
                <i class="wi wi-guanli" @click.stop="settingDoc(item.id)"></i>
              </el-tooltip>
            </div>
          </div>
          <div class="w7-card add-btn"  @click="dialogDocInfoVisible = true">
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
      <el-dialog class="we7-dialog" title="创建项目" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false" center>
        <el-form label-width="105px" label-position="left">
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
      <el-dialog class="we7-dialog" title="管理员转让" :visible.sync="dialogTransferDoc" :close-on-click-modal="false" center>
        <div class="transfer-tip">
          <i class="el-icon-warning"></i>转让管理员权限后您将成为操作员，不再是管理员，请谨慎操作。
        </div>
        <el-form label-width="115px" label-position="left">
          <el-form-item label="选择新的管理员">
            <el-input v-model="transferUsername" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="transfer">确 定</el-button>
          <el-button @click="dialogTransferDoc = false">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'docIndex',
  data() {
    return {
      radio: '1',
      loading: false,
      keyword: '',
      docList: [],
      currentPage: 0,//当前页码
      page_size: 29,
      pageCount: 0,//总页数
      total: 0,//总数
      name: '',
      dialogDocInfoVisible: false,//创建文档弹弹出框
      actClass:"actClass",
      dialogTransferDoc: false,
      transferUsername: '',
      selectDocId: ''
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
        page_size: this.page_size,
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
        .then(res => {
          this.$message('创建成功！')
          this.dialogDocInfoVisible = false
          this.goChapter(res, true)
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
      let routeUrl = this.$router.resolve({
        path: "/admin/document/" + id
      })
      window.open(routeUrl.href, '_blank')
    },
    transferDoc(id) {
      this.selectDocId = id
      this.transferUsername = ''
      this.dialogTransferDoc = true
    },
    transfer() {
      this.$post('/admin/document/change-founder',{
          document_id: this.selectDocId,
          username: this.transferUsername
        })
          .then(() => {
            this.getList()
            this.$message('转让成功！')
            this.dialogTransferDoc = false
          })
    },
    goChapter(id, bool) {
      let routeData = {
        name: 'chapter',
        params: {
          id: id
        }
      }
      if (bool) {
        routeData['query'] = { type: 'add'}
      }
      this.$router.push(routeData)
    }
  }
}
</script>
<style lang="scss" scoped>
.container-box{
  padding-left:20px;
}
.card-warpper {
  display: flex;
  flex-wrap:wrap;
  margin-left: -10px;
}
.w7-card{
  position: relative;
  top:0;
  margin: 10px;
  width: 300px;
	height: 160px;
  transition: 0.2s;
  background: #e6f2ff;
  border: 1px solid #eeeeee;
  box-sizing: border-box;
  .wi {
    font-size: 20px;
    color: #989898;
  }
  &:hover {
    position: relative;
    cursor:pointer;
    top:-10px;
    border-color: #bdddfd;
    .icon-box{
      display:block;
    }
  }
  &-title {
    padding-top: 30px;
    padding-left: 30px;
    font-size: 16px;
    color: #4d4d4d;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  &-time {
    padding-top: 10px;
    padding-left: 30px;
    font-size: 12px;
    color: #a4a6a9;
  }
  .icon-box i:hover {
    color: #3296fa;
  }
  .el-icon-lock:hover {
    color: #ffffff;
  }
}
.card-box{
  margin-top:30px;
}
.icon-box{
  display:none;
  position:absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 7px;
  text-align: right;
  background-color: #d8e7ff;
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
.redBtn {
  color: #eb2e56;
}
.transfer-tip {
  display: flex;
  align-items: center;
  margin-top: -10px;
  margin-bottom: 15px;
  i {
    margin-right: 10px;
    font-size: 18px;
    color: #f76260;
  }
}
</style>