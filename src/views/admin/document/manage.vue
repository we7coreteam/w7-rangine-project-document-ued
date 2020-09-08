<template>
  <div class="container">
    <div class="page-head">我的文档管理</div>
    <div class="container-box">
      <div class="search-box">
        <div class="search-box-input">
          <el-input v-model="listQuery.keyword" class="demo-input-suffix" placeholder="请输入文档名称" clearable
                    @keyup.enter.native="getAllProject">
            <i slot="suffix" class="el-input__icon el-icon-search" @click="getAllProject"></i>
          </el-input>
          <el-select v-model="listQuery.is_public" @change="getAllProject">
            <el-option label="全部" value=""></el-option>
            <el-option label="公有" value="1"></el-option>
            <el-option label="私有" value="2"></el-option>
          </el-select>
          <el-select v-model="listQuery.role" @change="getAllProject">
            <el-option label="全部" value=""></el-option>
            <el-option label="我创建的" value="1"></el-option>
            <el-option label="我操作的" value="2"></el-option>
          </el-select>
        </div>
      </div>
      <div class="card-box" v-loading="loading">
        <div class="card-warpper">
          <div class="w7-card"
             :class="{'has-cover': item.cover}"
             v-for="(item,index) in docList" :key="index"
             :style="{backgroundImage: 'url('+ item.cover +')'}"
             @click="goChapter(item)">
            <img class="mask-icon" src="@/assets/img/doc-bg-2.png">
            <div class="mask" v-if="item.cover"></div>
            <div class="mask-content">
              <!--<div class="w7-card-title" :class="{'has-cover': !item.cover}">-->
              <div class="w7-card-title has-cover">
                {{item.name}}
              </div>
              <div class="time-wrap">
                <img v-if="!item.is_public" src="@/assets/img/icon-lock.png">
                <!--<i class="wi wi-lock" v-if="!item.is_public"></i>-->
                <div class="w7-card-time">{{format(item.operator.time)}} {{item.operator.name}}</div>
              </div>
              <div class="icon-box">
                <el-tooltip effect="dark" content="转让项目" placement="bottom" v-if="item.acl.has_manage">
                  <img src="@/assets/img/icon-refresh.png" @click.stop="transferDoc(item.id)">
                  <!--<i class="wi wi-transfer" @click.stop="transferDoc(item.id)"></i>-->
                </el-tooltip>
                <el-tooltip effect="dark" content="预览" placement="bottom">
                  <img src="@/assets/img/icon-view.png" @click.stop="readDoc(item)">
                  <!--<i class="wq wq-chakan" @click.stop="readDoc(item)"></i>-->
                </el-tooltip>
                <el-tooltip effect="dark" content="进入管理" placement="bottom" v-if="item.acl.has_manage">
                  <img src="@/assets/img/icon-management.png" @click.stop="settingDoc(item.id)">
                  <!--<i class="wi wi-guanli" @click.stop="settingDoc(item.id)"></i>-->
                </el-tooltip>
              </div>
              <div class="line"></div>
            </div>
          </div>
          <div class="w7-card add-project" @click="dialogDocShow">
            <!--<i class="el-icon-circle-plus"></i>-->
            <img class="mask-icon" src="@/assets/img/doc-bg-1.png">
            <img src="@/assets/img/icon-add.png">
            <div class="add-text">新建项目</div>
            <!--<div class="line"></div>-->
          </div>
        </div>
      </div>
      <div class="pagination-wrap">
        <el-pagination
          background
          :hide-on-single-page="total <= 11"
          :current-page.sync="listQuery.page"
          :page-sizes="[11,23,35]"
          :page-size="listQuery.page_size"
          :layout="paginationLayouts"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 基本信息弹出框 -->
      <el-dialog class="w7-dialog" title="创建项目" :visible.sync="dialogDocInfoVisible" :close-on-click-modal="false"
                 center>
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
      <el-dialog class="w7-dialog" title="管理员转让" :visible.sync="dialogTransferDoc" :close-on-click-modal="false" center>
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
    <!-- 文档设置 -->
    <el-dialog class="we7-dialog dialog-setting" title="项目设置" width="1000px" :visible.sync="showSetting"
               :close-on-click-modal="false" :before-close="handleClose">
      <setting :id="settingDocId"></setting>
    </el-dialog>
  </div>
