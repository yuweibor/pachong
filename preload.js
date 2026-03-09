const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pachongApi', {
  run: (options) => ipcRenderer.invoke('run-pachong', options),
  stop: () => ipcRenderer.invoke('stop-pachong'),
  saveConfig: (options) => ipcRenderer.invoke('save-config', options),
  onCrawlerUpdate: (callback) => ipcRenderer.on('crawler-update', (_event, value) => callback(value)),
  onCrawlerDone: (callback) => ipcRenderer.on('crawler-done', (_event, value) => callback(value)),
});
