# give-me-money

> Just for fun.

[![GitHub Actions](https://github.com/YunYouJun/give-me-money/workflows/GitHub%20Pages/badge.svg)](https://github.com/YunYouJun/give-me-money/actions)

> Rewrite with Vite + Vue@3 + TypeScript.

我很可爱，请给我钱。

I'm so cute. Please give me money.

## About

这是自己几年前 Parcel 刚出的时候，写[Parcel.js + Vue 搭建笔记](https://www.yunyoujun.cn/note/vue-parcel-demo/)（已使用 Vite + Vue3 + TypeScript 重构），拿来练手的小玩意儿。所以代码很丑，也没做啥后端校验。 因为之前 API 次数被人恶意刷完了，所以重置了数据，现在加了邮箱验证才能提交。

乐呵乐呵完事了，我本身也是白嫖的 LeanCloud 的开发版，刷数据最多也就到 LeanCloud 的每日上限。

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
- [Vuex](https://vuex.vuejs.org)
- [iconify](https://iconify.design/)
- ~~[Element](https://github.com/ElemeFE/element/)~~
- [Element-Plus](https://github.com/element-plus/element-plus/)
- [element-theme-ink](https://github.com/YunYouJun/element-theme-ink/)
- [vue-i18n](https://github.com/intlify/vue-i18n-next)
- [TypeScript](https://www.typescriptlang.org/)

## Storage

采用 [LeanCloud](https://leancloud.cn/) 存储 （大家留给我的支付宝帐号，大概是能看到的~）

> 虽然至今都没有一个真的啊！摔！

## Audio

话说这个音频，有识之士（~~绅士~~）应该都有所耳闻。(~~笑~~)

我不是，我没有。

## Use

```sh
git clone https://github.com/YunYouJun/give-me-money.git
cd give-me-money
npm install
```

复制 `.env.example`，并重命名为 `.env`。

在 `.env` 中填入你在 [LeanCloud](https://leancloud.app) 创建的应用的 `appID` 与 `appKey`。

```sh
VITE_APP_ID=xxxxxxx
VITE_APP_KEY=xxxxxxx
# 只有国内版 LeanCloud 需要填写，所以更推荐直接使用国际版
# VITE_SERVER_URL=https://xxx.example.com
```

### 运行

```sh
npm run dev
# http://localhost:2333
```

端口号当然是 `2333` 啦~
