/**
 * Everything a command can ask of a drawer.
 *
 * **No `toggle`**, deliberately: a verb that reads the state before writing it would be
 * the only one in the library that undoes itself when sent twice, and `whenVisible` with
 * `whenHidden` already says the useful thing. Whether an opposable pair ever wants one is
 * a question for the whole vocabulary, not for this component.
 */
export const DRAWER_ACTION_VERBS = [
  'open',
  'close'
] as const

/** One of {@link DRAWER_ACTION_VERBS}. */
export type DrawerActionVerb = typeof DRAWER_ACTION_VERBS[number]

/** What a caller writes. Neither verb takes an argument. */
export type DrawerAction = DrawerActionVerb

/**
 * The one thing a command can reach for here.
 *
 * Named `opening` rather than `open` so that the domain and the verb are not the same
 * word — a map reading `open: 'open'` costs a reader a second look for nothing.
 */
export const DRAWER_ACTION_DOMAINS = ['opening'] as const

/** One of {@link DRAWER_ACTION_DOMAINS}. */
export type DrawerActionDomain = typeof DRAWER_ACTION_DOMAINS[number]

/**
 * The domain of each verb — **what a reader's gesture silences**.
 *
 * Both controls claim the single domain, so a reader who opened or closed the drawer by
 * hand silences `open` and `close` together. Closing counts as much as opening: the
 * alternative would reopen a drawer the reader has just dismissed, at every pass.
 */
export const DRAWER_ACTION_VERB_DOMAINS = {
  open: 'opening',
  close: 'opening'
} as const satisfies Record<DrawerActionVerb, DrawerActionDomain>
