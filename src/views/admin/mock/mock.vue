<template>
  <el-container class="w7-document-chapter">
    <el-main v-cloak>
      <div class="mock-wrap">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="mock">
              <div class="m-tit">请求模板</div>
              <div class="m-con" :style="{height: requestMockHeight + 'px'}">
                <div ref="requestMockLeftHeight">
                  <div class="pre-wrap" v-if="apiHeaderTreeData.length">
                    <div>Header</div>
                    <pre>{{ requestHeaderMockTemplate }}</pre>
                  </div>
                  <div class="pre-wrap" v-if="apiParamsTreeData.length">
                    <div>Params</div>
                    <pre>{{ requestParamsMockTemplate }}</pre>
                  </div>
                  <div class="pre-wrap" v-if="apiBodyTreeData.length">
                    <div>Body</div>
                    <pre>{{ requestBodyMockTemplate }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="mock">
              <div class="m-tit">请求数据</div>
              <div class="m-con" :style="{height: requestMockHeight + 'px'}">
                <div ref="requestMockRightHeight">
                  <div class="pre-wrap" v-if="apiHeaderTreeData.length">
                    <div>Header</div>
                    <pre>{{ requestHeaderMockJson }}</pre>
                  </div>
                  <div class="pre-wrap" v-if="apiParamsTreeData.length">
                    <div>Params</div>
                    <pre>{{ requesParamstMockJson }}</pre>
                  </div>
                  <div class="pre-wrap" v-if="apiBodyTreeData.length">
                    <div>Body</div>
                    <pre>{{ requestBodyMockJson }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="mock-wrap">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="mock">
              <div class="m-tit">响应模板</div>
              <div class="m-con" :style="{height: responseMockHeight + 'px'}">
                <div ref="responseMockLeftHeight">
                    <div class="pre-wrap" v-for="(item, index) in responseMockTemplate" :key="index">
                      <template v-if="apiResTreeData[index].data.length">
                        <div>响应{{ apiResTreeData[index].description }}：</div>
                        <pre>{{ item }}</pre>
                      </template>
                    </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="mock">
              <div class="m-tit">响应数据</div>
              <div class="m-con" :style="{height: responseMockHeight + 'px'}">
                <div ref="responseMockRightHeight">
                  <div class="pre-wrap" v-for="(item, index) in responseMockJson" :key="index">
                    <template v-if="apiResTreeData[index].data.length">
                      <div>响应{{ apiResTreeData[index].description }}:</div>
                      <pre>{{ item }}</pre>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>
<script>
  import {viewChapter} from '@/api/api'

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
  name: '',
  data() {
    return {
      loading: '',
      requestMockHeight: '',
      requestHeaderMockTemplate: '',
      requestParamsMockTemplate: '',
      requestBodyMockTemplate: '',
      requestHeaderMockJson: '',
      requesParamstMockJson: '',
      requestBodyMockJson: '',
      responseMockTemplate: '',
      responseMockHeight: '',
      apiHeaderTreeData: [],
      apiParamsTreeData: [],
      apiBodyTreeData: [],
      apiResTreeData: [],
      responseMockJson: ''
    }
  },
  created() {
    this.viewChapter();
  },
  methods: {
    viewChapter() {
      const chapter_id = this.$route.query.chapter_id;
      const document_id = this.$route.query.document_id;
      this.loading = this.$loading();
      viewChapter({
        chapter_id,
        document_id
      }).then(res => {
        this.loading.close();
        if (res.code == 200) {
          this.layout = res.data.layout;
          if (res.data.layout == 1) {
            // api文档
            let record = JSON.parse(JSON.stringify(res.data.record));
            // header
            if (record.body[1].length) {
              this.apiHeaderTreeData = JSON.parse(JSON.stringify(record.body['1']));
            } else {

            }
            // params
            if (record.body[2].length) {
              this.apiParamsTreeData = JSON.parse(JSON.stringify(record.body['2']));
            } else {
              this.apiParamsTreeData = [];
            }
            // request body
            if (record.body.request_body.length) {
              this.apiBodyTreeData = JSON.parse(JSON.stringify(record.body.request_body));
            } else {
              this.apiBodyTreeData = [];
            }
            // reponse body
            if (record.reponse.length) {
              this.apiResTreeData = JSON.parse(JSON.stringify(record.reponse));
            } else {
              this.apiResTreeData = [];
            }

            this.initMock();
          }
        }
      }).catch(e => {
        console.log(e);
        this.loading.close();
      })
    },

    initMock() {
      // Header
      console.log('requestHeaderMockTemplate');
      console.log(this.requestHeaderMockTemplate);
      this.requestHeaderMockTemplate = treeToTemplate(this.apiHeaderTreeData);
      this.requestHeaderMockJson = this.$mock.mock(treeToTemplate(this.apiHeaderTreeData, 1));
      this.requestHeaderMockJson = romoveSlash(this.requestHeaderMockJson);

      // Params
      this.requestParamsMockTemplate = treeToTemplate(this.apiParamsTreeData);
      this.requesParamstMockJson = this.$mock.mock(treeToTemplate(this.apiParamsTreeData, 1));
      this.requesParamstMockJson = romoveSlash(this.requesParamstMockJson);

      // body
      this.requestBodyMockTemplate = treeToTemplate(this.apiBodyTreeData);
      this.requestBodyMockJson = this.$mock.mock(treeToTemplate(this.apiBodyTreeData, 1));
      this.requestBodyMockJson = romoveSlash(this.requestBodyMockJson);
      console.log(666);
      console.log(this.requestBodyMockJson);

      // reponse
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
        let requestMockLeftHeight = this.$refs.requestMockLeftHeight.offsetHeight + 32;
        let requestMockRightHeight = this.$refs.requestMockRightHeight.offsetHeight + 32;

        let responseMockLeftHeight = this.$refs.responseMockLeftHeight.offsetHeight + 32;
        let responseMockRightHeight = this.$refs.responseMockRightHeight.offsetHeight + 32;

        if (requestMockLeftHeight > requestMockRightHeight) {
          this.requestMockHeight = requestMockLeftHeight;
        } else if (requestMockLeftHeight < requestMockRightHeight) {
          this.requestMockHeight = requestMockRightHeight;
        } else {
          this.requestMockHeight = requestMockLeftHeight;
        }

        if (responseMockLeftHeight > responseMockRightHeight) {
          this.responseMockHeight = responseMockLeftHeight;
        } else if (responseMockLeftHeight < responseMockRightHeight) {
          this.responseMockHeight = responseMockRightHeight;
        } else {
          this.responseMockHeight = responseMockRightHeight;
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>

  .mock-wrap {
    width: 1200px;
    margin: 0 auto 30px;

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
        height: 100%;
        overflow: auto;
        padding: 15px;

        .pre-wrap {
          margin-bottom: 30px;

          &:last-of-type {
            margin-bottom: 0;
          }

          pre {
            margin: 10px 0 0;
          }
        }

      }
    }
  }
</style>