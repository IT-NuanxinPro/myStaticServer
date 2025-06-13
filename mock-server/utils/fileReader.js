const fs = require('fs').promises;
const path = require('path');

class FileReader {
  static async readJsonFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`读取文件失败: ${filePath}`, error);
      return null;
    }
  }

  static async getMockData(projectName, apiPath) {
    const mockPath = path.join(__dirname, '..', 'projects', projectName, 'mock', ...apiPath);
    const jsonPath = `${mockPath}.json`;

    try {
      const exists = await fs.access(jsonPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        return null;
      }

      return await FileReader.readJsonFile(jsonPath);
    } catch (error) {
      console.error('获取Mock数据失败:', error);
      return null;
    }
  }

  static async listMockApis() {
    const mockDir = path.join(process.cwd(), 'mock');

    try {
      await fs.access(mockDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(mockDir, { recursive: true });
        return {};
      }
      throw error;
    }

    try {
      const projects = await fs.readdir(mockDir);
      const apis = {};
      for (const project of projects) {
        apis[project] = await FileReader.scanDir(path.join(mockDir, project));
      }
      return apis;
    } catch (error) {
      console.error('扫描API目录失败:', error);
      return {};
    }
  }

  static async scanDir(dir, base = '') {
    const files = await fs.readdir(dir);
    const apis = [];

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subApis = await FileReader.scanDir(fullPath, path.join(base, file));
        apis.push(...subApis);
      } else if (file.endsWith('.json')) {
        apis.push(path.join(base, file.replace('.json', '')));
      }
    }

    return apis;
  }
}

module.exports = FileReader; 