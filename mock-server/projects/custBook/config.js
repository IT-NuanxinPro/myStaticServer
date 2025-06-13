const path = require('path');
const { createPaginationHandler, createDownloadHandler } = require('../../utils/handlers');
const mockPath = path.join(__dirname, 'mock');
const downloadPath = path.join(__dirname, 'downloads');
module.exports = {
  name: 'custBook',
  prefix: '/custbookApi',
  response: {
    success: (data) => ({
      status: "0000",
      message: 'success',
      resData: data
    }),
    error: (message) => ({
      code: -1,
      msg: message || 'error'
    })
  },
  routes: {
    '/transfer/getBookMainList': {
      method: 'POST',
      file: 'bookMainList',
      requestBody: {
        required: ['isAddBook', 'login', 'naturalCust'],
        optional: ['pageNo', 'pageSize']
      },
      handler: createPaginationHandler(
        path.join(mockPath, 'bookMainList.json'),
        {
          getList: (data) => data.list
        }
      )
    },
    // 下载政企电话本nginx配置
    '/download/nginx-config': {
      method: 'GET',
      handler: createDownloadHandler(downloadPath, {
        getFilePath: (req, basePath) => path.join(basePath, '政企电话本生产ngin转发.txt'),
        getFileName: () => '政企电话本生产nginx配置.txt'
      })
    },

    // 下载号码摸查模版
    '/download/phone-search-template': {
      method: 'POST',
      handler: createDownloadHandler(downloadPath, {
        getFilePath: (req, basePath) => path.join(basePath, '号码摸查模版.xlsx'),
        getFileName: () => '号码摸查模版.xlsx'
      })
    },
  }
}; 