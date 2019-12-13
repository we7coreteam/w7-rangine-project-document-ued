<template>
  <div class="permission">
    <div class="select-power">
        <span class="name">项目权限</span>
        <el-select v-model="is_public" placeholder="请选择" @change="search">
            <el-option label="全部项目" value="0"></el-option>
            <el-option label="公有项目" value="1"></el-option>
            <el-option label="私有项目" value="2"></el-option>
        </el-select>
        <el-input placeholder="请输入项目名称" v-model="keyword" @keyup.enter.native="search">
          <i slot="suffix" class="el-input__icon el-icon-search" @click="search"></i>
        </el-input>
        <div class="more-edit" @click="dialogEditInfoVisible = true">批量修改</div>
    </div>
    <el-table class="w7-table" :data="docList" empty-text="" ref="multipleTable" :header-cell-style="{background:'#f7f9fc',color:'#606266'}">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="项目名称">
        <template slot-scope="scope">
            <i class="w7-icon-fileFolder"></i>
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
                <el-tooltip class="item" effect="dark" content="仅可以阅读" placement="bottom"
                  v-if="item.id == 1"
                  :key="item.id">
                    <el-radio :label="1">{{item.name}}</el-radio>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="可阅读和编辑文档" placement="bottom"
                  v-if="item.id == 2"
                  :key="item.id">
                    <el-radio :label="2">{{item.name}}</el-radio>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="可管理成员、阅读和编辑文档" placement="bottom"
                  v-if="item.id == 3"
                  :key="item.id">
                    <el-radio :label="3">{{item.name}}</el-radio>
                </el-tooltip>
              </template>
            </el-radio-group>
        </template>
        </el-table-column>
        <div class="nodata" slot="empty">
          <p>暂无可以查看管理的文档，请先操作</p>
        </div>
    </el-table>
    <div class="btns">
        <el-button type="primary" @click="save">保存</el-button>
    </div>
    <!-- 批量修改弹出框 -->
    <el-dialog class="w7-dialog" title="批量修改" :visible.sync="dialogEditInfoVisible" :close-on-click-modal="false" center>
        <el-form label-width="120" style="margin-left:50px;">
        <el-form-item label="公有项目">
            <el-radio-group v-model="radio" class="ownership">
            <el-radio :label="1">管理员</el-radio>
            <el-radio :label="2">操作员</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="私有项目">
            <el-radio-group v-model="radio1" class="ownership">
            <el-radio :label="1">管理员</el-radio>
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
  </div>
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
      pageCount: 0,//总页数
      total: 0,//总数
      dialogEditInfoVisible: false,
      radio: 1,
      radio1: 1,
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
    getList() {
      this.$post('/admin/document/all-by-uid',{
        user_id: this.user_id,
        page: this.currentPage,
        name: this.keyword,
        is_public: this.is_public
      })
        .then(res => {
          this.docList = res.data
          this.pageCount = res.pageCount
          this.total = res.total
        })
    },
    save() {
      let rows = this.$refs.multipleTable.selection
      let document_permission = []
      for (const i in rows) {
        document_permission.push({
          document_id: rows[i].id,
					permission: rows[i].cur_role
        })
      }
      this.$post('/admin/user/batch-update-permission',{
        user_id: this.user_id,
        document_permission: document_permission
      })
        .then(() => {
          this.$message('保存成功！')
          this.$router.push('/admin/user')
        })
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

<style lang="scss" scoped>
.select-power{
  display: flex;
  align-items: center;
  .name, .el-select, .el-input {
    margin-right: 60px;
  }
  .name {
    width: 80px;
  }
  .el-select {
    width: 200px;
  }
  .el-input {
    width: 300px;
  }
  .more-edit{
    flex: 1;
    text-align: right;
    color:#3296fa;
    cursor:pointer;
  }
}
.btns {
  margin-top: 20px;
  button {
    margin: 0 20px;
    padding: 12px 30px;
  }
  .el-pagination {
    margin-top:0;
  }
}
.w7-icon-fileFolder:after {
  content:url('~@/assets/img/fileFolder-small.png')
}
.el-table .cell{
  overflow:auto!important;
}
</style>