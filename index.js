'use strict';
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const fs = require('fs');
const axios = require("axios");
const cheerio = require('cheerio');
const moment = require('moment');
const getDayRange = days => {
  const dayRange = [];
  for (let i = 0; i < days; i++) {
    const newDay = moment().subtract(i, 'days').format('YYYY-MM-DD');
    dayRange.push(newDay);
  }
  return dayRange;
}

let visitedUrl = new Set();

const run = (url, keys, fileName, days, buffer) => {
  //清理旧文件
  if (fileName) fs.rm(fileName, () => { })
  fs.rm("error.txt", () => { })
  const dayRange = getDayRange(days);

  let count = 0;

  const runner = async (url) => {
    if (typeof url === "string" && visitedUrl.has(url)) {
      return;
    }
    fs.appendFileSync("url.txt", `${url}\n`)
    visitedUrl.add(url);
    count++;
    buffer--;
    axios({
      method: 'get',

      url,
    }).then((res) => {
      let html = res.data;
      if (typeof html !== 'string') return;
      const inDayRange = dayRange.filter(s => {
        return html.includes(s);
      })
      const hasKey = keys.filter(s => {
        return html.includes(s);
      })
      if (hasKey.length && inDayRange.length) {
        fs.appendFileSync(fileName,
          `-----网址: ${url}\n
               --关键词:${hasKey.join("、")}--\n
               --日期:${inDayRange.join("、")}--\n
          `)
      }
      const $ = cheerio.load(html);
      $("a").each(async function () {
        const href = $(this).attr("href");
        if (typeof href === 'string' && (!href.includes('/') || href.includes('english'))) {
          return;
        }
        const absUrl = new URL(href, url).href;
        if (buffer <= 0) {
          await new Promise(s => setTimeout(s, 1000))
        }
        runner(absUrl);
      })
    }).catch(e => {
      console.log('err', e.message, e.name)
      fs.appendFileSync("error.txt", `error--${url}\n${e.message}\n ${url.protocol}\n`)
      return;
    }).finally(() => {
      buffer++;
    })
  }

  runner(url);
}


const init = () => {
  let buffer = null;
  let days = null;

  rl.question('buffer?', e1 => {
    buffer = e1;
    rl.question('how many days?', e2 => {
      days = e2;
      rl.close();
      //网址 /关键词/文件名/最近多少天/buffer
      run("http://www.gov.cn", ["水泥"], "result.txt", days, buffer)
      // run("http://www.gov.cn", ["水泥", "错峰生产", "环保督察", "产能过剩", "转型升级", "技改", "绿色建材产业园", "绿色工厂", "智能制造"], "a.txt", days, buffer)

    });

  });

}
init();