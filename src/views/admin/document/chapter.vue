<template>
  <el-container class="w7-container">
    <el-aside class="w7-aside-chapter" width="202px">
      <div class="w7-aside-chapter-head">
        <p>{{ docName }}</p>
      </div>
      <el-input placeholder="请输入关键字搜索" v-model="filterText">
        <i slot="suffix" class="el-input__icon el-icon-search" style="color:#3296fa;"></i>
      </el-input>
      <div class="icon-box">
        <el-tooltip class="item" effect="dark" content="新建文档" placement="bottom">
          <i class="el-icon-document" @click="clickIconAddNode(false)"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="新建目录" placement="bottom">
          <i class="el-icon-wallet" @click="clickIconAddNode(true)"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="预览" placement="bottom">
          <i class="el-icon-view" @click="readDoc"></i>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="设置" placement="bottom" v-if="has_manage">
          <i class="el-icon-s-tools" @click="settingDoc"></i>
        </el-tooltip>
      </div>
      <el-tree class="w7-tree" :data="chapters" :props="defaultProps" empty-text=""
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
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>
            <i class="w7-icon-fileFolder" v-if="data.is_dir == 1"></i>
            <i class="el-icon-document" v-if="data.is_dir == 0"></i>
            <span style="margin-left:10px;">{{ node.label }}</span>
          </span>
          <span class="point3" @mousemove='updateXY' @click.stop="rightClick(false, data, node)"><span>...</span></span>
        </span>
      </el-tree>
      <div id="menu-bar" class="menu-bar" v-show="menuBarVisible">
        <ul class="menu">
          <template v-if="rightSelectNodeObj.is_dir == 1">
            <li class="menu__item" @click="addChildNode(true)">创建目录</li>
            <li class="menu__item" @click="addChildNode(false)">创建文档</li>
            <li class="menu__item" @click="updateNode(true)">重命名</li>
            <!-- <li class="menu__item" @click="openMoveDialog(true)">移动</li> -->
            <li class="menu__item" @click="removeNode">删除</li>
          </template>
          <template v-if="rightSelectNodeObj.is_dir == 0">
            <li class="menu__item" @click="defaultFile">设为目录默认文档</li>
            <li class="menu__item" @click="updateNode(false)">重命名</li>
            <!-- <li class="menu__item" @click="openMoveDialog(false)">移动</li> -->
            <!-- <li class="menu__item" @click="">权限</li> -->
            <li class="menu__item" @click="removeNode">删除</li>
          </template>
        </ul>
      </div>
    </el-aside>
    <el-main>
      <editors :chapterId="selectNodeObj.id" :chapterName="selectNodeObj.name" :clickSum="clickSum" v-if="selectNodeObj && selectNodeObj.id && selectNodeObj.is_dir == 0"></editors>
    </el-main>
    <!-- 新增节点弹出框 -->
    <el-dialog class="w7-dialog" :title="dialogTitle" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="addNodeObj" label-width="100px">
        <el-form-item :label="dialogFormLabel">
          <el-input v-model="addNodeObj.name" @keyup.enter.native="confirmBtn"></el-input>
        </el-form-item>
        <input type="text" style="display:none;">
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmBtn">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 弹出框移动tree节点 -->
    <el-dialog class="w7-dialog" :title="dialogMoveTitle" :visible.sync="dialogMoveVisible" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="项目">
          <el-select v-model="moveDoc" placeholder="请选择" @change="changeDoc">
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
            :props="{ value: 'id', label: 'name'}"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="moveNode">确 定</el-button>
        <el-button @click="dialogMoveVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import editors from './editors.vue'
