import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type ReactNode
} from 'react'
import { useStateChangeDispatch } from '../../agnostic/@react/effects/use-state-change-dispatch/index.js'
import type {
  ChildrenProps,
  ClassNameProps
} from '../../agnostic/@react/types/index.js'
import { absoluteModulo } from '../../agnostic/numbers/absolute-modulo/index.js'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import { useCommands } from '../utils/commands/index.js'
import { useDisclosure } from '../utils/disclosure/index.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import { sequencer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'
import { SEQUENCER_ACTION_VERB_ARGUMENTS } from './types.js'
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
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
export type Props = {
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
}
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

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
 * ### Disclosure
 * Under a standing `Disclaimer` the tempo does not run, from `defaultPlay` no more than
 * from a verb, and the component sends nothing. The step is kept, so dismissing the panel
 * resumes where the article left it instead of restarting.
 *
 * ### Commands
 * - `play` / `pause` — the tempo runs or stops.
 * - `jump-to:<n>`, `jump-start`, `jump-end`, `jump-by:<n>` — a whole number, negative
 *   counting back from the end, so `jump-to:-1` is the last step and `jump-by:-1` one
 *   step back.
 *
 * **A verb never contradicts a prop**: `play` and `pause` are inert while `play` arrived
 * as one, the four `jump-*` while `step` did. **A command never surrenders either** —
 * there is no control to touch here, so `:force` has nothing to override.
 *
 * **Nothing is clamped here, and that is the exception in the library**: elsewhere a
 * position outside the component lands on the nearest end, but a step past the last one
 * is a real position in the next lap, so there is no outside to be brought back from.
 *
 * `play` on a sequence that has ended does nothing, since ending is what stops it:
 * `['jump-start', 'play']` is how it starts again, and a `loop` sequence never ends so
 * never meets the case. An absolute jump stays in the lap it was made from, so it is not
 * a wrap and `onLooped` does not fire.
 *
 * @remarks
 * ### On the root
 * `--playing`, `--at-start`, `--at-end`, `--ended`, `--visible`, plus `data-step`,
 * `data-active-step`, `data-total-steps`, `data-tempo` and `data-lap`.
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
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
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
  className,
  children
}) => {
  const compId = useCompId(givenCompId)

  const rootRef = useRef<HTMLDivElement>(null)
  const isVisible = useVisibilityTriggers(compId, rootRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })

  const [internalStep, setInternalStep] = useState(defaultStep ?? 0)
  const [internalPlay, setInternalPlay] = useState(defaultPlay ?? false)
  const [hasLapped, setHasLapped] = useState(0)

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
  // A sequence withheld by a disclaimer does not advance. Read here rather than in the
  // clock, so the `playing` modifier and `onIsPlayingChanged` say the same thing the
  // tempo does — and so the step is kept, the reader landing where the article left it.
  const { isDisclosed } = useDisclosure()
  const isPlaying = (play ?? internalPlay) && !isEnded && isDisclosed

  // A lap counter rather than a comparison of steps: `onLooped` has to fire on the wrap
  // itself, and the position on either side of it says nothing about having crossed.
  const lap = stepsCount > 0 ? Math.floor(rawStep / stepsCount) : 0
  // A lap is a wrap, so there is none without `loop` — where the internal counter would
  // report `1` past the end.
  const publishedLap = loop === true ? lap : 0

  // Commands
  //
  // Written here rather than in a module of its own: every verb writes this component's
  // state, so a sibling file could only be handed each setter back.
  const readArgument = (
    verb: keyof typeof SEQUENCER_ACTION_VERB_ARGUMENTS,
    args: string[]
  ): string | null => {
    const arg = args[0]
    if (arg !== undefined && SEQUENCER_ACTION_VERB_ARGUMENTS[verb](arg)) return arg
    // eslint-disable-next-line no-console
    console.warn(`"${verb}" was sent an argument it cannot read: "${arg ?? ''}"`)
    return null
  }

  // An absolute jump writes the position of the lap it was made from, so it never reads
  // as a wrap. A negative step counts back from the end, `-1` being the last one.
  const jumpTo = (targetStep: number): void => {
    if (step !== undefined) return
    const inLap = targetStep < 0 ? stepsCount + targetStep : targetStep
    setInternalStep(publishedLap * stepsCount + inLap)
  }

  useCommands(compId, {
    play: () => { if (play === undefined) setInternalPlay(true) },
    pause: () => { if (play === undefined) setInternalPlay(false) },
    'jump-to': ({ args }) => {
      const arg = readArgument('jump-to', args)
      if (arg === null) return
      jumpTo(Number(arg))
    },
    'jump-start': () => { jumpTo(0) },
    'jump-end': () => { jumpTo(Math.max(stepsCount - 1, 0)) },
    // Relative to the counter and not to the position, so it keeps the lap it is in and
    // stepping back from an ended sequence lands on the last step rather than nowhere.
    'jump-by': ({ args }) => {
      const arg = readArgument('jump-by', args)
      if (arg === null || step !== undefined) return
      setInternalStep(current => current + Number(arg))
    }
  })

  useEffect(() => {
    if (!isPlaying || step !== undefined || stepsCount <= 0) return
    const interval = window.setInterval(
      () => setInternalStep(current => current + 1),
      60000 / Math.max(tempo, 1)
    )
    return () => window.clearInterval(interval)
  }, [isPlaying, step, stepsCount, tempo])

  useEffect(() => {
    if (loop !== true) return
    if (lap === hasLapped) return
    setHasLapped(lap)
    onLooped?.()
  }, [lap, loop])

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
    ended: isEnded,
    visible: isVisible === true
  }), className)

  const positionsOf = (steps: number[]): number[] => {
    const positions: number[] = []
    for (let i = 0; i < stepsCount; i += 1) {
      if (steps.includes(stepMap?.[i] ?? i)) positions.push(i)
    }
    return positions
  }

  // Rebuilt from the published lap rather than from `rawStep`, which runs one past the
  // end on a sequence that does not loop.
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
    {...compIdAttribute(compId)}
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
