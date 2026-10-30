/**
 * Everything a command can ask of a before/after.
 *
 * One verb, named after the value it writes as `Video`'s `volume` and `rate` are — there
 * is no index to count here, so `ratio:0` and `ratio:1` are the two ends and neither
 * needs a verb of its own.
 */
export const BEFORE_AFTER_ACTION_VERBS = ['ratio'] as const

/** One of {@link BEFORE_AFTER_ACTION_VERBS}. */
export type BeforeAfterActionVerb = typeof BEFORE_AFTER_ACTION_VERBS[number]

/** What a caller writes: the verb, and its position between `0` and `1`. */
export type BeforeAfterAction = `ratio:${number}`

const isRatio = (arg: string): boolean => {
  if (!/^\d+(?:\.\d+)?$/v.test(arg)) return false
  const value = Number(arg)
  return value >= 0 && value <= 1
}

/** How to read the argument of the one verb that takes one. */
export const BEFORE_AFTER_ACTION_VERB_ARGUMENTS = {
  ratio: isRatio
} as const satisfies Partial<Record<BeforeAfterActionVerb, (arg: string) => boolean>>

/**
 * The one thing a command can reach for here.
 *
 * It carries the verb's own name, which no other component does: elsewhere a domain
 * groups several verbs and needs a word of its own, where here one verb reaches one
 * thing and a second word would name nothing.
 */
export const BEFORE_AFTER_ACTION_DOMAINS = ['ratio'] as const

/** One of {@link BEFORE_AFTER_ACTION_DOMAINS}. */
export type BeforeAfterActionDomain = typeof BEFORE_AFTER_ACTION_DOMAINS[number]

/**
 * The domain of each verb — **what a reader's gesture silences**.
 *
 * Dragging the divider or clicking anywhere in the component moves it, so
 * either gesture claims the domain and `ratio` stops firing. `:force` opts out.
 */
export const BEFORE_AFTER_ACTION_VERB_DOMAINS = {
  ratio: 'ratio'
} as const satisfies Record<BeforeAfterActionVerb, BeforeAfterActionDomain>
