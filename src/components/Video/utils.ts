/**
 * The two list shapes `<video>` accepts as children, as records.
 *
 * They live here and not next to the component because nothing about them is React:
 * they describe a `<source>` and a `<track>` element, and `parseSources` below is a
 * pure function of a prop.
 */
export type SourceData = {
  src?: string
  type?: string
}

export type TrackData = {
  src?: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}

/**
 * The three forms a media list is written in, reduced to the one the render uses.
 *
 * A bare string is a single item, an array of strings is several, an array of records
 * is taken as given. **The array is read as homogeneous** — the first element decides
 * for all of them —, which is what someone writing one by hand means anyway, and the
 * only reading a static hyper-json array could support.
 */
export const parseSources = (
  sources: string | string[] | SourceData[] | undefined
): SourceData[] => {
  if (sources === undefined) return []
  if (typeof sources === 'string') return [{ src: sources }]
  if (!Array.isArray(sources)) return []
  if (sources.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element sampled just above; array is expected to be homogeneous
  if (typeof sources[0] === 'string') return (sources as string[]).map(src => ({ src }))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element was checked not to be a string just above; array is expected to be homogeneous
  return sources as SourceData[]
}

/** The same, for `<track>`. See {@link parseSources}. */
export const parseTracks = (
  tracks: string | string[] | TrackData[] | undefined
): TrackData[] => {
  if (tracks === undefined) return []
  if (typeof tracks === 'string') return [{ src: tracks }]
  if (!Array.isArray(tracks)) return []
  if (tracks.length === 0) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element sampled just above; array is expected to be homogeneous
  if (typeof tracks[0] === 'string') return (tracks as string[]).map(src => ({ src }))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- first element was checked not to be a string just above; array is expected to be homogeneous
  return tracks as TrackData[]
}

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
