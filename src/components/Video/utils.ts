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

// A browser refuses playback silently: the promise rejects and no event fires, so the
// return value is the only way the caller learns the outcome.
export const forcePlay = async (
  video: HTMLVideoElement | null
): Promise<boolean> => {
  if (video === null) return false
  if (!video.paused) return true
  try {
    await video.play()
  } catch (err) {
    // The refusal itself is the information, and it is in `video.paused` below.
  }
  return !video.paused
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

export const getTimelineClickProgress = (
  event: React.MouseEvent<HTMLDivElement>
): number => {
  const timelineRect = event.currentTarget.getBoundingClientRect()
  const position = event.clientX - timelineRect.left
  return Math.min(1, Math.max(0, position / timelineRect.width))
}

/**
 * Seeks the element, a negative target counting back from the duration — `-1` being the
 * last reachable timecode, not `-0`, which `===` makes indistinguishable from the start.
 *
 * @returns Whether the target had to be brought back inside the timeline. Only the
 * caller knows if that is worth a word: a written `jump-to` past the end is a typo, a
 * drag of the timeline is not.
 */
export const forceJumpTo = (
  video: HTMLVideoElement | null,
  targetMs: number
): boolean => {
  if (video === null) return false
  const durationMs = secondsToMs(video.duration)
  if (!Number.isFinite(durationMs)) return false
  const absolute = targetMs < 0 ? durationMs + targetMs : targetMs
  const clamped = Math.min(Math.max(absolute, 0), durationMs)
  // eslint-disable-next-line no-param-reassign
  video.currentTime = msToSeconds(clamped)
  return clamped !== absolute
}

/* Source lists */

export function parseSrcSetSourcesList <T extends Record<string, unknown>> (
  given: string | string[] | T[] | undefined,
  stringKey: keyof T & string
): T[] {
  const fromString = (value: string): T => {
    const single: Record<string, string> = { [stringKey]: value }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a one-key record is the narrowest `T` a bare string can describe; every other field is optional by contract
    return single as T
  }
  if (given === undefined) return []
  if (typeof given === 'string') return [fromString(given)]
  if (!Array.isArray(given)) return []
  if (given.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element sampled just above; array is read as homogeneous
  if (typeof given[0] === 'string') return (given as string[]).map(fromString)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element was checked not to be a string just above; array is read as homogeneous
  return given as T[]
}
