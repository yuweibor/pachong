"use strict";
var Crawler = require("crawler");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const fs = require("fs");
const cheerio = require("cheerio");
const moment = require("moment");
const { log } = require("console");
const getDayRange = (days) => {
  const dayRange = [];
  for (let i = 0; i < days; i++) {
    const newDay = moment().subtract(i, "days").format("YYYY-MM-DD");
    dayRange.push(newDay);
  }
  return dayRange;
};

let visitedUrl = new Set();

var crawl = new Crawler({
  rateLimit: 0,
  maxConnections: 10,
  timeout:4000,
});

const axios = (url) => new Promise((r, j) => {
  crawl.queue([
    {
      uri: url,
      jQuery: false,
      callback: (err, res, done) => {
        if (err) {
          j(err);
        } else {
          r(res.body);
        }
        done();
      },
    },
  ]);
});

const run = (url, keys, fileName, days) => {
  let resultCount = 0;
  let count = 0;
  //清理旧文件
  if (fileName) fs.rm(fileName, () => {});
  fs.rm("error.txt", () => {});
  fs.rm("url.txt", () => {});
  const dayRange = getDayRange(days);
  const runner = async (url) => {
    if (typeof url === "string" && (visitedUrl.has(url.split('//')[1]) || url.substring(url.length-4,url.length)==='.pdf')) {
      return;
    }
    fs.appendFileSync("url.txt", `${url}\n`);
    visitedUrl.add(url.split('//')[1]);
    log(++count, url);
    axios(url)
      .then((html) => {
        if (typeof html !== "string") return;
        const inDayRange = dayRange.filter((s) => {
          return html.includes(s);
        });
        const hasKey = keys.filter((s) => {
          return html.includes(s);
        });
        if (hasKey.length && inDayRange.length) {
          fs.appendFileSync(
            fileName,
            `\n${++resultCount}-----网址: ${url}\n
               --关键词:${hasKey.join("、")}--\n
               --日期:${inDayRange.join("、")}--\n
          `
          );
        }
        const $ = cheerio.load(html);
        $("a").each(async function () {
          const href = $(this).attr("href");
          if (
            typeof href === "string" &&
            (!href.includes("/") || href.includes("english"))
          ) {
            return;
          }
          const absUrl = new URL(href, url).href;
          
          runner(absUrl);
        });
      })
      .catch((e) => {
        console.log("err", e.message, e.name);
        fs.appendFileSync(
          "error.txt",
          `error--${url}\n${e.message}\n ${url.protocol}\n`
        );
        return;
      });
  };

  runner(url);
};

const init = () => {
  let days = null;
  rl.question("how many days?", (e2) => {
    days = e2;
    rl.close();
    //网址 /关键词/文件名/最近多少天
    run("http://www.gov.cn", ["水泥"], "result.txt", days);
    // run("http://www.gov.cn", ["水泥", "错峰生产", "环保督察", "产能过剩", "转型升级", "技改", "绿色建材产业园", "绿色工厂", "智能制造"], "a.txt", days, buffer)
  });
};
init();
