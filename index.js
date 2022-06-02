'use strict';
const fs = require('fs');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');

const makeFileName = () => {
  return `${ new Date().toLocaleString() }`
}

const run = async (address, key, level) => {
  let hrefArr = []
  let arr = []

  const ru = () => {
    return new Promise((res, rej) => {
      const runner = (_address, _level) => {
        if (_level === -1) res(arr);
        const method = _address.startsWith('http://') > -1 ? http : https;

        method.get(_address, function (res) {

          // 分段返回的 自己拼接
          let html = '';
          // 有数据产生的时候 拼接
          res.on('data', function (chunk) {
            html += chunk;
          })
          // 拼接完成
          res.on('end', function () {
            const $ = cheerio.load(html);
            $('a').each(function () {
              const href = $(this).attr("href");

              if (typeof href === 'string' && hrefArr.indexOf(href) === -1 && href.startsWith("http")) {
                arr.push({
                  text: $(this).text(),
                  href,
                  hasKey: html.indexOf(key) > -1
                })
                hrefArr.push(href);
                hrefArr = Array.from(new Set(hrefArr));
                runner(href, _level--)
              }

            })
          })
        })
      }
      runner(address, level);
    })
  }
  const addrArr = await ru();
  fs.writeFile(`${ makeFileName() }.txt`, JSON.stringify(addrArr), () => { })
}


run("https://movie.douban.com/top250", "水泥", 1)
// await runner(address, level);