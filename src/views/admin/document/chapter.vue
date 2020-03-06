<template>
  <el-container class="w7-document-chapter">
    <el-aside class="w7-aside-chapter" width="260px">
      <div class="w7-aside-chapter-head">
        <p>{{ docName }}</p>
      </div>
      <div class="search-box">
        <el-input placeholder="请输入关键字搜索" v-model="filterText" clearable>
          <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>
      <div class="icon-box">
        <el-tooltip effect="dark" content="新建文档" placement="bottom">
          <i class="wi wi-document" @click="clickIconAddNode(false)"></i>
        </el-tooltip>
        <el-tooltip effect="dark" content="新建目录" placement="bottom">
          <i class="wi wi-folder" @click="clickIconAddNode(true)"></i>
        </el-tooltip>
        <el-tooltip effect="dark" content="预览" placement="bottom">
          <i class="wi wi-view" @click="readDoc"></i>
        </el-tooltip>
        <el-tooltip effect="dark" content="设置" placement="bottom" v-if="has_manage">
          <i class="wi wi-guanli" @click="showSetting = true"></i>
        </el-tooltip>
      </div>
      <div class="tree-warpper">
        <el-scrollbar style="height: 100%">
          <el-tree class="w7-tree" :data="chapters" :props="defaultProps" empty-text="没有与搜索条件匹配的项"
            ref="chaptersTree"
            node-key="id"
            :expand-on-click-node="true"
            :highlight-current="true"
            :default-expanded-keys="defaultExpanded"
            :filter-node-method="filterNode"
            @node-contextmenu="rightClick"
            @node-click="handleNodeClick"
            draggable
            @node-drop="handleDrop"
            :allow-drop="allowDrop">
            <div class="custom-tree-node" slot-scope="{ node, data }">
              <span class="node-info">
                <i class="wi wi-folder" v-if="data.is_dir == 1"></i>
                <i class="wi wi-document" v-if="data.is_dir == 0"></i>
                <div class="text-over">
                  <span :title="node.label">{{ node.label }}</span>
                </div>
              </span>
              <span class="point3" @mousemove='updateXY' @click.stop="leftClick(data, node)"><span>...</span></span>
            </div>
          </el-tree>
          <div id="menu-bar" class="menu-bar" v-show="menuBarVisible">
            <ul class="menu">
              <template v-if="rightSelectNodeObj.is_dir == 1">
                <li class="menu__item" @click="addChildNode(true)">创建目录</li>
                <li class="menu__item" @click="addChildNode(false)">创建文档</li>
                <li class="menu__item" @click="updateNode(true)">重命名</li>
                <li class="menu__item" @click="openMoveDialog(true)">移动</li>
                <li class="menu__item" @click="removeNode">删除</li>
              </template>
              <template v-if="rightSelectNodeObj.is_dir == 0">
                <li class="menu__item" @click="defaultFile">设为目录默认文档</li>
                <li class="menu__item" @click="updateNode(false)">重命名</li>
                <li class="menu__item" @click="copyNode()">复制文档</li>
                <li class="menu__item" @click="openMoveDialog(false)">移动</li>
                <!-- <li class="menu__item" @click="">权限</li> -->
                <li class="menu__item" @click="removeNode">删除</li>
              </template>
            </ul>
          </div>
        </el-scrollbar>
      </div>
    </el-aside>
    <el-main>
      <editors :chapterId="selectNodeObj.id" :chapterIsDir="selectNodeObj.is_dir"></editors>
    </el-main>
    <!-- 新增节点弹出框 -->
    <el-dialog class="we7-dialog only-input-dialog" :title="dialogTitle" :visible.sync="dialogVisible" :close-on-click-modal="false" center>
      <el-form :model="addNodeObj" label-width="105px" label-position="left" @submit.native.prevent>
        <el-form-item :label="dialogFormLabel">
          <el-input v-model="addNodeObj.name" @keyup.enter.native="confirmBtn"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmBtn">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 弹出框移动tree节点 -->
    <el-dialog class="we7-dialog" :title="dialogMoveTitle" :visible.sync="dialogMoveVisible" :close-on-click-modal="false" center>
      <el-form label-width="105px" label-position="left">
        <el-form-item label="项目">
          <el-select v-model="moveDoc" placeholder="请输入文档名称进行搜索"
            filterable
            remote
            reserve-keyword
            :remote-method="remoteMethod"
            @change="changeDoc">
            <el-option
              v-for="item in docList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader
            v-model="moveClass"
            :options="docChapters"
            :props="{ value: 'id', label: 'name'}"
            :clearable="true"
            :change-on-select="true"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="moveNode">确 定</el-button>
        <el-button @click="dialogMoveVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 复制节点弹出框 -->
    <el-dialog class="we7-dialog only-input-dialog" title="复制章节" :visible.sync="dialogVisibleCopy" :close-on-click-modal="false" center>
      <el-form label-width="105px" label-position="left" @submit.native.prevent>
        <el-form-item label="文档名称">
          <el-input v-model="copyNodeName" @keyup.enter.native="confirmBtnCopy"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmBtnCopy">确 定</el-button>
        <el-button @click="dialogVisibleCopy = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 文档设置 -->
    <el-dialog class="we7-dialog dialog-setting" title="项目设置" width="1000px" :visible.sync="showSetting" :close-on-click-modal="false">
      <setting :id="$route.params.id"></setting>
    </el-dialog>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import editors from './editors.vue'
