const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  },
  send: (channel, data) => ipcRenderer.send(channel, data),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  onFocusChatInput: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('focus-chat-input', handler);
    return handler;
  },
  offFocusChatInput: (handler) => {
    ipcRenderer.removeListener('focus-chat-input', handler);
  }
});
