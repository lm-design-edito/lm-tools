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
 * Everything a command can ask of a lightbox: itself, open or closed, and nothing more.
 *
 * **No `jump-*` family here**, unlike `Video`, `Sequencer` and `Gallery`. Which member of
 * a group is open is not this component's state — it is the shared store's — and every
 * lightbox answers to a `compId`, so `@the-third-figure:open` already is the absolute
 * jump, written with the thing it names instead of a count into a document order an
 * article cannot see. Walking a group blindly would need a group-level address, which the
 * grammar does not have.
 */
export const LIGHTBOX_ACTION_VERBS = [
  'open',
  'close'
] as const

/** One of {@link LIGHTBOX_ACTION_VERBS}. */
export type LightboxActionVerb = typeof LIGHTBOX_ACTION_VERBS[number]

/** What a caller writes. Neither verb takes an argument. */
export type LightboxAction = LightboxActionVerb

/** The one thing a command can reach for here, named as `Drawer` names it. */
export const LIGHTBOX_ACTION_DOMAINS = ['opening'] as const

/** One of {@link LIGHTBOX_ACTION_DOMAINS}. */
export type LightboxActionDomain = typeof LIGHTBOX_ACTION_DOMAINS[number]

/**
 * The domain of each verb — **what a reader's gesture silences**.
 *
 * The open and close buttons claim it, and so do a click on the backdrop, `Escape`, and a
 * click on the content where `openOnClick` allows one.
 */
export const LIGHTBOX_ACTION_VERB_DOMAINS = {
  open: 'opening',
  close: 'opening'
} as const satisfies Record<LightboxActionVerb, LightboxActionDomain>
