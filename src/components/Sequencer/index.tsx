import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode
} from 'react'
import { absoluteModulo } from '../../agnostic/numbers/absolute-modulo/index.js'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames, useChangeDispatch } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { useViewportBehaviours } from '../utils/viewport-behaviours/index.js'
import type {
  ActionTable,
  ViewportBehaviours
} from '../utils/viewport-behaviours/types.js'
import { sequencer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'
import type {
  SequencerAction,
  SequencerDomain,
  SequencerVerb
} from './types.js'

/**
 * The attribute a child uses to say which steps it belongs to.
 *
 * **Written on the child rather than gathered in a prop**, and that is the whole
 * difference with the `activateOnStep` this component used to take. A parallel array and
 * a children list derive from one another: inserting a child in the middle means
 * reindexing the array, and nothing signals the one time it is forgotten. Carried by the
 * child, the attachment travels with it.
 *
 * It stays in the DOM once read — it costs nothing, it is worth having while debugging,
 * and a stylesheet can select on it.
 */
const STEPS_ATTRIBUTE = 'data-steps'

/**
 * The attribute a child uses to say that the sequence ends on it.
 *
 * It answers a shape the positional fallback could not: an article writes the steps in
 * reading order, then — **after** the sequence proper — the children that belong to
 * several steps at once and name them with {@link STEPS_ATTRIBUTE}. Those trailing
 * children would each claim a step of their own in the count, and the sequence would run
 * on into steps where nothing but them is lit.
 *
 * Marking the last step is what separates the two halves, and it is written where the
 * separation is rather than recounted in a prop — the same reason `data-steps` lives on
 * the child. A child after the mark that names no step therefore never lights up, which
 * is the honest reading of « it is not part of the sequence ».
 *
 * Valueless, as an HTML boolean attribute: what matters is that it is there.
 */
const LAST_STEP_ATTRIBUTE = 'data-last-step'

/*
 * Two numbers run this component and they are not the same one.
 *
 * **The position** is the counter. It goes from `0` to `totalSteps - 1`, it is what the
 * tempo advances, and it is what `step` controls when a consumer provides it.
 *
 * **The active step** is what the position *means* — `stepMap[position] ?? position`.
 * Without a `stepMap` the two are equal, which is why they were one number until now.
 *
 * Children are matched against the active step, never against the position.
 */

/**
 * @property totalSteps - How many steps the sequence has. Falls back to the first child
 * marked `data-last-step`, which sets the count to its own position plus one, and then
 * to the number of **element** children: text and whitespace never count, which matters
 * more than it looks — an article writes its children across several lines, and a text
 * node counting as a step would put every index out by one.
 * @property stepMap - Rewrites what a position means, **by position and nothing else**:
 * at position `i` the active step is `stepMap[i]` when there is one, and `i` otherwise.
 * `[2, 6, 7]` over seven steps plays `2, 6, 7, 3, 4, 5, 6` — a step may be skipped, may
 * come back, and may not correspond to any child at all, in which case nothing lights up
 * and that is a legal thing to write.
 * @property step - The position, taken over by the consumer. Provided, the tempo stops
 * advancing anything: the counter is theirs.
 * @property defaultStep - The position to start from. Ignored when `step` is provided.
 * @property play - Whether the sequence advances, taken over by the consumer. Provided,
 * it is the whole answer and the instructions no longer reach it, the way `step` takes
 * the counter over from the tempo.
 * @property defaultPlay - Whether it starts advancing. `false` by default, and the
 * starting point a `'play'` instruction moves from — not a setting, hence `default…`.
 * @property behavioursSuspended - Holds back the instructions that **start** something,
 * and lets through those that stop it. For a consumer withholding the sequence behind
 * something — a warning to accept, typically. What was held back is replayed the moment
 * this goes false, so lifting the veil on an already-visible sequence does what was
 * asked. `':force'` does not override it.
 * @property tempo - Speed in beats per minute: one step every `60000 / tempo` ms, so `60`
 * is a step per second. Clamped to a minimum of `1`.
 * @property loop - Whether the sequence wraps round. **`false` by default**, so a
 * sequence ends the way a video does rather than running forever.
 * @property onStepChanged - Called when the position changes, with the position and the
 * active step it resolves to. Never on mount.
 * @property onIsPlayingChanged - Called once the effective play state changed — which
 * includes it dropping to `false` on its own at the end.
 * @property onIsEndedChanged - Called when the sequence ends, or leaves that state.
 * **The end is the counter leaving the last step, not arriving on it** — the last step
 * is owed its beat like every other one, and a sequence paused on it has not ended. A
 * looping sequence never ends, so never emits.
 * @property onLooped - Called on each wrap, only while `loop` is `true`.
 * @property onReachedFirstStep - Called when the position becomes `0`.
 * @property onReachedLastStep - Called when the position becomes the last one. This is
 * the arrival, where `onIsEndedChanged` is the departure: on a playing sequence they are
 * one beat apart.
 */
export type Props = PropsWithChildren<WithClassName<{
  totalSteps?: number
  stepMap?: number[]
  step?: number
  defaultStep?: number
  play?: boolean
  defaultPlay?: boolean
  tempo?: number
  loop?: boolean
  onStepChanged?: (step: number, activeStep: number) => void
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onIsEndedChanged?: (isEnded: boolean) => void
  onLooped?: () => void
  onReachedFirstStep?: () => void
  onReachedLastStep?: () => void
}>>
  & ViewportBehaviours<SequencerAction>
  & { behavioursSuspended?: boolean }

/**
 * `data-steps="2, 6"` into the steps it names.
 *
 * Anything unreadable gives back `null`, which the caller reads as « the attribute was
 * not written » and falls back to the child's position. That is lm-link's rule applied
 * here — a typo costs the default behaviour, never a broken one.
 */
function parseSteps (raw: unknown): number[] | null {
  if (typeof raw !== 'string') return null
  const parts = raw.split(',').map(part => part.trim()).filter(part => part !== '')
  if (parts.length === 0) return null
  const steps = parts.map(Number)
  if (steps.some(step => !Number.isInteger(step))) return null
  return steps
}

/**
 * The children, with fragments opened.
 *
 * **`Children.toArray` does not go through a `<>…</>`**: a fragment is one element to it,
 * and one that cannot be classed either — `cloneElement` on it would hand `className` to
 * `React.Fragment`, which warns and drops it. So a consumer whose children arrive wrapped
 * in one gets a sequence of exactly one step, stuck on position `0`.
 *
 * That consumer is not hypothetical: lm-link renders an article's `<nodelist>` through
 * `lm-html`, which returns `<>{children}</>` — every sequence written in hyper-json
 * therefore arrives wrapped. Opening them here rather than asking each consumer to
 * flatten is the only place the fix belongs: a fragment is a grouping with no rendered
 * element of its own, so it has no business consuming a step.
 */
function flattenChildren (nodes: ReactNode): ReactNode[] {
  return Children.toArray(nodes).flatMap((child): ReactNode[] => {
    if (!isValidElement(child) || child.type !== Fragment) return [child]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a fragment's props are its children and its key, whatever else they are
    const { children } = child.props as { children?: ReactNode }
    return flattenChildren(children)
  })
}

/**
 * Whether a child carries {@link LAST_STEP_ATTRIBUTE}.
 *
 * Present is enough — `data-last-step` alone gives `''` through lm-html, and `true`
 * written in JSX. Only an explicit denial is read as one, so that a consumer computing
 * the attribute can write `false` without having to leave it out.
 */
function isLastStep (child: ReactElement): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const raw = (child.props as Record<string, unknown>)[LAST_STEP_ATTRIBUTE]
  if (raw === undefined || raw === null) return false
  return raw !== false && raw !== 'false'
}

