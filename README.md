# give-me-money

> Just for fun.

[![GitHub Actions](https://github.com/YunYouJun/give-me-money/workflows/GitHub%20Pages/badge.svg)](https://github.com/YunYouJun/give-me-money/actions)

> Rewrite with Vite + Vue@3 + TypeScript.

我很可爱，请给我钱。

I'm so cute. Please give me money.

## About

这是自己几年前 Parcel 刚出的时候，写[Parcel.js + Vue 搭建笔记](https://www.yunyoujun.cn/note/vue-parcel-demo/)（已使用 Vite + Vue3 + TypeScript 重构），拿来练手的小玩意儿。所以代码很丑，也没做啥后端校验。现在主站只保留前端恶作剧效果，不会真实提交或保存账号、密码、交易密码。

乐呵乐呵完事了，历史计数仍从云乐坊同一个 CloudBase 环境只读获取；评论互动统一放到云乐坊评论应用。

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
- 不保存敏感输入的本地恶作剧弹窗

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

采用 [CloudBase](https://cloudbase.net/) 只读历史计数。主站不再登录、不写库、不保存表单输入。

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

在 `.env` 中填入云乐坊 CloudBase 环境和 publishable access key，用于读取历史计数。评论应用地址可按需覆盖。

```sh
VITE_CLOUDBASE_ENV_ID=yunlefun-8g7ybcxc7345c490
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=xxxxxxx
VITE_GMM_COMMENTS_URL=https://apps.yunle.fun
```

CloudBase 只需要保留 `counters` 集合：

- `counters/ok`: 历史参与数
- `counters/no`: 历史拒绝数

建议删除或封禁旧的 `pay_records` 集合，避免继续保留敏感字段历史数据。

### 运行

```sh
pnpm run dev
# http://localhost:2333
```

端口号当然是 `2333` 啦~
