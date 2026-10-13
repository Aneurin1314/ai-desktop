export const builtInPlugins = [
  {
    id: 'clipboard',
    name: '剪贴板助手',
    description: '快速提取和整理剪贴板内容',
    ready: true
  },
  {
    id: 'system',
    name: '系统命令',
    description: '执行常用本地命令和脚本',
    ready: true
  },
  {
    id: 'workflow',
    name: '工作流助手',
    description: '让 AI 自动化重复性工作流',
    ready: true
  },
  {
    id: 'notes',
    name: '笔记提取',
    description: '自动总结文档和会议记录',
    ready: true
  }
];

export const getPluginSummary = () =>
  builtInPlugins
    .map((plugin) => `${plugin.name}: ${plugin.ready ? 'available' : 'offline'}`)
    .join(' | ');