/** The steps a child answers to: what it declares, or where it sits. */
function stepsOf (child: ReactElement, elementIndex: number): number[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
  const declared = parseSteps((child.props as Record<string, unknown>)[STEPS_ATTRIBUTE])
  return declared ?? [elementIndex]
}

/**
 * A sequencer over its children, which it classifies and never moves.
 *
 * It renders no box of its own around anything: **the modifiers go straight onto the
 * children**, by `cloneElement`. A wrapper would take the place a consumer lays out —
 * it would be the grid or flex item, leaving the element they actually wrote one level
 * down — and a sequencer exists precisely so that a stylesheet can animate that element.
 * The cost is the contract: **a child has to honour `className`**, which every DOM
 * element does, and every component here does by convention. One that ignores it gets no
 * modifiers, silently.
 *
 * Children that are not elements — text, whitespace — are rendered untouched and take no
 * part: they carry no class, so they simply stay visible throughout. **A fragment is
 * opened rather than counted**: it groups without rendering an element of its own, so
 * there would be nothing to class and nothing to show for the step it would consume.
 *
 * ### Where the sequence ends
 * A child marked `data-last-step` ends it, and what follows still takes part — through
 * `data-steps` alone. That is what lets an article write the steps in reading order and
 * put the children belonging to several of them at once **after**, where they read as
 * what they are, rather than having their position counted as a step of its own:
 *
 * ```html
 * <div>1</div><div>2</div><div data-last-step>3</div>
 * <div data-steps="0, 1">both of the first two</div>
 * ```
 *
 * Three steps, four children. A trailing child that names no step never lights up, which
 * is the honest reading of « it is not part of the sequence ».
 *
 * @remarks
 * **Viewport-driven behaviour is declared, not named by a prop.** `whenVisible` and
 * `whenHidden` take a verb or a list of them, out of {@link SequencerAction} — `'play'`,
 * `'jump-start'`, `'jump-by:1'` — each optionally suffixed by `':once'` and `':force'`.
 * The old `playOnVisible`, `pauseOnHidden`, `resetOnVisible` and `resetOnHidden` are
 * those four instructions written the long way: `whenHidden={['pause', 'jump-start']}`
 * is the pair of them, and the order of a list is the order of execution. See
 * `components/utils/viewport-behaviours` for the grammar, and the `visibility…` props
 * for what « visible » means and how long it has to have been true.
 *
 * **Nothing surrenders here.** The layer lets a reader's hand switch an instruction off
 * for the rest of the mount, and this component has no control for a hand to touch — so
 * `':force'` has nothing to override, and the single `'playback'` domain is a formality.
 * A gate still holds `'play'` back, which is a different brake. @see {@link SequencerDomain}
 *
 * ### On the root
 * `--playing`, `--at-start`, `--at-end`, `--ended`, plus `data-step`, `data-active-step`,
 * `data-total-steps` and `data-tempo`.
 *
 * ### On each element child
 * The `__child` element class, then three pairs, one of each always present:
 * - `--on` / `--off` — whether it belongs to the active step.
 * - `--is-first` / `--not-first` — whether its first turn in this lap is still to come.
 * - `--is-last` / `--not-last` — whether it has another turn left in this lap.
 *
 * **The three pairs are derived, not remembered.** The order of the whole lap is known
 * from `stepMap` alone, so « has it been shown yet » is a question about positions before
 * this one, not about what happened since mount. A child active at positions 1 and 6 is
 * therefore `--is-first` at 1 and `--not-first` at 6, and the answer is the same on every
 * lap without anything being reset.
 */
