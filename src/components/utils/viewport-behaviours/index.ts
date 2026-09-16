import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject
} from 'react'
import { useIntersectionObserver } from '../../IntersectionObserver/index.js'
import { useChangeDispatch } from '../index.js'
import type {
  ActionSpec,
  ActionTable,
  ViewportBehaviours,
  VisibilityOptions
} from './types.js'
import {
  parseInstruction,
  toInstructionList
} from './utils.js'

/**
 * Whether a string is an instruction this vocabulary answers to.
 *
 * **It lives in the entry point and not next to `parseInstruction`**, which is where it
 * belongs by subject, because the publish step only maps `index.js` and `types.js` into
 * the package's exports — a `utils.js` is unreachable from outside, whatever it holds.
 *
 * **Exported for the consumers that receive their props as text.** lm-link reads an
 * article's XML, where nothing is typed, and has to reject `'jump-to:banana'` before it
 * reaches a component. Written on its side, the rule would exist twice and drift in
 * silence — a verb added here would be rejected there for no visible reason.
 *
 * Returns a plain boolean rather than a type predicate, and that is not an oversight: a
 * verb taking an argument is written `'jump-to:500'`, which is not a member of the verb
 * list this checks against. Narrowing to `Instruction<A>` would therefore claim more than
 * the list can support, and the caller that needs the narrow type is better off asserting
 * it once, where it can say why.
 *
 * @param value - What the consumer wrote.
 * @param verbs - The vocabulary, bare — `VIDEO_VERBS` and its like.
 * @param withArgument - Those of them that take one, and what a valid one looks like. A
 * verb given an argument it does not take, or denied one it needs, fails either way:
 * both are a consumer meaning something the component cannot do.
 */
export function isInstruction (
  value: unknown,
  verbs: readonly string[],
  withArgument: Readonly<Partial<Record<string, (arg: string) => boolean>>> = {}
): boolean {
  if (typeof value !== 'string') return false
  const { verb, arg } = parseInstruction(value)
  if (!verbs.includes(verb)) return false
  const validate = withArgument[verb]
  if (validate === undefined) return arg === undefined
  return arg !== undefined && validate(arg)
}

/**
 * Whether the element counts as visible — **as a state, not as a crossing**.
 *
 * That distinction is the whole point. An `IntersectionObserver` reports an event, and
 * a behaviour hung on the event only ever runs when the screen is traversed. A
 * component already visible whose behaviour was held back — behind a lm-link gate,
 * typically — never gets a second chance, because nothing crosses when the gate lifts.
 * Held as a state, the condition can be recombined with whatever else gates it.
 *
 * The delays are a debounce **on this state**: the element has to hold its new value
 * for that long before the value is committed. A component crossed while scrolling fast
 * therefore never counts as seen at all, rather than counting and being undone.
 *
 * @param targetRef - The element to watch.
 * @param options - The observer's settings, plus the two delays.
 * @param enabled - `false` mounts no observer. A hook can't be skipped; this is how
 * a caller with nothing to watch for says so.
 * @returns `true` or `false` once the first observation has settled, `undefined` before.
 */
export function useVisibilityState (
  targetRef: RefObject<Element | null>,
  options: VisibilityOptions = {},
  enabled = true
): boolean | undefined {
  const {
    visibilityThreshold: threshold,
    visibilityRoot: root,
    visibilityRootMargin: rootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  } = options
  const ioEntry = useIntersectionObserver(
    targetRef,
    { threshold, root, rootMargin },
    undefined,
    enabled
  )
  const reported = ioEntry?.isIntersecting
  const [settled, setSettled] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (reported === undefined) return
    const delay = reported ? visibilityOnAfterMs : visibilityOffAfterMs
    if (delay === undefined || delay <= 0) {
      setSettled(reported)
      return
    }
    const timeout = window.setTimeout(() => setSettled(reported), delay)
    // The cancellation *is* the debounce: a value that flips back before its timer
    // fires is never committed, so the short crossing leaves no trace.
    return () => window.clearTimeout(timeout)
  }, [reported, visibilityOnAfterMs, visibilityOffAfterMs])

  return settled
}

/** The shape `useViewportBehaviours` hands back. */
export type ViewportBehavioursResult = {
  isVisible: boolean | undefined
  /**
   * Tells the layer that the reader has taken over a domain, and that its instructions
   * are to stop firing. Call it from the handlers that count as taking over — and only
   * those: seeking on a timeline or going fullscreen is not deciding about playback.
   */
  surrender: (domain: string) => void
}

