const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  },
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) => {
    ipcRenderer.on(channel, (_event, ...args) => func(...args));
  }
});
