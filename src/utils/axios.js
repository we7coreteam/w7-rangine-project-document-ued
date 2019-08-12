import axios from 'axios'
import router from '../router'
import {
  Message
} from 'element-ui'
import qs from 'qs'

const instance = axios.create()
instance.interceptors.request.use(request => {
  if(request.method == 'post') {
    request.data = {
      ...request.data,
      document_access_token: localStorage.getItem('document_access_token')
    }
  }
  if(request.method == 'get') {
    request.params = {
      ...request.params,
      document_access_token: localStorage.getItem('document_access_token')
    }
  }
  request.transformRequest = [function (data) {
    return typeof data === 'object' ? qs.stringify(data) : data
  }]
  return request
})
instance.interceptors.response.use(response => {
  // response.
  if (!response.data || !response.data.status) {
    if (response.data.code == '444') {
      router.push('/admin/login')
    } else {
      Message((response.data && response.data.message) ? response.data.message : '出错了')
    }
    return Promise.reject(response.data)
  } else {
    return response.data.data
  }
}, error => {
  return Promise.reject(error.response)
})

export default instance