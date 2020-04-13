function queryOkCounter() {
  let queryPay = new this.$AV.Query("Pay");
  queryPay.count().then(
    count => {
      this.counter.ok = count;
    },
    error => {
      this.$message({
        showClose: true,
        message: "Code " + error.code + " : " + error.rawMessage,
        type: "warning"
      });
    }
  );
}

function playLoveAudio() {
  const audio = document.getElementById("myAudio");
  audio.play();
}

export { playLoveAudio, queryOkCounter };
