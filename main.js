const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { pachong } = require('./src/services/pachong.js');

// 热重载配置
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (_) { }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // 推荐开启
      nodeIntegration: false, // 推荐关闭
    }
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
    // 打开开发者工具
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

app.whenReady().then(() => {
  // 设置 IPC 监听
  ipcMain.handle('run-pachong', (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    pachong.run(win, options);
  });

  ipcMain.handle('stop-pachong', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    pachong.stop(win);
  });

  ipcMain.handle('save-config', (event, options) => {
    return pachong.saveConfig(options);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})