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

/**
 * Asks the element to play, and reports what came of it.
 *
 * A browser may refuse — an unmuted media outside a user gesture, typically — and
 * it refuses **silently**: the promise rejects and no event fires, so this is the
 * only moment the outcome can be known. Hence the return value, and hence no
 * logging: a refusal is not an anomaly to print, it is an answer to hand back.
 *
 * @param video - The element, or `null` before it mounts.
 * @returns Whether it is playing now.
 */
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

/** The fields {@link formatTime} knows how to render. */
export type TimeToken = 'hh' | 'mm' | 'ss' | 'ms' | 'frame' | 'h' | 'm' | 's' | 'f'

// Alternation is ordered and the first branch that fits wins, so the longest tokens
// come first — the same regexp shape, and the same reason, as
// `agnostic/time/dates/format-date`.
const timeTokenRegexp = /\{\{(frame|hh|mm|ss|ms|h|m|s|f)\}\}/gv

/**
 * Renders a duration into a caller-defined pattern.
 *
 * Tokens are wrapped in `{{…}}` and everything outside them is literal, so a pattern
 * may carry words: `'{{m}} min {{ss}}'` renders as `'1 min 05'`.
 *
 * - `{{hh}}`, `{{mm}}`, `{{ss}}` — hours, minutes and seconds, zero-padded to two digits.
 * - `{{ms}}` — the remaining milliseconds, zero-padded to three digits.
 * - `{{frame}}` — those milliseconds expressed in frames, zero-padded to two digits.
 * - `{{h}}`, `{{m}}`, `{{s}}`, `{{f}}` — the same four values, unpadded.
 *
 * @param ms - The duration, in milliseconds.
 * @param format - The pattern to fill, e.g. `'{{mm}}:{{ss}}'`.
 * @param fps - Frame rate used to derive the `frame` and `f` tokens. Defaults to `25`.
 * @returns The formatted duration. An unknown token is left as written, braces
 *   included, rather than silently blanked — a typo has to be visible.
 *
 * @remarks
 * Every field is a remainder of the one above it, never a total: at one hour and a half,
 * `{{mm}}` is `30`, not `90`. A pattern that omits `{{hh}}` therefore loses the hours
 * rather than folding them into the minutes.
 *
 * **The delimiters are what make the pattern free-form.** Until they existed, `h`, `m`,
 * `s` and `f` were tokens on their own and every occurrence of those letters was
 * substituted wherever it sat — `'mm min ss'` rendered as `'01 1in 01'`, so a pattern
 * could only ever separate its fields with punctuation. That is why the format could not
 * be exposed as a prop: doing so would have published the trap.
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
  // Typed by {@link TimeToken} so the table and the regexp above cannot fall out of step,
  // then read through a widened view: the capture is a `string` as far as the compiler
  // knows, and widening is what lets it be looked up without asserting it back.
  const tokens: Record<TimeToken, string> = {
    hh: String(hours).padStart(2, '0'),
    mm: String(minutes).padStart(2, '0'),
    ss: String(seconds).padStart(2, '0'),
    frame: String(frames).padStart(2, '0'),
    ms: String(msRest).padStart(3, '0'),
    h: String(hours),
    m: String(minutes),
    s: String(seconds),
    f: String(frames)
  }
  const byName: Record<string, string> = tokens
  // One pass, so a rendered value can never be re-read as a token by a later pass — the
  // reason the old implementation had to sort its keys by length.
  return format.replace(
    timeTokenRegexp,
    (whole: string, token: string) => byName[token] ?? whole
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

/**
 * Whether a viewport-driven behaviour should run on this crossing.
 *
 * Each behaviour comes in two flavours: `…When…` on every crossing, `…Once…` on the
 * first one only. Setting both is the same as setting `…When…` alone.
 *
 * @param whenCrossed - The `…When…` prop.
 * @param onceOnly - The `…Once…` prop.
 * @param hasFired - Whether this behaviour's own automatic trigger already ran. It
 * tracks that behaviour and nothing else: a user pressing play must not spend an
 * automatic mute the component still owed.
 * @returns Whether to apply it now.
 */
export const shouldRunAutoBehaviour = (
  whenCrossed: boolean | undefined,
  onceOnly: boolean | undefined,
  hasFired: boolean
): boolean => {
  if (whenCrossed === true) return true
  return onceOnly === true && !hasFired
}