export const Sequencer: FunctionComponent<Props> = ({
  totalSteps,
  stepMap,
  step,
  defaultStep,
  play,
  defaultPlay,
  tempo = 60,
  loop,
  onStepChanged,
  onIsPlayingChanged,
  onIsEndedChanged,
  onLooped,
  onReachedFirstStep,
  onReachedLastStep,
  behavioursSuspended,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  className,
  children
}) => {
  const [internalStep, setInternalStep] = useState(step ?? defaultStep ?? 0)
  const [internalPlay, setInternalPlay] = useState(defaultPlay ?? false)
  const [hasLapped, setHasLapped] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  // Children, split once: what takes part and what merely renders.
  const childrenArr = flattenChildren(children)
  const elements = childrenArr.filter(isValidElement)
  // Three answers to « how long is the sequence », in decreasing order of explicitness:
  // the prop, then the child that says the sequence ends on it, then the count of
  // element children. The prop wins because it is the one a consumer writes knowing the
  // whole, where the mark only knows where it sits.
  const markedLast = elements.findIndex(isLastStep)
  const impliedSteps = markedLast === -1 ? elements.length : markedLast + 1
  const stepsCount = Math.max(totalSteps ?? impliedSteps, 0)

  // The two numbers
  const rawStep = step ?? internalStep
  const position = stepsCount > 0
    ? (loop === true
        ? absoluteModulo(rawStep, stepsCount)
        : clamp(rawStep, 0, stepsCount - 1))
    : 0
  const activeStep = stepMap?.[position] ?? position

  // **The end is the counter leaving the last step, not arriving on it.** The last step
  // is owed its beat like every other one, so the counter runs one past the end while
  // the position clamps to it — which is also what keeps the whole thing derived: nothing
  // has to be unset when `loop` or `step` changes under it, and `onReachedLastStep` stays
  // the arrival that this is not. A sequence merely paused on the last step has not
  // ended, and a consumer driving `step` says so by naming the position after the last.
  const isEnded = loop !== true && stepsCount > 0 && rawStep >= stepsCount
  const isPlaying = (play ?? internalPlay) && !isEnded

  useEffect(() => {
    if (!isPlaying || step !== undefined || stepsCount <= 0) return
    const interval = window.setInterval(
      () => setInternalStep(current => current + 1),
      60000 / Math.max(tempo, 1)
    )
    return () => window.clearInterval(interval)
  }, [isPlaying, step, stepsCount, tempo])

  // A lap counter rather than a comparison of steps: `onLooped` has to fire on the wrap
  // itself, and the position on either side of it says nothing about having crossed.
  const lap = stepsCount > 0 ? Math.floor(rawStep / stepsCount) : 0
  useEffect(() => {
    if (loop !== true) return
    if (lap === hasLapped) return
    setHasLapped(lap)
    onLooped?.()
  }, [lap, loop])

  // Viewport behaviours

  // A jump names a position and lands on it **within the current lap**: the counter is
  // absolute, so setting it to a bare position on a looping sequence would count as a
  // wrap backwards and fire `onLooped` for a move nobody made. `jump-by` is left alone
  // on purpose — stepping past the last position really is a wrap, and says so.
  const jumpToPosition = (target: number): void => {
    if (step !== undefined || stepsCount <= 0) return
    const resolved = target < 0 ? stepsCount + target : target
    const bounded = loop === true
      ? absoluteModulo(resolved, stepsCount)
      : clamp(resolved, 0, stepsCount - 1)
    setInternalStep(lap * stepsCount + bounded)
  }

  const jumpBy = (offset: number): void => {
    if (step !== undefined || stepsCount <= 0) return
    setInternalStep(current => current + offset)
  }

  // What each verb does. Rebuilt on every render — it closes over the setters — which is
  // why the generic layer reads it through a ref rather than a dependency list.
  //
  // `play` and `pause` need no guard against a controlled `play`: the effective state
  // reads the prop first, so the internal one they write is simply never consulted.
  const actions: ActionTable<SequencerVerb, SequencerDomain> = {
    play: { kind: 'start', domain: 'playback', run: () => setInternalPlay(true) },
    pause: { kind: 'stop', domain: 'playback', run: () => setInternalPlay(false) },
    // A jump starts nothing on its own — it moves a counter, playing or not — so a gate
    // has no reason to hold it back.
    'jump-to': {
      kind: 'stop',
      domain: 'playback',
      run: arg => {
        const target = Number(arg)
        if (!Number.isFinite(target)) return
        jumpToPosition(target)
      }
    },
    'jump-start': { kind: 'stop', domain: 'playback', run: () => jumpToPosition(0) },
    'jump-end': { kind: 'stop', domain: 'playback', run: () => jumpToPosition(-1) },
    'jump-by': {
      kind: 'stop',
      domain: 'playback',
      run: arg => {
        const offset = Number(arg)
        if (!Number.isFinite(offset)) return
        jumpBy(offset)
      }
    }
  }

  // The surrender half of the result is dropped, and that is the whole of what this
  // component's lack of controls changes: nothing here can be taken over by hand.
  useViewportBehaviours<SequencerAction>(
    rootRef,
    {
      visibilityThreshold,
      visibilityRoot,
      visibilityRootMargin,
      visibilityOnAfterMs,
      visibilityOffAfterMs,
      whenVisible,
      whenHidden,
      onVisibilityChanged
    },
    actions,
    behavioursSuspended === true
  )

  // State dispatch
  useChangeDispatch(position, () => onStepChanged?.(position, activeStep))
  useChangeDispatch(isPlaying, onIsPlayingChanged)
  useChangeDispatch(isEnded, onIsEndedChanged)
  useChangeDispatch(position === 0, atStart => { if (atStart) onReachedFirstStep?.() })
  useChangeDispatch(
    stepsCount > 0 && position === stepsCount - 1,
    atEnd => { if (atEnd) onReachedLastStep?.() }
  )

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    playing: isPlaying,
    'at-start': position === 0,
    'at-end': stepsCount > 0 && position === stepsCount - 1,
    ended: isEnded
  }), className)

  // Walked once per render: for each element, the positions of this lap at which it is
  // active. Cheap, and it is what makes the three pairs answerable without memory.
  const positionsOf = (steps: number[]): number[] => {
    const positions: number[] = []
    for (let i = 0; i < stepsCount; i += 1) {
      if (steps.includes(stepMap?.[i] ?? i)) positions.push(i)
    }
    return positions
  }

  let elementIndex = -1
  return <div
    ref={rootRef}
    className={rootClss}
    data-step={position}
    data-active-step={activeStep}
    data-total-steps={stepsCount}
    data-tempo={tempo}>
    {childrenArr.map((child, childPos): ReactNode => {
      if (!isValidElement(child)) return child
      elementIndex += 1
      const steps = stepsOf(child, elementIndex)
      const positions = positionsOf(steps)
      const isOn = steps.includes(activeStep)
      const hasEarlier = positions.some(p => p < position)
      const hasLater = positions.some(p => p > position)
      const childClss = c('child', {
        on: isOn,
        off: !isOn,
        'is-first': !hasEarlier,
        'not-first': hasEarlier,
        'is-last': !hasLater,
        'not-last': hasLater
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a React element's props are a record, whatever else they are
      const ownClassName = (child.props as Record<string, unknown>).className
      // `className` is the whole of what a child is asked to honour, and the only prop
      // touched here — its own is kept, and comes second so a consumer's class wins a
      // shorthand conflict.
      const nextProps: Partial<Record<string, unknown>> = {
        key: childPos,
        className: mergeClassNames(
          childClss,
          typeof ownClassName === 'string' ? ownClassName : undefined
        )
      }
      return cloneElement(child, nextProps)
    })}
  </div>
}
