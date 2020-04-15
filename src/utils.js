function queryOkCounter() {
  let queryPay = new this.$AV.Query("Pay");
  queryPay.count().then(
    (count) => {
      this.counter.ok = count;
    },
    (error) => {
      // not exist
      if (error.code == 101) {
        let Pay = this.$AV.Object.extend("Pay");
        let pay = new Pay();
        pay.set("name", "Test");
        pay.set("type", "alipay");
        pay.set("account", "test@yunyoujun.cn");
        pay.set("password", "123456");
        pay.set("pin", "123456");
        pay.save();
        console.log("Init Pay Class.");
      }
      this.$message({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    }
  );
}

function queryNoCounter() {
  let queryNo = new this.$AV.Query("Counter");
  queryNo.equalTo("name", "no");
  queryNo
    .find()
    .then((data) => {
      this.counter.no = data[0].get("time");
    })
    .catch((error) => {
      if (error.code == 101) {
        let Counter = this.$AV.Object.extend("Counter");
        let counter = new Counter();
        counter.set("name", "no");
        counter.set("time", 0);
        counter.save();
        console.log("Init Counter Class.");
      }
      this.$message({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning",
      });
    });
}

function playLoveAudio() {
  const audio = document.getElementById("myAudio");
  audio.play();
}

export { playLoveAudio, queryOkCounter, queryNoCounter };
