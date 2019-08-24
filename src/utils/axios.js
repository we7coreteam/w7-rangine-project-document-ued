import axios from 'axios'
import router from '../router'
import {
  Message
} from 'element-ui'
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
  // response.
  if (!response.data || !response.data.status) {
    if (response.data.code == '444') {
      router.push('/admin/login')
    } else {
      Message({
        message: (response.data && response.data.message) ? response.data.message : '出错了', 
        duration: 1000
        })
    }
    return Promise.reject(response.data)
  } else {
    return response.data.data
  }
}, error => {
  return Promise.reject(error.response)
})

export default instance