import { isClient } from './isClient'

/**
 * 播放「大好き」音频
 */
export function playLoveAudio() {
  if (!isClient)
    return

  const audio = document.getElementById('love-you')
  if (audio instanceof HTMLAudioElement) {
    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }
}
