# Stock & Fund Visualization App

## 项目简介 (Project Overview)
本项目是一个基于 React 的股票与基金数据可视化分析应用，结合了现代前端技术栈。在最新版本中，我们接入了强大的 AI 代理能力，能够根据基金的历史数据和表现提供自动化的 AI 基金诊断报告。

## 技术栈 (Technology Stack)
- **核心框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design (antd)
- **状态管理**: Zustand
- **网络请求**: Axios

## 快速开始 (Getting Started)

### 1. 环境准备
确保您的计算机上已安装 [Node.js](https://nodejs.org/) (推荐 18.x 或以上版本)。

### 2. 安装依赖
克隆项目后，在项目根目录下运行：
```bash
npm install
```

### 3. 本地开发运行
```bash
npm run dev
```
应用将在本地启动（通常是 `http://localhost:5173`）。您可以直接在浏览器中访问。

### 4. 构建生产代码
```bash
npm run build
```

## AI 基金诊断功能接入总结

### 1. 背景与目标
在本项目中，我们接入了 **AI 基金诊断** 功能，旨在通过 AI 代理系统结合大模型的能力，对基金数据进行自动化分析和诊断。通过与本地运行的 Antigravity Manager 代理服务器进行通信，前端应用能够获取并展示 AI 生成的详细基金诊断报告。

### 2. 接入核心步骤
- **代理服务器配置**
  - 依赖本地运行的 Antigravity Manager 代理，监听端口为 `8045`。
  - 目标接口地址：代理服务提供的标准大语言模型对话接口（如 `/v1/chat/completions`）。
   
- **跨域代理设置 (Vite)**
  - 修改了 `vite.config.ts` 中的 `server.proxy` 选项，将前端应用中特定的 API 请求（如 `/api/ai`）统一代理转发至 `http://localhost:8045`。
  - 此步骤避免了浏览器端的跨域资源共享 (CORS) 拦截问题。

- **鉴权异常排查 (解决 401 Unauthorized)**
  - 在 HTTP 请求头的 Headers 中携带正确的 `Authorization: Bearer <API_Key>`，解决了 `401 Unauthorized` 授权被拒的问题。

- **前后端接口联调**
  - 在 `src/api/` 下实现了相关网络请求代码。
  - 将受检基金的基本信息、历史表现等拼接为 Prompt，发送给 AI 代理，并解析其返回响应供前端渲染展示。

### 3. 调试与运行注意事项
- **确保代理运行**：开发阶段必须确认本地 `8045` 端口的服务已正常启动，且没有被其他进程占用。
- **常见问题排查**：
  - 如果遇到 `401` 错误，请检查环境变量或配置文件中的 API Key 是否有效。
  - 如果遇到 `404` 等网络超时，检查 `vite.config.ts` 中的路径重写规则 (`rewrite`) 以及请求 URL 前缀。
- **安全性提示**：前端直连代理接口仅限本地联调。在生产环境中，所有 AI 请求必须经由您的后端服务器进行鉴权、封装与转发，严禁将 API Key 暴露在浏览器客户端中。

### 4. 后续优化方向
- **流式数据加载 (Streaming)**：建议使用流式输出（即打字机效果）来展示 AI 响应内容，从而避免因生成时间过长带来的页面长时间 Loading，提升用户体验。
- **Prompt 调优**：补充更多行业基准指标和近期大盘走势等上下文信息，提升 AI 基金诊断报告的专业度和分析深度。

---
*Created with AI Proxy Assistant.*
