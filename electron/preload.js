const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  detectRuntime: () => ipcRenderer.invoke('detect-runtime'),
  launchExe: (exePath, options = {}) => ipcRenderer.invoke('launch-exe', exePath, options)
});
