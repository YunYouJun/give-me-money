<template>
  <div class="ui footer">
    <hr>
    <div class="ui container">
      <div class="ui stackable divided equal height stackable grid">
        <div class="column text-center">
          <h4 class="ui header">Give Me Money!</h4>
          <div class="ui link">
            <a class="item" href="https://github.com/YunYouJun/give-me-money" target="_blank">
              <button class="ui circular black basic icon button" data-tooltip="GitHub 项目代码" data-inverted="">
                <i class="github icon"></i>
              </button>
              </a>
            <a class="item" href="http://weibo.com/jizhideyunyoujun" target="_blank">
              <button class="ui circular red basic icon button" data-tooltip="微博：机智的云游君" data-inverted="">
                <i class="weibo icon"></i>
              </button>
            </a>
            <a class="item" href="mailto:me@yunyoujun.cn">
              <button class="ui circular blue basic icon button" data-tooltip="邮箱：me@yunyoujun.cn" data-inverted="">
                <i class="mail outline icon"></i>
              </button>
            </a>
            <a class="item" href="http://www.yunyoujun.cn" target="_blank">
              <button class="ui circular violet basic icon button" data-tooltip="博客：yunyoujun.cn" data-inverted="">
                <i class="world icon"></i>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Copyright',
    data () {
      return {

      }
    }
  }
</script>