const cheerio = require('cheerio')
const getBrowser = require('./browser')
const cache = require("./cache");

function getURLs(content) {
  try {
    const $ = cheerio.load(content);

    const list = [];

    $("article").each((i, el) => {
      $(el).find('img').each((i, el2) => {
        const link = $(el2).attr("src");
        list.push(link);
      });
    });

    return list;
  } catch (e) {
    console.log(e);
  }
}

async function getInstagramUrl(arg) {
  let url_set;
  const url_dataset = require("../url.json");
  if (arg == "bts") {
    url_set = url_dataset.BTS;
  } else if (arg == "constellation") {
    url_set = url_dataset.constellation;
  } else if (arg == "girl") {
    url_set = url_dataset.girl;
  } else if (arg == "food") {
    url_set = url_dataset.food;
  } else {
    const keys = Object.keys(url_dataset);
    const key = keys[Math.floor((Math.random() * keys.length))];
    arg = key;
    url_set = url_dataset[key];
  }

  let list = cache.get(arg);
  if (list === undefined) {
    console.log(arg, " is not in cache.");

    list = [];
    const browser = await getBrowser();

    for (let i = 0; i < url_set.length; i++) {
      const url = url_set[i];
      const page = await browser.newPage();
      await page.goto(url);
      page.evaluate(_ => {
        window.scrollBy(0, window.innerHeight * 10);
      });

      const content = await page.content();
      page.close();

      const newList = getURLs(content);
      list = [...list, ...newList];
    }

    cache.set(arg, list);
    console.log(list)
  } else {
    console.log(arg, " is in cache.");
    console.log(list)
  }

  return list[Math.floor((Math.random() * list.length))];
}

module.exports = getInstagramUrl;