const fs = require('fs');
const path = require('path');

let intervalId = null;

const pachong = {
  run: (win, options) => {
    console.log('在主进程中运行爬虫:', options);
    const cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }
    const cacheFilePath = path.join(cacheDir, `${options.name}.json`);

    // 如果缓存文件不存在，则初始化为空数组
    if (!fs.existsSync(cacheFilePath)) {
      fs.writeFileSync(cacheFilePath, JSON.stringify([], null, 2));
    }

    // 如果已经在运行，先停止
    if (intervalId) {
      clearInterval(intervalId);
    }

    let page = 1;
    intervalId = setInterval(() => {
      if (page > options.maxPages || page > 20) {
        clearInterval(intervalId);
        intervalId = null;
        win.webContents.send('crawler-done', { message: '爬取完成！' });
        return;
      }

      const newResult = {
        targetPage: `${options.targetUrl}?page=${page}`,
        targetKeyword: options.keywords[Math.floor(Math.random() * options.keywords.length)],
        times: Math.floor(Math.random() * 5) + 1,
      };

      // 1. 读取现有结果，追加新结果，然后写回
      const existingResults = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
      existingResults.push(newResult);
      fs.writeFileSync(cacheFilePath, JSON.stringify(existingResults, null, 2));

      // 2. 将新结果发送到渲染进程
      win.webContents.send('crawler-update', newResult);
      
      page++;
    }, 2000);
  },

  stop: (win) => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      console.log('爬虫已停止');
      win.webContents.send('crawler-done', { message: '任务已手动停止' });
    }
  },

  saveConfig: (options) => {
    const configDir = path.join(process.cwd(), 'configs');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }
    const fileName = `${options.name}.conf`;
    const filePath = path.join(configDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(options, null, 2), 'utf-8');
    console.log(`配置文件已保存: ${filePath}`);
    return filePath;
  }
};

module.exports = { pachong };
