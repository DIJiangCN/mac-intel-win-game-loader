const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { detectRuntime, launchGame } = require('../src/launcher');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 820,
    minHeight: 640,
    title: 'Mac Intel Windows Game Loader',
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('detect-runtime', async () => {
    return detectRuntime();
  });

  ipcMain.handle('launch-exe', async (_, exePath, options = {}) => {
    return launchGame(exePath, options);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
