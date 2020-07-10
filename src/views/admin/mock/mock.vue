<template>
  <div class="mock-wrap">
    <template v-if="responseMockJson.length">
      <pre>{{ responseMockJson[reponseIndex] }}</pre>
    </template>
  </div>
</template>
<script>
  import {mockDetail} from '@/api/api'

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
  name: 'mock',
  data() {
    return {
      loading: '',
      requestHeaderMockTemplate: '',
      requestParamsMockTemplate: '',
      requestBodyMockTemplate: '',
      requestHeaderMockJson: '',
      requesParamstMockJson: '',
      requestBodyMockJson: '',
      responseMockTemplate: '',
      apiHeaderTreeData: [],
      apiParamsTreeData: [],
      apiBodyTreeData: [],
      apiResTreeData: [],
      responseMockJson: '',
      reponseIndex: 0
    }
  },
  created() {
    this.mockDetail();
    this.reponseIndex = this.$route.query.reponse
  },
  methods: {
    mockDetail() {
      const chapter_id = this.$route.params.chapter_id;
      const document_id = this.$route.params.document_id;
      this.loading = this.$loading();
      mockDetail({
        chapter_id,
        document_id,
        show_record: 1
      }).then(res => {
        this.loading.close();
        if (res.code == 200) {
          if (res.data.record) {
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
    }
  }
}
</script>