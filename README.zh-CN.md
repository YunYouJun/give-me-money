[English](./README.md) | 简体中文

# give-me-money

> 我很可爱，请给我钱。  
> I'm so cute. Please give me money.

[![GitHub Actions](https://github.com/YunYouJun/give-me-money/workflows/GitHub%20Pages/badge.svg)](https://github.com/YunYouJun/give-me-money/actions)

一个从 Parcel 时代小练手一路迁移到 Vite + Vue 3 + TypeScript 的网页恶作剧。

主站只保留浏览器里的恶作剧效果：不会真实提交账号、密码、交易密码，也不会保存这些敏感输入。登录云乐坊后，页面只会写入一次性用户提交标记和公共计数选择；评论互动统一放到云乐坊应用页。

## 访问

- 主预览：<https://gmm.yunle.fun/>
- 备用预览：<https://gmm.yunyoujun.cn/>
- GitHub Pages：<https://yunyoujun.github.io/give-me-money/>
- GitHub：<https://github.com/YunYouJun/give-me-money>

![give-me-money](https://github.com/YunYouJun/give-me-money/blob/master/public/example.jpg?raw=true)

此前看到的一个图，出处不可考，觉得很有趣，就试着用网页实现了下。

## 功能

- 国际化
- 表单校验
- 明暗主题
- 可爱的出错提示
- 不保存敏感输入的本地恶作剧弹窗
- 登录云乐坊后的 CloudBase 公共计数，单个用户只能提交一次
- 云乐坊评论入口

## 技术栈

- [Vite](https://vitejs.dev/)
- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/)
- [vue-i18n](https://github.com/intlify/vue-i18n-next)
- [Iconify](https://iconify.design/)
- [CloudBase JS SDK](https://docs.cloudbase.net/api-reference/webv3/initialization)
- Local Vue UI components

历史迁移：

- ~~[Parcel](https://parceljs.org)~~ -> [Vite](https://vitejs.dev/)
- ~~[Vue 2](https://v2.vuejs.org/)~~ -> [Vue 3](https://vuejs.org/)
- ~~[Vuex](https://vuex.vuejs.org/)~~ -> [Pinia](https://pinia.vuejs.org/)
- ~~[Element](https://github.com/ElemeFE/element/)~~ / ~~[Element Plus](https://github.com/element-plus/element-plus/)~~ -> Local Vue UI components

## 数据与隐私

采用 [CloudBase](https://cloudbase.net/) 记录公共计数和一次性用户提交标记。主站只写入计数选择和当前登录用户标记，不保存账号、密码或交易密码表单输入。

CloudBase 需要保留以下集合：

- `counters/ok`：公开参与数，包含 `name: "ok"` 与 `time: number`
- `counters/no`：公开拒绝数，包含 `name: "no"` 与 `time: number`
- `counter_votes/{uid}`：一次性用户提交标记，包含 `uid`、`counterName` 与 `createdAt`

启用 CloudBase Web 登录方式，并配置 `counters` 与 `counter_votes` 让登录用户可写入所需文档。前端会在一个事务里创建 `counter_votes/{uid}` 并递增公共计数；如果标记已经存在，就不会重复计数。建议删除或封禁旧的 `pay_records` 集合，避免继续保留敏感字段历史数据。

大家要想打钱，也不用给我打，有现成的 [联合国儿童基金会](https://www.unicef.cn/)。

~~[要是真想给我打钱，也不是不行，哼！](https://www.yunyoujun.cn/sponsors/)~~

> 虽然至今都没有一个真的啊！摔！

## 声音提示

最后，欧尼酱，da i su ki。

网页有声音，公共场合打开前请注意音量。

## 本地开发

```sh
git clone https://github.com/YunYouJun/give-me-money.git
cd give-me-money
pnpm install
cp .env.example .env
```

在 `.env` 中填入云乐坊 CloudBase 环境和 publishable access key，用于读取计数并在登录后写入计数。应用评论页地址可按需覆盖。

```sh
VITE_CLOUDBASE_ENV_ID=yunlefun-8g7ybcxc7345c490
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=xxxxxxx
VITE_GMM_COMMENTS_URL=https://apps.yunle.fun/app/give-me-money
```

运行开发服务器：

```sh
pnpm run dev
# http://localhost:2333
```

端口号当然是 `2333` 啦~
