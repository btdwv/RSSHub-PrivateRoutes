import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import dayjs from 'dayjs';
import { config } from '@/config';

export const route: Route = {
    path: '/comic/:comic_py/:chapterCnt?',
    categories: ['anime'],
    example: '/zaimanhua/comic/zujiejineng/10',
    parameters: { comic_py: '漫画拼音', chapterCnt: '返回章节的数量，默认为 `10`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '漫画更新',
    maintainers: ['btdwv'],
    handler,
};

async function handler(ctx) {
    const comic_py = ctx.req.param('comic_py');// 漫画拼音
    // const chapterCnt = Number(ctx.req.param('chapterCnt') || 10);// 用于控制返回的章节数量

    const site = "zaimanhua.com";
    const baseUrl = `https://manhua.${site}`;
    // const apiUrl = `https://v4api.${site}/app/v1`;// 如果知道漫画Id，可以通过接口 https://v4api.zaimanhua.com/app/v1/comic/detail/{漫画Id} 获取漫画信息
    const accountApiUrl = `https://account-api.${site}/v1`;
    const comicUrl = `${baseUrl}/api/v1/comic1/comic/detail?comic_py=${comic_py}`;

    // 将用户名、密码的MD5写到配置文件里，docker启动时把配置文件设为环境变量，脚本可以从环境变量获取到可用的用户名、密码
    const username = process.env.ZAIMANHUA_USERNAME || "";// 用户名
    const password = process.env.ZAIMANHUA_PASSWORD || "";// 密码的MD5(小写)
    let token = process.env.ZAIMANHUA_TOKEN || "";// Token

    const getRandom24DigitNumberInRange = () => {
        const min = BigInt('100000000000000000000000');
        const max = BigInt('999999999999999999999999');
        const randomNum = min + BigInt(Math.floor(Math.random() * Number(max - min)));
        return randomNum.toString();
    };

    const fetchComicDetail = async () => {
        const header = {};
        if (token !== "") {
            header.authorization = `Bearer ${token}`;
        }
        const {  data } = await got({
            method: 'get',
            url: comicUrl,
            headers: header
        });

        if (isGetComicDetailSuccess(data) === false) {
            return null;
        }
        return data;
    };

    const getToken = async (sUsername, sPassword) => {
        if (sUsername === "" || sPassword === "") {
            return "";
        }

        const sRandNum = getRandom24DigitNumberInRange();
        const sContentType = `multipart/form-data; boundary=--------------------------${sRandNum}`;
        const sReqBody = `----------------------------${sRandNum}\r\nContent-Disposition: form-data; name="username"\r\n\r\n${sUsername}\r\n----------------------------${sRandNum}\r\nContent-Disposition: form-data; name="passwd"\r\n\r\n${sPassword}\r\n----------------------------${sRandNum}--`;

        const {  data } = await got({
            method: 'post',
            url: `${accountApiUrl}/login/passwd`,
            body: sReqBody,
            headers: {
                "Content-Type": sContentType
            }
        });

        if (typeof data !== 'object'  || data === null || data.errno !== 0) {
            return "";
        }
        return data.data.user.token;
    };

    const isTokenAvailable = async (token) => {
        if (token === "") {
            return false;
        }

        const {  data } = await got({
            method: 'get',
            url: `${accountApiUrl}/userInfo/get`,
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        if (typeof data !== 'object'  || data === null || data.errno !== 0) {
            return false;
        }
        return true;
    };

    const isGetComicDetailSuccess = (comicDetail) => {
        // 漫画不存在 时，错误码是2
        // 漫画被隐藏且token失效时，错误码是2
        if (typeof comicDetail !== 'object'  || comicDetail === null || comicDetail.errno !== 0 || comicDetail.data === null) {
            return false;
        }
        return true;
    }

    let comicDetail = await cache.tryGet(comicUrl, fetchComicDetail, config.cache.routeExpire, false);
    if (await isGetComicDetailSuccess(comicDetail) === false) {
        // 获取失败，可能是token失效，或漫画不存在
        if (await isTokenAvailable(token) === true) {
            return null;// Token可用，说明漫画不存在
        }

        token = await getToken(username, password);
        if (token === "") {
            return null;// 获取Token失败了
        }
        process.env.ZAIMANHUA_TOKEN = token;// 把能用的Token设置到环境变量

        // 获取了新的Token，重试一次
        cache.set(comicUrl, "", 0);// 清空缓存
        comicDetail = await cache.tryGet(comicUrl, fetchComicDetail, config.cache.routeExpire, false);
        if (await isGetComicDetailSuccess(comicDetail) === false) {
            return null;
        }
    }

    const comicInfo = comicDetail.data.comicInfo;
    const comicId = comicInfo.id; // 漫画Id
    const sTitle = comicInfo.title; // 标题
    const sDescription = comicInfo.description; // 简介
    const sAuthor = comicInfo.authorInfo.authorName; // 作者
    const sSource = "再漫画"; // 网站名称
    const pageUrl = `${baseUrl}/info/${comic_py}.html`;

    const generateChapterList = async (chapterList) => {
        // chapterList是个数组，第一个元素是连载的话，第2个元素是单行本的卷
        const chapterMap = {};
        for (const chapterListItem of chapterList) {
            for (const element of chapterListItem.data) {
                const chapterItem = element;
                const listItem = {};
                listItem.title = chapterItem.chapter_title;
                listItem.author = sAuthor;
                listItem.pubDate = dayjs(chapterItem.updatetime * 1000 || 0).format('YYYY-MM-DD HH:mm:ss');
                listItem.link = `${baseUrl}/view/${comic_py}/${comicId}/${chapterItem.chapter_id}`;
                listItem.guid = `${comic_py}/${comicId}/${chapterItem.chapter_id}`;
                listItem.description = `<a href="${listItem.link}">${listItem.title}</a>`;
                chapterMap[chapterItem.chapter_order] = listItem;
            }
        }

        const unsortedArray = Object.entries(chapterMap);//对象转换成array
        const sortedArray = unsortedArray.sort((a, b) => b[0] - a[0]);//按照章节顺序，从大到小排序
        return sortedArray.map(entry => entry[1]);// 排序后只保留值
    };

    const chapterList = await generateChapterList(comicInfo.chapterList);
    // const chapterListTmp = chapterList.slice(0, chapterCnt);// 只保留前10个元素
    return {
        title: sTitle + ' - ' + sSource,
        description: sDescription,
        link: pageUrl,
        item: chapterList
    };
}
