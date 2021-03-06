'use strict';
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const fs = require('fs');
const { get } = require("axios");
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

const run = (address, keys, fileName, days, buffer) => {
  //清理旧文件
  if (fileName) fs.rm(fileName, () => { })
  fs.rm("error.txt", () => { })
  const dayRange = getDayRange(days);
  let hrefArr = [];
  let count = 0;
  const runner = async (_address, originUrl) => {
    _address = _address.trim();
    if (_address.indexOf('/') < 0) return;
    let url = new URL(_address, originUrl);
    if (!url) return;
    if (buffer < 0) {
      await new Promise(e => setTimeout(e, 50));
      runner(_address, originUrl);
      return;
    }
    buffer--;
    get(url.href).then((res) => {
      count++;
      let html = res.data;
      if (typeof html !== 'string') return;
      const inDayRange = dayRange.filter(s => {
        return html.indexOf(s) > -1
      })
      const hasKey = keys.filter(s => {
        return html.indexOf(s) > -1
      })
      if (hasKey.length && inDayRange.length) {
        fs.appendFileSync(fileName,
          `-----网址: ${ _address.indexOf("://") > -1 ? _address : url.origin + _address }\n
               --关键词:${ hasKey.join("、") }--\n
               --日期:${ inDayRange.join("、") }--\n
          `)
      }
      const $ = cheerio.load(html);
      $("a").each(function () {
        const href = $(this).attr("href");
        if (typeof href === "string" && hrefArr.indexOf(href + url.origin) === -1) {
          hrefArr.push(href + url.origin);
          hrefArr = Array.from(new Set(hrefArr));
          runner(href, url.origin);
        }

      })
    }).catch(e => {
      console.log('err', e.message, e.name)
      fs.appendFileSync("error.txt", `error--${ url.href }  ${ url.origin }\n${ e.message }\n ${ url.protocol }\n`)
      return;
    }).finally(() => { buffer++; console.log(count, buffer) })
  }
  runner(address);
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
      run("http://www.gov.cn", [ "水泥", "错峰生产", "环保督察", "产能过剩", "转型升级", "技改", "绿色建材产业园", "绿色工厂", "智能制造" ], "a.txt", days, buffer)

    });

  });



}
init();