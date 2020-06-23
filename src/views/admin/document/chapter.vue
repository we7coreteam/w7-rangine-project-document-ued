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
          <i class="wq wq-mulu" @click="clickIconAddNode(false)"></i>
        </el-tooltip>
        <el-tooltip effect="dark" content="新建目录" placement="bottom">
          <i class="wq wq-wendang" @click="clickIconAddNode(true)"></i>
        </el-tooltip>
        <el-tooltip effect="dark" content="预览" placement="bottom">
          <i class="wq wq-chakan" @click="readDoc"></i>
        </el-tooltip>
        <el-tooltip effect="dark" content="设置" placement="bottom" v-if="has_manage">
          <i class="wq wq-shezhi1" @click="showSetting = true"></i>
        </el-tooltip>
      </div>
      <div class="tree-warpper">
        <el-scrollbar style="height: 100%">
          <el-tree class="w7-tree" :data="chapters" :props="defaultProps" empty-text="点击上方按钮创建"
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
                <i class="wq wq-wendang" v-if="data.is_dir == 1"></i>
                <i class="wq wq-mulu" v-if="data.is_dir == 0"></i>
                <div class="text-over">
                  <span :title="node.label">{{ node.label }}</span>
                </div>
              </span>
              <span class="shortcut" @click.stop="shortcut(data, node)">
                <i class="wq wq-mulu" v-if="data.is_dir == 1"></i>
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
                        <el-option v-for="item in methodArr" :key="item.value" :label="item.label"
                                   :value="item.value"></el-option>
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
                <el-row :gutter="10">
                  <el-col :md="14">
                    <el-form-item label="Mock Api地址" class="mock-api">
                      <el-tooltip class="item" effect="dark" popper-class="mock-api-tip" content="点击复制链接" placement="top">
                        <el-input v-clipboard:copy="mockApiUrl" v-clipboard:success="onCopy" v-model="mockApiUrl" readonly placeholder=""></el-input>
                      </el-tooltip>
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
                <!--<el-button type="primary" plain icon="el-icon-plus" @click="addFirstNode">添加</el-button>-->
                <el-button type="default" icon="el-icon-upload" v-if="false">导入</el-button>
                <el-button type="primary" size="mini" icon="el-icon-view" @click="viewRequestMock">预览</el-button>
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
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-input @input="paramNameChange(node, data)" v-model="data.name"
                                          placeholder="参数名"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-select v-model="data.type" placeholder="" @change="typeChange(data)">
                                  <el-option v-for="val in paramsArr" :key="val.value" :label="val.type"
                                             :value="val.value"></el-option>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-select v-model="data.enabled" placeholder="是否必填">
                                  <el-option label="true" :value="2"></el-option>
                                  <el-option label="false" :value="1"></el-option>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="" class="rule-question">
                                <el-input v-model="data.rule" placeholder="生成规则"></el-input>
                                <i v-if="apiHeaderTreeData && apiHeaderTreeData[0].id == data.id" @click="goMock" class="wq wq-wenhao rule-icon"></i>
                              </el-form-item>
                            </el-col>
                            <el-col :span="4">
                              <el-form-item label="">
                                <el-input :disabled="data.type == 4" v-model="data.default_value" placeholder="默认值"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-input v-model="data.description" placeholder="描述"></el-input>
                              </el-form-item>
                            </el-col>
                            <span class="add" @click="() => addApiTreeNode(data)"><span class="iconfont wq-add"></span></span>
                            <span class="delete" @click="() => removeApiTreeNode(node, data)"><span
                                class="iconfont wq-delete"></span></span>
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
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-input @input="paramNameChange(node, data)" v-model="data.name"
                                          placeholder="参数名"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-select v-model="data.type" placeholder="" @change="typeChange(data)">
                                  <el-option v-for="val in paramsArr" :key="val.value" :label="val.type"
                                             :value="val.value"></el-option>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-select v-model="data.enabled" placeholder="是否必填">
                                  <el-option label="true" :value="2"></el-option>
                                  <el-option label="false" :value="1"></el-option>
                                </el-select>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="" class="rule-question">
                                <el-input v-model="data.rule" placeholder="生成规则"></el-input>
                                <i v-if="apiParamsTreeData && apiParamsTreeData[0].id == data.id" @click="goMock" class="wq wq-wenhao rule-icon"></i>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-input :disabled="data.type == 4" v-model="data.default_value" placeholder="默认值"></el-input>
                              </el-form-item>
                            </el-col>
                            <el-col :span="3">
                              <el-form-item label="">
                                <el-input v-model="data.description" placeholder="描述"></el-input>
                              </el-form-item>
                            </el-col>
                            <span class="add" @click="() => addApiTreeNode(data)"><span class="iconfont wq-add"></span></span>
                            <span class="delete" @click="() => removeApiTreeNode(node, data)"><span
                                class="iconfont wq-delete"></span></span>
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
                          <el-radio :label="3">form-data</el-radio>
                          <el-radio :label="4">x-www-form-urlencoded</el-radio>
                          <el-radio :label="5">raw</el-radio>
                          <el-radio :label="6">binary</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <div class="tree-wrap">
                        <el-tree :data="apiBodyTreeData" node-key="id" default-expand-all :expand-on-click-node="false">
                          <div class="custom-tree-node" slot-scope="{ node, data }">
                            <el-row :gutter="5">
                              <el-col :span="3">
                                <el-form-item label="">
                                  <el-input @input="paramNameChange(node, data)" v-model="data.name"
                                            placeholder="参数名"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="">
                                  <el-select v-model="data.type" placeholder="" @change="typeChange(data)">
                                    <el-option v-for="val in paramsArr" :key="val.value" :label="val.type"
                                               :value="val.value"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="">
                                  <el-select v-model="data.enabled" placeholder="是否必填">
                                    <el-option label="true" :value="2"></el-option>
                                    <el-option label="false" :value="1"></el-option>
                                  </el-select>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="" class="rule-question">
                                  <el-input v-model="data.rule" placeholder="生成规则"></el-input>
                                  <i v-if="apiBodyTreeData && apiBodyTreeData[0].id == data.id" @click="goMock" class="wq wq-wenhao rule-icon"></i>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="">
                                  <el-input :disabled="data.type == 4" v-model="data.default_value" placeholder="默认值"></el-input>
                                </el-form-item>
                              </el-col>
                              <el-col :span="3">
                                <el-form-item label="">
                                  <el-input v-model="data.description" placeholder="描述"></el-input>
                                </el-form-item>
                              </el-col>
                              <span class="add" @click="() => addApiTreeNode(data)"><span
                                  class="iconfont wq-add"></span></span>
                              <span class="delete" @click="() => removeApiTreeNode(node, data)"><span
                                  class="iconfont wq-delete"></span></span>
                              <span class="delete" @click="() => insertAfter(node, data)"><!--<span class="iconfont wq-delete"></span>--></span>
                            </el-row>
                          </div>
                        </el-tree>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
              <div class="c-bottom" v-if="isViewRequest">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="mock">
                      <div class="m-tit">请求模板</div>
                      <div class="m-con" :style="{height: requestMockHeight + 'px'}">
                        <pre ref="requestMockLeftHeight">{{ requestMockTemplate }}</pre>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="mock">
                      <div class="m-tit">请求数据 <i class="el-icon-refresh" @click="refreshRequestMock"></i></div>
                      <div class="m-con" :style="{height: requestMockHeight + 'px'}">
                        <pre ref="requestMockRightHeight">{{ requestMockJson }}</pre>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!--响应数据-->
            <div class="api-con">
              <div class="top">
                <div class="line-wrap">
                  <span class="line"></span>
                  <span class="text">响应数据</span>
                  <el-button type="default" size="mini" icon="el-icon-plus" @click="addResNode">添加</el-button>
                </div>
                <el-button type="default" plain icon="el-icon-upload" v-if="false">导入</el-button>
                <el-button type="primary" size="mini" icon="el-icon-view" @click="viewResponseMock">预览</el-button>
              </div>
              <div class="c-con" v-for="(item, index) in apiResTreeData" :key="index">
                <el-row :gutter="5">
                  <el-col :span="15">
                    <div style="padding-left: 24px;">
                      <el-form-item label="">
                        <el-input style="width: calc(100% + 5px)" v-model="item.description" placeholder="响应数据描述"></el-input>
                      </el-form-item>
                    </div>
                  </el-col>
                  <el-col :span="9">
                    <div style="text-align: right;">
                      <el-button type="danger" size="mini" @click="deleteApiItem(index)">删除</el-button>
                    </div>
                  </el-col>
                </el-row>
                <el-tree :data="item.data" node-key="id" default-expand-all :expand-on-click-node="false">
                  <div class="custom-tree-node" slot-scope="{ node, data }">
                    <el-row :gutter="5">
                      <el-col :span="3">
                        <el-form-item label="">
                          <el-input @input="resParamNameChange(node, data)" v-model="data.name"
                                    placeholder="参数名"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="3">
                        <el-form-item label="">
                          <el-select v-model="data.type" placeholder="" @change="typeChange(data)">
                            <el-option v-for="val in paramsArr" :key="val.value" :label="val.type"
                                       :value="val.value"></el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <!--<el-col :span="3">-->
                      <!--<el-form-item label="">-->
                      <!--<el-select v-model="data.enabled" placeholder="是否必填">-->
                      <!--<el-option label="true" :value="2"></el-option>-->
                      <!--<el-option label="false" :value="1"></el-option>-->
                      <!--</el-select>-->
                      <!--</el-form-item>-->
                      <!--</el-col>-->
                      <el-col :span="3">
                        <el-form-item label="" class="rule-question">
                          <el-input v-model="data.rule" placeholder="生成规则"></el-input>
                          <i v-if="item.data[0].id == data.id" @click="goMock" class="wq wq-wenhao rule-icon"></i>
                        </el-form-item>
                      </el-col>
                      <el-col :span="3">
                        <el-form-item label="">
                          <el-input :disabled="data.type == 4" v-model="data.default_value" placeholder="默认值"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="3">
                        <el-form-item label="">
                          <el-input v-model="data.description" placeholder="描述"></el-input>
                        </el-form-item>
                      </el-col>
                      <span class="add" @click="() => addResApiTreeNode(data)"><span
                          class="iconfont wq-add"></span></span>
                      <span class="delete" @click="() => removeResApiTreeNode(node, data)"><span
                          class="iconfont wq-delete"></span></span>
                      <span class="delete" @click="() => insertAfter(node, data)"><!--<span class="iconfont wq-delete"></span>--></span>
                    </el-row>
                  </div>
                </el-tree>
              </div>
              <div class="c-bottom" v-if="isViewResponse">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="mock">
                      <div class="m-tit">响应模板</div>
                      <div class="m-con" :style="{height: responseMockHeight + 'px'}">
                        <div ref="responseMockLeftHeight">
                          <div :style="{'margin-top': index > 0 ? '30px' : '' }" v-for="(item, index) in responseMockTemplate" :key="index">
                            <div style="margin-bottom: 10px; font-size: 12px;">响应{{ apiResTreeData[index].description }}：</div>
                            <pre>{{ item }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="mock">
                      <div class="m-tit">响应数据 <i class="el-icon-refresh" @click="refreshResponseMock"></i></div>
                      <div class="m-con" :style="{height: responseMockHeight + 'px'}">
                        <div ref="responseMockRightHeight">
                          <div :style="{'margin-top': index > 0 ? '30px' : '' }" v-for="(item, index) in responseMockJson" :key="index">
                            <div style="margin-bottom: 10px; font-size: 12px;">响应{{ apiResTreeData[index].description }}:</div>
                            <pre>{{ item }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-form>
        </div>

        <editors v-model="markDownContent" :markDownContent="markDownContent" :chapter_id="chapter_id"
                 :chapterIsDir="selectNodeObj.is_dir"></editors>
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
        <el-button type="primary" :disabled="confirmDisabled" @click="confirmBtn">确 定</el-button>
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
        <el-button type="primary" :disabled="confirmCopyDisabled" @click="confirmBtnCopy">确 定</el-button>
        <el-button @click="dialogVisibleCopy = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文档设置 -->
    <el-dialog class="we7-dialog dialog-setting" title="项目设置" width="1000px" :visible.sync="showSetting"
               :close-on-click-modal="false" :before-close="handleClose">
      <setting :id="$route.params.id"></setting>
    </el-dialog>
  </el-container>
</template>

<script>
  // process.versions.node = '12.18.0';
  // const { VM } = require('vm2')
  import {mapGetters} from 'vuex'
  import {createChapter, getAllChapter, getMethodType, saveChapter, viewChapter} from '@/api/api'
  import editors from './editors.vue'
  import setting from './setting.vue'

  let id = 1000;

// num为1，对函数类型、正则执行函数，得到函数返回值
function treeToTemplate(tree, num = 0) {
  function parse(item, result) {
    let rule = item.rule ? ('|' + item.rule) : '';
    let value = item.default_value;
    if (item.default_value && item.default_value.indexOf('[') === 0 && item.default_value.substring(item.default_value.length - 1) === ']') {
      try {
        let reg = /\s*/g;
        let reg2 = /\"/g;
        value = value.substring(1, value.length - 1).replace(reg, '').replace(reg2, '').split(',');
        // console.error(123)
        // console.log(value)
        result[item.name + rule] = value
        // result[item.name + rule] = vm.run(`(${item.value})`)
      } catch (e) {
        result[item.name + rule] = value
      }
    } else {
      if (item.name.length) {
        switch (item.type) {
          case 1:
            // String
            result[item.name + rule] = value
            break
          case 2:
            // Number
            if (value === '') value = 1
            let parsed = parseFloat(value)
            if (!isNaN(parsed)) value = parsed
            result[item.name + rule] = value
            break
          case 3:
            // Boolean
            if (value === 'true') value = true
            if (value === 'false') value = false
            if (value === '0') value = false
            value = !!value
            result[item.name + rule] = value
            break
          case 4:
            // Object
            if (value) {
              // result[item.name + rule] = vm.run(`(${item.value})`)
              result[item.name + rule] = {};
              item.children.forEach((child) => {
                parse(child, result[item.name + rule])
              })
            } else {
              result[item.name + rule] = {}
              item.children.forEach((child) => {
                parse(child, result[item.name + rule])
              })
            }
            break
          case 5:
            // Array
            if (value) {
              try {
                // result[item.name + rule] = vm.run(`(${item.value})`)
                result[item.name + rule] = value
              } catch (e) {
                result[item.name + rule] = item.value
              }
            } else {
              result[item.name + rule] = item.children.length ? [{}] : []
              item.children.forEach((child) => {
                parse(child, result[item.name + rule][0])
              })
            }
            break
          case 6:
            // Function
            if (num == 1) {
              try {
                // 1
                let fun = eval(item.default_value);
                result[item.name + rule] = fun();

                // 2
                // let funcTest = new Function('return ' + item.default_value);
                // result[item.name + rule] = funcTest()()
              } catch (e) {
                // console.error(e);
                console.warn(`TreeToTemplate ${e.message}: ${item.type} { ${item.name}${rule}: ${item.default_value} }`) // 怎么消除异常值？
                result[item.name + rule] = item.default_value
              }
            } else {
              result[item.name + rule] = value
            }
            break
          case 7:
            // RegExp
            if (num == 1) {
              try {
                result[item.name + rule] = new RegExp(item.default_value);
              } catch (e) {
                console.warn(`TreeToTemplate ${e.message}: ${item.type} { ${item.name}${rule}: ${item.default_value} }`) // 怎么消除异常值？
                result[item.name + rule] = item.default_value
              }
            } else {
              let reg = /\\/g;
              result[item.name + rule] = item.default_value.replace(reg,"");
            }
            break
          case 8:
            // Null
            // tslint:disable-next-line: no-null-keyword
            result[item.name + rule] = null
            break
        }
      }
    }
  }
  let result = {}
  if (tree.length) {
    tree.forEach(child => {
      parse(child, result)
    })
  }
  return result
}

// 移除mock生成数据的'/'
function romoveSlash(obj) {
  let newObj = {}
  let reg = /\//g;
  for (let item in obj) {
    if (typeof obj[item] == 'string' && reg.test(obj[item])) {
      console.log(obj[item]);
      newObj[item] = obj[item].replace(reg,"");
    } else {
      newObj[item] = obj[item]
    }
  }
  return newObj
}

export default {
  name: 'chapter',
  components: {
    editors,
    setting
  },
  data() {
    return {
      isHeaderLast: true,
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
        body_param_location: 3,
        tab_location: '1'
      },
      formCompared: {},
      formCopy: {
        method: 1,
        url: '',
        description: '',
        body_param_location: 3,
        tab_location: '1'
      },
      // activeName: '1',
      baseRequestData: {
        already: 0,
        isChecked: false,
        name: '',
        type: 1,
        enabled: 2,
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
      apiResTreeDataCopy: [{
        already: 0,
        isChecked: false,
        name: '',
        type: 1,
        enabled: 2,
        default_value: '',
        description: '',
        rule: '',
        children: []
      }],
      chapter_id: '',
      isDocEmpty: true,
      previewId: '',
      loading: '',
      confirmDisabled: false,
      confirmCopyDisabled: false,
      apiHeaderTreeDataCompared: '',
      apiParamsTreeDataCompared: '',
      apiBodyTreeDataCompared: '',
      apiResTreeDataCompared: '',
      markDownContentCompared: '',
      isSave: true,
      isFormChange: false,
      isApiHeaderTreeDataChange: false,
      isApiParamsTreeDataChange: false,
      isApiBodyTreeDataChange: false,
      isApiResTreeDataChange: false,
      isMarkDownContentChange: false,
      treeActive: false,
      isViewRequest: false,
      isViewResponse: false,
      requestMockTemplate: '',
      requestMockJson: '',
      responseMockTemplate: '',
      responseMockJson: '',
      requestMockHeight: '',
      responseMockHeight: '',
      mockApiUrl: ''
    }
  },
  computed: {
    ...mapGetters({UserInfo: 'UserInfo'}),
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
    },
    markDownContent: {
      deep: true,
      handler: function (newVal, oldVal) {
        const newString = JSON.stringify(newVal);
        const oldString = JSON.stringify(this.markDownContentCompared);
        if (newString != oldString) {
          console.log('markDownContent有数据差异');
          console.log(newString);
          console.log(oldString);
          this.isMarkDownContentChange = true;
        } else {
          this.isMarkDownContentChange = false;
        }
      }
    },
    form: {
      deep: true,
      immediate: false,
      handler: function(newVal, oldVal) {
        const newObj = JSON.parse(JSON.stringify(newVal));
        delete newObj.tab_location;
        let newString = '';
        if (newObj.url) {
          newString = JSON.stringify(newObj);
        } else {
          newString = '""';
        }

        const oldObj = JSON.parse(JSON.stringify(this.formCompared));
        delete oldObj.tab_location;
        const oldString = JSON.stringify(oldObj);
        // console.log(111);
        // console.log(newString);
        // console.log(oldString);
        if (newString != oldString) {
          console.log('form有数据差异');
          console.log(newString);
          console.log(oldString);
          this.isFormChange = true;
        } else {
          this.isFormChange = false;
        }
      }
    },
    apiHeaderTreeData: {
      deep: true,
      immediate: false,
      handler: function(newVal) {
        if (newVal) {
          let newObj = JSON.parse(JSON.stringify(newVal));
          let newString = '';
          if (newObj.length) {
            newObj.forEach(item => {
              delete item.already;
            })
            newObj = newObj.filter(item => {
              return item.name || item.description
            })
            if (newObj.length) {
              newString = JSON.stringify(newObj);
            } else {
              newString = '""';
            }
          }
          let oldObj = JSON.parse(JSON.stringify(this.apiHeaderTreeDataCompared));
          const oldString = JSON.stringify(oldObj);
          if (newString != oldString) {
            console.log('apiHeaderTreeData有数据差异');
            console.log(newString);
            console.log(oldString);
            this.isApiHeaderTreeDataChange = true;
          } else {
            this.isApiHeaderTreeDataChange = false;
          }
        }
      }
    },
    apiParamsTreeData: {
      deep: true,
      immediate: false,
      handler: function(newVal) {
        if (newVal) {
          let newObj = JSON.parse(JSON.stringify(newVal));
          let newString = '';
          if (newObj.length) {
            newObj.forEach(item => {
              delete item.already;
            })
            newObj = newObj.filter(item => {
              return item.name || item.description
            })
            if (newObj.length) {
              newString = JSON.stringify(newObj);
            } else {
              newString = '""';
            }
          }
          let oldObj = JSON.parse(JSON.stringify(this.apiParamsTreeDataCompared));
          const oldString = JSON.stringify(oldObj);

          if (newString != oldString) {
            console.log('apiParamsTreeData有数据差异');
            console.log(newString);
            console.log(oldString);
            this.isApiParamsTreeDataChange = true;
          } else {
            this.isApiParamsTreeDataChange = false;
          }          }
      }
    },
    apiBodyTreeData: {
      deep: true,
      immediate: false,
      handler: function(newVal) {
        if (newVal) {
          let newObj = JSON.parse(JSON.stringify(newVal));
          let newString = '';
          if (newObj.length) {
            newObj.forEach(item => {
              delete item.already;
            })
            newObj = newObj.filter(item => {
              return item.name || item.description
            })
            if (newObj.length) {
              newString = JSON.stringify(newObj);
            } else {
              newString = '""';
            }
          }
          let oldObj = JSON.parse(JSON.stringify(this.apiBodyTreeDataCompared));
          const oldString = JSON.stringify(oldObj);
          if (newString != oldString) {
            console.log('apiBodyTreeData有数据差异');
            console.log(newString);
            console.log(oldString);
            this.isApiBodyTreeDataChange = true;
          } else {
            this.isApiBodyTreeDataChange = false;
          }          }
      }
    },
    apiResTreeData: {
      deep: true,
      immediate: false,
      handler: function(newVal) {
        if (newVal) {
          let newObj = JSON.parse(JSON.stringify(newVal));
          console.log('newObj');
          console.log(newObj);
          if (newObj.length && newObj[0].already == 0) {
            // console.log(222);
            newObj = newObj.filter(item => {
              return item.name || item.description
            })
          }
          if (newObj.length) {
            newObj.forEach(item => {
              if (item.data && item.data.length) {
                item.data.forEach(item2 => {
                  delete item2.already;
                })
                item.data = item.data.filter(item2 => {
                  return item2.name || item2.description
                })
              }
            })
          } else {
            newObj = [{description: '', data: []}];
          }
          let newString = '';
          newString = JSON.stringify(newObj);
          // if (newObj.length == 1) {
          //   if (!newObj[0].data.length && !newObj[0].description) {
          //     newString = '""'
          //   } else {
          //     newString = JSON.stringify(newObj);
          //   }
          // } else {
          //   newString = JSON.stringify(newObj);
          // }
          let oldObj = JSON.parse(JSON.stringify(this.apiResTreeDataCompared));
          const oldString = JSON.stringify(oldObj);
          if (newString != oldString) {
            console.log('apiResTreeData有数据差异');
            console.log(newString);
            console.log(oldString);
            this.isApiResTreeDataChange = true;
          } else {
            this.isApiResTreeDataChange = false;
          }
        }
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
  mounted() {
    // (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
    const This = this;
    document.addEventListener('keydown', function (e) {
      let currKey = 0;
      e = e || event || window.event;
      currKey = e.keyCode || e.which || e.charCode;
      if ((e.ctrlKey || e.metaKey) && currKey == 83) {
        e.preventDefault();
        This.saveApi();
        // return false;
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    // console.log(to)
    // console.log(from)
    if (this.isFormChange || this.isApiHeaderTreeDataChange || this.isApiParamsTreeDataChange || this.isApiBodyTreeDataChange || this.isApiResTreeDataChange || this.isMarkDownContentChange) {
      this.$confirm('您有数据尚未保存，确认保存?', '提示', {
        showClose: false,
        closeOnClickModal: false,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.saveApi();
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
        next();
      });
    } else {
      next();
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

    // 创建默认文档
    initCreateChapter() {
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
      getAllChapter({
        document_id: this.$route.params.id
      }).then(res => {
        if (res.code == 200) {
          let history = '';
          if (localStorage['currentData_' + this.$route.params.id]) {
            history = JSON.parse(localStorage['currentData_' + this.$route.params.id]);
          }
          if (res.data.catalog == 0) {
            this.isDocEmpty = true;
            // this.initCreateChapter();
          } else if (res.data.catalog && !history ) {
            console.log(555);
            const findChapter = (arr) => {
              if (arr.length) {
                console.log('arr');
                console.log(arr);
                for (const item of arr) {
                  /*
                  * 如果是文档首先选中排在前的文档
                  * 如果是目录，则选中第一个目录内的第一个文档*/
                  try {
                    if (item.is_dir && item.children.length) {
                      findChapter(item.children);
                      return false;
                    } else {
                      console.log('findChapter');
                      console.log(item.id);
                      this.isDocEmpty = false;
                      // this.$nextTick(() => {
                        console.log('item');
                        console.log(item);
                        this.chapters = this.initTreeData(res.data.catalog);
                        this.handleNodeClick(item);
                        this.defaultExpanded = [item.parent_id];
                        // this.$refs.chaptersTree.setCurrentKey(item.id);
                        // this.defaultCheckedKeys = [item.id];
                        // $('.w7-tree .is-checked').attr('data-active', 'tree-active');
                        // const has2 = $('.w7-tree .is-current').prop('aria-expanded');
                        // if (has2) {
                        //   // $('.w7-tree .is-current').attr('data-active', 'tree-active');
                        //   $('.w7-tree .is-checked').attr('data-active', 'tree-active');
                        // }
                      // })
                      return false;
                    }
                  } catch (e) {
                    console.log(e);
                  }
                }
              }
            }
            findChapter(res.data.catalog);
          } else {
            console.log(1111);
            this.isDocEmpty = false;
            this.docName = res.data.document.name;
            this.has_manage = res.data.acl.has_manage;
            // this.chapters = res.data.catalog;
            this.chapters = this.initTreeData(res.data.catalog); // 临时注释
            //如果有记录的默认文档节点，则选中
            if (this.defaultSelect) {
              // console.log(1);
              // console.log(this.defaultSelect);
              this.$nextTick(() => {
                this.$refs.chaptersTree.setCurrentKey(this.defaultSelect);
                console.log(3);
                console.log(this.$refs.chaptersTree.getCurrentNode());
                if (this.$refs.chaptersTree.getCurrentNode() != null) {
                  // console.log(4);
                  this.handleNodeClick(this.$refs.chaptersTree.getCurrentNode());
                  //展开
                  let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
                  let record = allRecords['document_' + this.$route.params.id]
                  this.defaultExpanded = record.defaultExpanded;
                  this.defaultExpanded.push(this.$refs.chaptersTree.getCurrentNode().id)
                } else {
                  // console.log(5);
                  this.$refs.chaptersTree.setCurrentKey(res.data.catalog[0].id);
                  this.handleNodeClick(res.data.catalog[0]);
                  let allRecords = JSON.parse(localStorage.getItem('we7_doc_user_' + this.UserInfo.id))
                  let record = allRecords['document_' + this.$route.params.id]
                  this.defaultExpanded = record.defaultExpanded;
                  this.defaultExpanded.push(res.data.catalog[0])
                }
              })
            } else {
              // console.log(2);
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
      console.log(8);
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
      // console.log('treeData');
      // console.log(treeData);
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
    // 点击tree
    handleNodeClick(data) {
      console.log(12);
      console.log(data);
      /*
            const This = this;
            function findChapter(arr) {
              if (arr.length) {
                for (const item of arr) {
                  if (item.is_dir) {
                    findChapter(item.children)
                  } else {
                    This.defaultCheckedKeys = [item.id];
                    console.log('findChapter');
                    console.log(item.id);
                    return false;
                  }
                }
              }
            }
            findChapter(this.chapters);
      */
      // 目录不展示内容，只展开文件夹
      if (!data.is_dir) {
        console.log(7);
        this.$nextTick(() => {
          console.log(7);
          $('.w7-tree .el-tree-node').removeClass('is-checked').attr({'data-active': ''});
        })
        // console.error(1233)
        const document_id = this.$route.params.id;
        // console.error('currentData_' + document_id)
        localStorage['currentData_' + document_id] = JSON.stringify(data);
        if (this.isFormChange || this.isApiHeaderTreeDataChange || this.isApiParamsTreeDataChange || this.isApiBodyTreeDataChange || this.isApiResTreeDataChange || this.isMarkDownContentChange) {
          this.$confirm('您有数据尚未保存，确认保存?', '提示', {
            showClose: false,
            closeOnClickModal: false,
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.saveApi();
            // location.reload();
            this.isFormChange = false;
            this.isApiHeaderTreeDataChange = false;
            this.isApiParamsTreeDataChange = false;
            this.isApiBodyTreeDataChange = false;
            this.isApiResTreeDataChange = false;
            this.isMarkDownContentChange = false;
            this.getOperRecord();
            this.getChapters();
            // this.viewChapter();
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消'
            });
            // location.reload();
            this.isFormChange = false;
            this.isApiHeaderTreeDataChange = false;
            this.isApiParamsTreeDataChange = false;
            this.isApiBodyTreeDataChange = false;
            this.isApiResTreeDataChange = false;
            this.isMarkDownContentChange = false;
            // this.getOperRecord();
            // this.getChapters();
            this.previewId = data.id;
            this.docTitle = data.name;
            this.chapter_id = data.id;
            this.viewChapter();
            this.treeActive = true;
            if (this.menuBarVisible) {
              this.menuBarVisible = false
            }
            this.selectNodeObj = data;
            this.setOperRecord(data); // 临时注释
            console.log('无变化1');
            this.$nextTick(() => {
              $('.w7-tree .is-current').attr('data-active', 'tree-active');
            })
          });
          return false;
        } else {
          this.previewId = data.id;
          this.docTitle = data.name;
          this.chapter_id = data.id;
          this.viewChapter();
          this.treeActive = true;
          if (this.menuBarVisible) {
            this.menuBarVisible = false
          }
          this.selectNodeObj = data;
          this.setOperRecord(data); // 临时注释
          console.log('无变化2');
          this.$nextTick(() => {
            const children1 = $('.w7-tree .is-current').find('.el-tree-node__children').length;
            const children2 = $('.w7-tree .is-current').find('.el-tree-node__children .el-tree-node').length;
            if ((children1 == 0 || children1 > 0) && children2 == 0) {
              setTimeout(() => {
                const has = $('.w7-tree .is-current').prop('aria-expanded');
                const has2 = $('.w7-tree .is-checked').prop('aria-expanded');
                console.log('children1 ' + children1)
                console.log('children2 ' + children2)
                console.log('has ' + has)
                console.log('has2 ' + has2)
                if (!has) {
                  $('.w7-tree .is-current').attr('data-active', 'tree-active');
                }
                if (!has2) {
                  // 取is-checked最后一个
                  $('.w7-tree .is-checked:last').attr('data-active', 'tree-active');
                }
              }, 500)
            }
          })
        }
      } else {
        const document_id = this.$route.params.id;
        if (localStorage['currentData_' + document_id]) {
          let currentData = JSON.parse(localStorage['currentData_' + document_id]);
          console.log(currentData);
          this.defaultCheckedKeys = [currentData.id];
          console.log(this.defaultCheckedKeys);
        } else {
          console.log(this.chapters);
          const This = this;
          function findChapter(arr) {
            if (arr.length) {
              for (const item of arr) {
                if (item.is_dir) {
                  findChapter(item.children)
                } else {
                  This.defaultCheckedKeys = [item.id];
                  console.log('findChapter');
                  console.log(item.id);
                  return false;
                }
              }
            }
          }
          findChapter(this.chapters);
        }
        this.$nextTick(() => {
          const children1 = $('.w7-tree .is-current').find('.el-tree-node__children').length;
          const children2 = $('.w7-tree .is-current').find('.el-tree-node__children .el-tree-node').length;
          const has = $('.w7-tree .is-current').prop('aria-expanded');
          console.log('children1 ' + children1)
          console.log('children2 ' + children2)
          console.log('has ' + has)
          if (!localStorage['currentData_' + this.$route.params.id]) {
            const has2 = $('.w7-tree .is-current').prop('aria-expanded');
            if (has2) {
              // $('.w7-tree .is-current').attr('data-active', 'tree-active');
              $('.w7-tree .is-checked').attr('data-active', 'tree-active');
            }
          } else {
            if (has) {
              console.log(9);
              $('.w7-tree .is-current').attr('data-active', '');
            }
          }
          // $('.w7-tree .is-checked').attr('data-active', 'tree-active');
        })
      }
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
      this.confirmCopyDisabled = true;
      this.$post('/admin/chapter/copy', {
        document_id: this.$route.params.id,
        chapter_id: this.rightSelectNodeObj.id,
        parent_id: this.rightSelectNodeObj.parent_id,
        name: this.copyNodeName
      }).then(res => {
        let newChild = res.data;
        this.confirmCopyDisabled = false;
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
        return
      }
      this.confirmDisabled = true;
      if (this.dialogTitle == '新建目录' || this.dialogTitle == '新建文档') {
        this.formCompared = '';
        this.markDownContentCompared = '';
        this.apiResTreeDataCompared = [];
        this.apiResTreeDataCompared.push({description: '', data: []});
        createChapter({
          document_id: this.$route.params.id,
          parent_id: this.addFirst ? 0 : this.rightSelectNode.data.id,
          is_dir: this.addNodeObj.is_dir,
          layout: this.addNodeObj.layout,
          name: this.addNodeObj.name
        }).then(res => {
          this.chapter_id = res.data.id;
          this.confirmDisabled = false;
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
          this.confirmDisabled = false;
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
          this.confirmDisabled = false;
          const docTitle = this.docTitle;
          const rename = localStorage.rename;
          if (docTitle == rename) {
            this.docTitle = this.addNodeObj.name;
          }
          // location.reload();
        }).catch(() => {
          this.dialogVisible = false
          this.confirmDisabled = false;
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
          if (localStorage['currentData_' + this.$route.params.id]) {
            const id = localStorage['currentData_' + this.$route.params.id].id;
            arrId.forEach(item => {
              if (item.id == id) {
                localStorage['currentData_' + this.$route.params.id] = '';
              }
            })
           }

          let node = this.rightSelectNode
          let data = this.rightSelectNodeObj
          let parent = node.parent;
          let children = parent.data.children || parent.data
          let index = children.findIndex(d => d.id === data.id)
          children.splice(index, 1)
          this.$message('删除成功！')
          console.log('defaultSelect2');
          console.log(this.defaultSelect);
          console.log(arrId);
          // this.emptyForm();
          // this.getChapters();
          // this.selectNodeObj = {}
          // 使用刷新页面替代
          location.reload();
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
        }).then(res => {
          this.docList = res.data.data
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
    getMethodType() {
      getMethodType({}).then(res => {
        if (res.data && res.data.methodLabel) {
          this.methodArr = res.data.methodLabel.option;
        }
      })
    },
    // 请求类型切换
    tabRequest(tab) {
      localStorage.tab_location = tab.name;
      this.refreshRequestMock();
      console.log(tab);
    },
    // 请求数据 输入框输入 下方新增同级node
    paramNameChange(node, data) {
      // console.log(node);
      // console.log(data);
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
    resParamNameChange(node, data) {
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
    addFirstNode() {
      const baseRequestData = JSON.parse(JSON.stringify(this.baseRequestData));
      const This = this;

      function apiDataFilter(data) {
        const last = data.length - 1;
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
    addResFirstNode() {
      const This = this;
      const baseRequestData = JSON.parse(JSON.stringify(this.baseRequestData));

      // this.apiResTreeData.push(baseRequestData);

      function apiDataFilter(data) {
        const last = data.length - 1;
        if (data[last].name == '' && data[last].description == '') {
          This.$message.warning('已存在空白行，请勿再次添加！')
        } else {
          data.push(baseRequestData);
        }
      }

      apiDataFilter(this.apiResTreeData);
    },
    // 请求数据 添加下一级node
    addApiTreeNode(data) {
      // console.log('data');
      // console.log(data);
      // const newChild = {};
      const newChild = {
        id: id++,
        already: 0,
        isChecked: false,
        name: '',
        type: 1,
        enabled: 2,
        default_value: '',
        description: '',
        rule: '',
        children: [],
      };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      if (data.type == 4 || data.type == 5) {
        data.children.push(newChild);
      } else {
        this.$message.warning('参数类型为Object或者为Array才可添加！')
      }
    },
    // 响应数据 添加下一级node
    addResApiTreeNode(data) {
      console.log('data');
      console.log(data);
      // const newChild = {};
      const newChild = {
        id: id++,
        already: 0,
        isChecked: false,
        name: '',
        type: 1,
        enabled: 2,
        default_value: '',
        description: '',
        rule: '',
        children: [],
      };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      if (data.type == 4 || data.type == 5) {
        data.children.push(newChild);
      } else {
        this.$message.warning('参数类型为Object或者为Array才可添加！')
      }
    },
    // 删除 请求数据node
    removeApiTreeNode(node, data) {
      const length1 = this.apiHeaderTreeData.length;
      const length2 = this.apiParamsTreeData.length;
      const length3 = this.apiBodyTreeData.length;
      const tab_location = this.form.tab_location;

      if (tab_location == 1) {
        if (length1 == 1 && node.level == 1) {
          this.$message.error('已经是最后一个了，勿删！')
          return false;
        }
      }
      if (tab_location == 2) {
        if (length2 == 1 && node.level == 1) {
          this.$message.error('已经是最后一个了，勿删！')
          return false;
        }
      }
      if (tab_location == 3) {
        if (length3 == 1 && node.level == 1) {
          this.$message.error('已经是最后一个了，勿删！')
          return false;
        }
      }

      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex(d => d.id === data.id);
      children.splice(index, 1);
    },
    // 删除 响应数据数据node
    removeResApiTreeNode(node, data) {
      console.log(node);

      const length = this.apiResTreeData.length;
      console.log(length);

      if (length == 1 && node.level == 1) {
        this.$message.error('已经是最后一个了，勿删！')
        return false;
      }
      const parent = node.parent;
      const children = parent.data.children || parent.data;
      const index = children.findIndex(d => d.id === data.id);
      children.splice(index, 1);
    },
    insertAfter(node, data) {
      // console.log(node);
      // console.log(data);

      const parent = node.parent;
      const newChild = {
        id: id++,
        already: 0,
        isChecked: false,
        name: '',
        type: 1,
        enabled: 2,
        default_value: '',
        description: '',
        rule: '',
        children: []
      };

      if (Array.isArray(parent.data)) {
        parent.data.push(newChild);
      } else {
        parent.data.children.push(newChild);
      }
    },
    // 保存文档
    saveApi() {
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
      // body['reponse_body'] = this.apiResTreeData;
      record.api = this.form;
      record.body = body;
      record.reponse = this.apiResTreeData;
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
          if (res.code == 200) {
            this.$message.success('保存成功！');
            this.isFormChange = false;
            this.isApiHeaderTreeDataChange = false;
            this.isApiParamsTreeDataChange = false;
            this.isApiBodyTreeDataChange = false;
            this.isApiResTreeDataChange = false;
            this.isMarkDownContentChange = false;
            console.log(1);
            // this.getOperRecord();
            // this.getChapters();
            // this.viewChapter();
          }
        })
      } else {
        saveChapter({
          document_id: this.$route.params.id,
          chapter_id,
          layout: 0,
          content: this.markDownContent
        }).then(res => {
          if (res.code == 200) {
            this.$message.success('保存成功！');
            this.isFormChange = false;
            this.isApiHeaderTreeDataChange = false;
            this.isApiParamsTreeDataChange = false;
            this.isApiBodyTreeDataChange = false;
            this.isApiResTreeDataChange = false;
            this.isMarkDownContentChange = false;
            console.log(2);
            // this.getOperRecord();
            // this.getChapters();
            // this.viewChapter();
          }
          // console.log('form');
          // console.log(this.form);
        })
      }
    },
    // 清空form
    emptyForm() {
      this.docTitle = ''
      this.form = this.formCopy;
      this.apiHeaderTreeData = this.apiTreeDataCopy;
      this.apiParamsTreeData = this.apiTreeDataCopy;
      this.apiBodyTreeData = this.apiTreeDataCopy;
      this.apiResTreeData = this.apiResTreeDataCopy;
      this.markDownContent = '';
    },
    // 查看文档
    viewChapter() {
      const chapter_id = this.chapter_id;
      const document_id = this.$route.params.id;
      this.loading = this.$loading();
      this.mockApiUrl = location.origin + `/admin/viewMock?chapter_id=${chapter_id}&document_id=${this.$route.params.id}`
      viewChapter({
        chapter_id,
        document_id
      }).then(res => {
        this.loading.close();
        this.defaultCheckedKeys = [chapter_id];
        if (res.code == 200) {
          this.layout = res.data.layout;
          if (res.data.layout == 1) {
            // api文档
            let record = JSON.parse(JSON.stringify(res.data.record));
            const apiData1 = JSON.parse(JSON.stringify(this.baseRequestData));
            const apiData2 = JSON.parse(JSON.stringify(this.baseRequestData));
            const apiData3 = JSON.parse(JSON.stringify(this.baseRequestData));
            const apiData4 = JSON.parse(JSON.stringify(this.baseRequestData));
            if (record.api) {
              this.formCompared = JSON.parse(JSON.stringify(record.api));
              if (!this.formCompared.url) {
                this.formCompared = "";
              }
              this.form = JSON.parse(JSON.stringify(record.api));
              // console.log(55);
              this.form.tab_location = localStorage.tab_location || this.form.tab_location.toString();
              // this.form.body_param_location = this.form.body_param_location.toString();
              this.form.body_param_location = this.form.body_param_location;
            } else {
              // console.log(56);
              this.formCompared = "";
              this.form = JSON.parse(JSON.stringify(this.formCopy));
            }

            // header
            if (record.body[1].length) {
              this.apiHeaderTreeData = JSON.parse(JSON.stringify(record.body['1']));
              this.apiHeaderTreeDataCompared = JSON.parse(JSON.stringify(record.body['1']));
              this.apiHeaderTreeData.push(apiData1);
            } else {
              // const apiData1 = JSON.parse(JSON.stringify(this.baseRequestData));
              this.apiHeaderTreeDataCompared = "";
              this.apiHeaderTreeData = [apiData1];
            }
            // params
            if (record.body[2].length) {
              // console.log(record.body['2']);
              this.apiParamsTreeData = JSON.parse(JSON.stringify(record.body['2']));
              this.apiParamsTreeDataCompared = JSON.parse(JSON.stringify(record.body['2']));
              this.apiParamsTreeData.push(apiData2);
            } else {
              // const apiData2 = JSON.parse(JSON.stringify(this.baseRequestData));
              this.apiParamsTreeDataCompared = "";
              this.apiParamsTreeData = [apiData2];
            }
            // request body
            if (record.body.request_body.length) {
              this.apiBodyTreeData = JSON.parse(JSON.stringify(record.body.request_body));
              this.apiBodyTreeDataCompared = JSON.parse(JSON.stringify(record.body.request_body));
              this.apiBodyTreeData.push(apiData3);
            } else {
              // const apiData3 = JSON.parse(JSON.stringify(this.baseRequestData));
              this.apiBodyTreeDataCompared = "";
              this.apiBodyTreeData = [apiData3];
            }
            // reponse body
            if (record.reponse.length) {
              // console.error(1)
              this.apiResTreeData = JSON.parse(JSON.stringify(record.reponse));
              this.apiResTreeData.forEach(item1 => {
                item1.data.push(apiData4)
              })
              this.apiResTreeDataCompared = JSON.parse(JSON.stringify(record.reponse));
            } else {
              // console.error(2)
              const apiData = JSON.parse(JSON.stringify(this.baseRequestData));
              this.apiResTreeDataCompared = [];
              this.apiResTreeDataCompared.push({description: '', data: []});
              this.apiResTreeData = [{description: '', data: [apiData]}];
            }
            // markDown
            if (record.extend == null) {
              this.markDownContent = '';
              this.markDownContentCompared = "";
            } else {
              this.markDownContent = JSON.parse(JSON.stringify(record.extend));
              this.markDownContentCompared = JSON.parse(JSON.stringify(record.extend));
            }
          } else {
            // 普通文档
            if (res.data.content == null) {
              this.markDownContent = '';
              this.markDownContentCompared = ''
            } else {
              this.markDownContent = res.data.content;
              this.markDownContentCompared = res.data.content;
            }
          }
        }
      }).catch(e => {
        console.log(e);
        this.loading.close();
      })
    },
    // 添加响应数据模块
    addResNode() {
      const apiData = JSON.parse(JSON.stringify(this.baseRequestData));
      this.apiResTreeData.push({description: '', data: [apiData]});
    },
    // 删除响应数据模块
    deleteApiItem(index) {
      this.$confirm('确认删除该数据吗?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.apiResTreeData.splice(index, 1);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    // object 类型输入框禁用
    typeChange(data) {
      console.log(data);
      if (data.type == 4 || data.type == 5) {
        data.default_value = '';
      }
    },
    // 预览请求数据mock
    viewRequestMock() {
      this.isViewRequest = !this.isViewRequest;
      if (this.isViewRequest) {
        this.refreshRequestMock();
      }
    },
    // 刷新请求数据mock
    refreshRequestMock() {
      const tab_location = this.form.tab_location;
      if (tab_location == 1) {
        // console.log(treeToTemplate(this.apiHeaderTreeData));
        this.requestMockTemplate = treeToTemplate(this.apiHeaderTreeData);
        this.requestMockJson = this.$mock.mock(treeToTemplate(this.apiHeaderTreeData, 1));
        this.requestMockJson = romoveSlash(this.requestMockJson);
        // console.log('requestMockTemplate');
        // console.log(this.requestMockTemplate);
        // console.log('requestMockJson');
        // console.log(this.requestMockJson);
      } else if (tab_location == 2) {
        this.requestMockTemplate = treeToTemplate(this.apiParamsTreeData);
        this.requestMockJson = this.$mock.mock(treeToTemplate(this.apiParamsTreeData, 1));
        this.requestMockJson = romoveSlash(this.requestMockJson);
      } else {
        this.requestMockTemplate = treeToTemplate(this.apiBodyTreeData);
        this.requestMockJson = this.$mock.mock(treeToTemplate(this.apiBodyTreeData, 1));
        this.requestMockJson = romoveSlash(this.requestMockJson);
      }
      this.$nextTick(() => {
        let requestMockLeftHeight = this.$refs.requestMockLeftHeight.offsetHeight + 32;
        let requestMockRightHeight = this.$refs.requestMockRightHeight.offsetHeight + 32;
        console.log('requestMockLeftHeight');
        console.log(requestMockLeftHeight);
        console.log(requestMockRightHeight);
        if (requestMockLeftHeight > requestMockRightHeight) {
          this.requestMockHeight = requestMockLeftHeight;
        } else if (requestMockLeftHeight < requestMockRightHeight) {
          this.requestMockHeight = requestMockRightHeight;
        } else {
          this.requestMockHeight = requestMockLeftHeight;
        }
      })
    },

    // 预览响应数据mock responseMockTemplate
    viewResponseMock() {
      this.isViewResponse = !this.isViewResponse;
      if (this.isViewResponse) {
        this.refreshResponseMock();
      }
    },
    // 刷新响应数据mock
    refreshResponseMock() {
      this.responseMockTemplate = [];
      this.responseMockJson = [];
      this.apiResTreeData.forEach(item => {
        this.responseMockTemplate.push(treeToTemplate(item.data));
        this.responseMockJson.push(this.$mock.mock(treeToTemplate(item.data, 1)));
        // this.responseMockJson = romoveSlash(this.requestMockJson);
      })
      console.log('responseMockJson1');
      console.log(this.responseMockJson);
      let newArr = [];
      this.responseMockJson.forEach(item => {
        newArr.push(romoveSlash(item));
      })
      this.responseMockJson = newArr;

      this.$nextTick(() => {
        let responseMockLeftHeight = this.$refs.responseMockLeftHeight.offsetHeight + 32;
        let responseMockRightHeight = this.$refs.responseMockRightHeight.offsetHeight + 32;
        console.log('responseMockLeftHeight');
        console.log(responseMockLeftHeight);
        console.log(responseMockRightHeight);
        if (responseMockLeftHeight > responseMockRightHeight) {
          this.responseMockHeight = responseMockLeftHeight;
        } else if (responseMockLeftHeight < responseMockRightHeight) {
          this.responseMockHeight = responseMockRightHeight;
        } else {
          this.responseMockHeight = responseMockRightHeight;
        }
      })
    },
    onCopy(e){
      this.$message.success('复制成功');
    },
    goMock() {
      window.open('https://github.com/nuysoft/Mock/wiki/Syntax-Specification');
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
      color: #3296FA;

      .el-tooltip {
        cursor: pointer;
      }

      .wq {
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
        width: 100%;

        .node-info {
          flex: 1;
          display: flex;
          align-items: center;

          .wq {
            color: #ffcd2c;
            font-size: 18px;

            &.wq-mulu {
              font-size: 16px;
            }
          }

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

          .wq {
            color: #ffcd2c;
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
  }

  // wyg 2020/04/09
  .w7-aside-chapter {
    .custom-tree-node {
      /*height: 40px;*/
    }
  }

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
          justify-content: space-between;
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
          margin-bottom: 20px;

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

          .custom-tree-node {
            width: 100%;
          }

          .el-row {
            .el-form-item {
              margin-bottom: 10px;

              &.rule-question {
                position: relative;

                .rule-icon {
                  position: absolute;
                  right: 10px;
                  color: #999;
                  font-size: 12px;
                  line-height: 40px;

                  &:hover {
                    color: #3296fa;
                  }
                }

              }
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

        .c-bottom {
          .mock {
            .m-tit {
              color: #333;
              margin-bottom: 10px;
              font-size: 14px;

              .el-icon-refresh {
                color: #3296fa;
                font-weight: 600;
                font-size: 15px;
                cursor: pointer;
              }
            }

            .m-con {
              border: 1px solid #eee;
              border-radius: 2px;
              background-color: #f0f0f0;
              max-height: 90vh;
              height: 100%;
              overflow: auto;
              padding: 15px;

              pre {
                margin: 0;
              }
            }
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

      .basic-information {
        .mock-api {
          /deep/ {
            .el-form-item__content {
              display: inline-block;
              width: calc(100% - 105px);
              cursor: pointer;

              input {
                padding: 0 0 0 10px;
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }

  .api {
    /deep/ {
      .el-tree-node:focus > .el-tree-node__content {
        background-color: transparent;
      }
    }
  }
</style>
<style>
  [v-cloak] {
    display: none !important;
  }

  .mock-api-tip {
    top: 270px !important;
  }

  /*增加.el-tree-node__children，去除目录选中状态*/
  /*.w7-tree.el-tree--highlight-current > .is-current[data-active=tree-active] {*/
    /*background-color: #fff !important;*/
  /*}*/
  /*.w7-tree.el-tree--highlight-current > .is-checked[data-active=tree-active] {*/
    /*background-color: #fff !important;*/
  /*}*/


  /*.w7-tree.el-tree--highlight-current .el-tree-node__children .is-current[data-active=tree-active] {*/
    /*background-color: #fff !important;*/
  /*}*/
  /*.w7-tree.el-tree--highlight-current .el-tree-node__children .is-checked[data-active=tree-active] {*/
    /*background-color: #fff !important;*/
  /*}*/
  .w7-tree.el-tree--highlight-current > .is-current[data-active=tree-active] > .el-tree-node__content {
    background-color: #fff !important;
  }
  /*.w7-tree.el-tree--highlight-current > .is-checked[data-active=tree-active][aria-expanded] > .el-tree-node__content {*/
    /*background-color: transparent !important;*/
  /*}*/
  .w7-tree.el-tree--highlight-current > .is-checked[data-active=tree-active] > .el-tree-node__content {
    background-color: #fff !important;
  }
  .w7-tree.el-tree--highlight-current .el-tree-node__children .is-current[data-active=tree-active] > .el-tree-node__content {
    background-color: #fff !important;
  }
  .w7-tree.el-tree--highlight-current .el-tree-node__children .is-checked[data-active=tree-active] > .el-tree-node__content {
    background-color: #fff !important;
  }
</style>
