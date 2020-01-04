//获取url中的参数
export function getUrlParam(url, name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)")
  if (url && url.split('?')[1]) {
    var r = url.split('?')[1].match(reg)
    if (r != null) {
      return unescape(r[2])
    }
    return null
  }
}
//替换指定传入参数的值,paramName为参数,replaceVal为新值
export function replaceParamVal(url, paramName, replaceVal) {
  var oUrl = url.toString()
  var re=eval('/('+ paramName+'=)([^&]*)/gi')
  var nUrl = oUrl.replace(re,paramName+'='+replaceVal)
  return nUrl
}