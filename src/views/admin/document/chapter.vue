<template>
  <el-container class="w7-container">
    <el-aside class="w7-aside-chapter" width="202px">
      <div class="w7-aside-chapter-head">
        <!-- <div class="icon"></div> -->
        <p>{{ docName }}</p>
      </div>
      <el-input placeholder="请输入关键字搜索" v-model="filterText">
        <i slot="suffix" class="el-input__icon el-icon-search" @click="searchDoc" style="color:#3296fa;"></i>
      </el-input>
      <div class="icon-box">
        <i class="el-icon-document icon1">
          <div class="pos-box">
            <div class="arr-box">
              <div class="arrow"></div>
              <span>新建文档</span>
            </div>
          </div>
        </i>
        <i class="el-icon-wallet icon2">
          <div class="pos-box">
            <div class="arr-box">
              <div class="arrow"></div>
              <span>文件夹</span>
            </div>
          </div>
        </i>
        <i class="el-icon-view icon3">
          <div class="pos-box">
            <div class="arr-box">
              <div class="arrow"></div>
              <span>预览</span>
            </div>
          </div>
        </i>
        <i class="el-icon-s-tools icon4">
          <div class="pos-box">
            <div class="arr-box">
              <div class="arrow"></div>
              <span>设置</span>
            </div>
          </div>
        </i>
      </div>
      <el-tree class="w7-tree" :data="chapters" :props="defaultProps" empty-text=""
        ref="chaptersTree"
        node-key="id"
        :expand-on-click-node="true"
        :highlight-current="true"
        :default-expanded-keys="defaultExpanded"
        :filter-node-method="filterNode"
        @node-contextmenu="rightClick"
        @node-click="handleNodeClick">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>
            <i class="w7-icon-fileFolder"></i>
            <span style="margin-left:10px;">{{ node.label }}</span>
          </span>
          <span class="point3" @mousemove='updateXY' @click.stop="rightClick(false, data, node)"><span>...</span></span>
        </span>
      </el-tree>
      <div id="menu-bar" class="menu-bar" v-show="menuBarVisible">
        <ul class="menu">
          <li class="menu__item" @click="addChildNode">创建子章节</li>
          <li class="menu__item" @click="updateNode">编辑</li>
          <li class="menu__item" @click="removeNode">删除</li>
        </ul>
      </div>
      <div class="add-node">
        <el-button type="primary" @click="addNode">创建章节</el-button>
      </div>
    </el-aside>
    <el-main>
      <editors :chapterId="selectNodeObj.id" :chapterName="selectNodeObj.name" :clickSum="clickSum" v-if="selectNodeObj && selectNodeObj.id"></editors>
    </el-main>
    <!-- 基本信息弹出框 -->
    <el-dialog class="w7-dialog" :title="dialogTitle" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form :model="addNodeObj" label-width="100px">
        <el-form-item label="章节顺序">
          <el-input v-model="addNodeObj.sort"></el-input>
        </el-form-item>
        <el-form-item label="章节名称">
          <el-input v-model="addNodeObj.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmBtn">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
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
      filterText: '',
      sort: 0,
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
      addNodeObj: {
        sort: '',
        name: ''
      },//新增节点
      dialogTitle: '',
      dialogVisible: false,
      chapterInfo: {}//选中的文档，基本信息
    }
  },
  watch: {
    filterText(val) {
      this.$refs.chaptersTree.filter(val);
    }
  },
  created() {
    this.init()
    this.getChapters()
  },
  methods: {
    init() {
      this.$post('/admin/document/detail', {
        document_id: this.$route.params.id
      })
        .then(res => {
          this.docName = res.name
        })
    },
    getChapters() {
      this.$post('/admin/chapter/index', {
        document_id: this.$route.params.id
      })
        .then(res => {
          if(!res) { return }
          this.chapters = res
          if(!this.sort) {
            let maxsort = this.sort
            //找到sort的最大值
            let maxValue = function(arr, value) {
              for(let i in arr) {
                maxsort = arr[i][value] > maxsort ? arr[i][value] : maxsort
                if(arr[i].children.length > 0) {
                  maxValue(arr[i].children, value)
                }
              }
            }
            maxValue(this.chapters, 'sort')
            this.sort = maxsort + 1
            this.$nextTick(() => {
              this.defaultSelectNode()
            })
          }
        })
    },
    searchDoc() {
      this.$post('/admin/chapter/search ', {
        document_id: this.$route.params.id,
        keywords: this.keyword
      })
        .then(res => {
           this.chapters = res
        })
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
    handleNodeClick(object) {
      if(this.menuBarVisible) {this.menuBarVisible = false}
      this.selectNodeObj = object
      this.clickSum++
      // console.log(this.selectNodeObj)
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
    addChildNode() {
      if(this.rightSelectNode.level == 3) {
        this.$message('当前属于第三级，不可以添加子章节！')
        return
      }
      this.dialogTitle = '新建子章节'
      this.addNodeObj.sort = this.sort
      this.addNodeObj.name = ''
      this.dialogVisible = true
    },
    confirmBtn() {
      if(!this.addNodeObj.name) {
        this.$message('章节名称不能为空！')
        return
      }
      if(this.dialogTitle == '新建子章节' || this.dialogTitle == '创建章节' ) {
        this.$post('/admin/chapter/create', {
          document_id: this.$route.params.id,
          parent_id: this.dialogTitle == '新建子章节' ? this.rightSelectNode.data.id : 0,
          name: this.addNodeObj.name,
          sort: this.addNodeObj.sort
        })
          .then(res => {
            let newChild = res
            if(this.dialogTitle == '新建子章节') {
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
            this.sort++
            this.clickSum = 0
            this.$nextTick(() => {
              //选中新建章节
              this.$refs.chaptersTree.setCurrentKey( newChild.id )
              this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
              //展开
              this.defaultExpanded.push(newChild.id)
            })
          })
      }if(this.dialogTitle == '编辑章节') {
        this.$post('/admin/chapter/update', {
          id: this.selectNodeObj.id,
          name: this.selectNodeObj.name,
          sort: this.selectNodeObj.sort
        })
          .then(() => {
            this.$message('修改成功！')
            this.dialogVisible = false
          })
      }
    },
    updateNode() {
      this.dialogTitle = '编辑章节'
      this.addNodeObj = this.rightSelectNodeObj
      this.dialogVisible = true
    },
    removeNode() {
      this.$confirm('确定删除该章节吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/chapter/destroy', {
          id: this.selectNodeObj.id
        })
          .then(() => {
            let node = this.rightSelectNode
            let data = this.rightSelectNodeObj
            let parent = node.parent;
            let children = parent.data.children || parent.data
            let index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
            console.log(this.chapters)
            this.$message('删除成功！')
          })
      }).catch(() => {
      })
    },
    addNode() {
      this.dialogTitle = '创建章节'
      this.rightSelectNode = {}
      this.rightSelectNodeObj = {}
      this.addNodeObj.sort = this.sort
      this.addNodeObj.name = ''
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.w7-container {
  width:100%;
  margin: -30px;
  padding:30px 40px 0 30px;
  box-sizing:border-box;
  .w7-aside-chapter {
    border-left: solid 1px #eeeeee;
    border-right: solid 1px #eeeeee;
    .w7-aside-chapter-head {
      margin-top: 30px;
      .icon {
        width: 33px;
        height: 29px;
        background: url('~@/assets/img/fileFolder-normal.png') no-repeat;
        margin: 0 auto 10px;
      }
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
}
.add-node {
  margin: 10px auto;
  text-align: center;
  button {
    width: 120px;
    height: 34px;
    border-radius: 2px;
    padding: 9px 20px;
  }
}
.icon-box{
  width:100%;
  display: flex;
  justify-content: space-around;
  margin-bottom: 35px;
  font-size:14px;
  color:#b6b5b5;
}
.icon-box i{
  position: relative;
}
.icon-box i:hover .pos-box{
  display:block;
}
.icon-box .icon1 .pos-box{
  position: absolute;
  top:20px;
  left:-20px;
  display:none;
  text-align: center;
  width:70px;
  height:20px;
  line-height:16px;
  background: #000;
  color:#fff;
  font-size:14px;
}
.icon-box .icon1 .pos-box .arr-box{
  position: relative;
  width:100%;
  height:100%;
  box-sizing:border-box;
  background: #000;
  border:2px solid #000;
}
.icon-box .icon1 .arrow{
  width: 0px;   
  height: 0px;   
  position: absolute;   
  border:5px solid transparent;
  border-bottom-color:#000;
  top:-10px;
  left:30%;
}
.icon-box .icon2 .pos-box{
  position: absolute;
  top:20px;
  left:-20px;
  display:none;
  text-align: center;
  width:50px;
  height:20px;
  line-height:16px;
  background: #000;
  color:#fff;
  font-size:14px;
}
.icon-box .icon2 .pos-box .arr-box{
  position: relative;
  width:100%;
  height:100%;
  box-sizing:border-box;
  background: #000;
  border:2px solid #000;
}
.icon-box .icon2 .arrow{
  width: 0px;   
  height: 0px;   
  position: absolute;   
  border:5px solid transparent;
  border-bottom-color:#000;
  top:-10px;
  left:45%;
}
.icon-box .icon3 .pos-box{
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
.icon-box .icon3 .pos-box .arr-box{
  position: relative;
  width:100%;
  height:100%;
  box-sizing:border-box;
  background: #000;
  border:2px solid #000;
}
.icon-box .icon3 .arrow{
  width: 0px;   
  height: 0px;   
  position: absolute;   
  border:5px solid transparent;
  border-bottom-color:#000;
  top:-10px;
  left:30%;
}
.icon-box .icon4 .pos-box{
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
.icon-box .icon4 .pos-box .arr-box{
  position: relative;
  width:100%;
  height:100%;
  box-sizing:border-box;
  background: #000;
  border:2px solid #000;
}
.icon-box .icon4 .arrow{
  width: 0px;   
  height: 0px;   
  position: absolute;   
  border:5px solid transparent;
  border-bottom-color:#000;
  top:-10px;
  left:30%;
}
.w7-icon-fileFolder:after {
  content:url('~@/assets/img/fileFolder-small.png')
}
</style>