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
 * Renders a duration into a caller-defined pattern.
 *
 * The pattern is a free-form string in which the following tokens are replaced,
 * longest first, so that `mm` is consumed before `m`:
 *
 * - `hh`, `mm`, `ss` — hours, minutes and seconds, zero-padded to two digits.
 * - `ms` — the remaining milliseconds, zero-padded to three digits.
 * - `frame` — the remaining milliseconds expressed in frames, zero-padded to two
 *   digits.
 * - `h`, `m`, `s`, `f` — the same four values, unpadded.
 *
 * @param ms - The duration, in milliseconds.
 * @param format - The pattern to fill, e.g. `'mm:ss:ms'`.
 * @param fps - Frame rate used to derive the `frame` and `f` tokens. Defaults to `25`.
 * @returns The formatted duration.
 *
 * @remarks
 * Every field is a remainder of the one above it, never a total: at one hour and
 * a half, `mm` is `30`, not `90`. A pattern that omits `hh` therefore loses the
 * hours rather than folding them into the minutes.
 *
 * Since `h`, `m`, `s` and `f` are tokens on their own, **every** occurrence of
 * those letters is substituted, wherever it sits: `'mm min ss'` renders as
 * `'01 1in 01'`. Separate the fields with punctuation. This is what
 * `agnostic/time/dates/format-date` avoids by delimiting its tokens with
 * `{{…}}` — worth aligning on the day this one is made public.
 */
export function formatTime (
  ms: number,
  format: string,
  fps = 25
): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const frames = Math.floor(((ms % 1000) / 1000) * fps)
  const msRest = Math.floor(ms % 1000)
  const tokens: Record<string, string | number> = {
    hh: String(hours).padStart(2, '0'),
    mm: String(minutes).padStart(2, '0'),
    ss: String(seconds).padStart(2, '0'),
    frame: String(frames).padStart(2, '0'),
    ms: String(msRest).padStart(3, '0'),
    h: hours,
    m: minutes,
    s: seconds,
    f: frames
  }
  return Object
    .keys(tokens)
    .sort((a, b) => b.length - a.length)
    .reduce(
      (acc, t) => acc.replace(new RegExp(t, 'gv'), String(tokens[t])),
      format
    )
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