export default {
  name: 'chapter',
  components: {
    editors
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
      clickSum: 2,//章节点击次数，每次新建重置为0
      defaultExpanded: [],//默认展开节点的数组
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
      docChapters: []
    }
  },
  watch: {
    filterText(val) {
      this.$refs.chaptersTree.filter(val);
    }
  },
  created() {
    this.getChapters()
    this.getDocList()
  },
  methods: {
    getChapters() {
      this.$post('/admin/chapter/detail', {
        document_id: this.$route.params.id
      })
        .then(res => {
          this.docName = res.document.name
          this.has_manage = res.acl.has_manage
          this.chapters = res.catalog
        })
    },
    readDoc() {
      let routeUrl = this.$router.resolve({
        path: "/chapter/" + this.$route.params.id
      })
      window.open(routeUrl.href, '_blank')
    },
    settingDoc() {
      this.$router.push('/admin/document/' + this.$route.params.id)
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    defaultSelectNode() {
      //tree默认选中第一个
      if(!this.chapters.length) { return }
      this.$refs.chaptersTree.setCurrentKey( this.chapters[0].id )
      this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
    },
    handleNodeClick(obj) {
      if(this.menuBarVisible) {this.menuBarVisible = false}
      this.selectNodeObj = obj
      this.clickSum++
    },
    updateXY(event) {
      this.clientX = event.clientX
      this.clientY = event.clientY
    },
    rightClick(MouseEvent, object, Node) {
      // console.log('右键被点击---event:', MouseEvent)
      // console.log('右键被点击---传递给 data 属性的数组中该节点所对应的对象:', object)
      // console.log('右键被点击---节点对应的 Node:', Node)
      // console.log('右键被点击---节点组件本身:', element)
      this.menuBarVisible = false // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
      this.menuBarVisible = true  // 显示模态窗口，跳出自定义菜单栏
      const menuBar = document.querySelector('#menu-bar')
      if(!MouseEvent) {
        menuBar.style.left = this.clientX + 'px'
        menuBar.style.top = this.clientY + 'px'
      }
      menuBar.style.left = MouseEvent.clientX + 'px'
      menuBar.style.top = MouseEvent.clientY + 'px'
      this.rightSelectNodeObj = object
      this.rightSelectNode = Node
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
            console.log(this.chapters)
            this.$message('新增成功！')
            this.dialogVisible = false
            this.clickSum = 0
            this.$nextTick(() => {
              //选中新建章节
              this.$refs.chaptersTree.setCurrentKey( newChild.id )
              this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
              //展开
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
      this.$confirm('确定删除该章节吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //这里鼠标左右键，都是只有右键this.rightSelectNode有值，左键没值
        this.$post('/admin/chapter/delete', {
          document_id: this.$route.params.id,
          chapter_id: this.rightSelectNodeObj.id
        })
          .then(() => {
            let node = this.rightSelectNode
            let data = this.rightSelectNodeObj
            let parent = node.parent;
            let children = parent.data.children || parent.data
            let index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
            this.$message('删除成功！')
          })
      }).catch(() => {
      })
    },
    handleDrop(draggingNode, dropNode, dropType) {
      console.log(dropNode, dropType)
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
    getDocList() {
      this.$post('/admin/document/all',{
        page: 1
      })
        .then(res => {
          this.docList = res.data
        })
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
      if(!this.moveDoc || !this.moveClass) {
        this.$message('项目和分类不能为空！')
        return
      }
      let parent_id = ''
      if (this.moveClass.length == 1) {
        parent_id = this.moveClass[0]
      } else {
        parent_id = this.moveClass[1]
      }
      this.$post('/admin/chapter/update', {
        document_id: this.moveDoc,
        chapter_id: this.rightSelectNodeObj.id,
        parent_id: parent_id
      })
        .then(() => {
          this.$message('修改成功！')
        })
    },
    defaultFile() {
      this.$post('/admin/document/default-show', {
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

<style lang="scss" scoped>
.w7-container {
  .w7-aside-chapter {
    border-left: solid 1px #eeeeee;
    border-right: solid 1px #eeeeee;
    .w7-aside-chapter-head {
      margin-top: 30px;
      p {
        font-size: 16px;
        color: #4d4d4d;
        text-align: center;
      }
    }
    .el-input {
      width: 180px;
      margin: 25px 10px;
      /deep/ input {
        height: 34px;
        border: solid 1px #eeeeee;
        border-radius: 0;
      }
      /deep/ i {
        line-height: 34px;
      }
    }
  }
}
.w7-tree {
  .el-tree-node__content {
    &:hover .custom-tree-node .point3 {
      display: inline-block;
    }
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
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
  .el-icon-document {
    color: #3296fa;
  }
}
.icon-box{
  width:100%;
  display: flex;
  justify-content: space-around;
  margin-bottom: 35px;
  font-size:14px;
  color:#b6b5b5;
  .el-tooltip {
    cursor: pointer;
  }
}
.w7-icon-fileFolder:after {
  content:url('~@/assets/img/fileFolder-small.png')
}
</style>