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
      requestBody: {
        required: ['protocolType']
      }
    },
  }
}; 