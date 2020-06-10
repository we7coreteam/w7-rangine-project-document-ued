import axios from 'axios'
import router from '../router'
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
    if (response.data.code == 444) {
      // router.push('/admin-login?redirect_url='+ window.location.href)
      // router.push({name: 'adminLoginPage'});
      Message.closeAll();
      Message.error(response.data.message);
    } else if (response.data.code == 445) {
      Message.error(response.data.message);
      router.push('/admin/document');
    } else if (response.data.code == 446) {
      Message.error(response.data.message);
      router.push('/admin/document');
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