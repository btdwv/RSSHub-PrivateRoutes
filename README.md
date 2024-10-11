# RSSHub-PrivateRoutes
介绍如何给RSSHub添加私有路由

## 开发
参考RSSHub的介绍文档进行开发，写好脚本并构建

## 复制配置
打开/app/assets/build/routes.json，将自己添加的脚本配置找出来，单独复制到config/privateRoutes.json中  
将自己的脚本文件夹复制到config/privateRoutes中

## 修改docker启动命令
参考rss.yml的写法，将config文件夹映射到容器里  
启动时先运行addPrivateRoutes.js，将私有路由的配置合并进去，再启动rsshub

```
    env_file:
      - /share/DockerConfig/rss/rsshub/rsshub.env
    volumes:
      - /share/DockerConfig/rss/rsshub:/config  
    command:
      - sh
      - -c
      - |
        node /config/addPrivateRoutes.js
        npm run start
```

## 私有路由介绍

文件名|用途
-|-
suwayomi-server/manga.ts     |  给suwayomi生成rss
copymanga/author.ts          |  给拷贝漫画的作者页面生成rss，方便检查作者有没有新作品
coymanga/comic_puppeteer.ts  |  通过puppeteer解析拷贝漫画的章节目录页面，生成rss
zaimanhua/comic.ts           |  再漫画的rss脚本(注意: 需要在环境变量文件rsshub.env设置用户名、密码)
