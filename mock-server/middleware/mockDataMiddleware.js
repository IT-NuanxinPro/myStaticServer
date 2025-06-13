const path = require('path');
const fs = require('fs').promises;

// 验证请求参数
const validateRequest = (config, req) => {
  if (!config) return { valid: false, message: '接口不存在' };

  // 验证请求方法
  if (config.method !== req.method) {
    return { valid: false, message: `接口只支持 ${config.method} 方法` };
  }

  // 验证请求体 (POST请求)
  if (config.method === 'POST' && config.requestBody) {
    const { required = [], optional = [] } = config.requestBody;
    const bodyFields = Object.keys(req.body);

    // 检查必需字段
    const missingFields = required.filter(field => !bodyFields.includes(field));
    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `缺少必需的字段: ${missingFields.join(', ')}`
      };
    }

    // 检查未知字段
    const allowedFields = [...required, ...optional];
    const unknownFields = bodyFields.filter(field => !allowedFields.includes(field));
    if (unknownFields.length > 0) {
      return {
        valid: false,
        message: `包含未知的字段: ${unknownFields.join(', ')}`
      };
    }
  }

  // 验证查询参数 (GET请求)
  if (config.method === 'GET' && config.requestQuery) {
    const { required = [], optional = [] } = config.requestQuery;
    const queryFields = Object.keys(req.query);

    // 检查必需的查询参数
    const missingFields = required.filter(field => !queryFields.includes(field));
    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `缺少必需的查询参数: ${missingFields.join(', ')}`
      };
    }

    // 检查未知的查询参数
    const allowedFields = [...required, ...optional];
    const unknownFields = queryFields.filter(field => !allowedFields.includes(field));
    if (unknownFields.length > 0) {
      return {
        valid: false,
        message: `包含未知的查询参数: ${unknownFields.join(', ')}`
      };
    }
  }

  return { valid: true };
};

// 创建通用的mock数据处理中间件
const createMockMiddleware = (projectConfig) => {
  return async (req, res, next) => {
    // 排除特殊路径的处理
    if (req.path === '/api-list' || req.path === '/') {
      return next();
    }

    const apiPath = req.path;
    const routeInfo = projectConfig.routes[apiPath];

    if (!routeInfo) {
      return res.status(404).json(projectConfig.response.error('接口不存在'));
    }

    // 验证请求
    const validationResult = validateRequest(routeInfo, req);
    if (!validationResult.valid) {
      return res.status(400).json(projectConfig.response.error(validationResult.message));
    }

    try {
      let data;

      if (routeInfo.handler) {
        // 使用自定义处理函数
        data = await routeInfo.handler(req, res);
        if (data === null) {
          // 如果处理函数返回null，表示它已经处理了响应
          return;
        }
      } else {
        // 使用默认的JSON文件读取
        const filePath = path.join(
          __dirname,
          '..',
          'projects',
          projectConfig.name,
          'mock',
          `${routeInfo.file}.json`
        );
        const fileContent = await fs.readFile(filePath, 'utf8');
        data = JSON.parse(fileContent);
      }

      res.json(projectConfig.response.success(data));
    } catch (error) {
      console.error('处理请求失败:', error);
      res.status(500).json(projectConfig.response.error('服务器错误'));
    }
  };
};

module.exports = createMockMiddleware; 