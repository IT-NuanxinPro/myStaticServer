const path = require('path');
const { createPaginationHandler } = require('../../utils/handlers');
const mockPath = path.join(__dirname, 'mock');

module.exports = {
  name: 'ms',
  prefix: '/ms',
  response: {
    success: (data) => ({
      respCode: 200,
      respDesc: '请求成功',
      data: data
    }),
    error: (message) => ({
      respCode: 500,
      respDesc: message || '服务器错误'
    })
  },
  routes: {
    // 商品列表（带分页）
    '/goods/list': {
      method: 'GET',
      handler: createPaginationHandler(
        path.join(mockPath, 'goodsList.json'),
        {
          getList: (data) => data.list
        }
      )
    },

    // 地址搜索
    '/wdt-api/searchAddr': {
      method: 'POST',
      file: 'searchAddr',
      requestBody: {
        required: ['searchedAddr']
      }
    }
  }
}; 