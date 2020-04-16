<template>
    <div class="setting-nav">
      <div class="page-head">导航设置</div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="风格设置" name="style">
          <div class="we7-panel-form">
            <div class="we7-panel-form__header">导航风格</div>
            <div class="we7-panel-form__body">
              <div class="we7-panel-form__item">
                <div class="we7-panel-form__label">导航风格设置</div>
                  <div class="we7-panel-form__value">{{styleData[style]}}</div>
                  <div class="we7-panel-form__action">
                    <el-tooltip effect="dark" content="编辑" placement="bottom">
                      <i class="wi wi-edit wi-oper" @click="dialogStyle = true"></i>
                    </el-tooltip>
                  </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="菜单设置" name="menu">
          <div class="search-box">
            <div class="demo-input-btn">
              <el-button class="add-menu" type="primary" @click="openDialogMenu('add')">新增菜单</el-button>
            </div>
          </div>
          <el-table class="w7-table" :data="menuList" ref="multipleTable"
            :header-cell-style="{background:'#f7f9fc',color:'#606266'}"
            :default-sort = "{prop: 'sort', order: 'ascending'}">
            <el-table-column label="菜单名称" prop="name"></el-table-column>
            <el-table-column label="排序" prop="sort"></el-table-column>
            <el-table-column label="操作" align="right">
              <div class="oper" slot-scope="scope">
                <el-tooltip effect="dark" content="编辑" placement="bottom">
                  <i class="wi wi-edit wi-oper" @click="openDialogMenu('edit', scope.row)"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="删除" placement="bottom">
                  <i class="wi wi-delete wi-oper" @click="delMenu(scope.row.id, scope.$index)"></i>
                </el-tooltip>
              </div>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 弹出框 -->
      <el-dialog class="w7-dialog" title="导航风格设置" :visible.sync="dialogStyle" :close-on-click-modal="false" center>
        <el-form label-width="120px" label-position="left">
          <el-form-item label="导航风格">
            <el-select v-model="style">
              <el-option
                v-for="item in styleList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="confirmStyle">确 定</el-button>
          <el-button @click="dialogStyle = false">取 消</el-button>
        </div>
      </el-dialog>
      <el-dialog class="w7-dialog" :title="dialogMenuTitle" :visible.sync="dialogMenu" @close="closeDialogMenu" :close-on-click-modal="false" center>
        <el-form ref="menuForm" :model="menuData" :rules="rules" class="w7-form__no-required-icon" label-width="120px" label-position="left">
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="menuData.name"></el-input>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input v-model="menuData.sort"></el-input>
            <div class="we7-help-block">排序为升序排序，数字越小，排名越靠前</div>
          </el-form-item>
          <el-form-item label="菜单链接" prop="url">
            <el-input v-model="menuData.url"></el-input>
            <div class="we7-help-block">支持相对链接。非相对链接请填写以http或https开头的完整链接</div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="confirm">确 定</el-button>
          <el-button @click="closeDialogMenu">取 消</el-button>
        </div>
      </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
      return {
        activeName:'style',
        menuList: [],
        dialogStyle: false,
        style: '',
        styleData: {
          black: '黑色',
          white: '白色'
        },
        styleList: [
          {
            value: 'white',
            label: '白色'
          }, {
            value: 'black',
            label: '黑色'
          }
        ],
        dialogMenu: false,
        dialogMenuTitle: '',
        menuData: {
          id: '',
          name: '',
          sort: '',
          url: ''
        },
        rules: {
          name: [
            { required: true, message: '请填写菜单名称', trigger: 'blur' }
          ],
          sort: [
            { required: true, message: '请填写排序', trigger: 'blur' }
          ],
          url: [
            { required: true, message: '请填写菜单链接', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getStyle()
      this.getMenuData()
    },
    methods: {
      getStyle() {
        this.$post('/admin/menu/get-theme')
          .then(res => {
            this.style = res.data || 'white'
          })
      },
      getMenuData() {
        this.$post('/admin/menu/all')
          .then(res => {
            this.menuList = res.data
          })
      },
      confirmStyle() {
        this.$post('/admin/menu/set-theme', {
          theme: this.style
        })
          .then(() => {
            this.$message('修改成功！')
            this.dialogStyle = false
            this.$store.dispatch('getNavMenu')
          })
      },
      openDialogMenu(type, row) {
        if (type == 'add') {
          this.dialogMenuTitle = '新增菜单'
          this.menuData = {
            id: '',
            name: '',
            sort: '',
            url: ''
          }
        } else {
          this.dialogMenuTitle = '编辑菜单'
          let newdata = JSON.parse(JSON.stringify(row))
          this.menuData = {
            id: newdata.id,
            name:  newdata.name,
            sort:  newdata.sort,
            url:  newdata.url
          }
        }
        this.dialogMenu = true
      },
      closeDialogMenu() {
        this.$refs.menuForm.resetFields()
        this.dialogMenu = false
      },
      confirm() {
        this.$refs.menuForm.validate((valid) => {
          if (valid) {
            if (this.dialogMenuTitle == '新增菜单') {
              this.$post('/admin/menu/add', {
                ...this.menuData
              })
                .then(() => {
                  this.getMenuData()
                  this.$message('新增成功！')
                  this.dialogMenu = false
                })
            } else {
              this.$post('/admin/menu/update', {
                ...this.menuData
              })
                .then(() => {
                  this.getMenuData()
                  this.$message('修改成功！')
                  this.dialogMenu = false
                })
            }
          }
        })
      },
      delMenu(id, index) {
        this.$confirm('确定要删除该菜单吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$post('/admin/menu/delete', {
            id: id
          })
            .then(() => {
              this.menuList.splice(index, 1)
              this.$message('删除成功！')
            })
        })
      },
      handleClick() {
      }
    }
}
</script>

<style lang="scss">
.setting-nav {
  .page-head {
    padding-bottom: 20px;
  }
  .we7-panel-form__header {
    margin-top: 5px;
  }
  .demo-input-btn {
    width: 100%;
    text-align: right;
    .add-menu {
      padding: 9px 30px;
    }
  }
  .w7-table {
    margin-top: 20px;
  }
}
</style>