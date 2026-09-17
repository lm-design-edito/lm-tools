/**
 * The verbs a scroll listener answers to.
 *
 * Two, and there could not be more: measuring is the only thing this component does, so
 * starting and stopping it is the whole of what a trigger can act on. `track` is the old
 * `startOnVisible` and `untrack` the old `stopOnHidden`, said in the grammar the library
 * shares rather than in two props of its own.
 *
 * Neither takes an argument.
 */
export const SCROLL_LISTENER_VERBS = [
  'track',
  'untrack'
] as const

export type ScrollListenerVerb = typeof SCROLL_LISTENER_VERBS[number]

/**
 * The instructions a consumer writes in `whenVisible` / `whenHidden`.
 *
 * No verb takes an argument here, so an action *is* a verb. Both take the `':once'` and
 * `':force'` suffixes, which are the generic layer's and are not restated here.
 */
export type ScrollListenerAction = ScrollListenerVerb

/**
 * What a verb competes with — one domain, and it is a formality.
 *
 * **This component has no controls**: nothing to click, so nothing a reader can take over
 * and nothing that ever surrenders. The field is part of `ActionSpec` and is declared
 * honestly rather than split into domains no hand could ever tell apart. The consequence
 * is that `':force'` has no trigger here.
 *
 * A gate is the other brake, and it does reach `track`: measuring a subtree nobody is
 * being shown is work done for no one.
 */
export type ScrollListenerDomain = 'tracking'
