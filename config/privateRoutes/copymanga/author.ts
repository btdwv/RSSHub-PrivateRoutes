import { Route } from "@/types";
import cache from "@/utils/cache";
import { load } from "cheerio";
import { config } from "@/config";
import puppeteer from "puppeteer";

export const route: Route = {
  path: "/author/:id",
  categories: ["anime"],
  example: "/copymanga/author/hiroyuki",
  parameters: { id: "作者ID" },
  features: {
    requireConfig: false,
    requirePuppeteer: true,
    antiCrawler: false,
    supportBT: false,
    supportPodcast: false,
    supportScihub: false,
  },
  name: "作者作品",
  maintainers: ["btdwv"],
  handler,
};

async function handler(ctx) {
  const id = ctx.req.param("id");
  let authorName = "";

  const strBaseUrl = "https://mangacopy.com";
  const strPageUrl = `${strBaseUrl}/author/${id}/comics`;
  
  const strProxy = "https://xxxxx.username.workers.dev/";
  const strProxyPageUrl = `${strProxy}${strPageUrl}`;//通过cloudflare搭建的代理 https://github.com/gaboolic/cloudflare-reverse-proxy  https://github.com/1234567Yang/cf-proxy-ex
  
  const fetchChaptorxData = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(strPageUrl);
    const html = await page.evaluate(
      () => document.querySelector("body").innerHTML
    );
    browser.close();
    const $ = load(html);
    const bookUrls = $("div[class='correlationItem-txt'] > a");
    const bookNames = $("div[class='correlationItem-txt'] > a > p");
    authorName = $("div[class='correlation-title-top'] h4 span")
      .text()
      .match(/\[(.*?)]/)[1];
    const covers = $(
      "div[class='correlationItem-img loadingIcon hoverImage'] a img"
    );
    const count = bookUrls.length;

    const items = [];
    for (let i = 0; i < count; i++) {
      const listItem = {};
      listItem.link = strBaseUrl + bookUrls[i].attribs.href.replace(strProxy, "").replace(strBaseUrl, "");
      listItem.title = bookNames[i].attribs.title;
      listItem.description = `<img src=${covers[i].attribs.src.replace(strProxy, "")}></img>`.trim();
      listItem.author = authorName;
      items.push(listItem);
    }
    return items;
  };

  const chapterArray = await cache.tryGet(
    strPageUrl,
    fetchChaptorxData,
    config.cache.routeExpire,
    false
  );

  return {
    title: `拷贝漫画 - [${authorName}] 相关作品`,
    link: String(strPageUrl),
    description: `[${authorName}] 相关作品`,
    item: chapterArray,
  };
}
