<template>
  <div class="container">
    <div class="page-head">我的文档管理</div>
    <div class="container-box">
      <div class="search-box">
        <div class="search-box-input">
          <el-input v-model="searchData.keyword" class="demo-input-suffix" placeholder="请输入文档名称" clearable
                    @keyup.enter.native="getAllProject">
            <i slot="suffix" class="el-input__icon el-icon-search" @click="getAllProject"></i>
          </el-input>
          <el-select v-model="searchData.is_public" @change="getAllProject">
            <el-option label="全部" value=""></el-option>
            <el-option label="公有" value="1"></el-option>
            <el-option label="私有" value="2"></el-option>
          </el-select>
          <el-select v-model="searchData.role" @change="getAllProject">
            <el-option label="全部" value=""></el-option>
            <el-option label="我创建的" value="1"></el-option>
            <el-option label="我操作的" value="2"></el-option>
          </el-select>
        </div>
      </div>
      <div class="card-box" v-loading="loading">
        <div class="card-warpper">
          <div class="w7-card" :class="{'has-cover': item.cover}"
               v-for="(item,index) in docList" :key="index"
               :style="{backgroundImage: 'url('+ item.cover +')'}"
               @click="goChapter(item)">
            <div class="w7-card-title">
              {{item.name}}
              <i class="wi wi-lock" v-if="!item.is_public"></i>
            </div>
            <div class="w7-card-time">{{format(item.operator.time)}} {{item.operator.name}}</div>
            <div class="icon-box">
              <el-tooltip effect="dark" content="转让项目" placement="bottom" v-if="item.acl.has_manage">
                <i class="wi wi-transfer" @click.stop="transferDoc(item.id)"></i>
              </el-tooltip>
              <el-tooltip effect="dark" content="预览" placement="bottom">
                <i class="wi wi-view" @click.stop="readDoc(item)"></i>
              </el-tooltip>
              <el-tooltip effect="dark" content="进入管理" placement="bottom" v-if="item.acl.has_manage">
                <i class="wi wi-guanli" @click.stop="settingDoc(item.id)"></i>
              </el-tooltip>
            </div>
          </div>
          <div class="w7-card add-btn" @click="dialogDocShow">
            <div class="add-text">新建项目</div>
            <div class="add-box">
              <i class="el-icon-circle-plus"></i>
            </div>
          </div>
        </div>
      </div>
      <el-pagination
          background
          @current-change="getAllProject"
          layout="prev, pager, next, total"
          prev-text="上一页"
          next-text="下一页"
          :page-size="page_size"
          :current-page.sync="currentPage"
          :page-count="pageCount"
          :hide-on-single-page="false"
          style="margin-top:20px"
      >
      </el-pagination>
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
    name: 'docIndex',
    components: {
      setting
    },
    data() {
      return {
        radio: '1',
        loading: false,
        searchData: {
          keyword: '',
          role: '',
          is_public: ''
        },
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
        getAllProject({
          page: this.currentPage,
          page_size: this.page_size,
          ...this.searchData
        }).then(res => {
          if (res.code == 200) {
            this.docList = res.data.data;
            this.pageCount = res.page_count;
            this.total = res.total;
            this.loading = false;
          }
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
      }
    }
  }
</script>
<style lang="scss" scoped>
  .card-warpper {
    display: flex;
    flex-wrap: wrap;
    margin-left: -10px;
  }

  .w7-card {
    position: relative;
    /*top: 0;*/
    margin: 10px;
    width: 300px;
    height: 160px;
    transition: 300ms;
    background: #e6f2ff;
    border: 1px solid #eeeeee;
    box-sizing: border-box;
    background-position: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;

    .wi {
      font-size: 20px;
      color: #989898;
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
    }

    &-title {
      padding-top: 30px;
      padding-left: 30px;
      font-size: 16px;
      color: #4d4d4d;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .wi-lock {
        font-size: 16px;
        color: #3296fa;
      }
    }

    &-time {
      padding-top: 10px;
      padding-left: 30px;
      font-size: 12px;
      color: #a4a6a9;
    }

    &.has-cover .icon-box {
      background-color: rgba(0, 0, 0, 0.2);
    }

    .icon-box i:hover {
      color: #3296fa;
    }

    .el-icon-lock:hover {
      color: #ffffff;
    }
  }

  .card-box {
    margin-top: 30px;
  }

  .icon-box {
    display: none;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 8px 7px;
    text-align: right;
    background-color: #d8e7ff;
  }

  .icon-box i {
    position: relative;
    margin-left: 20px;
  }

  .icon-box i:hover .pos-box {
    display: block;
  }

  .icon-box i .pos-box {
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
  }

  .icon-box i .pos-box .arr-box {
    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background: #000;
    border: 2px solid #000;
  }

  .icon-box i .arrow {
    width: 0px;
    height: 0px;
    position: absolute;
    border: 5px solid transparent;
    border-bottom-color: #000;
    top: -10px;
    left: 30%;
  }

  .add-btn {
    background: #fff;
    border: 1px solid #eee;
    color: #b6b5b5;
    position: relative;

    .add-text {
      padding-top: 30px;
      padding-left: 30px;
      font-size: 16px;
      color: #4d4d4d;
    }

    i:hover {
      color: #b6b5b5;
    }
  }

  .add-box {
    font-size: 60px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
