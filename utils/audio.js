/* globals Audio */

export const playSound = {
  play: function (fileOrData, volume = 1) {
    if (!fileOrData) {
      throw new Error('No sound file or data provided')
    }
    const audio = new Audio(fileOrData)
    audio.volume = volume
    audio.play()
  }
}
