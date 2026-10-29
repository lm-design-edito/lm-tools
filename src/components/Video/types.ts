import { parseDuration } from '../../agnostic/time/duration/parse-duration/index.js'
import type { DurationSuffix } from '../../agnostic/time/duration/parse-duration/types.js'

/**
 * One `<source>` of a `<video>`.
 *
 * **Not interchangeable with a picture source**: a `<source>` inside a `<video>` carries
 * `src`, one inside a `<picture>` carries `srcSet`, `media` and `sizes`, and neither
 * element accepts the other's attributes.
 *
 * @property src - URL of the video file.
 * @property type - MIME type, so the browser can skip what it cannot play
 * (`'video/mp4'`).
 */
export type SourceData = {
  src?: string
  type?: string
}

/**
 * One `<track>` of a `<video>` — subtitles, captions, chapters.
 *
 * @property src - URL of the WebVTT file.
 * @property kind - What the track holds. Browsers default to `'subtitles'`.
 * @property srclang - Its BCP 47 language tag, required by the element whenever `kind`
 * is `'subtitles'`.
 * @property label - The name a browser shows in its own track menu.
 * @property default - Whether it is the one enabled when no preference says otherwise.
 * At most one track per element may carry it.
 */
export type TrackData = {
  src?: string
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  srclang?: string
  label?: string
  default?: boolean
}

/**
 * The verbs a video answers to as commands, keyed by the verb alone — an argument is
 * read out of the command before the lookup.
 *
 * **A value and not a bare union**, like every vocabulary here: a consumer validating
 * what an article wrote needs the list at runtime, and a type has nothing to hand a
 * validator.
 */
export const VIDEO_ACTION_VERBS = [
  'play',
  'pause',
  'loud',
  'mute',
  'volume',
  'rate',
  'jump-to',
  'jump-start',
  'jump-end'
] as const

/** One of {@link VIDEO_ACTION_VERBS}. */
export type VideoActionVerb = typeof VIDEO_ACTION_VERBS[number]

/**
 * What a caller writes: a verb, and its argument after a colon for the three that take
 * one.
 *
 * A time is a number of milliseconds or a suffixed duration — `jump-to:500`,
 * `jump-to:1.2min` —, and **a negative value counts back from the end**: `jump-to:-1`
 * is the last reachable timecode, `-1` rather than `-0` because `-0 === 0` would
 * collide with the start.
 */
export type VideoActionTime = `${number}` | `${number}${DurationSuffix}`
export type VideoAction =
  | Exclude<VideoActionVerb, 'jump-to' | 'volume' | 'rate'>
  | `jump-to:${VideoActionTime}`
  | `volume:${number}`
  | `rate:${number}`

const isRatio = (arg: string): boolean => {
  if (!/^\d+(?:\.\d+)?$/v.test(arg)) return false
  const value = Number(arg)
  return value >= 0 && value <= 1
}

/**
 * How to read the argument of each verb that takes one. The others take none, and a
 * verb absent from here is handed its argument list unread.
 */
export const VIDEO_ACTION_VERB_ARGUMENTS = {
  'jump-to': (arg: string) => parseDuration(arg) !== null,
  volume: isRatio,
  rate: (arg: string) => /^\d+(?:\.\d+)?$/v.test(arg) && Number(arg) > 0
} as const satisfies Partial<Record<VideoActionVerb, (arg: string) => boolean>>

/** Which control of the player a verb reaches for. */
export type VideoActionDomain = 'playback' | 'sound' | 'volume' | 'rate'

/**
 * The domain of each verb.
 *
 * **Declared and read by nothing yet.** It exists for the reader's hand — touching a
 * control silences the commands of its domain, which `:force` then opts out of — and
 * that layer is not written: `components/utils/commands` parses `force` and transports
 * it, but holds no ledger for it to override.
 */
export const VIDEO_ACTION_VERB_DOMAINS = {
  play: 'playback',
  pause: 'playback',
  'jump-to': 'playback',
  'jump-start': 'playback',
  'jump-end': 'playback',
  loud: 'sound',
  mute: 'sound',
  volume: 'volume',
  rate: 'rate'
} as const satisfies Record<VideoActionVerb, VideoActionDomain>
