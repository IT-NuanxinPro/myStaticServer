const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs").promises;

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.projectsPath = path.join(__dirname, "projects");
    this.initializeMiddlewares();
    this.initializeProjects();
  }

  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  async initializeProjects() {
    try {
      // 先注册API列表路由
      this.app.get("/api-list", this.getApiList.bind(this));

      const projects = await fs.readdir(this.projectsPath);

      for (const project of projects) {
        const config = require(`./projects/${project}/config`);
        const router = express.Router();
        const mockMiddleware = require("./middleware/mockDataMiddleware")(config);

        router.use(mockMiddleware);
        this.app.use(config.prefix, router);

        console.log(`已加载项目: ${project} (${config.prefix})`);
      }
    } catch (error) {
      console.error("加载项目失败:", error);
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
      console.error("获取API列表失败:", error);
      res.status(500).json({ error: "获取接口列表失败" });
    }
  }

  getLocalIP() {
    const { networkInterfaces } = require("os");
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          return net.address;
        }
      }
    }
    return "localhost";
  }

  start() {
    const localIP = this.getLocalIP();
    this.app.listen(this.port, "0.0.0.0", () => {
      console.log("=== Mock Server 已启动 === ");
      console.log(`本地访问: http://127.0.0.1:${this.port}`);
      console.log(`局域网访问: http://${localIP}:${this.port}`);
      console.log("访问根路径 / 查看API文档（由 Vue 应用提供）");
      console.log("======================");
    });
    this.app.use(express.static(path.join(__dirname, "..", "frontend-docs", "dist")));
    this.app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "..", "frontend-docs", "dist", "index.html"));
    });
  }
}

const server = new Server();
server.start();