/**
 * Runs a component's visibility instructions, and holds everything that decides whether
 * they may run at all.
 *
 * @template A - The component's vocabulary.
 * @param targetRef - The element to watch.
 * @param props - The component's visibility props.
 * @param table - What each of its verbs does. @see {@link ActionTable}
 * @param suspended - Holds back the verbs that **start** something, and lets through
 * those that stop something. This is a capability's doing — a lm-link gate — and it is
 * not the same as a surrender: a gate speaks of consent not yet given, so `':force'`
 * does not override it.
 *
 * @remarks
 * **An instruction yields to the reader by default.** The failure modes are not
 * symmetrical: not restarting on its own is a disappointment, restarting against a
 * reader who has just pressed pause is an hostility they will meet again at every pass.
 * `':force'` opts out, and is expected to be rare — which is why it is the written form
 * and yielding is the silent one.
 */
export function useViewportBehaviours <A extends string> (
  targetRef: RefObject<Element | null>,
  props: ViewportBehaviours<A>,
  table: ActionTable<A>,
  suspended = false
): ViewportBehavioursResult {
  const {
    whenVisible,
    whenHidden,
    onVisibilityChanged
  } = props

  // The table closes over the component's state, so it is a new object on every render
  // and has no business in a dependency list. Read through a ref, it is never stale.
  //
  // Held as a `Map` and not as the record itself: a verb parsed out of a string is a
  // plain `string`, and looking one up in a `Record<A, …>` would mean asserting it into
  // the vocabulary before knowing whether it belongs to it. A map answers `undefined`,
  // which is the honest answer for an instruction nobody recognises.
  const tableRef = useRef<Map<string, ActionSpec>>(new Map())
  tableRef.current = new Map(Object.entries<ActionSpec>(table))

  const surrenderedRef = useRef(new Set<string>())
  const spentRef = useRef(new Set<string>())
  const heldBackRef = useRef(new Set<string>())
  const lastRunRef = useRef<{ isVisible?: boolean, suspended: boolean }>({ suspended })

  const surrender = useCallback((domain: string) => {
    surrenderedRef.current.add(domain)
  }, [])

  const needsObserve = whenVisible !== undefined
    || whenHidden !== undefined
    || onVisibilityChanged !== undefined

  const isVisible = useVisibilityState(targetRef, props, needsObserve)

  // Reported on the **settled** state, delays included: a consumer watching visibility
  // and a consumer running instructions have to be told the same story.
  useChangeDispatch(isVisible, next => {
    if (next === undefined) return
    onVisibilityChanged?.(next)
  })

  useEffect(() => {
    if (isVisible === undefined) return
    const last = lastRunRef.current
    const crossed = last.isVisible !== isVisible
    const released = !crossed && last.suspended && !suspended
    lastRunRef.current = { isVisible, suspended }
    // Neither the state nor the suspension moved: nothing to do. Without this, any
    // unrelated re-render would replay the list.
    if (!crossed && !released) return

    const trigger = isVisible ? 'visible' : 'hidden'
    const list = toInstructionList(isVisible ? whenVisible : whenHidden)
    const runnable = dedupe(list)
    if (released) heldBackRef.current.clear()

    for (const parsed of runnable) {
      const key = `${trigger}|${parsed.verb}|${parsed.arg ?? ''}`
      // A suspension only reaches a verb that *starts* something, and it is the only
      // one of the two brakes that can be lifted — hence the held-back list, replayed
      // on release so a gate opening on a visible component does what it was asked.
      const spec = tableRef.current.get(parsed.verb)
      if (spec === undefined) continue
      if (released && !heldBackRef.current.has(key)) continue
      if (suspended && spec.kind === 'start') {
        heldBackRef.current.add(key)
        continue
      }
      if (!parsed.force && surrenderedRef.current.has(spec.domain)) continue
      if (parsed.once && spentRef.current.has(key)) continue
      if (parsed.once) spentRef.current.add(key)
      heldBackRef.current.delete(key)
      spec.run(parsed.arg)
    }
  }, [isVisible, suspended, whenVisible, whenHidden])

  return { isVisible, surrender }
}

/**
 * One entry per verb, keeping the **widest** reading when the same verb is written more
 * than once in a list.
 *
 * `['play', 'play:once']` runs on every crossing — the bare form wins, which is the
 * long-standing rule that declaring both frequencies is declaring the recurring one.
 * `['play', 'play:force']` is forced, by the same logic read the other way: a consumer
 * who wrote `force` somewhere asked for it.
 */
function dedupe (list: string[]): Array<ReturnType<typeof parseInstruction>> {
  const byVerb = new Map<string, ReturnType<typeof parseInstruction>>()
  for (const instruction of list) {
    const parsed = parseInstruction(instruction)
    if (parsed.verb === '') continue
    const key = `${parsed.verb}|${parsed.arg ?? ''}`
    const seen = byVerb.get(key)
    if (seen === undefined) { byVerb.set(key, parsed); continue }
    byVerb.set(key, {
      ...parsed,
      once: seen.once && parsed.once,
      force: seen.force || parsed.force
    })
  }
  return [...byVerb.values()]
}
