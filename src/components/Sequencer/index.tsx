import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode
} from 'react'
import { absoluteModulo } from '../../agnostic/numbers/absolute-modulo/index.js'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import { useStateChangeDispatch } from '../utils/index.js'
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
import {
  getChildActiveSteps,
  hasDataLastStepAttribute
} from './utils.js'

// The position is the counter the tempo advances; the active step is what it means
// through `stepMap`. Children are matched against the active step, never the position.

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
 * @property tempo - Speed in beats per minute: one step every `60000 / tempo` ms, so `60`
 * is a step per second. Clamped to a minimum of `1`.
 * @property loop - Whether the sequence wraps round. **`false` by default**, so a
 * sequence ends the way a video does rather than running forever.
 * @property onStepChanged - Called when the position changes, with `step` and the
 * `activeStep` it resolves to. Never on mount.
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
  onStepChanged?: (payload: { step: number, activeStep: number }) => void
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onIsEndedChanged?: (isEnded: boolean) => void
  onLooped?: () => void
  onReachedFirstStep?: () => void
  onReachedLastStep?: () => void
}>>
  & ViewportBehaviours<SequencerAction>

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
 * @see {@link SequencerDomain}
 *
 * ### On the root
 * `--playing`, `--at-start`, `--at-end`, `--ended`, plus `data-step`, `data-active-step`,
 * `data-total-steps`, `data-tempo` and `data-lap`.
 *
 * The same five numbers are also published as custom properties —
 * `--lm-sequencer-step`, `--lm-sequencer-active-step`, `--lm-sequencer-total-steps`,
 * `--lm-sequencer-tempo`, `--lm-sequencer-lap` — plus `--lm-sequencer-raw-step`, the
 * counter that keeps growing across laps (`lap × total + step`). **A data attribute
 * selects, a custom property computes**: `attr()` cannot feed a `calc()`, so a rule that
 * wants to turn something by a degree per step needs the property, and gets it on every
 * descendant since custom properties inherit —
 * `transform: rotate(calc(var(--lm-sequencer-raw-step) * 5deg))`.
 *
 * No `-raw` twin as `ResizeObserver` has: every one of these is a bare number, and none
 * of them would mean anything with a unit attached.
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

  const childrenArr = Children.toArray(children)
  const elements = childrenArr.filter(isValidElement)
  const markedLast = elements.findIndex(hasDataLastStepAttribute)
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

  // The counter runs one past the end so the last step gets its beat, and the position
  // clamps to it. Ended is therefore leaving the last step, not arriving on it.
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

  // The lap offset only applies while looping: on a sequence that does not loop, `lap`
  // reads `1` past the end, and adding it would land `jump-start` back on the end.
  const jumpToPosition = (target: number): void => {
    if (step !== undefined || stepsCount <= 0) return
    const resolved = target < 0 ? stepsCount + target : target
    const bounded = loop === true
      ? absoluteModulo(resolved, stepsCount)
      : clamp(resolved, 0, stepsCount - 1)
    setInternalStep(loop === true ? lap * stepsCount + bounded : bounded)
  }

  const jumpBy = (offset: number): void => {
    if (step !== undefined || stepsCount <= 0) return
    setInternalStep(current => current + offset)
  }

  // `play` and `pause` need no guard against a controlled `play`: the effective state
  // reads the prop first, so the internal one they write is never consulted.
  const actions: ActionTable<SequencerVerb, SequencerDomain> = {
    play: { domain: 'playback', run: () => setInternalPlay(true) },
    pause: { domain: 'playback', run: () => setInternalPlay(false) },
    'jump-to': {
      domain: 'playback',
      run: arg => {
        const target = Number(arg)
        if (!Number.isFinite(target)) return
        jumpToPosition(target)
      }
    },
    'jump-start': { domain: 'playback', run: () => jumpToPosition(0) },
    'jump-end': { domain: 'playback', run: () => jumpToPosition(-1) },
    'jump-by': {
      domain: 'playback',
      run: arg => {
        const offset = Number(arg)
        if (!Number.isFinite(offset)) return
        jumpBy(offset)
      }
    }
  }

  // The surrender half is dropped: this component has no control a hand could take over.
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
    actions
  )

  // State dispatch
  useStateChangeDispatch(position, () => onStepChanged?.({ step: position, activeStep }))
  useStateChangeDispatch(isPlaying, onIsPlayingChanged)
  useStateChangeDispatch(isEnded, onIsEndedChanged)
  useStateChangeDispatch(position === 0, atStart => { if (atStart) onReachedFirstStep?.() })
  useStateChangeDispatch(
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

  const positionsOf = (steps: number[]): number[] => {
    const positions: number[] = []
    for (let i = 0; i < stepsCount; i += 1) {
      if (steps.includes(stepMap?.[i] ?? i)) positions.push(i)
    }
    return positions
  }

  // A lap is a wrap, so there is none without `loop` — where the internal counter would
  // report `1` past the end. Both numbers below are rebuilt from it rather than `rawStep`.
  const publishedLap = loop === true ? lap : 0
  const rawStepProp = publishedLap * stepsCount + position
  const cssCustomProps: Record<string, string> = {
    '--lm-sequencer-step': `${position}`,
    '--lm-sequencer-active-step': `${activeStep}`,
    '--lm-sequencer-total-steps': `${stepsCount}`,
    '--lm-sequencer-tempo': `${tempo}`,
    '--lm-sequencer-lap': `${publishedLap}`,
    '--lm-sequencer-raw-step': `${rawStepProp}`
  }

  let elementIndex = -1
  return <div
    ref={rootRef}
    className={rootClss}
    data-step={position}
    data-active-step={activeStep}
    data-total-steps={stepsCount}
    data-tempo={tempo}
    data-lap={publishedLap}
    style={{ ...cssCustomProps }}>
    {childrenArr.map((child, childPos): ReactNode => {
      if (!isValidElement(child)) return child
      elementIndex += 1
      const steps = getChildActiveSteps(child, elementIndex)
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
      // The child's own class comes second, so a consumer wins a shorthand conflict.
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
