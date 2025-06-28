{
  "copymanga": {
    "routes": {
      "/author/:id": {
        "path": "/author/:id",
        "categories": [
          "anime"
        ],
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
        "maintainers": [
          "btdwv"
        ],
        "location": "author.ts",
        "module": () => import('@/routes/copymanga/author.ts')
      },
      "/comic2/:id/:chapterCnt?": {
        "path": "/comic2/:id/:chapterCnt?",
        "categories": [
          "anime"
        ],
        "example": "/copymanga/comic2/dianjuren/5",
        "parameters": {
          "id": "漫画ID",
          "chapterCnt": "返回章节的数量，默认为 `10`"
        },
        "features": {
          "requireConfig": false,
          "requirePuppeteer": true,
          "antiCrawler": false,
          "supportBT": false,
          "supportPodcast": false,
          "supportScihub": false
        },
        "name": "漫画更新",
        "maintainers": [
          "btdwv"
        ],
        "location": "comic2.ts",
        "module": () => import('@/routes/copymanga/comic2.ts')
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
        "categories": [
          "anime"
        ],
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
        "maintainers": [
          "btdwv"
        ],
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
        "categories": [
          "anime"
        ],
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
        "maintainers": [
          "btdwv"
        ],
        "location": "comic.ts",
        "module": () => import('@/routes/zaimanhua/comic.ts')
      }
    },
    "name": "再漫画",
    "url": "manhua.zaimanhua.com"
  },
  "manhuagui": {
    "routes": {
      "/comic2/:id/:chapterCnt?": {
        "path": [
          "/comic2/:id/:chapterCnt?",
          "/:domain?/comic2/:id/:chapterCnt?"
        ],
        "categories": [
          "anime"
        ],
        "example": "/manhuagui/comic2/22942/5",
        "parameters": {
          "id": "漫画ID",
          "chapterCnt": "返回章节的数量，默认为0，返回所有章节"
        },
        "features": {
          "requireConfig": false,
          "requirePuppeteer": false,
          "antiCrawler": true,
          "supportBT": false,
          "supportPodcast": false,
          "supportScihub": false
        },
        "radar": [
          {
            "source": [
              "www.mhgui.com/comic/:id/"
            ],
            "target": "/comic2/:id"
          }
        ],
        "name": "漫画更新",
        "maintainers": [
          "MegrezZhu"
        ],
        "location": "comic2.ts",
        "module": () => import('@/routes/manhuagui/comic2.ts')
      },
      "/:domain?/comic2/:id/:chapterCnt?": {
        "path": [
          "/comic2/:id/:chapterCnt?",
          "/:domain?/comic2/:id/:chapterCnt?"
        ],
        "categories": [
          "anime"
        ],
        "example": "/manhuagui/comic2/22942/5",
        "parameters": {
          "id": "漫画ID",
          "chapterCnt": "返回章节的数量，默认为0，返回所有章节"
        },
        "features": {
          "requireConfig": false,
          "requirePuppeteer": false,
          "antiCrawler": true,
          "supportBT": false,
          "supportPodcast": false,
          "supportScihub": false
        },
        "radar": [
          {
            "source": [
              "www.mhgui.com/comic/:id/"
            ],
            "target": "/comic2/:id"
          }
        ],
        "name": "漫画更新",
        "maintainers": [
          "MegrezZhu"
        ],
        "location": "comic2.ts",
        "module": () => import('@/routes/manhuagui/comic2.ts')
      }
    },
    "name": "看漫画",
    "apiRoutes": {},
    "url": "www.manhuagui.com",
    "lang": "zh-CN"
  }
}