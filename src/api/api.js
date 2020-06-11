import axios from '@/utils/fetch'

export const createDoc = (data) => axios({
  url: '/admin/document/create',
  data,
  method: 'post'
})

export const createChapter = (data) => axios({
  url: '/admin/chapter/create',
  data,
  method: 'post'
})

// 获取请求方式列表
export const getMethodType = (data) => axios({
  url: '/admin/document/chapterapi/getApiLabel',
  data,
  method: 'get'
})

// 保存文档
export const saveChapter = (data) => axios({
  url: '/admin/chapter/save',
  data,
  method: 'post'
})

// 文档内容-查看
export const viewChapter = (data) => axios({
  url: '/admin/chapter/content',
  data,
  method: 'post'
})

// 获取所有项目
export const getAllProject = (data) => axios({
  url: '/admin/document/all',
  data,
  method: 'post'
})

// 获取项目内所有目录
export const getAllChapter = (data) => axios({
  url: '/admin/chapter/detail',
  data,
  method: 'post'
})

// 退出
export const logout = (data) => axios({
  url: '/common/auth/logout',
  data,
  method: 'post'
})

export const logouturl = (data) => axios({
  url: '/common/auth/getlogouturl',
  data,
  method: 'get'
})







