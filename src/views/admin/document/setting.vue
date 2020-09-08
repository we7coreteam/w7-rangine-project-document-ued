<template>
  <div class="document-setting">
    <div class="document-setting-warpper" v-if="!showAddManage">
      <div class="nav">
        <div class="nav-item" :class="{'active': active == 0}" @click="onClickNav(0)">
          <p class="light-line" v-if="active == 0"></p>
          项目概览
        </div>
        <div class="nav-item" :class="{'active': active == 1}" @click="onClickNav(1)">
          <p class="light-line" v-if="active == 1"></p>
          权限管理
        </div>
        <div class="nav-item" :class="{'active': active == 2}" @click="onClickNav(2)">
          <p class="light-line" v-if="active == 2"></p>
          历史记录
        </div>
      </div>
      <div class="content">
        <div class="project" v-if="active == 0">
          <el-form :model="docData" ref="docForm" key="doc" :rules="rules" class="w7-form__no-required-icon" label-width="85px" label-position="left">
            <el-form-item label="项目封面" class="cover-warpper">
              <div class="upload-wrap">
                <el-upload
                    action="/admin/upload/image"
                    accept=".jpg,.jpeg,.png"
                    ref="upload"
                    :show-file-list="false"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload">
                  <div class="cover-img">
                    <img v-if="docData.cover" :src="docData.cover">
                  </div>
                </el-upload>
                <div class="cover-btn">
                  <el-upload
                      action="/admin/upload/image"
                      accept=".jpg,.jpeg,.png"
                      ref="upload"
                      :show-file-list="false"
                      :on-success="handleAvatarSuccess"
                      :before-upload="beforeAvatarUpload">
                    <el-button type="primary" plain>上传封面</el-button>
                  </el-upload>
                  <el-button class="cover-default" @click="docData.cover = ''">默认封面</el-button>
                </div>
              </div>
              <div class="el-upload__tip">格式要求：支持jpg、jpeg、png格式，图片小于5M，最佳图片比例2:1。</div>
            </el-form-item>
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="docData.name"></el-input>
            </el-form-item>
            <el-form-item label="公开性质">
              <el-select v-model="docData.is_public">
                <el-option label="公开项目" value="1"></el-option>
                <el-option label="私有项目" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="查看权限" v-if="docData.is_public != 1">
              <el-select v-model="docData.login_preview">
                <el-option label="仅限有权限者查看" value="2"></el-option>
                <el-option label="点击链接登录后查看" value="3"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div class="btns">
            <el-button type="primary" @click="saveDoc">保存</el-button>
            <el-button @click="delDoc">删除</el-button>
          </div>
        </div>
        <div class="manage" v-if="active == 1">
          <div class="top">
            <el-button type="primary" plain @click="openAddManage">添加权限</el-button>
          </div>
          <el-table class="w7-table" max-height="370" :data="details.operator" key="manageTable" :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
            <el-table-column prop="username" label="名称" width="300px"></el-table-column>
            <el-table-column label="身份" align="center">
              <template slot-scope="scope">
                <div class="identity" v-if="scope.row.acl.role == 1">{{scope.row.acl.name}}</div>
                <template v-else>{{scope.row.acl.name}}</template>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="right">
              <div class="oper" slot-scope="scope">
                <el-tooltip  effect="dark" content="编辑" placement="bottom">
                  <i class="wi wi-edit" @click="editManage(scope.row)" v-if="details.acl.has_manage && scope.row.acl.role != 1"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="删除" placement="bottom">
                  <i class="wi wi-delete" @click="removeManage(scope.row.id)" v-if="details.acl.has_manage && scope.row.acl.role != 1"></i>
                </el-tooltip>
                <div class="edit-role" v-if="shwoEditRole && selectUserId == scope.row.id">
                  <div class="edit-role-content">
                    <div class="label">权限:</div>
                    <el-select v-model="selectUserRole">
                      <el-option
                        v-for="item in role_list"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="edit-role-foot">
                    <el-button type="primary" @click="editRole">确定</el-button>
                    <el-button @click="shwoEditRole = false">取消</el-button>
                  </div>
                </div>
              </div>
            </el-table-column>
          </el-table>
        </div>
        <div class="history" v-if="active == 2">
          <el-table class="w7-table" ref="historyTableRef" :data="historyList" key="historyTable" max-height="370">
            <el-table-column prop="remark" label="描述"></el-table-column>
            <el-table-column prop="time" label="时间" align="right"></el-table-column>
          </el-table>
          <el-pagination
            background
            @current-change = "getHistory"
            layout="prev, pager, next, total"
            prev-text="上一页"
            next-text="下一页"
            :page-size="5"
            :current-page.sync = "currentPageHistory"
            :page-count="pageCountHistory"
            :hide-on-single-page = "true"
          >
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 添加权限 -->
    <div class="add-manage-header" v-if="showAddManage">
      <el-link :underline="false" @click="showAddManage = false"><i class="el-icon-arrow-left"></i>添加权限</el-link>
      <el-link :underline="false" @click="showAddManage = false"><i class="el-icon-close"></i></el-link>
    </div>
    <div class="add-manage-body" v-if="showAddManage">
      <el-form :model="addManageData" ref="addManageForm" key="addManage" :rules="rules" class="w7-form__no-required-icon" label-width="85px" label-position="left">
        <el-form-item label="用户名" prop="username">
          <el-select
            v-model="addManageData.username"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            :loading="loading">
              <el-option
                v-for="item in userOptions"
                :key="item.username"
                :label="item.username"
                :value="item.username">
              </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作员权限">
          <el-select v-model="addManageData.role">
            <el-option
              v-for="item in role_list"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="add-manage-footer">
        <el-button type="primary" @click="addManage">确 定</el-button>
        <el-button @click="showAddManage = false">取 消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import {getUser} from '@/api/api'

  export default {
  name: 'setting',
  props: ['id'],
  data() {
    return {
      active: 0,
      details: '',
      docData: {
        cover: '',
        name: '',
        is_public: '1',
        login_preview: '2',
        is_public_Copy: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'change' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'change' }
        ]
      },
      addManageData: {},
      role_list: [],//操作员的可选权限
      showAddManage: false,
      shwoEditRole: false,
      selectUserId: '',
      selectUserRole: '',
      historyList: [],
      currentPageHistory: 1,//当前页码
      pageCountHistory: 0,//总页数
      totalHistory: 0,//总数
      userOptions: [],
      loading: false
    }
  },
  watch: {
    id(newVal, oldVal) {
      console.log(newVal, oldVal)
      this.active = 0
      this.getdetails()
    }
  },
  created() {
    this.getdetails()
  },
  methods: {
    onClickNav(index) {
      if (index == 2) {
        this.getHistory()
      }
      this.active = index
    },
    getdetails() {
      this.$post('/admin/document/detail',{
        document_id : this.id
      }).then(res => {
        this.details = res.data;
        console.log('details');
        console.log(this.details);
        let is_public = '';
        let login_preview = '';
        if (res.data.is_public == 1) {
          login_preview = 2;
          is_public = 1;
        } else if (res.data.is_public == 2) {
          login_preview = res.data.is_public;
          is_public = 2;
        } else {
          login_preview = res.data.is_public;
          is_public = 2;
        }
        this.docData = {
          cover: res.data.cover || '',
          name: res.data.name,
          // is_public: res.data.is_public ? '2' : '1',
          is_public,
          login_preview,
          is_public_Copy: res.data.is_public
        }
        this.docData.is_public = this.docData.is_public.toString();
        console.log('is_public');
        console.log(this.docData.is_public);
        this.docData.login_preview = this.docData.login_preview.toString();
        this.role_list = res.data.role_list
        this.addManageData.role = res.data.role_list[0].id;
      })
    },
    getHistory() {
      this.$post('/admin/operate-log/get-by-document ',{
        document_id : this.id,
        page: this.currentPageHistory
      }).then(res => {
        this.historyList = res.data.data || []
        this.pageCountHistory = res.data.page_count
        this.totalHistory = res.data.total
        this.$refs.historyTableRef.bodyWrapper.scrollTop = 0
      })
    },
    handleAvatarSuccess(res) {
      console.log(res);
      if (res.code === 200) {
        this.docData.cover = res.data.url;
      } else {
        this.$message.error(res.message);
      }
    },
    beforeAvatarUpload(file) {
      const isFormat = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt5M = file.size / 1024 / 1024 < 5;

      if (!isFormat) {
        this.$message.error('上传图片只支持jpg、jpeg、png格式!');
      }
      if (!isLt5M) {
        this.$message.error('上传图片大小不能超过 5MB!');
      }
      return isFormat && isLt5M;
    },
    saveDoc() {
      const cover = this.docData.cover;
      const name = this.docData.name;
      const login_preview = this.docData.login_preview;
      let is_public = this.docData.is_public;
      if (is_public == 1) {
        is_public = 1;
      } else {
        if (login_preview == 2) {
          is_public = 2;
        } else {
          is_public = 3;
        }
      }

      this.$refs['docForm'].validate((valid) => {
        if (valid) {
          this.$post('/admin/document/update', {
            document_id: this.details.id,
            cover,
            name,
            is_public
          }).then(() => {
              this.$message({ type: 'success', message: '保存成功!'});

          })
        }
      })
    },
    delDoc() {
      this.$confirm('此操作将永久删除该文档, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/document/delete', {
          document_id: this.details.id
        }).then(() => {
          this.$parent.handleClose();
          this.$message({ type: 'success', message: '删除成功!'})
          // this.$router.push('/admin/document/')
        })
      })
    },
    editManage(item) {
      this.selectUserId = item.id
      this.selectUserRole = item.acl.role
      this.shwoEditRole = true
    },
    editRole() {
      this.$post('/admin/document/operator',{
        user_id: this.selectUserId,
        document_id: this.id,
        permission: this.selectUserRole
      }).then(() => {
        this.getdetails()
        this.shwoEditRole = false
      })
    },
    removeManage(id) {
      this.$confirm('确定删除该操作员吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/document/operator',{
          user_id: id,
          document_id: this.id
        })
          .then(() => {
            this.getdetails()
            this.$message('删除成功！')
          })
      })
    },
    openAddManage() {
      this.addManageData = {
        username: '',
        role: this.role_list[0].id || ''
      }
      this.showAddManage = true
      getUser({
        no_self: 1
      }).then(res => {
        this.userOptions = res.data;
        console.log(123);
        console.log(this.userOptions);
      }).catch(e => {
        console.log(e);
      })
    },
    addManage() {
      let flag = true
      for (const i in this.details.operator) {
        if(this.details.operator[i].username == this.addManageData.username) {
            this.$message('用户已存在')
            flag = false
            return
          }
      }
      if (!flag) { return }
      this.$refs['addManageForm'].validate((valid) => {
        if (valid) {
          this.$post('/admin/document/operator',{
            user_name: this.addManageData.username,
            document_id: this.id,
            permission : this.addManageData.role,
          })
            .then(() => {
              this.getdetails()
              this.$message('添加成功！')
              this.showAddManage = false
            })
        }
      })
    },
    uploadCover () {
      this.$refs.upload.uploadFiles();
      console.log(this.$refs.upload.uploadFiles());
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true;
        console.log(query);
        getUser({
          no_self: 1,
          username: query
        }).then(res => {
          this.loading = false;
          this.userOptions = res.data;
        }).catch(e => {
          console.log(e);
          this.loading = false;
        })
      } else {
        this.userOptions = [];
      }
    }
  }
}
</script>

