const path = require('path');
const { createPaginationHandler, createDownloadHandler } = require('../../utils/handlers');
const mockPath = path.join(__dirname, 'mock');
const downloadPath = path.join(__dirname, 'downloads');
module.exports = {
  name: 'intelligent-penetration',
  prefix: '/intelligent-penetration/api',
  response: {
    success: (data) => ({
      resultCode: "0000",
      resultDesc: '操作成功',
      resData: data
    }),
    error: (message) => ({
      code: '9999',
      resultDesc: message || 'error',
      resData: null
    })
  },
  routes: {
    '/task/list': {
      method: 'POST',
      file: 'taskList',
      description: '任务列表',
      handler: (req, res) => {
        const taskList = require(path.join(mockPath, 'taskList.json'));
        return {
          taskList,
        };
      }
    },
    // 创建任务，返回一个任务id（taskId）
    '/task/create': {
      method: 'POST',
      description: '创建任务',
      handler: (req, res) => {
        return {
          taskId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        };
      }
    },

    // 开始执行接口
    '/task/start': {
      method: 'POST',
      description: '开始执行',
      handler: async (req, res) => {
        const taskId = req.body.taskId;

        const delay = Math.floor(Math.random() * 2000) + 3000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return {}
      }
    },

    // 任务详情接口
    '/task/detail': {
      method: 'POST',
      description: '任务详情',
      handler: async (req, res) => {
        const taskId = req.body.taskId;
        const reportFileName = taskId === 'TASK_JWPCPXAP_002' ? '天津联通物采数智平台.docx' : '天津联通沃装维.docx';

        return {
          taskId,
          departName: "测试人部门",
          staffName: "测试人姓名",
          sysName: "目标系统名称",
          sysUrl: "目标系统URL",
          status: "9",
          startDate: "2025-07-18 14:54:13",
          endDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
          reportFileName
        }
      }
    },

    // 删除任务
    '/task/delete': {
      method: 'POST',
      description: '删除任务',
      handler: (req, res) => {
        return {}
      }
    },

    // 下载号码摸查模版
    // '/download/phone-search-template': {
    //   method: 'POST',
    //   description: '下载号码摸查模版',
    //   handler: createDownloadHandler(downloadPath, {
    //     getFilePath: (req, basePath) => path.join(basePath, '号码摸查模版.xlsx'),
    //     getFileName: () => '号码摸查模版.xlsx'
    //   })
    // },
  }
}; 