import setting from './setting.vue'
export default {
  name: 'chapter',
  components: {
    editors,
    setting
  },
  data() {
    return {
      docName: '',
      has_manage: true,
      filterText: '',
      chapters: [],//目录树
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      defaultExpanded: [],//默认展开节点的数组
      defaultSelect: '',//默认选中的节点
      menuBarVisible: false,
      clientX: '',
      clientY: '',
      selectNodeObj: {},//选中的节点data
      rightSelectNodeObj: {},//右键选中的节点Object
      rightSelectNode: {},//右键选中的节点的Node
      addFirst: true,//新增节点的是否为第一级
      addNodeObj: {
        name: '',
        is_dir: 1
      },//新增节点
      dialogTitle: '',
      dialogFormLabel: '',
      dialogVisible: false,//新增弹出
      dialogMoveVisible: false,//移动弹出
      dialogMoveTitle: '',
      moveDoc: '',
      moveClass: '',
      docList: [],
      docChapters: [],
      showSetting: false,
      dialogVisibleCopy: false,
      copyNodeName: ''
    }
  },
  computed: {
    ...mapGetters({ UserInfo: 'UserInfo' })
  },
  watch: {
    filterText(val) {
      this.$refs.chaptersTree.filter(val)
    },
    dialogVisible(val) {
      if (val) {
        setTimeout(() => {
          document.querySelector(".only-input-dialog .el-input__inner").focus()
        }, 300);
      }
    },
    UserInfo(val) {
      if (val) {
        this.getOperRecord()
      }
    }
  },
  created() {
    if (this.$route.query && this.$route.query.type == 'add') {//新增项目
      this.clickIconAddNode(true)
    } else {
      if (this.UserInfo) {
        this.getOperRecord()
      }
      this.getChapters()
    }
  },
  methods: {
    /**
     * @打开操作记录
     * localStorage记录的操作节点的数据结构
     * we7_doc_user_1: {
     *  document_10: {
     *    defaultExpanded: [22, 33],
     *    defaultSelect: 11
     *  }
     * }
     * 注意：默认打开目录的时候，如果有默认选中的文档，需要在手动修改this.defaultExpanded，
     *      把defaultSelect（默认选中文档）push进去，但是不可以保存在localStorage中
    */
    getOperRecord() {
      var docUserKey = 'we7_doc_user_' + this.UserInfo.id//用户
      var docUserValue = JSON.parse(localStorage.getItem(docUserKey))
      var documentKey = 'document_' + this.$route.params.id//项目
      var data = {}
      data[documentKey] = {
        defaultExpanded: [],
        defaultSelect: ''
      }
      //判断当前用户名下存在记录
      if (docUserValue) {
        //判断是否存在当前项目的记录
        if (docUserValue[documentKey]) {
          this.defaultExpanded = docUserValue[documentKey].defaultExpanded
          this.defaultSelect = docUserValue[documentKey].defaultSelect
        } else {
          docUserValue[documentKey] = {
            defaultExpanded: [],
            defaultSelect: ''
          }
          localStorage.setItem(docUserKey, JSON.stringify(docUserValue))
        }
      } else {
        localStorage.setItem(docUserKey, JSON.stringify(data))
      }
    },
    //保存操作记录
    setOperRecord (obj) {
      //当前用户下的所有项目tree记录
      let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
      let record = allRecords['document_' + this.$route.params.id]
      if (obj.is_dir) {//如果是目录
        let index = record.defaultExpanded.findIndex( item => item == obj.id)
        if (index > -1) {
          record.defaultExpanded.splice(index, 1)
        } else {
          record.defaultExpanded.push(obj.id)
        }
      } else {
        record.defaultSelect = obj.id
      }
      localStorage.setItem('we7_doc_user_' + this.UserInfo.id, JSON.stringify(allRecords))
    },
    getChapters() {
      this.$post('/admin/chapter/detail', {
        document_id: this.$route.params.id
      })
        .then(res => {
          this.docName = res.document.name
          this.has_manage = res.acl.has_manage
          this.chapters = res.catalog
          //如果有记录的默认文档节点，则选中
          if (this.defaultSelect) {
            this.$nextTick(() => {
              this.$refs.chaptersTree.setCurrentKey(this.defaultSelect)
              this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
              //展开
              let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
              let record = allRecords['document_' + this.$route.params.id]
              this.defaultExpanded = record.defaultExpanded
              this.defaultExpanded.push(this.$refs.chaptersTree.getCurrentNode().id)
            })
          }
        })
    },
    readDoc() {
      let routeUrl = this.$router.resolve({
        path: "/chapter/" + this.$route.params.id
      })
      window.open(routeUrl.href, '_blank')
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    handleNodeClick(obj) {
      if(this.menuBarVisible) {this.menuBarVisible = false}
      this.selectNodeObj = obj
      this.setOperRecord(obj)
    },
    updateXY(event) {
      this.clientX = event.clientX
      this.clientY = event.clientY
    },
    leftClick(object, Node) {
      if (this.menuBarVisible == true) {
        this.menuBarVisible = false
        return
      }
      this.rightClick(false, object, Node)
    },
    rightClick(MouseEvent, object, Node) {
      // console.log('右键被点击---event:', MouseEvent)
      // console.log('右键被点击---传递给 data 属性的数组中该节点所对应的对象:', object)
      // console.log('右键被点击---节点对应的 Node:', Node)
      // console.log('右键被点击---节点组件本身:', element)
      this.rightSelectNodeObj = object
      this.rightSelectNode = Node
      this.menuBarVisible = false // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
      this.menuBarVisible = true  // 显示模态窗口，跳出自定义菜单栏
      this.$nextTick(() => {
        const menuBar = document.querySelector('#menu-bar')
        let height = window.innerHeight
        let menuHeight = menuBar.offsetHeight
        if(!MouseEvent) {//鼠标左键
          if (height - this.clientY > menuHeight) {
            menuBar.style.top = (this.clientY + 20) + 'px'
            menuBar.className = 'menu-bar bottom'
          } else {
            menuBar.style.top = (this.clientY - menuHeight - 20) + 'px'
            menuBar.className = 'menu-bar top'
          }
          menuBar.style.left = (this.clientX - 50) + 'px'
        } else {//鼠标右键
          if (height - MouseEvent.clientY > menuHeight) {
            menuBar.style.top = (MouseEvent.clientY + 20) + 'px'
            menuBar.className = 'menu-bar bottom'
          } else {
            menuBar.style.top = (MouseEvent.clientY - menuHeight - 10) + 'px'
            menuBar.className = 'menu-bar top'
          }
          menuBar.style.left = (MouseEvent.clientX - 50) + 'px'
        }
      })
      // 给整个document添加监听鼠标事件，点击任何位置执行removeRightClickEvent
      document.addEventListener('click', this.removeRightClickEvent)
    },
    removeRightClickEvent() {
      this.menuBarVisible = false
      document.removeEventListener('click', this.removeRightClickEvent)
    },
    clickIconAddNode(bool) {
      this.addFirst = true
      this.dialogTitle = bool ? '新建目录' : '新建文档'
      this.dialogFormLabel = bool ? '目录名称' : '文档名称'
      this.addNodeObj.name = ''
      this.addNodeObj.is_dir = bool ? 1 : 0
      this.dialogVisible = true
      this.rightSelectNode = {}
      this.rightSelectNodeObj = {}
    },
    updateNode(bool) {
      this.dialogTitle = '重命名'
      this.addNodeObj.name = this.rightSelectNodeObj.name
      this.dialogFormLabel = bool ? '新的目录名称' : '新的文档名称'
      this.dialogVisible = true
    },
    copyNode() {
      this.copyNodeName = this.rightSelectNodeObj.name
      this.dialogVisibleCopy = true
    },
    addChildNode(bool) {
      this.addFirst = false
      if (this.rightSelectNode.level == 2 && bool) {
        this.$message('第三级只能为文档！')
        return
      }
      this.dialogTitle = bool ? '新建目录' : '新建文档'
      this.dialogFormLabel = bool ? '目录名称' : '文档名称'
      this.addNodeObj.name = ''
      this.addNodeObj.is_dir = bool ? 1 : 0
      this.dialogVisible = true
    },
    confirmBtnCopy() {
      if(!this.copyNodeName) {
        this.$message('章节名称不能为空！')
        return
      }
      this.$post('/admin/chapter/copy', {
          document_id: this.$route.params.id,
          chapter_id: this.rightSelectNodeObj.id,
          parent_id: this.rightSelectNodeObj.parent_id,
          name: this.copyNodeName
        })
          .then(res => {
            let newChild = res
            if(this.rightSelectNodeObj.parent_id != 0) {
              let node = this.rightSelectNode
              let parent = node.parent
              parent.data.children.push(newChild)
            }else {
              this.chapters.push(newChild)
            }
            this.$message('复制成功！')
            this.dialogVisibleCopy = false
            this.$nextTick(() => {
              //选中新建章节
              this.$refs.chaptersTree.setCurrentKey( newChild.id )
              this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
              //展开
              let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
              let record = allRecords['document_' + this.$route.params.id]
              this.defaultExpanded = record.defaultExpanded
              this.defaultExpanded.push(newChild.id)
            })
          })
    },
    confirmBtn() {
      if(!this.addNodeObj.name) {
        this.$message('章节名称不能为空！')
        return
      }
      if(this.dialogTitle == '新建目录' || this.dialogTitle == '新建文档') {
        this.$post('/admin/chapter/create', {
          document_id: this.$route.params.id,
          parent_id: this.addFirst ? 0 : this.rightSelectNode.data.id,
          is_dir: this.addNodeObj.is_dir,
          name: this.addNodeObj.name
        })
          .then(res => {
            let newChild = res
            if(!this.addFirst) {
              let data = this.rightSelectNodeObj
              if (!data.children) {
                this.$set(data, 'children', []);
              }
              data.children.push(newChild)
            }else {
              this.chapters.push(newChild)
            }
            this.$message('新增成功！')
            this.dialogVisible = false
            this.$nextTick(() => {
              //选中新建章节
              this.$refs.chaptersTree.setCurrentKey( newChild.id )
              this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
              //展开
              let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
              let record = allRecords['document_' + this.$route.params.id]
              this.defaultExpanded = record.defaultExpanded
              this.defaultExpanded.push(newChild.id)
            })
          })
          .catch(() => {
            this.dialogVisible = false
          })
      }
      if(this.dialogTitle == '重命名') {
        this.$post('/admin/chapter/update', {
          document_id: this.$route.params.id,
          chapter_id: this.rightSelectNodeObj.id,
          name: this.addNodeObj.name
        })
          .then(() => {
            this.$message('修改成功！')
            this.rightSelectNodeObj.name = this.addNodeObj.name
            this.dialogVisible = false
          })
          .catch(() => {
            this.dialogVisible = false
          })
      }
    },
    removeNode() {
      var arrId =[]
      arrId.push(this.rightSelectNodeObj.id)
      //删除的为目录,切存在子节点
      if (this.rightSelectNodeObj.is_dir && this.rightSelectNodeObj.children && this.rightSelectNodeObj.children.length) {
        let getArrId = function(array) {
          array.forEach(item => {
            arrId.push(item.id)
            if (item.children && item.children.length) {
              getArrId(item.children)
            }
          })
        }
        getArrId(this.rightSelectNodeObj.children)
      }
      this.$confirm('确定删除该章节吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //这里鼠标左右键，都是只有右键this.rightSelectNode有值，左键没值
        this.$post('/admin/chapter/delete', {
          document_id: this.$route.params.id,
          chapter_id: arrId
        })
          .then(() => {
            let node = this.rightSelectNode
            let data = this.rightSelectNodeObj
            let parent = node.parent;
            let children = parent.data.children || parent.data
            let index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
            this.$message('删除成功！')
            this.selectNodeObj = {}
          })
      }).catch(() => {
      })
    },
    handleDrop(draggingNode, dropNode, dropType) {
      this.$post('/admin/chapter/sort', {
        document_id: this.$route.params.id,
        chapter_id: draggingNode.data.id,
        target: {
          chapter_id: dropNode.data.id,
          parent_id: dropNode.data.parent_id,
          position: dropType
        }
      })
        .then(() => {
          this.$message('修改成功！')
        })
    },
    allowDrop(draggingNode, dropNode, type) {
      if (dropNode.data.is_dir || type !== 'inner') {
        return true
      }
    },
    openMoveDialog(bool) {
      this.dialogMoveTitle =  bool ? '移动目录' : '移动文档'
      this.moveDoc = ''
      this.moveClass = ''
      this.dialogMoveVisible = true
    },
    remoteMethod(query) {
      if (query !== '') {
        this.$post('/admin/document/all',{
          keyword: query
        })
          .then(res => {
            this.docList = res.data
          })
      } else {
        this.options = [];
      }
    },
    changeDoc(id) {
      this.$post('/admin/chapter/detail', {
        document_id: id

      })
        .then(res => {
          //去掉所有文档和最后一个children
          this.docChapters =  this.deleteA(this.deleteA(res.catalog))
        })
    },
    deleteA(arr) {
      if(arr.length) {
        for(let i = arr.length-1;i>= 0; i--) {
          if(!arr[i]['is_dir']) {
            arr.splice(i, 1)
          } else if(arr[i].children && !arr[i].children.length) {
            delete arr[i].children
          } else if(arr[i].children){
            this.deleteA(arr[i]['children'])
          }
        }
      }
      return arr
    },
    moveNode() {
      if(!this.moveDoc) {
        this.$message('项目不能为空！')
        return
      }
      let id = 0
      if (this.moveClass.length == 1) {
        id = this.moveClass[0]
      } else if (this.moveClass.length == 2) {
        id = this.moveClass[1]
      }
      this.$post('/admin/chapter/sort', {
        document_id: this.$route.params.id,
        chapter_id: this.rightSelectNodeObj.id,
        target: {
          document_id: this.moveDoc,
          chapter_id: id,
          position: 'move'
        }
      })
        .then(() => {
          this.$message('移动成功！')
          this.dialogMoveVisible = false
          this.getChapters()
        })
    },
    defaultFile() {
      this.$post('/admin/chapter/default-show', {
        document_id: this.$route.params.id,
        chapter_id: this.rightSelectNodeObj.parent_id,
        show_chapter_id: this.rightSelectNodeObj.id
      })
        .then(() => {
          this.$message('设置默认文档成功！')
        })
    }
  }
}
</script>

