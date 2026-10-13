# AI Desktop

这是一个可扩展的桌面 AI 助手启动模板，基于 Electron + React + Vite，适合后续扩展：

- AI 聊天助手
- 文件本地问答
- 代码搜索与总结
- 本地模型 / 云模型接入
- 插件与系统工具集成
- 语音输入与语音输出

## 运行方式

1. 安装依赖

```bash
npm install
```

2. 启动开发模式（前端 + Electron）

```bash
npm run dev
```

3. 构建生产版本

```bash
npm run build
```

4. 运行打包后静态版本

```bash
npm start
```

## 目录结构

```text
.
├── electron/
│   ├── main.js
│   └── preload.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 扩展建议

- 在 `electron/main.js` 中添加 IPC 通道，用于与本地服务通信
- 在 `src/App.jsx` 中接入模型 API 或本地 Agent
- 创建 `src/services/` 模块，封装：OpenAI、Anthropic、llama.cpp 适配器
- 后续可加入 `src/plugins/`、`src/store/`、`src/utils/` 等结构

## 下一步计划

- 接入 OpenAI / Azure / Anthropic API
- 支持本地 llama.cpp
- 增加文件上传和 PDF/Markdown 读取
- 增加语音输入与 TTS
- 增加插件系统与全局快捷键
