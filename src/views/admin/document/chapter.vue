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
                     :default-checked-keys="defaultCheckedKeys"
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
                <span class="shortcut" @click.stop="shortcut(data, node)">
                <i class="wi wi-document" v-if="data.is_dir == 1"></i>
              </span>
                <span class="point3" @mousemove='updateXY' @click.stop="leftClick(data, node)"><span>...</span></span>
                <div class="doc-default" v-if="data.is_default"></div>
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
                  <!--<li class="menu__item" @click="defaultFile">设为目录默认文档</li>-->
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
      <el-main v-cloak>
        <div v-if="isDocEmpty">尚未创建文档</div>
        <template v-else>
          <div class="chapter-title">{{docTitle}}</div>

          <div class="api" v-if="layout == 1">
            <el-form ref="form" :model="form" label-width="100">
              <!--基本信息-->
              <div class="basic-information api-con">
                <div class="top">
                  <div class="line-wrap">
                    <span class="line"></span>
                    <span class="text">基本信息</span>
                  </div>
                </div>
                <div class="c-con">
                  <el-row :gutter="10">
                    <el-col :md="4">
                      <el-form-item label="">
                        <el-select v-model="form.method" placeholder="">
                          <el-option v-for="item in methodArr" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :md="10">
                      <el-form-item label="">
                        <el-input v-model="form.url" placeholder="请求地址，如：/api/test"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="10">
                    <el-col :md="14">
                      <el-form-item label="">
                        <el-input v-model="form.description" placeholder="请在此输入接口描述内容"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>

              <!--请求数据-->
              <div class="api-con">
                <div class="top">
                  <div class="line-wrap">
                    <span class="line"></span>
                    <span class="text">请求数据</span>
                  </div>
                  <el-button type="primary" plain icon="el-icon-plus" @click="addFirstNode">添加</el-button>
                  <el-button type="default" plain icon="el-icon-upload" v-if="false">导入</el-button>
                </div>
                <div class="c-con">
                  <el-tabs v-model="form.tab_location" @tab-click="tabRequest">
                    <!--请求头Header-->
                    <el-tab-pane label="请求头Header" name="1" key="header">
                      <!--el-tree 添加 show-checkbox 则显示复选框-->
                      <div class="tree-wrap">
                        <el-tree :data="apiHeaderTreeData" node-key="id" default-expand-all :expand-on-click-node="false">
                          <div class="custom-tree-node" slot-scope="{ node, data }">
                            <el-row :gutter="10">
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-input @input="paramNameChange(node, data)" v-model="data.name" placeholder="参数名"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-select v-model="data.type" placeholder="">
                                    <el-option v-for="val in paramsArr" :key="val.value" :label="val.type" :value="val.value"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-select v-model="data.enabled" placeholder="是否必填">
                                    <el-option label="true" :value="1"></el-option>
                                    <el-option label="false" :value="0"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-input v-model="data.default_value" placeholder="默认值"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :md="6">
                                <el-form-item label="">
                                  <el-input v-model="data.description" placeholder="描述"></el-input>
                                </el-form-item>
                              </el-col>
                              <span class="add"  @click="() => addApiTreeNode(data)"><span class="iconfont wq-add"></span></span>
                              <span class="delete" @click="() => removeApiTreeNode(node, data)"><span class="iconfont wq-delete"></span></span>
                              <span class="delete" @click="() => insertAfter(node, data)"><!--<span class="iconfont wq-delete"></span>--></span>
                            </el-row>
                          </div>
                        </el-tree>
                      </div>
                    </el-tab-pane>

                    <!--params-->
                    <el-tab-pane label="Query Params" name="2" key="params">
                      <div class="tree-wrap">
                        <el-tree :data="apiParamsTreeData" node-key="id" default-expand-all :expand-on-click-node="false">
                          <div class="custom-tree-node" slot-scope="{ node, data }">
                            <el-row :gutter="5">
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-input @input="paramNameChange(node, data)" v-model="data.name" placeholder="参数名"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-select v-model="data.type" placeholder="">
                                    <el-option v-for="val in paramsArr" :key="val.value" :label="val.type" :value="val.value"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-select v-model="data.enabled" placeholder="是否必填">
                                    <el-option label="true" :value="1"></el-option>
                                    <el-option label="false" :value="0"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :md="4">
                                <el-form-item label="">
                                  <el-input v-model="data.default_value" placeholder="默认值"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :md="6">
                                <el-form-item label="">
                                  <el-input v-model="data.description" placeholder="描述"></el-input>
                                </el-form-item>
                              </el-col>
                              <span class="add"  @click="() => addApiTreeNode(data)"><span class="iconfont wq-add"></span></span>
                              <span class="delete" @click="() => removeApiTreeNode(node, data)"><span class="iconfont wq-delete"></span></span>
                              <span class="delete" @click="() => insertAfter(node, data)"><!--<span class="iconfont wq-delete"></span>--></span>
                            </el-row>
                          </div>
                        </el-tree>
                      </div>
                    </el-tab-pane>

                    <!--body-->
                    <el-tab-pane label="请求参数（Body）" name="3" key="body">
                      <div class="type-body">
                        <el-form-item label="请求类型：">
                          <el-radio-group v-model="form.body_param_location">
                            <el-radio label="3">form-data</el-radio>
                            <el-radio label="4">x-www-form-urlencoded</el-radio>
                            <el-radio label="5">raw</el-radio>
                            <el-radio label="6">binary</el-radio>
                          </el-radio-group>
                        </el-form-item>
                        <div class="tree-wrap">
                          <el-tree :data="apiBodyTreeData" node-key="id" default-expand-all :expand-on-click-node="false">
                            <div class="custom-tree-node" slot-scope="{ node, data }">
                              <el-row :gutter="5">
                                <el-col :md="4">
                                  <el-form-item label="">
                                    <el-input @input="paramNameChange(node, data)" v-model="data.name" placeholder="参数名"></el-input>
                                  </el-form-item>
                                </el-col>
                                <el-col :md="4">
                                  <el-form-item label="">
                                    <el-select v-model="data.type" placeholder="">
                                      <el-option v-for="val in paramsArr" :key="val.value" :label="val.type" :value="val.value"></el-option>
                                    </el-select>
                                  </el-form-item>
                                </el-col>
                                <el-col :md="4">
                                  <el-form-item label="">
                                    <el-select v-model="data.enabled" placeholder="是否必填">
                                      <el-option label="true" :value="1"></el-option>
                                      <el-option label="false" :value="0"></el-option>
                                    </el-select>
                                  </el-form-item>
                                </el-col>
                                <el-col :md="4">
                                  <el-form-item label="">
                                    <el-input v-model="data.default_value" placeholder="默认值"></el-input>
                                  </el-form-item>
                                </el-col>
                                <el-col :md="6">
                                  <el-form-item label="">
                                    <el-input v-model="data.description" placeholder="描述"></el-input>
                                  </el-form-item>
                                </el-col>
                                <span class="add"  @click="() => addApiTreeNode(data)"><span class="iconfont wq-add"></span></span>
                                <span class="delete" @click="() => removeApiTreeNode(node, data)"><span class="iconfont wq-delete"></span></span>
                                <span class="delete" @click="() => insertAfter(node, data)"><!--<span class="iconfont wq-delete"></span>--></span>
                              </el-row>
                            </div>
                          </el-tree>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </div>

              <!--响应数据-->
              <div class="api-con">
                <div class="top">
                  <div class="line-wrap">
                    <span class="line"></span>
                    <span class="text">响应数据</span>
                  </div>
                  <el-button type="primary" plain icon="el-icon-plus" @click="addResFirstNode">添加</el-button>
                  <el-button type="default" plain icon="el-icon-upload" v-if="false">导入</el-button>
                </div>
                <div class="c-con">
                  <el-tree :data="apiResTreeData" node-key="id" default-expand-all :expand-on-click-node="false">
                    <div class="custom-tree-node" slot-scope="{ node, data }">
                      <el-row :gutter="5">
                        <el-col :md="4">
                          <el-form-item label="">
                            <el-input @input="resParamNameChange(node, data)" v-model="data.name" placeholder="参数名"></el-input>
                          </el-form-item>
                        </el-col>
                        <el-col :md="4">
                          <el-form-item label="">
                            <el-select v-model="data.type" placeholder="">
                              <el-option v-for="val in paramsArr" :key="val.value" :label="val.type" :value="val.value"></el-option>
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :md="4">
                          <el-form-item label="">
                            <el-select v-model="data.enabled" placeholder="是否必填">
                              <el-option label="true" :value="1"></el-option>
                              <el-option label="false" :value="0"></el-option>
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :md="4">
                          <el-form-item label="">
                            <el-input v-model="data.default_value" placeholder="默认值"></el-input>
                          </el-form-item>
                        </el-col>
                        <el-col :md="6">
                          <el-form-item label="">
                            <el-input v-model="data.description" placeholder="描述"></el-input>
                          </el-form-item>
                        </el-col>
                        <span class="add"  @click="() => addResApiTreeNode(data)"><span class="iconfont wq-add"></span></span>
                        <span class="delete" @click="() => removeResApiTreeNode(node, data)"><span class="iconfont wq-delete"></span></span>
                        <span class="delete" @click="() => insertAfter(node, data)"><!--<span class="iconfont wq-delete"></span>--></span>
                      </el-row>
                    </div>
                  </el-tree>
                </div>
              </div>
            </el-form>
          </div>

          <editors v-model="markDownContent" :markDownContent="markDownContent" :chapter_id = "chapter_id" :chapterIsDir="selectNodeObj.is_dir"></editors>
          <!--<editors v-model="markDownContent" :markDownContent="markDownContent"  :chapterIsDir="selectNodeObj.is_dir"></editors>-->

          <el-button type="primary" @click="saveApi">保存</el-button>

          <!--<editors :chapterId="selectNodeObj.id" :chapterIsDir="selectNodeObj.is_dir"></editors>-->

        </template>
      </el-main>

      <!-- 新增节点弹出框 -->
      <el-dialog class="we7-dialog only-input-dialog" :title="dialogTitle" :visible.sync="dialogVisible"
                 :close-on-click-modal="false" center>
        <el-form :model="addNodeObj" label-width="105px" label-position="left" @submit.native.prevent>
          <el-form-item :label="dialogFormLabel">
            <el-input v-model="addNodeObj.name" @keyup.enter.native="confirmBtn"></el-input>
          </el-form-item>
          <el-form-item label="文档类型" v-if="addNodeObj.is_dir != 1">
            <el-radio-group v-model="addNodeObj.layout">
              <el-radio :label="0">普通文档</el-radio>
              <el-radio :label="1">API文档</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="confirmBtn">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 弹出框移动tree节点 -->
      <el-dialog class="we7-dialog" :title="dialogMoveTitle" :visible.sync="dialogMoveVisible"
                 :close-on-click-modal="false" center>
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
      <el-dialog class="we7-dialog only-input-dialog" title="复制章节" :visible.sync="dialogVisibleCopy"
                 :close-on-click-modal="false" center>
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
      <el-dialog class="we7-dialog dialog-setting" title="项目设置" width="1000px" :visible.sync="showSetting"
                 :close-on-click-modal="false" :before-close="handleClose">
        <setting :id="$route.params.id"></setting>
      </el-dialog>

      <!--确认保存-->
      <el-dialog title="" :visible.sync="saveDialogVisible" :show-close="false" width="30%">
        <span>您已修改了一些数据，请确认是否要放弃保存并离开？</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelLeave">取 消</el-button>
          <el-button type="primary" @click="determineLeave">确 定</el-button>
        </span>
      </el-dialog>

    </el-container>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { getMethodType, saveChapter, createChapter, viewChapter, getAllChapter } from '@/api/api'
  import editors from './editors.vue'
  import setting from './setting.vue'
  let id = 1000;
  export default {
    name: 'chapter',
    components: {
      editors,
      setting
    },
    data() {
      return {
        docName: '',
        docTitle: '',
        defaultCheckedKeys: [],
        layout: '',
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
          is_dir: 1,
          layout: 0,
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
        copyNodeName: '',
        methodArr: [],
        paramsArr: [
          {type: 'String', value: 1},
          {type: 'Number', value: 2},
          {type: 'Boolean', value: 3},
          {type: 'Object', value: 4},
          {type: 'Array', value: 5},
          {type: 'Function', value: 6},
          {type: 'RegExp', value: 7},
          {type: 'Null', value: 8},
        ],
        form: {
          method: 1,
          url: '',
          description: '',
          body_param_location: '3',
          tab_location: '1'
        },
        formCopy: {
          method: 1,
          url: '',
          description: '',
          body_param_location: '3',
          tab_location: '1'
        },
        // activeName: '1',
        baseRequestData: {
          already: 0,
          isChecked: false,
          name: '',
          type: 1,
          enabled: 0,
          default_value: '',
          description: '',
          rule: '',
          children: [],
        },
        markDownContent: '',
        apiHeaderTreeData: [],
        apiParamsTreeData: [],
        apiBodyTreeData: [],
        apiResTreeData: [],
        apiResTreeDataCopy: [{already: 0, isChecked: false,  name: '', type: 1, enabled: 0, default_value: '', description: '', rule: '', children: []}],
        chapter_id: '',
        isDocEmpty: true,
        previewId: '',
      }
    },
    computed: {
      ...mapGetters({UserInfo: 'UserInfo'}),
      isSave () {
        return this.$store.state.isSave;
      },
      saveDialogVisible () {
        return this.$store.state.saveDialogVisible;
      }
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
      this.getMethodType();
      // this.initCreateChapter();
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
      // 创建默认文档
      initCreateChapter () {
        createChapter({
          document_id: this.$route.params.id,
          parent_id: 0,
          is_dir: 1,
          layout: 0,
          name: '默认目录'
        }).then(res => {
          this.chapter_id = res.data.id;
          let newChild = res.data;
          if (!this.addFirst) {
            let data = this.rightSelectNodeObj
            if (!data.children) {
              this.$set(data, 'children', []);
            }
            data.children.push(newChild)
          } else {
            this.chapters.push(newChild)
          }
          this.$nextTick(() => {
            //选中新建章节
            this.$refs.chaptersTree.setCurrentKey(newChild.id)
            this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
            //展开
            let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
            let record = allRecords['document_' + this.$route.params.id]
            this.defaultExpanded = record.defaultExpanded;
            this.defaultExpanded.push(newChild.id);
          })
        }).catch(() => {
        })
      },
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
      setOperRecord(obj) {
        const isAdd = this.$route.query.type;
        const id = this.$route.params.id;

        if (isAdd == 'add') {
          const records = {};
          records['document_' + id] = {
            defaultExpanded: [],
            defaultSelect: ""
          }
          localStorage.setItem('we7_doc_user_' + this.UserInfo.id, JSON.stringify(records))
        } else {
          //当前用户下的所有项目tree记录
          let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
          let record = allRecords['document_' + this.$route.params.id];

          if (obj.is_dir) {//如果是目录
            record.defaultSelect = obj.id;
            // let index = record.defaultExpanded.findIndex(item => item == obj.id) // 临时注释
            // if (index > -1) {
            //   record.defaultExpanded.splice(index, 1)
            // } else {
            //   record.defaultExpanded.push(obj.id)
            // }
          } else {
            record.defaultSelect = obj.id
          }
          localStorage.setItem('we7_doc_user_' + this.UserInfo.id, JSON.stringify(allRecords))
        }

      },
      getChapters() {
        // const apiData1 = JSON.parse(JSON.stringify(this.baseRequestData));
        // const apiData2 = JSON.parse(JSON.stringify(this.baseRequestData));
        // const apiData3 = JSON.parse(JSON.stringify(this.baseRequestData));
        // const apiData4 = JSON.parse(JSON.stringify(this.baseRequestData));
        // this.apiHeaderTreeData.push(apiData1);
        // this.apiParamsTreeData.push(apiData2);
        // this.apiBodyTreeData.push(apiData3);
        // this.apiResTreeData.push(apiData4);

        getAllChapter({
          document_id: this.$route.params.id
        }).then(res => {
          if (res.code == 200) {
            if (res.data.catalog == 0) {
              this.isDocEmpty = true;
              // this.initCreateChapter();
            } else {
              this.isDocEmpty = false;
              this.docName = res.data.document.name;
              this.has_manage = res.data.acl.has_manage;
              // this.chapters = res.data.catalog;
              this.chapters = this.initTreeData(res.data.catalog); // 临时注释
              //如果有记录的默认文档节点，则选中
              if (this.defaultSelect) {
                console.log(this.defaultSelect);
                this.$nextTick(() => {
                  this.$refs.chaptersTree.setCurrentKey(this.defaultSelect)
                  this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
                  //展开
                  let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
                  let record = allRecords['document_' + this.$route.params.id]
                  this.defaultExpanded = record.defaultExpanded;
                  this.defaultExpanded.push(this.$refs.chaptersTree.getCurrentNode().id)
                })
              } else {
                this.$nextTick(() => {
                  this.$refs.chaptersTree.setCurrentKey(res.data.catalog[0].id);
                  this.handleNodeClick(res.data.catalog[0]);
                })
              }
            }
          }
        })
      },
      //重新遍历树数据，给每个文档节点添加is_default属性
      initTreeData(treeData) {
        function loopData(data, defaultId) {
          for (let i = 0; i < data.length; i++) {
            if (data[i].is_dir) {
              loopData(data[i].children, data[i].default_show_chapter_id)
            } else {
              data[i]['is_default'] = data[i].default_show_chapter_id == data[i].id || data[i].id == defaultId
            }
          }
        }
        loopData(treeData)
        console.log('treeData');
        console.log(treeData);
        return treeData
      },
      readDoc() {
        // Vue路由新窗口打开
        let routeUrl = this.$router.resolve({
          path: "/chapter/" + this.$route.params.id,
          query: {id: this.previewId}
        });
        window.open(routeUrl.href, '_blank')
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      handleNodeClick(data) {
        console.log(12);
        console.log(data);

        this.previewId = data.id;
        this.docTitle = data.name;
        this.chapter_id = data.id;

        this.viewChapter();

        if (this.menuBarVisible) {
          this.menuBarVisible = false
        }
        this.selectNodeObj = data;
        this.setOperRecord(data); // 临时注释
      },
      updateXY(event) {
        this.clientX = event.clientX
        this.clientY = event.clientY
      },
      shortcut(object, Node) {
        this.rightSelectNodeObj = object
        this.rightSelectNode = Node
        this.addChildNode(false)
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
          if (!MouseEvent) {//鼠标左键
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
        this.addNodeObj.layout = bool ? 0 : 1
        this.dialogVisible = true
        this.rightSelectNode = {}
        this.rightSelectNodeObj = {}
      },
      updateNode(bool) {
        this.dialogTitle = '重命名';
        localStorage.rename = this.rightSelectNodeObj.name;
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
        // console.log(this.rightSelectNode)
        // 五级文档
        if (this.rightSelectNode.level == 5 && bool) {
          this.$message('第五级只能为文档！')
          return
        }
        this.dialogTitle = bool ? '新建目录' : '新建文档'
        this.dialogFormLabel = bool ? '目录名称' : '文档名称'
        this.addNodeObj.name = ''
        this.addNodeObj.is_dir = bool ? 1 : 0
        this.dialogVisible = true
      },
      confirmBtnCopy() {
        if (!this.copyNodeName) {
          this.$message('章节名称不能为空！')
          return
        }
        this.$post('/admin/chapter/copy', {
          document_id: this.$route.params.id,
          chapter_id: this.rightSelectNodeObj.id,
          parent_id: this.rightSelectNodeObj.parent_id,
          name: this.copyNodeName
        }).then(res => {
          let newChild = res.data;
          if (this.rightSelectNodeObj.parent_id != 0) {
            let node = this.rightSelectNode
            let parent = node.parent
            parent.data.children.push(newChild)
          } else {
            this.chapters.push(newChild)
          }
          this.$message('复制成功！')
          this.dialogVisibleCopy = false
          this.$nextTick(() => {
            //选中新建章节
            this.$refs.chaptersTree.setCurrentKey(newChild.id)
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
        if (!this.addNodeObj.name) {
          this.$message('章节名称不能为空！')
        }
        if (this.dialogTitle == '新建目录' || this.dialogTitle == '新建文档') {
          createChapter({
            document_id: this.$route.params.id,
            parent_id: this.addFirst ? 0 : this.rightSelectNode.data.id,
            is_dir: this.addNodeObj.is_dir,
            layout: this.addNodeObj.layout,
            name: this.addNodeObj.name
          }).then(res => {
            this.chapter_id = res.data.id;
            let newChild = res.data;
            if (!this.addFirst) {
              let data = this.rightSelectNodeObj
              if (!data.children) {
                this.$set(data, 'children', []);
              }
              data.children.push(newChild)
            } else {
              this.chapters.push(newChild)
            }
            this.$message('新增成功！');

            this.emptyForm();
            this.isDocEmpty = false;
            this.dialogVisible = false;

            this.$nextTick(() => {
              //选中新建章节
              this.$refs.chaptersTree.setCurrentKey(newChild.id)
              this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode())
              //展开
              let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
              let record = allRecords['document_' + this.$route.params.id]
              this.defaultExpanded = record.defaultExpanded
              this.defaultExpanded.push(newChild.id);
            })
          }).catch(() => {
              this.dialogVisible = false
          })
        }
        if (this.dialogTitle == '重命名') {
          this.$post('/admin/chapter/update', {
            document_id: this.$route.params.id,
            chapter_id: this.rightSelectNodeObj.id,
            name: this.addNodeObj.name
          }).then(() => {
              this.$message('修改成功！')
              this.rightSelectNodeObj.name = this.addNodeObj.name
              this.dialogVisible = false;
              const docTitle = this.docTitle;
              const rename = localStorage.rename;
              if (docTitle == rename) {
                this.docTitle = this.addNodeObj.name;
              }
              // location.reload();
          }).catch(() => {
              this.dialogVisible = false
          })
        }
      },
      removeNode() {
        var arrId = []
        arrId.push(this.rightSelectNodeObj.id)
        //删除的为目录,切存在子节点
        if (this.rightSelectNodeObj.is_dir && this.rightSelectNodeObj.children && this.rightSelectNodeObj.children.length) {
          let getArrId = function (array) {
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
          }).then(() => {
            let node = this.rightSelectNode
            let data = this.rightSelectNodeObj
            let parent = node.parent;
            let children = parent.data.children || parent.data
            let index = children.findIndex(d => d.id === data.id)
            children.splice(index, 1)
            this.$message('删除成功！')
            this.emptyForm();
            this.getChapters();
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
        this.dialogMoveTitle = bool ? '移动目录' : '移动文档'
        this.moveDoc = ''
        this.moveClass = ''
        this.dialogMoveVisible = true
      },
      remoteMethod(query) {
        if (query !== '') {
          this.$post('/admin/document/all', {
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
            this.docChapters = this.deleteA(this.deleteA(res.catalog))
          })
      },
      deleteA(arr) {
        if (arr.length) {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (!arr[i]['is_dir']) {
              arr.splice(i, 1)
            } else if (arr[i].children && !arr[i].children.length) {
              delete arr[i].children
            } else if (arr[i].children) {
              this.deleteA(arr[i]['children'])
            }
          }
        }
        return arr
      },
      moveNode() {
        if (!this.moveDoc) {
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
            this.getChapters()
            this.$message('设置默认文档成功！')
          })
      },
      handleClose() {
        this.getChapters()
        this.showSetting = false
      },

      // 获取请求类型
      getMethodType () {
        getMethodType({}).then(res => {
          if (res.data && res.data.methodLabel) {
            this.methodArr = res.data.methodLabel.option;
          }
        })
      },

      // 请求类型切换
      tabRequest(tab) {
        console.log(tab);
      },

      // 请求数据 输入框输入 下方新增同级node
      paramNameChange (node, data) {
        if (data.name.length) {
          data.already = Number(data.already) + 1;
          // console.log(data);
          // console.log(data.already);
          // 防止不断输入添加多个同级node
          if (data.already == 1) {
            // this.addFirstNode();
            this.insertAfter(node, data);
          }
        }
      },

      // 响应数据 输入框输入 下方新增同级node
      resParamNameChange (node, data) {
        if (data.name.length) {
          data.already = Number(data.already) + 1;
          // console.log(data);
          // console.log(data.already);
          // 防止不断输入添加多个同级node
          if (data.already == 1) {
            this.insertAfter(node, data);
          }
        }
      },

      // request请求 添加同级node
      addFirstNode () {
        const baseRequestData = JSON.parse(JSON.stringify(this.baseRequestData));
        const This = this;

        function apiDataFilter(data) {
          const last = data.length -1;
          if (data[last].name == '' && data[last].description == '') {
            This.$message.warning('已存在空白行，请勿再次添加！')
          } else {
            data.push(baseRequestData);
          }
        }

        /*
        *或者按照这种push
        * baseRequestData = {isChecked: false, name: '',type: 1, enabled: '', default_value: '', description: '', rule: '',children: []}
        * */

        const tab_location = this.form.tab_location;

        if (tab_location == 1) {
          // this.apiHeaderTreeData.push(baseRequestData);
          apiDataFilter(this.apiHeaderTreeData);
        } else if (tab_location == 2) {
          // this.apiParamsTreeData.push(baseRequestData);
          apiDataFilter(this.apiParamsTreeData);
        } else if (tab_location == 3) {
          // this.apiBodyTreeData.push(baseRequestData);
          apiDataFilter(this.apiBodyTreeData);
        }
      },

      // res响应数据 添加同级node
      addResFirstNode () {
        const This = this;
        const baseRequestData = JSON.parse(JSON.stringify(this.baseRequestData));
        // this.apiResTreeData.push(baseRequestData);

        function apiDataFilter(data) {
          const last = data.length -1;
          if (data[last].name == '' && data[last].description == '') {
            This.$message.warning('已存在空白行，请勿再次添加！')
          } else {
            data.push(baseRequestData);
          }
        }

        apiDataFilter(this.apiResTreeData);
      },

      // 请求数据 添加下一级node
      addApiTreeNode (data) {
        // console.log('data');
        // console.log(data);
        // const newChild = {};
        const newChild = {id: id++, already: 0, isChecked: false, name: '', type: 1, enabled: 0, default_value: '', description: '', rule: '', children: [],};
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.children.push(newChild);
      },

      // 响应数据 添加下一级node
      addResApiTreeNode (data) {
        // console.log('data');
        // console.log(data);
        // const newChild = {};
        const newChild = {id: id++, already: 0, isChecked: false, name: '', type: 1, enabled: 0, default_value: '', description: '', rule: '', children: [],};
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.children.push(newChild);
      },

      // 删除 请求数据node
      removeApiTreeNode (node, data) {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      },

      // 删除 响应数据数据node
      removeResApiTreeNode (node, data) {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      },

      insertAfter (node, data) {
        // console.log(node);
        // console.log(data);

        const parent = node.parent;
        const newChild = {id: id++, already: 0, isChecked: false, name: '', type: 1, enabled: 0, default_value: '', description: '', rule: '', children: []};

        if (Array.isArray(parent.data)) {
          parent.data.push(newChild);
        } else {
          parent.data.children.push(newChild);
        }
      },

      // 保存文档
      saveApi () {
        // console.log('body_param_location');
        // console.log(this.form.body_param_location);
        const tab_location = this.form.tab_location;
        const body_param_location = this.form.body_param_location;
        let chapter_id = '';
        let record = {};
        let body = {};
        body = {};
        // if (tab_location == '3') {
        //   if (body_param_location == 3) {
        //     body['3'] = this.apiBodyTreeData;
        //   } else if (body_param_location == 4) {
        //     body['4'] = this.apiBodyTreeData;
        //   } else if (body_param_location == 5) {
        //     body['5'] = this.apiBodyTreeData;
        //   } else if (body_param_location == 6) {
        //     body['6'] = this.apiBodyTreeData;
        //   }
        // }

        body['1'] = this.apiHeaderTreeData;
        body['2'] = this.apiParamsTreeData;
        body['request_body'] = this.apiBodyTreeData;
        body['reponse_body'] = this.apiResTreeData;
        record.api = this.form;
        record.body = body;
        record.extend = this.markDownContent;
        chapter_id = this.chapter_id;

        if (this.layout == 1) {
          // alert(1);
          saveChapter({
            document_id: this.$route.params.id,
            chapter_id,
            layout: 1,
            record
          }).then(res => {
            if (res.code == 200)
              this.$message.success('保存成功！')
            // console.log('form');
            // console.log(this.form);
          })
        } else {
          saveChapter({
            document_id: this.$route.params.id,
            chapter_id,
            layout: 0,
            content: this.markDownContent
          }).then(res => {
            if (res.code == 200)
              this.$message.success('保存成功！')
            // console.log('form');
            // console.log(this.form);
          })
        }
      },

      determineLeave () {
        this.$store.state.saveDialogVisible = false;
        this.$store.state.isSave = true;
        console.log('isSave');
        console.log(this.$store.state.isSave);
        console.log(this.$store.state.saveDialogVisible);
      },

      cancelLeave () {
        this.$store.state.saveDialogVisible = false;
      },

      // 清空form
      emptyForm () {
        this.docTitle = ''
        this.form = this.formCopy;
        this.apiHeaderTreeData = this.apiTreeDataCopy;
        this.apiParamsTreeData = this.apiTreeDataCopy;
        this.apiBodyTreeData = this.apiTreeDataCopy;
        this.apiResTreeData = this.apiResTreeDataCopy;
        this.markDownContent = '';
      },

      // 查看文档
      viewChapter () {
        const chapter_id = this.chapter_id;
        const document_id = this.$route.params.id;
        viewChapter({
          chapter_id,
          document_id
        }).then(res => {
          if (res.code == 200) {
            this.layout = res.data.layout;
            if (res.data.layout == 1) {
              if (res.data.content != null && res.data.content.length) {
                // console.log(res);
                let record = res.data.record;
                if (record.api) {
                  this.form = record.api;
                  this.form.tab_location = this.form.tab_location.toString();
                  this.form.body_param_location = this.form.body_param_location.toString();
                }
                if (record.body) {
                  this.apiHeaderTreeData = record.body['1'];
                  this.apiParamsTreeData = record.body['2'];
                  this.apiBodyTreeData = record.body.request_body;
                  this.apiResTreeData = record.body.reponse_body;
                }
                this.markDownContent = record.extend;
              } else {
                this.form = this.formCopy;
                const apiData1 = JSON.parse(JSON.stringify(this.baseRequestData));
                const apiData2 = JSON.parse(JSON.stringify(this.baseRequestData));
                const apiData3 = JSON.parse(JSON.stringify(this.baseRequestData));
                const apiData4 = JSON.parse(JSON.stringify(this.baseRequestData));
                this.apiHeaderTreeData = [apiData1];
                this.apiParamsTreeData = [apiData2];
                this.apiBodyTreeData = [apiData3];
                this.apiResTreeData = [apiData4];
                this.markDownContent = '';
              }
            } else {
              if (res.data.content == null) {
                this.markDownContent = '';
              } else {
                this.markDownContent = res.data.content;
              }
              // if (res.data.content.length) {
              //   this.markDownContent = res.data.content;
              // } else {
              //   this.markDownContent = '';
              // }
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
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

    .icon-box {
      padding: 0 30px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      color: #b6b5b5;

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
      box-shadow: 2px 0px 10px 4px rgba(219, 219, 219, 0.53);
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
        margin: 0;
        padding: 10px 0;
      }

      li {
        padding: 0 14px;
        width: 150px;
        line-height: 34px;
        box-sizing: border-box;
        list-style: none;

        &:hover {
          color: #3296fa;
          cursor: pointer;
        }
      }
    }
  }

  .w7-tree {
    background: transparent;

    .el-tree-node__content {
      position: relative;

      &:hover .custom-tree-node .point3, &:hover .custom-tree-node .shortcut {
        display: inline-block;
      }

      .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;

        .node-info {
          flex: 1;
          display: flex;

          .text-over {
            flex: 1;
            width: 0;
            margin-left: 10px;
            padding-right: 10px;
          }
        }

        .shortcut {
          display: none;
          margin-right: 10px;

          .wi {
            color: #b6b5b5;

            &:hover {
              color: #3296fa;
            }
          }
        }

        .point3 {
          display: none;
          color: #b6b5b5;

          &:hover {
            color: #3296fa;
          }

          span {
            display: block;
            font-size: 30px;
            margin-top: -23px;
            margin-right: 10px;
          }
        }

        .doc-default {
          position: absolute;
          top: 0;
          left: 0;
          width: 26px;
          height: 26px;
          background-image: url('~@/assets/img/doc-default.png');
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

  // wyg 2020/04/09
  .w7-document-chapter {
    .chapter-title {
      margin-bottom: 30px;
    }

    .api {
      .api-con {
        margin-bottom: 50px;

        .top {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .line-wrap {
            display: flex;
            align-items: center;

            .line {
              width: 3px;
              height: 18px;
              background: rgba(153, 153, 153, 1);
              margin-right: 10px;
            }

            .text {
              color: #666;
              font-size: 18px;
              font-weight: 600;
            }
          }

          .el-button {
            margin-left: 10px;
          }
        }

        .c-con {
          border: 1px solid rgba(238, 238, 238, 1);
          border-radius: 2px;
          padding: 15px 20px;

          /deep/ .el-tabs__header {
            margin-bottom: 25px;
          }

          /deep/ .type-body {
            .el-form-item {
              margin-bottom: 20px;

              .el-form-item__label {
                height: auto;
                line-height: normal;
              }

              .el-form-item__content {
                height: auto;
                line-height: normal;
              }
            }
          }

          .el-row {
            .el-form-item {
              margin-bottom: 10px;
            }

            &:last-of-type {
              .el-col {
                .el-form-item {
                  margin-bottom: 0;
                }
              }
            }

            .el-checkbox {
              margin: 10px 10px 0 15px;
            }
          }

          .add {
            margin-left: 10px;
          }
          .delete {
            margin-left: 10px;
          }

          .delete, .add {
            height: 40px;
            display: flex;
            align-items: center;
            float: left;
            font-size: 24px;
            cursor: pointer;
          }
        }

        .el-select {
          width: 100%;
        }

        /deep/ .el-tree-node__content {
          height: 40px;
          margin-bottom: 10px;

          &:hover {
            background-color: transparent;
          }

          .el-input__inner {
          }
        }

        /deep/ .el-input__inner {
          border: none;
          border-bottom: 1px solid #dcdfe6;
          border-radius: 0;
        }
      }

    }
  }
</style>
<style>
  [v-cloak] {
    display: none !important;
  }
</style>