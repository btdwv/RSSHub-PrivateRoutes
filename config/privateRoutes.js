{
  "copymanga": {
    "routes": {
      "/author/:id": {
        "path": "/author/:id",
        "categories": ["anime"],
        "example": "/copymanga/author/hiroyuki",
        "parameters": {
          "id": "作者ID"
        },
        "features": {
          "requireConfig": false,
          "requirePuppeteer": true,
          "antiCrawler": false,
          "supportBT": false,
          "supportPodcast": false,
          "supportScihub": false
        },
        "name": "作者作品",
        "maintainers": ["btdwv"],
        "location": "author.ts",
        "module": () => import('@/routes/copymanga/author.ts')
      },
      "/comic/:id/:chapterCnt?": {
        "path": "/comic/:id/:chapterCnt?",
        "categories": ["anime"],
        "example": "/copymanga/comic/dianjuren/5",
        "parameters": {
          "id": "漫画ID",
          "chapterCnt": "返回章节的数量，默认为 `10`"
        },
        "features": {
          "requireConfig": false,
          "requirePuppeteer": false,
          "antiCrawler": false,
          "supportBT": false,
          "supportPodcast": false,
          "supportScihub": false
        },
        "name": "漫画更新",
        "maintainers": ["btdwv", "marvolo666", "yan12125"],
        "location": "comic.ts",
        "module": () => import('@/routes/copymanga/comic.ts')
      }
    },
    "name": "拷贝漫画",
    "url": "copymanga.com",
    "lang": "zh-CN"
  },
  "suwayomi-server": {
    "routes": {
      "/manga/:id": {
        "path": "/manga/:id",
        "categories": ["anime"],
        "example": "/suwayomi-server/manga/3909",
        "parameters": {
          "id": "漫画ID"
        },
        "features": {
          "requireConfig": false,
          "requirePuppeteer": false,
          "antiCrawler": false,
          "supportBT": false,
          "supportPodcast": false,
          "supportScihub": false
        },
        "name": "漫画更新",
        "maintainers": ["btdwv"],
        "location": "manga.ts",
        "module": () => import('@/routes/suwayomi-server/manga.ts')
      }
    },
    "name": "Suwayomi-Server",
    "url": "Suwayomi-Server.com"
  },
  "zaimanhua": {
    "routes": {
      "/comic/:comic_py/:chapterCnt?": {
        "path": "/comic/:comic_py/:chapterCnt?",
        "categories": ["anime"],
        "example": "/zaimanhua/comic/zujiejineng/10",
        "parameters": {
          "comic_py": "漫画拼音",
          "chapterCnt": "返回章节的数量，默认为 `10`"
        },
        "features": {
          "requireConfig": false,
          "requirePuppeteer": false,
          "antiCrawler": false,
          "supportBT": false,
          "supportPodcast": false,
          "supportScihub": false
        },
        "name": "漫画更新",
        "maintainers": ["btdwv"],
        "location": "comic.ts",
        "module": () => import('@/routes/zaimanhua/comic.ts')
      }
    },
    "name": "再漫画",
    "url": "manhua.zaimanhua.com"
  }
}
