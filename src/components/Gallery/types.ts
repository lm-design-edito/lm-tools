/**
 * Everything a command can ask of a gallery.
 *
 * The `jump-*` family, as on `Video` and `Sequencer`, rather than the `next` / `prev`
 * its own controls are named after: a jump names a position and never says what the
 * position is counted in, which is what lets one family serve a time, a step and a slot.
 * `jump-by:1` is what the next button does.
 */
export const GALLERY_ACTION_VERBS = [
  'jump-to',
  'jump-start',
  'jump-end',
  'jump-by'
] as const

/** One of {@link GALLERY_ACTION_VERBS}. */
export type GalleryActionVerb = typeof GALLERY_ACTION_VERBS[number]

/**
 * What a caller writes: a verb, and its argument after a colon for the two that take one.
 *
 * A slot is a whole number, and **a negative one counts back from the end**:
 * `jump-to:-1` is the last slot, `-1` rather than `-0` because `-0 === 0` would collide
 * with the first. `jump-by` reads the sign as a direction instead. A position no slot
 * answers to is a no-op, since the scroll table has nothing to scroll to.
 */
export type GalleryAction =
  | Exclude<GalleryActionVerb, 'jump-to' | 'jump-by'>
  | `jump-to:${number}`
  | `jump-by:${number}`

const isSlot = (arg: string): boolean => /^-?\d+$/v.test(arg)

/**
 * How to read the argument of each verb that takes one. The others take none, and a verb
 * absent from here is handed its argument list unread.
 */
export const GALLERY_ACTION_VERB_ARGUMENTS = {
  'jump-to': isSlot,
  'jump-by': isSlot
} as const satisfies Partial<Record<GalleryActionVerb, (arg: string) => boolean>>

/**
 * The one thing a command can reach for here, named as `Video` and `Sequencer` name it.
 */
export const GALLERY_ACTION_DOMAINS = ['position'] as const

/** One of {@link GALLERY_ACTION_DOMAINS}. */
export type GalleryActionDomain = typeof GALLERY_ACTION_DOMAINS[number]

/**
 * The domain of each verb — **what a reader's gesture silences**.
 *
 * Every gesture here claims the one domain: the two controls, a pagination item, and the
 * reader's own hand on the strip — see the component for how a horizontal intent is told
 * from the jitter of a vertical scroll.
 */
export const GALLERY_ACTION_VERB_DOMAINS = {
  'jump-to': 'position',
  'jump-start': 'position',
  'jump-end': 'position',
  'jump-by': 'position'
} as const satisfies Record<GalleryActionVerb, GalleryActionDomain>
