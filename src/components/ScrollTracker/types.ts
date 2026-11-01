/**
 * Everything a command can ask of a scroll tracker: whether it measures, and nothing
 * else. Neither verb takes an argument, and the measurements themselves are read, never
 * written.
 */
export const SCROLL_TRACKER_ACTION_VERBS = [
  'track',
  'untrack'
] as const

/** One of {@link SCROLL_TRACKER_ACTION_VERBS}. */
export type ScrollTrackerActionVerb = typeof SCROLL_TRACKER_ACTION_VERBS[number]

/** What a caller writes. Neither verb takes an argument. */
export type ScrollTrackerAction = ScrollTrackerActionVerb

/** The one thing a command can reach for here. */
export const SCROLL_TRACKER_ACTION_DOMAINS = ['tracking'] as const

/** One of {@link SCROLL_TRACKER_ACTION_DOMAINS}. */
export type ScrollTrackerActionDomain = typeof SCROLL_TRACKER_ACTION_DOMAINS[number]

/**
 * The domain of each verb — **what a reader's gesture would silence**.
 *
 * Nothing silences it today, and that is not an omission: this component renders no
 * control, and measuring the scroll is not something a reader takes in hand. The domain
 * is declared all the same, as `Sequencer`'s two are, and starts working on its own the
 * day a gesture reaches it.
 */
export const SCROLL_TRACKER_ACTION_VERB_DOMAINS = {
  track: 'tracking',
  untrack: 'tracking'
} as const satisfies Record<ScrollTrackerActionVerb, ScrollTrackerActionDomain>
