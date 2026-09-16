import type { WithViewportObservation } from '../types.js'

/**
 * The stop conditions an instruction can carry, written as suffixes.
 *
 * - `once` — runs on the first crossing only. The credit is per (verb, trigger) pair
 *   and lives for the mount.
 * - `force` — runs even after the reader has taken over the verb's domain. It
 *   overrides the **surrender**, never a suspension: a gate speaks of consent not yet
 *   given, a surrender of an intention already expressed, and an article able to force
 *   its way past a disclaimer would empty it of its purpose.
 *
 * **They are a set, not a sequence.** `'play:once:force'` and `'play:force:once'` are
 * the same instruction, which is what spares the contract an ordering rule.
 */
export const MODIFIERS = ['once', 'force'] as const

export type Modifier = typeof MODIFIERS[number]

/**
 * A verb, optionally suffixed by its stop conditions.
 *
 * A verb may carry its own argument — `'jump-to:500'` — in which case the argument is
 * part of `A`, declared by the component that owns the vocabulary. The modifiers then
 * suffix that whole form: `'jump-to:500:once'` needs nothing written here.
 *
 * **No verb may be named after a modifier.** The trailing segments are read as
 * modifiers first, so a verb called `once` would parse as an instruction with no verb
 * at all.
 *
 * @template A - The component's vocabulary.
 */
export type Instruction<A extends string> =
  | A
  | `${A}:${Modifier}`
  | `${A}:${Modifier}:${Modifier}`

/** An instruction taken apart. @see {@link Instruction} */
export type ParsedInstruction = {
  verb: string
  /** What followed the verb, when the verb takes one. `'500'` in `'jump-to:500'`. */
  arg?: string
  once: boolean
  force: boolean
}

/**
 * What a component says about one of its verbs.
 *
 * @property kind - Whether the verb starts something or stops it. A suspension — a
 * lm-link gate, typically — holds back `'start'` and lets `'stop'` through, since a
 * verb that quietens a component can never work against a reader who hasn't consented
 * yet.
 * @property domain - Which of the component's controls this verb competes with.
 * `play` and `pause` share `'playback'`, `loud` and `mute` share `'sound'` — so pausing
 * by hand doesn't stop the sound from being cut on the way out. One flag for all of
 * them would confound four questions, which is a mistake this library has made once.
 * @property run - Does the thing. Receives the verb's argument, when it takes one.
 */
export type ActionSpec = {
  kind: 'start' | 'stop'
  domain: string
  run: (arg?: string) => void
}

/** A component's whole vocabulary. @see {@link ActionSpec} */
export type ActionTable<A extends string> = Record<A, ActionSpec>

/**
 * The visibility surface of a component: when it counts as seen, and what that does.
 *
 * Three families, answering three different questions. `threshold` and `rootMargin`
 * say **from what point** it is visible; the two delays say **for how long** it has to
 * have been; the two lists say **what happens then**.
 *
 * @property whenVisible - Instructions run each time the component becomes visible.
 * @property whenHidden - The same, on the way out.
 * @property visibleAfterMs - How long it must stay visible to count as visible. This
 * is a debounce on the state and not a delay on the action: a component crossed while
 * scrolling fast never counts as seen, so nothing runs and no `once` credit is spent.
 * @property hiddenAfterMs - The same, on the way out.
 *
 * @template Action - The component's vocabulary.
 */
export type ViewportBehaviours<Action extends string> = WithViewportObservation<{
  whenVisible?: Instruction<Action> | Array<Instruction<Action>>
  whenHidden?: Instruction<Action> | Array<Instruction<Action>>
  visibleAfterMs?: number
  hiddenAfterMs?: number
}>
