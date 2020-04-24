import axios from 'axios'
import {Message} from 'element-ui'
import qs from 'qs'

// axios.defaults.withCredentials=true
const instance = axios.create({
  withCredentials: true
})

instance.interceptors.request.use(request => {
  request.transformRequest = [function (data) {
    return (typeof data === 'object' && !(data instanceof FormData)) ? qs.stringify(data) : data
  }]
  return request
})
instance.interceptors.response.use(response => {
  if (response.data.code >= 200 && response.data.code < 300) {
    return response.data;
  } else {
    if (response.data.code == '444') {
      Message.closeAll();
      Message.error(response.data.message);
    } else {
      Message.closeAll();
      Message.error(response.data.message);
    }
    return Promise.reject(response.data)
  }
}, error => {
  return Promise.reject(error.response)
})

export default instance
// export {instance as axios}