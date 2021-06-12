import { ElMessage } from "element-plus";
import AV from "leancloud-storage";

export function queryOkCounter() {
  const queryPay = new AV.Query("Pay");
  return queryPay.count().then(
    count => {
      return count;
    },
    error => {
      // not exist
      if (error.code === 101) {
        const Pay = AV.Object.extend("Pay");
        const pay = new Pay();
        pay.set("name", "Test");
        pay.set("type", "alipay");
        pay.set("account", "test@yunyoujun.cn");
        pay.set("password", "123456");
        pay.set("pin", "123456");
        pay.save();
        console.log("Init Pay Class.");
      }
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    },
  );
}

export function queryNoCounter(): Promise<number> {
  const queryNo = new AV.Query("Counter");
  queryNo.equalTo("name", "no");
  return queryNo
    .find()
    .then(data => {
      return data[0].get("time");
    })
    .catch(error => {
      if (error.code === 101) {
        const Counter = AV.Object.extend("Counter");
        const counter = new Counter();
        counter.set("name", "no");
        counter.set("time", 0);
        counter.save();
        console.log("Init Counter Class.");
      }
      ElMessage({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    });
}

/**
 * 播放「大好き」音频
 */
export function playLoveAudio() {
  const audio = document.getElementById("myAudio") as HTMLAudioElement;
  audio.play();
}
