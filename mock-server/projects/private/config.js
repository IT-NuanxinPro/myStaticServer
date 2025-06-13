const path = require('path');
const { createPaginationHandler } = require('../../utils/handlers');
const mockPath = path.join(__dirname, 'mock');

module.exports = {
  name: 'private',
  prefix: '',
  response: {
    success: (data) => ({
      state: 1,
      success: true,
      message: "请求成功",
      data: data
    }),
    error: (message) => ({
      state: 0,
      success: false,
      message: message || "请求失败",
      data: null
    })
  },
  routes: {
    '/user/protocolAddress': {
      method: 'POST',
      file: 'address',
      description: '微信公众号获取协议地址',
      requestBody: {
        required: ['protocolType']
      }
    },
  }
}; 