<style lang="scss">
.document-setting {
  .document-setting-warpper {
    display: flex;
    border-top: 1px solid #e5e5e5;
  }
  .nav {
    width: 150px;
    border-right: 1px solid #e5e5e5;
    &-item {
      position: relative;
      padding-left: 30px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #eeeeee;
      box-sizing: border-box;
      cursor: pointer;
      &:hover {
        color: #59a5f9;
      }
      &.active {
        color: #59a5f9;
        background-color: #f5f5f5;
      }
      .light-line {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 3px;
        height: 100%;
        background: #3296fa;
      }
    }
  }

  .content {
    flex: 1;
    height: 510px;
    box-sizing: border-box;

    .upload-wrap {
      display: flex;
      /*align-items: center;*/

    }

    .project {
      padding: 50px 100px;
      .el-form-item__content {
        width: 490px;
      }
      .cover-warpper {
        position: relative;
        margin-bottom: 10px;
        .el-upload {
          display: flex;
          .cover-img {
            margin-right: 20px;
            width: 200px;
            height: 100px;
            background: #e6f2ff;
            border: 1px solid #eeeeee;
            box-sizing: border-box;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .cover-btn {
            text-align: left;
          }
        }
        .el-upload__tip {
          margin-top: 0;
          color: #cccccc;
          line-height: 36px;
        }
        .cover-default {
          margin-top: 10px;
          /*position: absolute;*/
          /*top: 50px;*/
          /*right: 120px;*/
        }
      }
      .btns {
        padding-top: 25px;
        text-align: center;
        .el-button + .el-button {
          margin-left: 20px;
        }
      }
    }
    .manage {
      padding: 20px 35px 0 30px;
      .top {
        padding-bottom: 20px;
        text-align: right;
      }
      .w7-table {
        margin-top: 0;
        overflow: inherit;
        .el-table th, .el-table td {
          padding: 6px 0;
          position: relative;
        }
        .el-table__body-wrapper, .cell {
          overflow: inherit;
        }
        .identity {
          margin: 0 auto;
          width: 78px;
          line-height: 28px;
          color: #45bb7f;
          text-align: center;
          background-color: #c1fbde;
          border: 1px solid #4dc88a;
          border-radius: 4px;
        }
        .oper {
          /*position: relative;*/

          .edit-role {
            position: absolute;
            top: 42px;
            right: 0;
            width: 360px;
            height: 150px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 3px 18px 1px rgba(194, 192, 192, .85);
            z-index: 9999;
            &::before {
              content: '';
              position: absolute;
              top: -10px;
              right: 40px;
              width: 0;
              height: 0;
              border-color: transparent;
              border-style: solid;
              border-width: 10px;
              border-top-width: 0;
              border-bottom-color: #ffffff;
            }
            &-content {
              padding: 28px 25px 28px 23px;
              .label {
                display: inline-block;
                width: 40px;
                text-align: left;
              }
              .el-select {
                width: 270px;
              }
            }
            &-foot {
              text-align: center;
              .el-button {
                padding: 9px 34px;
              }
            }
          }
        }
      }
    }
    .history {
      padding: 40px 50px;
      .w7-table {
        margin-top: 0;

      }
    }
  }
  .add-manage-header {
    position: absolute;
    top: 0;
    left: 0;
    padding: 30px 20px;
    display: flex;
    justify-content: space-between;
    width: 1000px;
    background-color: #ffffff;
    box-sizing: border-box;
    .el-link {
      line-height: 24px;
      font-size: 18px;
    }
    .el-icon-close {
      font-size: 20px;
    }
  }
  .add-manage-body {
    padding: 50px 220px 55px 200px;
    border-top: 1px solid #e5e5e5;
    .add-manage-footer {
      padding-top: 260px;
      text-align: center;
    }
  }
}
</style>