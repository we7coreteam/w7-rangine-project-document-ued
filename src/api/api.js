import axios from '@/utils/axios'

export const createDoc = (data) => axios({
  url: '/admin/document/create',
  data,
  method: 'post'
})





