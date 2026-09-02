/* Video element triggers */
export const muteAttributeWorkaround = (
  video: HTMLVideoElement | null,
  shouldMute: boolean
): void => {
  if (video === null) return
  if (!shouldMute) return
  const currentMuted = video.getAttribute('muted')
  if (currentMuted !== null) return
  video.setAttribute('muted', '')
  video.load()
}

export const forceMute = (video: HTMLVideoElement | null): void => {
  if (video === null) return
  // eslint-disable-next-line no-param-reassign
  video.muted = true
}

export const forceLoud = (video: HTMLVideoElement | null): void => {
  if (video === null) return
  // eslint-disable-next-line no-param-reassign
  video.muted = false
}

export const forceVolume = (
  video: HTMLVideoElement | null,
  volume: number
): void => {
  if (video === null) return
  // eslint-disable-next-line no-param-reassign
  video.volume = volume
}

export const forcePlay = async (
  video: HTMLVideoElement | null
): Promise<boolean> => {
  if (video === null) return false
  if (!video.paused) return true
  try {
    await video.play()
    return video.paused
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
  return false
}

export const forcePause = (
  video: HTMLVideoElement | null
): boolean => {
  if (video === null) return false
  if (video.paused) return true
  try {
    video.pause()
    return video.paused
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
  return false
}

export const forcePlaybackRate = (
  video: HTMLVideoElement | null,
  rate: number
): void => {
  if (video === null) return
  // eslint-disable-next-line no-param-reassign
  video.playbackRate = rate
}

export const forceFullscreen = async (
  video: HTMLVideoElement | null
): Promise<boolean> => {
  if (video === null) return false
  try {
    await video.requestFullscreen()
    return document.fullscreenElement === video
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
  return false
}

export const forceExitFullscreen = async (
  video: HTMLVideoElement | null
): Promise<boolean> => {
  if (video === null || document.fullscreenElement !== video) {
    return false
  }
  try {
    await document.exitFullscreen()
    return document.fullscreenElement !== video
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
  }
  return false
}

/* Time & formats */

export function secondsToMs (seconds: number): number {
  return seconds * 1000
}

export function msToSeconds (ms: number): number {
  return ms / 1000
}

/**
 * Where along the timeline a click landed.
 *
 * @param event - The click on the timeline element.
 * @returns A ratio between `0` and `1`, clamped to the element's own bounds.
 */
export const getTimelineClickProgress = (
  event: React.MouseEvent<HTMLDivElement>
): number => {
  const timelineRect = event.currentTarget.getBoundingClientRect()
  const position = event.clientX - timelineRect.left
  return Math.min(1, Math.max(0, position / timelineRect.width))
}
