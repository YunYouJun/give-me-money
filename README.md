# give-me-money

> Just for fun.

[![GitHub Actions](https://github.com/YunYouJun/give-me-money/workflows/GitHub%20Pages/badge.svg)](https://github.com/YunYouJun/give-me-money/actions)

> Rewrite with Vite + Vue@3 + TypeScript.

我很可爱，请给我钱。

I'm so cute. Please give me money.

## About

这是自己几年前 Parcel 刚出的时候，写[Parcel.js + Vue 搭建笔记](https://www.yunyoujun.cn/note/vue-parcel-demo/)（已使用 Vite + Vue3 + TypeScript 重构），拿来练手的小玩意儿。所以代码很丑，也没做啥后端校验。因为之前 API 次数被人恶意刷完了，所以重置了数据，现在改为登录云乐坊账号后才能提交。

乐呵乐呵完事了，站点数据现在写入云乐坊同一个 CloudBase 环境。

大家要想打钱，也不用给我打，有现成的 [联合国儿童基金会](https://www.unicef.cn/)。

~~[要是真想给我打钱，也不是不行，哼！](https://sponsors.yunyoujun.cn)~~

最后，欧尼酱，da i su ki。 （网页声音预警，看到有欧尼酱说不小心社会性死亡了。）

---

![give-me-money](https://github.com/YunYouJun/give-me-money/blob/master/public/example.jpg?raw=true)

此前看到的一个图，出处不可考，觉得很有趣，就试着用网页实现了下。

- GitHub: <https://github.com/YunYouJun/give-me-money>
- 预览地址: <https://yunyoujun.github.io/give-me-money/>

## Feature

- 国际化
- 表单校验
- 可爱的出错提示
- 记录每个大哥哥的账号并展示

## Base

- ~~[Parcel](https://parceljs.org)~~
- [Vite](https://vitejs.dev/)
- ~~[Vue](https://vuejs.org)~~
- [Vue3](https://v3.vuejs.org)
- ~~[Vuex](https://vuex.vuejs.org)~~
- [Pinia](https://pinia.esm.dev/)
- [iconify](https://iconify.design/)
- ~~[Element](https://github.com/ElemeFE/element/)~~
- ~~[Element-Plus](https://github.com/element-plus/element-plus/)~~
- ~~[element-theme-ink](https://github.com/YunYouJun/element-theme-ink/)~~
- Local Vue UI components
- [vue-i18n](https://github.com/intlify/vue-i18n-next)
- [TypeScript](https://www.typescriptlang.org/)

## Storage

采用 [CloudBase](https://cloudbase.net/) 存储，并通过云乐坊统一账号同步登录态。

> 虽然至今都没有一个真的啊！摔！

## Audio

话说这个音频，有识之士（~~绅士~~）应该都有所耳闻。(~~笑~~)

我不是，我没有。

## Use

```sh
git clone https://github.com/YunYouJun/give-me-money.git
cd give-me-money
pnpm install
```

复制 `.env.example`，并重命名为 `.env`。

在 `.env` 中填入云乐坊 CloudBase 环境和 publishable access key。

```sh
VITE_CLOUDBASE_ENV_ID=yunlefun-8g7ybcxc7345c490
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=xxxxxxx
VITE_YUNLE_SSO_ORIGIN=https://www.yunle.fun
VITE_YUNLE_APP_AUTH_ORIGIN=https://apps.yunle.fun
VITE_GMM_APP_ID=give-me-money
```

网页登录走 `www.yunle.fun` SSO；云乐坊 App 内打开时优先走 `apps.yunle.fun`
注入的 `window.ylf.getAuthCode({ scope: ['profile', 'cloudbase:session'] })`，
兑换到 CloudBase session 后再调用 Web SDK `auth.setSession()`。

需要在云乐坊 SSO / JSAPI Auth allowlist 中允许以下来源：

- `https://gmm.yunle.fun`
- `http://localhost:2333`
- `http://127.0.0.1:2333`

### 运行

```sh
pnpm run dev
# http://localhost:2333
```

端口号当然是 `2333` 啦~
