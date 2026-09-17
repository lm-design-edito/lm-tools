/**
 * The verbs a sequence answers to, as the table keys them.
 *
 * `jump-to` and `jump-by` are the two taking an argument, and the table is keyed by the
 * verb alone — the argument is parsed out of the instruction before the lookup.
 *
 * The family is `Video`'s, word for word: a sequence and a player move a counter, and
 * two vocabularies for that one gesture is exactly what the viewport-behaviours layer
 * exists to stop. `jump-start` is the old `resetOnVisible` under the shared name.
 */
export const SEQUENCER_VERBS = [
  'play',
  'pause',
  'jump-to',
  'jump-start',
  'jump-end',
  'jump-by'
] as const

export type SequencerVerb = typeof SEQUENCER_VERBS[number]

/**
 * How to read the argument of each verb that takes one.
 *
 * **Exported because a consumer has to validate what it is handed**, and a type gives a
 * runtime validator nothing to compare against: lm-link reads an article's props out of
 * static XML and has to reject `'jump-to:banana'` before it reaches the component.
 *
 * A digit string, and deliberately not `Number`: that would take `'1e3'` and `'0x10'`,
 * which nobody means to write in an article.
 */
export const SEQUENCER_VERB_ARGUMENTS = {
  'jump-to': (arg: string) => /^-?\d+$/v.test(arg),
  'jump-by': (arg: string) => /^-?\d+$/v.test(arg)
} as const satisfies Partial<Record<SequencerVerb, (arg: string) => boolean>>

/**
 * The instructions a consumer writes in `whenVisible` / `whenHidden`.
 *
 * **A jump names a position, never an active step** — the counter, the thing `step` and
 * `defaultStep` already name. What that position *means* stays `stepMap`'s answer, which
 * is the one place the component's two numbers could be confused for one another.
 *
 * `'jump-to:2'` goes to position 2, and **a negative value counts from the end**:
 * `'jump-to:-1'` is the last position, `-1` rather than `-0` because `-0 === 0` in
 * JavaScript and would collide with the start. `'jump-start'` and `'jump-end'` are the
 * shorthands for `'jump-to:0'` and `'jump-to:-1'`.
 *
 * `'jump-by:1'` is the next position and `'jump-by:-1'` the previous one — signed and
 * relative, where `jump-to` is absolute. The two forms of `-1` therefore do not say the
 * same thing, which is the price of keeping one family rather than adding `next` and
 * `prev` beside it.
 *
 * Every one of them takes the `':once'` and `':force'` suffixes, which are the generic
 * layer's and are not restated here.
 */
export type SequencerAction =
  | Exclude<SequencerVerb, 'jump-to' | 'jump-by'>
  | `jump-to:${number}`
  | `jump-by:${number}`

/**
 * What a verb competes with — one domain, and it is a formality.
 *
 * **This component has no controls**: nothing to click, so nothing a reader can take
 * over and nothing that ever surrenders. The field is part of {@link ActionSpec} and is
 * declared honestly rather than split into domains no hand could ever tell apart. The
 * consequence is that `':force'` has no trigger here — it overrides a surrender, and
 * there are none.
 */
export type SequencerDomain = 'playback'
