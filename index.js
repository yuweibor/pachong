'use strict';
const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');
https.get('https://movie.douban.com/top250', function (res) {
  // 分段返回的 自己拼接
  let html = '';
  // 有数据产生的时候 拼接
  res.on('data', function (chunk) {
    html += chunk;
  })
  // 拼接完成
  res.on('end', function () {
    const $ = cheerio.load(html);
    let allFilms = [];
    $('li .item').each(function () {
      // this 循环时 指向当前这个电影
      // 当前这个电影下面的title
      // 相当于this.querySelector 
      const title = $('.title', this).text();
      const star = $('.rating_num', this).text();
      const pic = $('.pic img', this).attr('src');
      // console.log(title,star,pic);
      // 存 数据库
      // 没有数据库存成一个json文件 fs
      allFilms.push({
        title, star, pic
      })
    })
    fs.writeFile("a.txt", JSON.stringify(allFilms), () => { })
  })
})