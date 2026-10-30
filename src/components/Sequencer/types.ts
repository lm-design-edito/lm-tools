/**
 * The attribute a child uses to say which steps it belongs to.
 *
 * **Written on the child rather than gathered in a prop**, and that is the whole
 * difference with the `activateOnStep` this component used to take. A parallel array and
 * a children list derive from one another: inserting a child in the middle means
 * reindexing the array, and nothing signals the one time it is forgotten. Carried by the
 * child, the attachment travels with it.
 *
 * It stays in the DOM once read — it costs nothing, it is worth having while debugging,
 * and a stylesheet can select on it.
 */
export const STEPS_ATTRIBUTE = 'data-steps'

/**
 * The attribute a child uses to say that the sequence ends on it.
 *
 * It answers a shape the positional fallback could not: an article writes the steps in
 * reading order, then — **after** the sequence proper — the children that belong to
 * several steps at once and name them with {@link STEPS_ATTRIBUTE}. Those trailing
 * children would each claim a step of their own in the count, and the sequence would run
 * on into steps where nothing but them is lit.
 *
 * Marking the last step is what separates the two halves, and it is written where the
 * separation is rather than recounted in a prop — the same reason `data-steps` lives on
 * the child. A child after the mark that names no step therefore never lights up, which
 * is the honest reading of « it is not part of the sequence ».
 *
 * Valueless, as an HTML boolean attribute: what matters is that it is there.
 */
export const LAST_STEP_ATTRIBUTE = 'data-last-step'

/**
 * Everything a command can ask of a sequence, in the family `Video` already uses.
 *
 * **A jump names a position, never an active step**: `stepMap` is read after the jump,
 * not before, so `jump-to:1` is the second beat whatever step it resolves to. No `reset`
 * — the old `resetOnVisible` **is** `jump-start` — and no `stop`, since
 * `['pause', 'jump-start']` composes and a list runs in order.
 */
export const SEQUENCER_ACTION_VERBS = [
  'play',
  'pause',
  'jump-to',
  'jump-start',
  'jump-end',
  'jump-by'
] as const

/** One of {@link SEQUENCER_ACTION_VERBS}. */
export type SequencerActionVerb = typeof SEQUENCER_ACTION_VERBS[number]

/**
 * What a caller writes: a verb, and its argument after a colon for the two that take one.
 *
 * A step is a whole number, and **a negative one counts back from the end**: `jump-to:-1`
 * is the last step, `-1` rather than `-0` because `-0 === 0` would collide with the
 * start. `jump-by` reads the same sign as a direction instead — `jump-by:-1` steps back
 * one — which is the price of one `jump-*` family rather than a `next` / `prev` pair
 * beside it.
 */
export type SequencerAction =
  | Exclude<SequencerActionVerb, 'jump-to' | 'jump-by'>
  | `jump-to:${number}`
  | `jump-by:${number}`

const isStep = (arg: string): boolean => /^-?\d+$/v.test(arg)

/**
 * How to read the argument of each verb that takes one. The others take none, and a verb
 * absent from here is handed its argument list unread.
 */
export const SEQUENCER_ACTION_VERB_ARGUMENTS = {
  'jump-to': isStep,
  'jump-by': isStep
} as const satisfies Partial<Record<SequencerActionVerb, (arg: string) => boolean>>

/**
 * The two things a command can reach for here, named as `Video` names them.
 *
 * **Nothing ever surrenders in a sequencer**: it renders no control, so no gesture of the
 * reader's can claim a domain and `:force` has nothing to override. The partition is
 * vocabulary for the day one grows a play button, and it is written now so that the same
 * verb carries the same domain across components.
 */
export const SEQUENCER_ACTION_DOMAINS = [
  'playback',
  'position'
] as const

/** One of {@link SEQUENCER_ACTION_DOMAINS}. */
export type SequencerActionDomain = typeof SEQUENCER_ACTION_DOMAINS[number]

/** The domain of each verb — see {@link SEQUENCER_ACTION_DOMAINS}. */
export const SEQUENCER_ACTION_VERB_DOMAINS = {
  play: 'playback',
  pause: 'playback',
  'jump-to': 'position',
  'jump-start': 'position',
  'jump-end': 'position',
  'jump-by': 'position'
} as const satisfies Record<SequencerActionVerb, SequencerActionDomain>
