<template>
  <el-container class="user-permission">
    <el-aside width="150px">项目权限</el-aside>
    <el-main>
      <div class="select-power search-box">
          <el-select v-model="is_public" placeholder="请选择" @change="search">
              <el-option label="全部项目" value="0"></el-option>
              <el-option label="公有项目" value="1"></el-option>
              <el-option label="私有项目" value="2"></el-option>
          </el-select>
          <div class="demo-input-suffix">
            <el-input v-model="keyword" placeholder="请输入项目名称" clearable @keyup.enter.native="search">
              <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
            </el-input>
          </div>
          <div class="more-edit" v-if="false" @click="dialogEditInfoVisible = true">批量修改</div>
      </div>
      <el-table class="w7-table" :data="docList" empty-text="" row-key="id" ref="multipleTable" :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
          <el-table-column v-if="false" reserve-selection type="selection" width="55"></el-table-column>
          <el-table-column label="项目名称">
            <template slot-scope="scope">
                <i class="wi wi-folder"></i>
                <span style="margin-left: 10px">{{ scope.row.name }}</span>
                <div v-if="!scope.row.is_public" style="display:inline-block;padding:0 5px;margin-left: 20px;background:#fff1de;color:#ff8600;">
                <i class="el-icon-lock" ><span style="margin-left: 5px;">私有</span></i>
                </div>
            </template>
          </el-table-column>
          <el-table-column label="权限" align="right">
          <template slot-scope="scope">
              <el-radio-group v-model="scope.row.cur_role" class="ownership">
                <template v-for="item in scope.row.role_list">
                  <el-tooltip effect="dark" content="可管理成员、阅读和编辑文档" placement="bottom"
                    v-if="item.id == 1"
                    :key="item.id">
                      <el-radio :label="1">{{item.name}}</el-radio>
                  </el-tooltip>
                  <el-tooltip effect="dark" content="可阅读和编辑文档" placement="bottom"
                    v-if="item.id == 2"
                    :key="item.id">
                      <el-radio :label="2">{{item.name}}</el-radio>
                  </el-tooltip>
                  <el-tooltip effect="dark" content="仅可以阅读" placement="bottom"
                    v-if="item.id == 3"
                    :key="item.id">
                      <el-radio :label="3">{{item.name}}</el-radio>
                  </el-tooltip>
                </template>
              </el-radio-group>
          </template>
          </el-table-column>
          <div class="nodata" slot="empty">
            <p>暂无可以查看管理的文档</p>
          </div>
      </el-table>
      <div class="get-more" v-if="currentPage != pageCount && pageCount > 1">
        <el-button type="text" @click="getMore">点击加载更多</el-button>
      </div>
      <div class="btns">
          <el-button type="primary" @click="save">保存</el-button>
      </div>
    </el-main>
    <!-- 批量修改弹出框 -->
    <el-dialog class="w7-dialog" title="批量修改" :visible.sync="dialogEditInfoVisible" :close-on-click-modal="false" center>
        <el-form label-width="120" style="margin-left:50px;">
        <el-form-item label="公有项目">
            <el-radio-group v-model="radio" class="ownership">
            <!-- <el-radio :label="1">管理员</el-radio> -->
            <el-radio :label="2">操作员</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="私有项目">
            <el-radio-group v-model="radio1" class="ownership">
            <!-- <el-radio :label="1">管理员</el-radio> -->
            <el-radio :label="2">操作员</el-radio>
            <el-radio :label="3">阅读者</el-radio>
            </el-radio-group>
        </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editAll">确 定</el-button>
        <el-button @click="dialogEditInfoVisible = false">取 消</el-button>
        </div>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  props: ['user_id'],
  data() {
    return {
      is_public: '',
      keyword: '',
      docList: [],//项目列表
      currentPage: 1,//当前页码
      pageCount: 1,//总页数
      total: 0,//总数
      dialogEditInfoVisible: false,
      radio: 2,
      radio1: 2,
      selectRows: []//所有选中行
    }
  },
  created() {
    this.getList()
  },
  methods: {
    search() {
      this.currentPage = 1
      this.getList()
    },
    getMore() {
      this.currentPage++
      this.getList('more')
    },
    getList(val) {
      this.$post('/admin/document/all-by-uid',{
        user_id: this.user_id,
        page: this.currentPage,
        name: this.keyword,
        is_public: this.is_public
      }).then(res => {
        if (val == 'more') {
          this.docList = [...this.docList,...res.data.data]
        } else {
          this.docList = res.data.data;
        }
        this.pageCount = res.data.page_count;
        this.total = res.data.total;
      })
    },
    save() {
      let document_permission = []
      for (const i in this.docList) {
        if(this.docList[i].cur_role) {
          document_permission.push({
            document_id: this.docList[i].id,
            permission: this.docList[i].cur_role
          })
        }
      }
      if (document_permission.length) {
        this.$post('/admin/user/batch-update-permission',{
          user_id: this.user_id,
          document_permission: document_permission
        })
          .then(() => {
            this.$message('保存成功！')
            this.$router.push('/admin/user')
          })
      } else {
        this.$router.push('/admin/user')
      }
    },
    editAll() {
      let rows = this.$refs.multipleTable.selection
      for (const i in rows) {
        if (rows[i].is_public) {
          rows[i].cur_role = Number(this.radio)
        } else {
          rows[i].cur_role = Number(this.radio1)
        }
      }
      this.dialogEditInfoVisible = false
    }
  }
}
</script>

<style lang="scss">
.user-permission {
  .el-aside {
    padding-left: 20px;
  }
  .el-main {
    padding: 0;
  }
  .el-table, .el-table tr, .el-table tr th {
    background-color: #fcfcfc!important;
  }
  .el-table--enable-row-hover .el-table__body tr:hover > td {
    background-color: #ffffff;
  }
  .select-power{
    .el-select {
      margin-right: 20px;
      width: 200px;
    }
    .demo-input-suffix {
      flex: 1;
      .el-input {
        width: 300px;
      }
    }
    .more-edit{
      text-align: right;
      color:#3296fa;
      cursor:pointer;
    }
  }
  .btns {
    margin-top: 20px;
  }
  .el-table .cell{
    overflow:auto!important;
    .wi-folder {
      color: #ffcd2c;
    }
  }
  .get-more {
    margin: 20px auto;
    text-align: center;
  }
}
</style>