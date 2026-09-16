/**
 * The verbs a video answers to, as the table keys them.
 *
 * `jump-to` is the only one taking an argument, and the table is keyed by the verb
 * alone — the argument is parsed out of the instruction before the lookup.
 */
export const VIDEO_VERBS = [
  'play',
  'pause',
  'loud',
  'mute',
  'jump-to',
  'jump-start',
  'jump-end'
] as const

export type VideoVerb = typeof VIDEO_VERBS[number]

/**
 * How to read the argument of each verb that takes one.
 *
 * **Exported because a consumer has to validate what it is handed**, and a type gives a
 * runtime validator nothing to compare against. lm-link reads an article's props out of
 * static XML and has to reject `'jump-to:banana'` before it ever reaches here — with the
 * list restated on its side, the day a verb is added is the day an article writing it
 * silently gets nothing.
 *
 * A digit string, and deliberately not `Number`: that would take `'1e3'` and `'0x10'`,
 * which nobody means to write in an article.
 */
export const VIDEO_VERB_ARGUMENTS = {
  'jump-to': (arg: string) => /^-?\d+$/v.test(arg)
} as const satisfies Partial<Record<VideoVerb, (arg: string) => boolean>>

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
