/**
 * Everything a command can ask of a disclaimer.
 *
 * `dismiss` is the word the component already uses for the act — `onDismissClicked` —
 * and `restore` is its opposite. **Only `restore` has no gesture behind it**: a reader
 * can put the panel away and never bring it back, so the verb exists for an article that
 * re-arms the gate on its own, typically `whenHidden='restore'`.
 */
export const DISCLAIMER_ACTION_VERBS = [
  'dismiss',
  'restore'
] as const

/** One of {@link DISCLAIMER_ACTION_VERBS}. */
export type DisclaimerActionVerb = typeof DISCLAIMER_ACTION_VERBS[number]

/** What a caller writes. Neither verb takes an argument. */
export type DisclaimerAction = DisclaimerActionVerb

/**
 * The one thing a command can reach for here.
 *
 * Named for what is at stake rather than for a verb, as `Drawer`'s `opening` is: a map
 * reading `dismiss: 'dismiss'` costs a reader a second look for nothing.
 */
export const DISCLAIMER_ACTION_DOMAINS = ['disclosure'] as const

/** One of {@link DISCLAIMER_ACTION_DOMAINS}. */
export type DisclaimerActionDomain = typeof DISCLAIMER_ACTION_DOMAINS[number]

/**
 * The domain of each verb — **what a reader's gesture silences**.
 *
 * Dismissing the panel claims the domain, which silences `restore` as much as `dismiss`:
 * putting a gate back over content someone chose to reveal is the hostility the whole
 * rule exists to prevent. `:force` is the way to mean it anyway.
 */
export const DISCLAIMER_ACTION_VERB_DOMAINS = {
  dismiss: 'disclosure',
  restore: 'disclosure'
} as const satisfies Record<DisclaimerActionVerb, DisclaimerActionDomain>
