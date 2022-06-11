'use strict';
const fs = require('fs');
const http = require('http');
const https = require('https');
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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const run = (address, keys, level, fileName, days) => {
  if (fileName) fs.rm(fileName, () => { })
  fs.rm("error.txt", () => { })
  const dayRange = getDayRange(days);
  let hrefArr = [];
  let count = 0;
  let _level = level;
  let buffer = 5;

  const runner = async (_address, originUrl) => {
    while (buffer < 0) {
      await new Promise(e => setTimeout(e, 1000))
    }
    buffer--;
    if (_level <= 0) return;
    _level--;
    if (_address.indexOf('/') < 0) return;
    let url = new URL(_address, originUrl);
    if (!url) return;
    console.log(`${ ++count }次点击,${ level - _level }层`)
    const method = url.protocol.indexOf('s') > -1 ? https : http;
    method.get(url.href, (res) => {
      console.log(res.statusCode, buffer);
      let html = "";
      res.on("data", (chunk) => {
        html += chunk;
      })
      res.on("end", () => {

        const inDayRange = dayRange.filter(s => {
          return html.indexOf(s) > -1
        })
        const hasKey = keys.filter(s => {
          return html.indexOf(s) > -1
        })
        if (hasKey.length && inDayRange.length) {
          fs.appendFileSync(fileName,
            `-----网址:${ url.origin }${ _address }\n
               --关键词:${ hasKey.join("、") }--\n
               --日期:${ inDayRange.join("、") }--\n
               --第${ _level }层检索\n
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
      })
    }).on("error", e => {
      buffer++;
      console.log('err', e.message, e.name)
      fs.appendFileSync("error.txt", `error--${ url.href }  ${ url.origin }\n${ e.message }\n`)
      return;
    }).on("finish", () => {
      buffer++;
    })
  }
  runner(address);
}
//网址 /关键词/深度/文件名/最近多少天
run("http://www.gov.cn", [ "水泥", "错峰生产", "环保督察", "产能过剩", "转型升级", "技改", "绿色建材产业园", "绿色工厂", "智能制造" ], 20000, "a.txt", 7)