# NuanXinPro Mock Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-brightgreen.svg)](https://vuejs.org/)

一个功能强大的静态Mock服务器，提供API模拟、文档生成和可视化管理界面。支持多项目配置、自动API文档生成、参数验证等功能。

## ✨ 特性

- 🚀 **快速启动** - 零配置启动，支持热重载
- 📁 **多项目支持** - 支持多个独立项目的API模拟
- 📖 **自动文档生成** - 基于配置自动生成API文档
- 🎯 **参数验证** - 支持请求参数验证和错误提示
- 📱 **响应式界面** - 现代化的Vue3 + Element Plus界面
- 🔄 **分页支持** - 内置分页处理器
- 📥 **文件下载** - 支持文件下载功能
- 🌐 **CORS支持** - 跨域请求支持
- 📊 **实时预览** - 支持API实时测试

## 🏗️ 项目结构

```
my-static-server/
├── mock-server/              # 后端Mock服务器
│   ├── server.js            # 主服务器文件
│   ├── middleware/          # 中间件
│   │   └── mockDataMiddleware.js
│   ├── utils/               # 工具函数
│   │   ├── handlers.js      # 处理器工具
│   │   └── fileReader.js    # 文件读取工具
│   ├── projects/            # 项目配置目录
│   │   ├── ms/              # 示例项目：商城系统
│   │   ├── custBook/        # 示例项目：电话本
│   │   ├── intelligent-penetration/  # 示例项目：智能渗透
│   │   └── private/         # 示例项目：私有项目
│   └── package.json
└── frontend-docs/           # 前端文档界面
    ├── src/
    │   ├── views/
    │   │   └── ApiDocs.vue  # API文档主页面
    │   ├── router/          # 路由配置
    │   └── main.js          # 入口文件
    ├── dist/                # 构建输出目录
    └── package.json
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd mock-server
npm install

# 安装前端依赖
cd ../frontend-docs
npm install
```

### 启动服务

#### 方式一：开发模式（推荐）

```bash
# 启动后端服务（支持热重载）
cd mock-server
npm run dev

# 启动前端开发服务
cd ../frontend-docs
npm run dev
```

#### 方式二：生产模式

```bash
# 构建前端
cd frontend-docs
npm run build

# 启动后端服务（包含前端静态文件）
cd ../mock-server
npm start
```

### 访问服务

- **API文档界面**: http://localhost:3000
- **API接口**: http://localhost:3000/[项目前缀]/[接口路径]
- **API列表**: http://localhost:3000/api-list

## 📝 配置说明

### 项目配置

每个项目需要在 `mock-server/projects/` 目录下创建独立的配置文件：

```javascript
// projects/example/config.js
module.exports = {
  name: 'example',                    // 项目名称
  prefix: '/api/example',             // API前缀
  response: {                         // 响应格式配置
    success: (data) => ({
      code: 200,
      message: '成功',
      data: data
    }),
    error: (message) => ({
      code: 500,
      message: message || '服务器错误'
    })
  },
  routes: {                          // 路由配置
    '/users/list': {
      method: 'GET',
      description: '用户列表',
      file: 'userList',              // 对应 mock/userList.json
      requestQuery: {
        required: ['page'],
        optional: ['size', 'keyword']
      }
    }
  }
};
```

### Mock数据

在项目目录下创建 `mock/` 文件夹，存放JSON格式的模拟数据：

```json
// projects/example/mock/userList.json
{
  "total": 100,
  "list": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  ]
}
```

## 🔧 高级功能

### 自定义处理器

支持自定义处理逻辑：

```javascript
routes: {
  '/custom-api': {
    method: 'POST',
    description: '自定义处理',
    handler: async (req, res) => {
      // 自定义逻辑
      return {
        timestamp: Date.now(),
        data: req.body
      };
    }
  }
}
```

### 分页处理

使用内置分页处理器：

```javascript
const { createPaginationHandler } = require('../../utils/handlers');

routes: {
  '/paginated-list': {
    method: 'GET',
    description: '分页列表',
    handler: createPaginationHandler(
      path.join(__dirname, 'mock/list.json'),
      {
        getList: (data) => data.items
      }
    )
  }
}
```

### 文件下载

支持文件下载功能：

```javascript
const { createDownloadHandler } = require('../../utils/handlers');

routes: {
  '/download/file': {
    method: 'GET',
    description: '文件下载',
    handler: createDownloadHandler(downloadPath, {
      getFilePath: (req, basePath) => path.join(basePath, 'file.txt'),
      getFileName: () => 'download.txt'
    })
  }
}
```

## 🛠️ 开发指南

### 添加新项目

1. 在 `mock-server/projects/` 下创建项目目录
2. 创建 `config.js` 配置文件
3. 创建 `mock/` 目录并添加JSON数据文件
4. 重启服务器

### 前端开发

前端使用Vue 3 + Element Plus开发，支持：

- 响应式设计
- API搜索和过滤
- 实时API测试
- 移动端适配

## 📦 部署

### Docker部署（推荐）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN cd frontend-docs && npm install && npm run build
RUN cd mock-server && npm install
EXPOSE 3000
CMD ["node", "mock-server/server.js"]
```

### 传统部署

```bash
# 构建前端
cd frontend-docs
npm run build

# 启动后端
cd ../mock-server
npm start
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

[MIT License](LICENSE)

## 👨‍💻 作者

**NuanXinPro** - [GitHub](https://github.com/IT-NuanxinPro)

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！
