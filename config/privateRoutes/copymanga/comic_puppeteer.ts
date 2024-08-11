import { Route } from "@/types";
import cache from "@/utils/cache";
import { load } from "cheerio";
import { config } from "@/config";
import puppeteer from "puppeteer";

export const route: Route = {
  path: "/comic/:id/:chapterCnt?",
  categories: ["anime"],
  example: "/copymanga/comic/dianjuren/5",
  parameters: { id: "漫画ID", chapterCnt: "返回章节的数量，默认为 `10`" },
  features: {
    requireConfig: false,
    requirePuppeteer: false,
    antiCrawler: false,
    supportBT: false,
    supportPodcast: false,
    supportScihub: false,
  },
  name: "漫画更新",
  maintainers: ["btdwv", "marvolo666", "yan12125"],
  handler,
};

async function handler(ctx) {
  // 漫画ID
  const id = ctx.req.param("id");
  // 用于控制返回的章节数量
  const chapterCnt = Number(ctx.req.param("chapterCnt") || 10);
  const strBaseUrl = "https://mangacopy.com";
  const strPageUrl = `${strBaseUrl}/comic/${id}`;

  const getChapters = ($) =>
    $(".table-default-box > div > div > ul")
      .toArray()
      .reverse()
      .reduce((acc, curr) => acc.concat($(curr).children("a").toArray()), [])
      .map((ele) => {
        const a = $(ele);
        return {
          link: strBaseUrl + a.attr("href"),
          title: a.attr("title"),
        };
      });

  const genResult = (chapter) => ({
    link: chapter.link,
    title: chapter.title,
    description: `
            <h1>${chapter.title}</h1>
        `.trim(),
  });

  let bookTitle = "";
  let bookIntro = "";
  const fetchChaptorxData = async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox"
        // "--disable-http2",
        // "--ssl-version-min=tls1.3",
        // "--ssl-version-max=tls1.3"
      ],
    });
    const page = await browser.newPage();
    await page.goto(strPageUrl);
    const html = await page.evaluate(
      () => document.querySelector("body").innerHTML
    );
    browser.close();
    const $ = load(html);
    bookTitle = $(
      ".comicParticulars-title-right > ul > li:nth-child(1) > h6"
    ).text();
    bookIntro = $(".comicParticulars-synopsis > div:nth-child(2) > p").text();
    // const coverImgSrc = $('.comicParticulars-title-left > div > img').attr('src');
    const chapters = getChapters($);
    chapters.reverse();
    let itemsLen = chapters.length;
    if (chapterCnt > 0) {
      itemsLen = chapterCnt;
    }
    return chapters.map(genResult).slice(0, itemsLen);
  };

  const chapterArray = await cache.tryGet(
    strPageUrl,
    fetchChaptorxData,
    config.cache.routeExpire,
    false
  );

  return {
    title: `拷贝漫画 - ${bookTitle}`,
    link: `${strBaseUrl}/comic/${id}`,
    description: bookIntro,
    item: chapterArray,
  };
}
