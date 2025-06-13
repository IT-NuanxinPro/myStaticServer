const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const mime = require('mime-types');

// 分页处理
const createPaginationHandler = (dataFile, options = {}) => {
  return async (req, res) => {
    const params = req.method === 'GET' ? req.query : req.body;
    const { pageNo = 1, pageSize = 10 } = params;
    const currentPage = parseInt(pageNo);
    const limit = parseInt(pageSize);
    console.log(params);
    console.log(currentPage, limit);

    try {
      // 读取数据文件
      const data = await fs.readFile(dataFile, 'utf8');
      const jsonData = JSON.parse(data);

      // 获取数据列表
      let list;
      if (Array.isArray(jsonData)) {
        // 如果数据本身就是数组
        list = jsonData;
      } else {
        list = options.getList ? options.getList(jsonData) : jsonData.list;
      }

      const total = list.length;

      // 计算分页
      const start = (currentPage - 1) * limit;
      const end = start + limit;
      const pageData = list.slice(start, end);

      // 否则返回带有分页信息的对象
      return {
        list: pageData,
        total
      };
    } catch (error) {
      throw new Error('获取分页数据失败');
    }
  };
};

// 文件下载处理
const createDownloadHandler = (downloadPath, options = {}) => {
  return async (req, res) => {
    try {
      const filePath = options.getFilePath
        ? options.getFilePath(req, downloadPath)
        : path.join(downloadPath, req.params.filename);

      // 检查文件是否存在
      await fs.access(filePath);

      // 获取文件信息
      const stat = await fs.stat(filePath);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';

      // 获取下载时的文件名
      const downloadFilename = options.getFileName
        ? options.getFileName(req)
        : path.basename(filePath);

      // 设置响应头
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(downloadFilename)}`);

      // 使用同步版本的fs创建读取流
      const fileStream = fsSync.createReadStream(filePath);
      fileStream.pipe(res);

      return null; // 表示响应已经被处理
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('文件不存在');
      }
      throw error;
    }
  };
};

module.exports = {
  createPaginationHandler,
  createDownloadHandler
}; 