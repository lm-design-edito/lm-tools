/**
 * The verbs a video answers to, as the table keys them.
 *
 * `jump-to` is the only one taking an argument, and the table is keyed by the verb
 * alone — the argument is parsed out of the instruction before the lookup.
 */
export type VideoVerb =
  | 'play'
  | 'pause'
  | 'loud'
  | 'mute'
  | 'jump-to'
  | 'jump-start'
  | 'jump-end'

/**
 * The instructions a consumer writes in `whenVisible` / `whenHidden`.
 *
 * `'jump-to:500'` seeks to 500 ms. **A negative value counts from the end**:
 * `'jump-to:-1'` is the last reachable timecode, and it is `-1` rather than `-0`
 * because `-0 === 0` in JavaScript and would collide with the start. `'jump-start'`
 * and `'jump-end'` are the shorthands for `'jump-to:0'` and `'jump-to:-1'`.
 *
 * Every one of them takes the `':once'` and `':force'` suffixes, which are the generic
 * layer's and are not restated here.
 */
export type VideoAction =
  | Exclude<VideoVerb, 'jump-to'>
  | `jump-to:${number}`

/**
 * What a verb competes with, so that taking one control over doesn't silence the rest.
 *
 * Seeking belongs to `'playback'`: a reader who drags the timeline has said where they
 * want to be, and an automatic jump would take it back from them.
 */
export type VideoDomain = 'playback' | 'sound'
