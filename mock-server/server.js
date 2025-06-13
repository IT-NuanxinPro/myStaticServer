const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;
const handlebars = require('handlebars');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.projectsPath = path.join(__dirname, 'projects');
    this.initializeMiddlewares();
    this.initializeProjects();
  }

  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  async initializeProjects() {
    try {
      // 先注册API列表路由
      this.app.get('/api-list', this.getApiList.bind(this));
      this.app.get('/', this.getApiListPage.bind(this));

      const projects = await fs.readdir(this.projectsPath);

      for (const project of projects) {
        const config = require(`./projects/${project}/config`);
        const router = express.Router();
        const mockMiddleware = require('./middleware/mockDataMiddleware')(config);

        router.use(mockMiddleware);
        this.app.use(config.prefix, router);

        console.log(`已加载项目: ${project} (${config.prefix})`);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  }

  async getApiList(req, res) {
    try {
      const apis = {};
      const projects = await fs.readdir(this.projectsPath);

      for (const project of projects) {
        const config = require(`./projects/${project}/config`);
        apis[project] = {
          prefix: config.prefix,
          routes: Object.entries(config.routes).map(([path, routeInfo]) => ({
            path,
            method: routeInfo.method,
            params: {
              ...(routeInfo.requestBody && { requestBody: routeInfo.requestBody }),
              ...(routeInfo.requestQuery && { query: routeInfo.requestQuery })
            }
          }))
        };
      }

      res.json(apis);
    } catch (error) {
      console.error('获取API列表失败:', error);
      res.status(500).json({ error: '获取接口列表失败' });
    }
  }

  async getApiListPage(req, res) {
    try {
      const apis = {};
      const projects = await fs.readdir(this.projectsPath);

      for (const project of projects) {
        const config = require(`./projects/${project}/config`);
        apis[project] = {
          prefix: config.prefix,
          routes: Object.entries(config.routes).map(([path, routeInfo]) => ({
            path,
            method: routeInfo.method,
            params: {
              ...(routeInfo.requestBody && { requestBody: routeInfo.requestBody }),
              ...(routeInfo.requestQuery && { query: routeInfo.requestQuery })
            }
          }))
        };
      }

      // 读取模板文件
      const templatePath = path.join(__dirname, 'templates', 'api-docs.html');
      const templateContent = await fs.readFile(templatePath, 'utf8');

      // 注册 Handlebars 助手
      handlebars.registerHelper('json', function (context) {
        return JSON.stringify(context, null, 2);
      });

      // 编译模板
      const template = handlebars.compile(templateContent);
      const html = template({ projects: apis });

      res.send(html);
    } catch (error) {
      console.error('生成API列表页面失败:', error);
      res.status(500).send('生成页面失败');
    }
  }

  getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return 'localhost';
  }

  start() {
    const localIP = this.getLocalIP();
    this.app.listen(this.port, '0.0.0.0', () => {
      console.log('\n=== Mock Server 已启动 ===');
      console.log(`本地访问: http://127.0.0.1:${this.port}`);
      console.log(`局域网访问: http://${localIP}:${this.port}`);
      console.log('\n访问根路径 / 查看API文档');
      console.log('======================\n');
    });
  }
}

const server = new Server();
server.start(); 