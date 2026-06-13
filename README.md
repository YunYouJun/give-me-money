English | [简体中文](./README.zh-CN.md)

# give-me-money

> I'm so cute. Please give me money.

[![GitHub Actions](https://github.com/YunYouJun/give-me-money/workflows/GitHub%20Pages/badge.svg)](https://github.com/YunYouJun/give-me-money/actions)

A playful web prank that started as a Parcel demo and has since moved to Vite + Vue 3 + TypeScript.

The production site only keeps the browser-side prank experience. It does not submit or store account names, passwords, payment PINs, or other sensitive input. After YunLeFun sign-in, the page writes only a one-time user marker and the public counter choice; comments are handled on the YunLeFun app page.

## Preview

- Primary: <https://gmm.yunle.fun/>
- Backup: <https://gmm.yunyoujun.cn/>
- GitHub Pages: <https://yunyoujun.github.io/give-me-money/>
- GitHub: <https://github.com/YunYouJun/give-me-money>

![give-me-money](https://github.com/YunYouJun/give-me-money/blob/master/public/example.jpg?raw=true)

I once saw this image somewhere, could not trace its source, and rebuilt the joke as a web page because it was funny.

## Features

- Internationalization
- Form validation
- Light and dark themes
- Cute error messages
- Local prank dialog without storing sensitive input
- Public CloudBase counters after YunLeFun sign-in, limited to one submission per user
- YunLeFun comment entry

## Tech Stack

- [Vite](https://vitejs.dev/)
- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/)
- [vue-i18n](https://github.com/intlify/vue-i18n-next)
- [Iconify](https://iconify.design/)
- [CloudBase JS SDK](https://docs.cloudbase.net/api-reference/webv3/initialization)
- Local Vue UI components

Migration history:

- ~~[Parcel](https://parceljs.org)~~ -> [Vite](https://vitejs.dev/)
- ~~[Vue 2](https://v2.vuejs.org/)~~ -> [Vue 3](https://vuejs.org/)
- ~~[Vuex](https://vuex.vuejs.org/)~~ -> [Pinia](https://pinia.vuejs.org/)
- ~~[Element](https://github.com/ElemeFE/element/)~~ / ~~[Element Plus](https://github.com/element-plus/element-plus/)~~ -> Local Vue UI components

## Data And Privacy

The app uses [CloudBase](https://cloudbase.net/) for public counters and one-time user submission markers. The production site writes only the counter choice and current signed-in user marker; it does not store account, password, or PIN form input.

Two collections are needed:

- `counters/ok`: public accept count with `name: "ok"` and `time: number`
- `counters/no`: public reject count with `name: "no"` and `time: number`
- `counter_votes/{uid}`: one-time user marker with `uid`, `counterName`, and `createdAt`

Enable a CloudBase Web sign-in provider, then configure `counters` and `counter_votes` so signed-in users can write the required documents. The frontend creates `counter_votes/{uid}` and increments the public counter in one transaction; if the marker already exists, it does not count again. The old `pay_records` collection should be deleted or blocked to avoid retaining historical sensitive fields.

If you want to donate money, [UNICEF China](https://www.unicef.cn/) is a better place to send it.

~~[But if you really want to sponsor me, well...](https://www.yunyoujun.cn/sponsors/)~~

## Audio Notice

The page plays audio. Check your volume before opening it in public.

## Local Development

```sh
git clone https://github.com/YunYouJun/give-me-money.git
cd give-me-money
pnpm install
cp .env.example .env
```

Fill `.env` with the YunLeFun CloudBase environment and publishable access key used to read counters and write them after sign-in. The app comment URL can be overridden when needed.

```sh
VITE_CLOUDBASE_ENV_ID=yunlefun-8g7ybcxc7345c490
VITE_CLOUDBASE_REGION=ap-shanghai
VITE_CLOUDBASE_ACCESS_KEY=xxxxxxx
VITE_GMM_COMMENTS_URL=https://apps.yunle.fun/app/give-me-money
```

Start the dev server:

```sh
pnpm run dev
# http://localhost:2333
```