</template>

<script>
  import {timestampFormat} from '@/utils/utils'
  import {createDoc, getAllProject} from '@/api/api'

  import setting from './setting.vue'

  export default {
name: 'documentIndex',
components: {
  setting
},
data() {
  return {
    listQuery: {
      page: 1,
      page_size: 11,
      keyword: '',
      role: '',
      is_public: ''
    },
    radio: '1',
    loading: false,
    docList: [],
    currentPage: 0,//当前页码
    page_size: 19,
    pageCount: 0,//总页数
    total: 0,//总数
    name: '',
    dialogDocInfoVisible: false,//创建文档弹弹出框
    actClass: "actClass",
    dialogTransferDoc: false,
    transferUsername: '',
    selectDocId: '',
    showSetting: false,
    settingDocId: ''
  }
},
computed: {
  paginationLayouts() {
    return this.total && (this.total / this.listQuery.page_size) > 1 ? 'total, sizes, prev, pager, next, jumper' : 'total, sizes'
  }
},
created() {
  this.getAllProject()
},
methods: {
  dialogDocShow () {
    this.dialogDocInfoVisible = true;
    this.name = '';
  },
  getAllProject() {
    this.loading = true;
    getAllProject(this.listQuery).then(res => {
      if (res.code == 200) {
        this.docList = res.data.data;
        this.pageCount = res.data.page_count;
        this.total = res.data.total;
        this.loading = false;
      }
    }).catch(error => {
      this.loading = false;
      console.log(error);
    })
  },
  createDoc() {
    createDoc({
      name: this.name,
      is_public: this.radio
    }).then(res => {
      this.$message('创建成功！')
      this.dialogDocInfoVisible = false;
      this.getAllProject();
      // this.$router.push({
      //   name: 'chapter',
      //   params: {
      //     id: res.data,
      //   },
      //   query: {type: 'add', documentType: 1}
      // })
    })

    // this.$post('/admin/document/create', {
    //   name: this.name,
    //   is_public: this.radio
    // }).then(res => {
    //   this.$message('创建成功！')
    //   this.dialogDocInfoVisible = false;
    //   this.goChapter(res, true)
    // })
  },
  removeDoc(id) {
    this.$confirm('确定删除该文档吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.$post('/admin/document/delete', {
        id: id
      })
        .then(() => {
          this.getAllProject()
          this.$message('删除成功！')
        })
    })
  },
  updateDoc(id, isShow) {
    this.$post('/admin/document/update', {
      id: id,
      is_show: isShow == 1 ? 2 : 1
    }).then(() => {
      //修改docList
      this.docList.forEach(row => {
        if (row.id == id) {
          row.is_show = isShow == 1 ? 2 : 1
          return
        }
      });
    })
  },
  readDoc(item) {
    let routeUrl = this.$router.resolve({
      path: "/chapter/" + item.id
    })
    localStorage.projectName = item.name;
    window.open(routeUrl.href, '_blank')
  },
  settingDoc(id) {
    this.settingDocId = id
    this.showSetting = true
  },
  transferDoc(id) {
    this.selectDocId = id
    this.transferUsername = ''
    this.dialogTransferDoc = true
  },
  transfer() {
    this.$post('/admin/document/change-founder', {
      document_id: this.selectDocId,
      username: this.transferUsername
    })
      .then(() => {
        this.getAllProject()
        this.$message('转让成功！')
        this.dialogTransferDoc = false
      })
  },
  goChapter(item, bool) {
    let routeData = {
      name: 'chapter',
      params: {
        id: item.id
      }
    }
    if (bool) {
      routeData['query'] = {type: 'add', documentType: 1}
    }
    localStorage.projectName = item.name;
    this.$router.push(routeData);
  },
  format(time) {
    if (time) {
      let result = timestampFormat(time)
      if (result.length > 8) {
        return timestampFormat(time).slice(5);
      } else {
        return timestampFormat(time);
      }
    }
  },
  handleClose() {
    this.getAllProject()
    this.showSetting = false
  },
  handleSizeChange(val) {
    this.listQuery.page_size = val
    this.getAllProject()
  },
  handleCurrentChange(val) {
    this.listQuery.page = val
    this.getAllProject()
  }
}
}
</script>
<style lang="scss" scoped>
  .pagination-wrap {
    .el-pagination {
      float: none;
      text-align: center;
    }
  }

  .card-box {
    margin-top: 30px;
    width: 90%;
  }

  .card-warpper {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -10px;

/*
    .line {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      background-color: #fff;
      width: 6px;
      height: 270px;
      border-radius: 3px;
    }
*/
  }

  .w7-card {
    position: relative;
    /*top: 0;*/
    margin: 10px 20px 10px 10px;
    width: 215px;
    height: 300px;
    transition: 300ms;
    box-sizing: border-box;
    background-position: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-color: #e6f2ff;
    border-radius: 10px 20px 20px 10px;

    .w7-card-title {
      font-size: 16px;
      color: #333;
      padding: 0 10px;
      margin-top: 100px;
      height: 64px;
      line-height: 32px;
      color: #2f2f2f;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;

      &.has-cover {
        background-image: linear-gradient(to right, #e7f3ff , #f5f9fd);
      }
    }

    .mask-icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: -12px;
    }

    .time-wrap {
      position: absolute;
      bottom: 30px;
      right: 10px;
      text-align: right;


      img {
        /*margin-bottom: 15px;*/
      }

      .wi-lock {
        font-size: 22px;
        color: #999;
        margin-bottom: 15px;
      }

      .w7-card-time {
        font-size: 14px;
        color: #818d9b;
      }
    }

    &.has-cover .icon-box {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .icon-box {
      display: none;
      position: absolute;
      width: 100%;
      left: 0;
      right: 3px;
      bottom: 0;
      padding: 10px;
      text-align: right;
      background-color: #b7cee8;
      border-radius: 0 0 20px 10px;

      i {
        color: #fff;
        font-size: 24px;
        position: relative;
        margin-left: 20px;

        .pos-box {
          position: absolute;
          top: 20px;
          left: -10px;
          display: none;
          text-align: center;
          width: 40px;
          height: 20px;
          line-height: 16px;
          background: #000;
          color: #fff;
          font-size: 14px;

          .arr-box {
            position: relative;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            background: #000;
            border: 2px solid #000;
          }
        }

        .arrow {
          width: 0px;
          height: 0px;
          position: absolute;
          border: 5px solid transparent;
          border-bottom-color: #000;
          top: -10px;
          left: 30%;
        }

        &:hover {
          color: #3296fa;
          .pos-box {
            display: block;
          }
        }
      }

      img {
        margin-left: 10px;
      }
    }

    .el-icon-lock:hover {
      color: #ffffff;
    }

    .mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255,255,255,.6);
      z-index: 2;
    }

    .mask-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
    }

    &:hover {
      /*position: relative;*/
      cursor: pointer;
      //top: -10px;
      border-color: #bdddfd;
      transform: translateY(-10px);

      .w7-card-title {
        color: #3296fa;
      }

      .icon-box {
        display: block;
      }

      .time-wrap {
        bottom: 60px;
      }
    }
  }

  .add-project {
    background: #fff;
    color: #b6b5b5;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    flex-flow: column;
    justify-content: center;

    img {
      margin-bottom: 10px;
    }

    .add-text {
      font-size: 16px;
      color: #2f2f2f;
      /*margin-bottom: 15px;*/
    }

/*
    i {
      font-size: 50px;
    }
*/
  }

  .ownership {
    margin-left: 120px;
  }

  .el-dialog__footer {
    border-top: 1px solid #eee;
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
