# give-me-money

> I'm so cute. Please give me money.

[![Build Status](https://travis-ci.org/YunYouJun/give-me-money.svg?branch=master)](https://travis-ci.org/YunYouJun/give-me-money)

我很可爱，请给我钱。

![give-me-money](https://github.com/YunYouJun/give-me-money/blob/master/src/assets/example.jpg?raw=true)

此前看到的一个图，觉得很有趣，就试着用网页实现了下。

- GitHub: <https://github.com/YunYouJun/give-me-money>
- DEMO: <http://github.yunyoujun.cn/give-me-money/>

<!-- more -->

## Base

- [Vue](https://vuejs.org)
- [Parcel](https://parceljs.org)
- [Vuex](https://vuex.vuejs.org)
- [iconfont](http://iconfont.cn)
- [Element](https://github.com/ElemeFE/element/)
- [element-theme-ink](https://github.com/YunYouJun/element-theme-ink/)

## Storage

采用 [LeanCloud](https://leancloud.cn/) 存储 （大家留给我的支付宝帐号，大概是能看到的~）

> 虽然至今都没有一个真的啊！摔！

## Audio

话说这个音频，有识之士（~~绅士~~）应该都有所耳闻。(~~笑~~)

我不是，我没有。

## Use

```sh
git clone https://github.com/YunYouJun/give-me-money.git
npm install
npm run dev
# http://localhost:2333
```

端口号当然是 `2333` 啦~

## Intend

- [ ] i18n all  [json 分离]
- [ ] wechatpay
- [ ] qrcode
- [ ] show all account info (vue router)
- [x] travis