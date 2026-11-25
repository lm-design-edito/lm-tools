/**
 * The attribute a child uses to say which items it belongs to.
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
export const ITEMS_ATTRIBUTE = 'data-items'

/**
 * The attribute a child uses to say that the sequence ends on it.
 *
 * It answers a shape the positional fallback could not: an article writes the items in
 * reading order, then — **after** the sequence proper — the children that belong to
 * several items at once and name them with {@link ITEMS_ATTRIBUTE}. Those trailing
 * children would each claim an item of their own in the count, and the sequence would run
 * on into items where nothing but them is lit.
 *
 * Marking the last item is what separates the two halves, and it is written where the
 * separation is rather than recounted in a prop — the same reason `data-items` lives on
 * the child. A child after the mark that names no item therefore never lights up, which
 * is the honest reading of « it is not part of the sequence ».
 *
 * **`last` here is the index and not the reading sense**: the mark is the highest item
 * the sequence counts, which under `reverse` is where it starts rather than where it
 * ends.
 *
 * Valueless, as an HTML boolean attribute: what matters is that it is there.
 */
export const LAST_ITEM_ATTRIBUTE = 'data-last-item'

/**
 * The two directions a sequence runs in, named on the items and nothing else.
 *
 * `forward` is the items ascending and `backward` the items descending, **whichever way
 * the sequence happens to be playing** — which is what makes them the invariable half of
 * this component's vocabulary, and `reverse` the prop that switches between them.
 */
export const SEQUENCER_DIRECTIONS = [
  'forward',
  'backward'
] as const

/** One of {@link SEQUENCER_DIRECTIONS}. */
export type SequencerDirection = typeof SEQUENCER_DIRECTIONS[number]

/**
 * Everything a command can ask of a sequence, in the family `Video` already uses.
 *
 * **Two axes, and every verb belongs to one of them.** An item is a place in the sequence
 * and a step is one beat of the tempo. The items — `first`, `last`, `forward`,
 * `backward` — never move: `jump-last` is the highest item whatever the sequence is
 * doing. The steps — `start`, `end`, and the sign of `jump-by` — follow `reverse`:
 * `jump-start` is the item playback begins on, which is the last one when the sequence
 * runs backward.
 *
 * **A jump names an item, never an active item**: `itemMap` is read after the jump, not
 * before, so `jump-to:1` is the second item whatever it resolves to. No `reset` — the
 * old `resetOnVisible` **is** `jump-start` — and no `stop`, since
 * `['pause', 'jump-start']` composes and a list runs in order.
 */
export const SEQUENCER_ACTION_VERBS = [
  'play',
  'pause',
  'direction',
  'jump-to',
  'jump-first',
  'jump-last',
  'jump-forward-by',
  'jump-backward-by',
  'jump-start',
  'jump-end',
  'jump-by'
] as const

/** One of {@link SEQUENCER_ACTION_VERBS}. */
export type SequencerActionVerb = typeof SEQUENCER_ACTION_VERBS[number]

/**
 * What a caller writes: a verb, and its argument after a colon for the four that take
 * one.
 *
 * An item is a whole number, and **a negative one counts back from the end**:
 * `jump-to:-1` is the last item, `-1` rather than `-0` because `-0 === 0` would collide
 * with the first. The two `jump-*-by` carry a direction in the verb and take a plain
 * count, so only `jump-by` reads a sign — as a direction along the reading sense,
 * `jump-by:-1` stepping back one towards where playback began.
 */
export type SequencerAction =
  | Exclude<
    SequencerActionVerb,
    'direction' | 'jump-to' | 'jump-forward-by' | 'jump-backward-by' | 'jump-by'
  >
  | `direction:${SequencerDirection}`
  | `jump-to:${number}`
  | `jump-forward-by:${number}`
  | `jump-backward-by:${number}`
  | `jump-by:${number}`

const isWholeNumber = (arg: string): boolean => /^-?\d+$/v.test(arg)

const isCount = (arg: string): boolean => /^\d+$/v.test(arg)

const isDirection = (arg: string): boolean => SEQUENCER_DIRECTIONS
  .some(direction => direction === arg)

/**
 * How to read the argument of each verb that takes one. The others take none, and a verb
 * absent from here is handed its argument list unread.
 */
export const SEQUENCER_ACTION_VERB_ARGUMENTS = {
  direction: isDirection,
  'jump-to': isWholeNumber,
  'jump-forward-by': isCount,
  'jump-backward-by': isCount,
  'jump-by': isWholeNumber
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

/**
 * The domain of each verb — see {@link SEQUENCER_ACTION_DOMAINS}. `direction` is playback
 * and not position: it says which way the sequence runs, not where it is.
 */
export const SEQUENCER_ACTION_VERB_DOMAINS = {
  play: 'playback',
  pause: 'playback',
  direction: 'playback',
  'jump-to': 'position',
  'jump-first': 'position',
  'jump-last': 'position',
  'jump-forward-by': 'position',
  'jump-backward-by': 'position',
  'jump-start': 'position',
  'jump-end': 'position',
  'jump-by': 'position'
} as const satisfies Record<SequencerActionVerb, SequencerActionDomain>