<style lang="scss">
.w7-document-chapter {
  margin-left: -15px;
  padding-left: 260px;
  position: relative;
  .w7-aside-chapter {
    border-left: solid 1px #eeeeee;
    border-right: solid 1px #eeeeee;
    background-color: #f7f8fa;
    position: fixed;
    bottom: 0;
    left: 0;
    top: 60px;
    z-index: 1501;
    .w7-aside-chapter-head {
      margin: 40px 0;
      p {
        font-size: 16px;
        color: #4d4d4d;
        text-align: center;
      }
    }
    .search-box {
      margin: 0 20px 20px;
    }
  }
  .icon-box{
    padding: 0 30px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    color:#b6b5b5;
    .el-tooltip {
      cursor: pointer;
    }
    .wi {
      font-size: 22px;
    }
  }
  .tree-warpper {
    height: calc(100vh - 300px);
    .el-scrollbar__wrap {
      overflow-x: auto;
    }
  }
  .menu-bar {
    position: fixed;
    font-size: 14px;
    color: #4d4d4d;
    background-color: #ffffff;
    box-shadow: 2px 0px 10px 4px	rgba(219, 219, 219, 0.53);
    z-index: 10000;
    &.bottom::after {
      content: " ";
      position: absolute;
      display: block;
      top: -8px;
      left: 50px;
      width: 0;
      height: 0;
      border-color: transparent;
      border-style: solid;
      border-width: 8px;
      border-top-width: 0;
      border-bottom-color: #fff;
    }
    &.top::after {
      content: " ";
      position: absolute;
      display: block;
      left: 50px;
      width: 0;
      height: 0;
      border-color: transparent;
      border-style: solid;
      border-width: 8px;
      border-bottom-width: 0;
      border-top-color: #fff;
    }
    ul {
      margin: 10px 0;
    }
    li {
      padding: 0 14px;
      width: 150px;
      line-height: 34px;
      box-sizing: border-box;
      &:hover {
        color: #3296fa;
        cursor: pointer;
      }
    }
  }
  .dialog-setting {
    .el-dialog {
      border-radius: 0;
      .el-dialog__header {
        padding: 30px 20px;
        padding-bottom: 30px;
        .el-dialog__headerbtn {
          top: 31px;
          right: 20px;
          font-size: 20px;
        }
      }
      .el-dialog__body {
        padding: 0;
      }
    }
  }
}
.w7-tree {
  background: transparent;
  .el-tree-node__content {
    &:hover .custom-tree-node .point3 {
      display: inline-block;
    }
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .node-info {
        flex: 1;
        display: flex;
        .text-over {
          flex: 1;
          width: 0;
          margin-left:10px;
          padding-right: 10px;
        }
      }
      .point3 {
        display: none;
        color: #409eff;
        span {
          display: block;
          font-size: 30px;
          margin-top: -23px;
          margin-right: 10px;
        }
      }
    }
  }
  .wi-document {
    color: #3296fa;
  }
  .wi-folder {
    color: #ffcd2c;
  }
}
</style>