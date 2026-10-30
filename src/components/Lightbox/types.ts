/** What a lightbox hands the store so its group can find and place it. */
export type RegisteredLightbox = {
  id: string
  groups: string[]
  /** The lightbox's anchor in the page, for ordering. `null` before it mounts. */
  getElement: () => HTMLElement | null
}

/** Everything the store holds, and everything a lightbox watches. */
export type LightboxesStoreState = {
  /** The group currently open, `null` when nothing is. */
  openGroup: string | null
  /** The lightbox currently shown. */
  openLightboxId: string | null
  /** Every mounted lightbox of the page, unordered. */
  lightboxesById: ReadonlyMap<string, RegisteredLightbox>
}

/**
 * Everything a command can ask of a lightbox.
 *
 * `open` and `close` as on `Drawer`. The group walk is the `jump-*` family of `Video`,
 * `Sequencer` and `Gallery` rather than the `prev` / `next` this component's own controls
 * are named after: a jump names a position without saying what the position counts, which
 * here is a member of the open group.
 */
export const LIGHTBOX_ACTION_VERBS = [
  'open',
  'close',
  'jump-to',
  'jump-start',
  'jump-end',
  'jump-by'
] as const

/** One of {@link LIGHTBOX_ACTION_VERBS}. */
export type LightboxActionVerb = typeof LIGHTBOX_ACTION_VERBS[number]

/**
 * What a caller writes: a verb, and its argument after a colon for the two that take one.
 *
 * A member is a whole number, and **a negative one counts back from the end**:
 * `jump-to:-1` is the last lightbox of the group, `-1` rather than `-0` because
 * `-0 === 0` would collide with the first. `jump-by` reads the sign as a direction
 * instead, and stops at either end as the controls do.
 */
export type LightboxAction =
  | Exclude<LightboxActionVerb, 'jump-to' | 'jump-by'>
  | `jump-to:${number}`
  | `jump-by:${number}`

const isMember = (arg: string): boolean => /^-?\d+$/v.test(arg)

/**
 * How to read the argument of each verb that takes one. The others take none, and a verb
 * absent from here is handed its argument list unread.
 */
export const LIGHTBOX_ACTION_VERB_ARGUMENTS = {
  'jump-to': isMember,
  'jump-by': isMember
} as const satisfies Partial<Record<LightboxActionVerb, (arg: string) => boolean>>

/**
 * The two things a command can reach for here, named as the rest of the library names
 * them — `opening` as on `Drawer`, `position` as on the three components that jump.
 */
export const LIGHTBOX_ACTION_DOMAINS = [
  'opening',
  'position'
] as const

/** One of {@link LIGHTBOX_ACTION_DOMAINS}. */
export type LightboxActionDomain = typeof LIGHTBOX_ACTION_DOMAINS[number]

/**
 * The domain of each verb — **what a reader's gesture silences**.
 *
 * `opening` is claimed by the open and close buttons, a click on the backdrop, `Escape`,
 * and a click on the content where `openOnClick` allows one. `position` is claimed by the
 * two navigation buttons and by the arrow keys.
 */
export const LIGHTBOX_ACTION_VERB_DOMAINS = {
  open: 'opening',
  close: 'opening',
  'jump-to': 'position',
  'jump-start': 'position',
  'jump-end': 'position',
  'jump-by': 'position'
} as const satisfies Record<LightboxActionVerb, LightboxActionDomain>
