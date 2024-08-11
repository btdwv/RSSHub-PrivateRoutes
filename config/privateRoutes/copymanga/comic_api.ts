import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import asyncPool from 'tiny-async-pool';

export const route: Route = {
    path: '/comic/:id/:chapterCnt?',
    categories: ['anime'],
    example: '/copymanga/comic/dianjuren/5',
    parameters: { id: '漫画ID', chapterCnt: '返回章节的数量，默认为 `10`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '漫画更新',
    maintainers: ['btdwv', 'marvolo666', 'yan12125'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    // 用于控制返回的章节数量
    const chapterCnt = Number(ctx.req.param('chapterCnt') || 10);
    // 直接调用拷贝漫画的接口
    const host = 'mangacopy.com';//为了跟自己的版本保持一致，将地址改为mangacopy.com
    const baseUrl = `https://${host}`;
    const apiBaseUrl = `https://api.${host}`;
    const strBaseUrl = `${apiBaseUrl}/api/v3/comic/${id}/group/default/chapters`;
    const iReqLimit = 500;
    // 获取漫画列表
    const chapterArray = await cache.tryGet(
        strBaseUrl,
        async () => {
            let bHasNextPage = false;
            let chapters = [];
            let iReqOffSet = 0;

            do {
                bHasNextPage = false;
                // eslint-disable-next-line no-await-in-loop
                const { data } = await got(strBaseUrl, {
                    headers: {
                        platform: 1,
                    },
                    searchParams: {
                        limit: iReqLimit,
                        offset: iReqOffSet,
                    },
                });
                const { code, results } = data;

                if (code !== 200) {
                    break;
                }

                if (results.limit + results.offset < results.total) {
                    bHasNextPage = true;
                }
                iReqOffSet += iReqLimit;

                chapters = [...chapters, ...results.list];
            } while (bHasNextPage);

            chapters = chapters
                .map(({ comic_path_word, uuid, name, size, datetime_created, ordered /* , index*/ }) => ({
                    link: `${baseUrl}/comic/${comic_path_word}/chapter/${uuid}`,
                    guid: `${baseUrl}/comic/${comic_path_word}/chapter/${uuid}`,
                    uuid,
                    title: name,
                    size,
                    pubDate: parseDate(datetime_created, 'YYYY-MM-DD'),
                    ordered,
                    // index,
                }))
                .sort((a, b) => b.ordered - a.ordered);

            return chapters;
        },
        config.cache.routeExpire,
        false
    );

    // 获取漫画标题、介绍
    const { bookTitle, bookIntro } = await cache.tryGet(`${baseUrl}/comic/${id}`, async () => {
        const { data } = await got(`${baseUrl}/comic/${id}`);
        const $ = load(data);
        return {
            bookTitle: $('.comicParticulars-title-right > ul > li > h6').text(),
            bookIntro: $('.intro').text(),
        };
    });

    const genResult = async (chapter) => {
        const {
            data: { code, results },
        } = await got(`${apiBaseUrl}/api/v3/comic/${id}/chapter/${chapter.uuid}`, {
            headers: {
                webp: 1,
            },
        });

        const contents =
            code === 210
                ? [] // Request was throttled. Expected available in x seconds.
                : results.chapter.contents.map((content) => ({ url: content.url.replace('.c800x.', '.c1500x.') }));

        return {
            link: chapter.link,
            title: chapter.title,
            description: `
            <h1>${chapter.title}</h1>
        `.trim(),
            //description: art(path.join(__dirname, './templates/comic.art'), { //为了跟自己的版本保持一致，将描述改为标题
            //    size: chapter.size,
            //    contents,
            //}),
            //pubDate: chapter.pubDate,//为了跟自己的版本保持一致，去掉了pubDate
        };
    };

    const asyncPoolAll = async (...args) => {
        const results = [];
        for await (const result of asyncPool(...args)) {
            results.push(result);
        }
        return results;
    };

    const result = await asyncPoolAll(3, chapterArray.slice(0, chapterCnt), (chapter) => cache.tryGet(chapter.link, () => genResult(chapter)));
    const items = [...result, ...chapterArray.slice(chapterCnt)];

    return {
        title: `拷贝漫画 - ${bookTitle}`,
        link: `${baseUrl}/comic/${id}`,
        description: bookIntro,
        item: items,
    };
}
