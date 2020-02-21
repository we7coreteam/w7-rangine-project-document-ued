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

//格式化时间
export function timestampFormat( timeString ) {
  var timestamp = Date.parse(timeString)/1000
  function zeroize( num ) {
      return (String(num).length == 1 ? '0' : '') + num;
  }

  var curTimestamp = parseInt(new Date().getTime() / 1000); //当前时间戳
  var timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数

  var curDate = new Date( curTimestamp * 1000 ); // 当前时间日期对象
  var tmDate = new Date( timestamp * 1000 );  // 参数时间戳转换成的日期对象

  var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
  var H = tmDate.getHours(), i = tmDate.getMinutes();

  if ( timestampDiff < 60 ) { // 一分钟以内
    return "刚刚";
  } else if( timestampDiff < 3600 ) { // 一小时前之内
    return Math.floor( timestampDiff / 60 ) + "分钟前";
  } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
    return '今天' + zeroize(H) + ':' + zeroize(i);
  } else {
    var oneDayDate = new Date( (curTimestamp - 86400) * 1000 ); // 参数中的时间戳加一天转换成的日期对象
    if ( oneDayDate.getFullYear() == Y && oneDayDate.getMonth()+1 == m && oneDayDate.getDate() == d ) {
      return '昨天' + zeroize(H) + ':' + zeroize(i);
    } else {
      return  Y + '年' + zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
    }
  }
}