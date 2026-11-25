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

// The count is time and the position is place: `reverse` makes the two run opposite
// ways, and `stepMap` turns the position into the active step children are matched on.

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
 * @property step - The count, taken over by the consumer — the number the position is
 * read from, laps included. Provided, the tempo stops advancing anything: the count is
 * theirs.
 * @property defaultStep - The count to start from. Ignored when `step` is provided.
 * @property play - Whether the sequence advances, taken over by the consumer. Provided,
 * it is the whole answer and the instructions no longer reach it, the way `step` takes
 * the counter over from the tempo.
 * @property defaultPlay - Whether it starts advancing. `false` by default, and the
 * starting point a `'play'` instruction moves from — not a setting, hence `default…`.
 * @property tempo - Speed in beats per minute: one step every `60000 / tempo` ms, so `60`
 * is a step per second. Clamped to a minimum of `1`.
 * @property loop - Whether the sequence wraps round. **`false` by default**, so a
 * sequence ends the way a video does rather than running forever.
 * @property reverse - Whether the sequence runs backward — down the index instead of up
 * it — taken over by the consumer. Provided, the `direction` verb no longer reaches it.
 * @property defaultReverse - Which way it starts running. `false` by default, which is
 * `forward`, and the direction a `direction` verb moves from — not a setting, hence
 * `default…`.
 * @property onStepChanged - Called when the position changes, with `step` and the
 * `activeStep` it resolves to. Never on mount.
 * @property onIsPlayingChanged - Called once the effective play state changed — which
 * includes it dropping to `false` on its own at the end.
 * @property onIsEndedChanged - Called when the sequence ends, or leaves that state.
 * **The end is the counter leaving the last step, not arriving on it** — the last step
 * is owed its beat like every other one, and a sequence paused on it has not ended. A
 * looping sequence never ends, so never emits.
 * @property onLooped - Called on each wrap, only while `loop` is `true`.
 * @property onReachedFirstStep - Called when the position becomes `0`. Named on the
 * index, so under `reverse` it fires where the sequence ends.
 * @property onReachedLastStep - Called when the position becomes the last one. This is
 * the arrival, where `onIsEndedChanged` is the departure: on a sequence playing forward
 * they are one count apart.
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
  reverse?: boolean
  defaultReverse?: boolean
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
 * Every verb belongs to one of two axes, and that is the whole of the vocabulary. The
 * index — `first`, `last`, `forward`, `backward` — never moves; the reading sense —
 * `start`, `end`, and the sign of `jump-by` — follows `reverse`.
 * - `play` / `pause` — the tempo runs or stops.
 * - `direction:forward` / `direction:backward` — which way it runs, up the index or down
 *   it.
 * - `jump-to:<n>`, `jump-first`, `jump-last`, `jump-forward-by:<n>`,
 *   `jump-backward-by:<n>` — the index. A negative `n` on `jump-to` counts back from the
 *   end, so `jump-to:-1` is the last step; the two `jump-*-by` carry their direction in
 *   the verb and take a plain count.
 * - `jump-start`, `jump-end`, `jump-by:<n>` — the reading sense. `jump-start` is where
 *   playback begins, the last index when the sequence is backward, and `jump-by:1` is
 *   the next step played whichever way it runs.
 *
 * **A verb never contradicts a prop**: `play` and `pause` are inert while `play` arrived
 * as one, `direction` while `reverse` did, every `jump-*` while `step` did. **A command
 * never surrenders either** — there is no control to touch here, so `:force` has nothing
 * to override.
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
 * `--playing`, `--at-start`, `--at-end`, `--reverse`, `--ended`, `--visible`, plus
 * `data-step`, `data-active-step`, `data-total-steps`, `data-tempo`, `data-lap` and
 * `data-count`. `--at-start` and `--at-end` are the reading sense, so `reverse` swaps
 * which end of the index they land on.
 *
 * The same six numbers are also published as custom properties —
 * `--lm-sequencer-step`, `--lm-sequencer-active-step`, `--lm-sequencer-total-steps`,
 * `--lm-sequencer-tempo`, `--lm-sequencer-lap` and `--lm-sequencer-count`, the count that
 * keeps growing across laps (`lap × total` plus the position playback has reached, which
 * is the step itself only when the sequence runs forward). **A data attribute selects, a
 * custom property computes**: `attr()` cannot feed a `calc()`, so a rule that wants to
 * turn something by a degree per step needs the property, and gets it on every descendant
 * since custom properties inherit —
 * `transform: rotate(calc(var(--lm-sequencer-count) * 5deg))`.
 *
 * No `-raw` twin as `ResizeObserver` has: every one of these is a bare number, and none
 * of them would mean anything with a unit attached.
 *
 * ### On each element child
 * The `__child` element class, then three pairs, one of each always present:
 * - `--on` / `--off` — whether it belongs to the active step.
 * - `--has-earlier-turn` / `--no-earlier-turn` — whether a turn of its own came earlier
 *   in this lap's playback.
 * - `--has-later-turn` / `--no-later-turn` — whether it has another one left in this lap.
 *
 * **The three pairs are derived, not remembered.** The order of the whole lap is known
 * from `stepMap` and the direction alone, so « has it been shown yet » is a question
 * about the positions playback has already passed, not about what happened since mount.
 * A child active at positions 1 and 6 therefore has no earlier turn at 1 and one at 6 —
 * the other way round under `reverse` — and the answer is the same on every lap without
 * anything being reset.
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
  reverse,
  defaultReverse,
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
  const [internalReverse, setInternalReverse] = useState(defaultReverse ?? false)
  const [hasLapped, setHasLapped] = useState(0)

  const childrenArr = Children.toArray(children)
  const elements = childrenArr.filter(isValidElement)
  const markedLast = elements.findIndex(hasDataLastStepAttribute)
  const impliedSteps = markedLast === -1 ? elements.length : markedLast + 1
  const stepsCount = Math.max(totalSteps ?? impliedSteps, 0)

  // The three numbers
  const rawCount = step ?? internalStep
  const isReversed = reverse ?? internalReverse
  const forwardPosition = stepsCount > 0
    ? (loop === true
        ? absoluteModulo(rawCount, stepsCount)
        : clamp(rawCount, 0, stepsCount - 1))
    : 0
  // Its own inverse, so it reads the count's position as an index and an index back as a
  // count's position.
  const oppositePositionWhenReversed = (sourcePosition: number): number => isReversed
    ? Math.max(stepsCount - 1, 0) - sourcePosition
    : sourcePosition
  const position = oppositePositionWhenReversed(forwardPosition)
  const activeStep = stepMap?.[position] ?? position

  // The count runs one past the end so the last step played gets a count of its own, and
  // the position clamps to it. Ended is therefore leaving that step, not arriving on it.
  const isEnded = loop !== true && stepsCount > 0 && rawCount >= stepsCount
  // A sequence withheld by a disclaimer does not advance. Read here rather than in the
  // clock, so the `playing` modifier and `onIsPlayingChanged` say the same thing the
  // tempo does — and so the step is kept, the reader landing where the article left it.
  const { isDisclosed } = useDisclosure()
  const isPlaying = (play ?? internalPlay) && !isEnded && isDisclosed

  // A lap counter rather than a comparison of steps: `onLooped` has to fire on the wrap
  // itself, and the position on either side of it says nothing about having crossed.
  const lap = stepsCount > 0 ? Math.floor(rawCount / stepsCount) : 0
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

  // An absolute jump writes a count in the lap it was made from, so it never reads as a
  // wrap.
  const jumpToForwardPosition = (targetForwardPosition: number): void => {
    if (step !== undefined) return
    setInternalStep(publishedLap * stepsCount + targetForwardPosition)
  }

  // A negative step counts back from the end, `-1` being the last one.
  const jumpToStep = (targetStep: number): void => {
    const targetPosition = targetStep < 0 ? stepsCount + targetStep : targetStep
    jumpToForwardPosition(oppositePositionWhenReversed(targetPosition))
  }

  // Relative to the count and not to the position, so it keeps the lap it is in and a
  // step back from an ended sequence lands on the last step rather than nowhere.
  const jumpByCount = (countDelta: number): void => {
    if (step !== undefined) return
    setInternalStep(current => current + countDelta)
  }

  useCommands(compId, {
    play: () => { if (play === undefined) setInternalPlay(true) },
    pause: () => { if (play === undefined) setInternalPlay(false) },
    direction: ({ args }) => {
      const arg = readArgument('direction', args)
      if (arg === null || reverse !== undefined) return
      setInternalReverse(arg === 'backward')
    },
    'jump-to': ({ args }) => {
      const arg = readArgument('jump-to', args)
      if (arg === null) return
      jumpToStep(Number(arg))
    },
    'jump-first': () => { jumpToStep(0) },
    'jump-last': () => { jumpToStep(Math.max(stepsCount - 1, 0)) },
    'jump-forward-by': ({ args }) => {
      const arg = readArgument('jump-forward-by', args)
      if (arg === null) return
      jumpByCount(isReversed ? -Number(arg) : Number(arg))
    },
    'jump-backward-by': ({ args }) => {
      const arg = readArgument('jump-backward-by', args)
      if (arg === null) return
      jumpByCount(isReversed ? Number(arg) : -Number(arg))
    },
    'jump-start': () => { jumpToForwardPosition(0) },
    'jump-end': () => { jumpToForwardPosition(Math.max(stepsCount - 1, 0)) },
    'jump-by': ({ args }) => {
      const arg = readArgument('jump-by', args)
      if (arg === null) return
      jumpByCount(Number(arg))
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
    'at-start': forwardPosition === 0,
    'at-end': stepsCount > 0 && forwardPosition === stepsCount - 1,
    reverse: isReversed,
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

  // Rebuilt from the published lap rather than from `rawCount`, which runs one past the
  // end on a sequence that does not loop.
  const publishedCount = publishedLap * stepsCount + forwardPosition
  const cssCustomProps: Record<string, string> = {
    '--lm-sequencer-step': `${position}`,
    '--lm-sequencer-active-step': `${activeStep}`,
    '--lm-sequencer-total-steps': `${stepsCount}`,
    '--lm-sequencer-tempo': `${tempo}`,
    '--lm-sequencer-lap': `${publishedLap}`,
    '--lm-sequencer-count': `${publishedCount}`
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
    data-count={publishedCount}
    style={{ ...cssCustomProps }}>
    {childrenArr.map((child, childPos): ReactNode => {
      if (!isValidElement(child)) return child
      elementIndex += 1
      const steps = getChildActiveSteps(child, elementIndex)
      const positions = positionsOf(steps)
      const isOn = steps.includes(activeStep)
      const hasBefore = positions.some(turnPosition => turnPosition < position)
      const hasAfter = positions.some(turnPosition => turnPosition > position)
      const hasEarlierTurn = isReversed ? hasAfter : hasBefore
      const hasLaterTurn = isReversed ? hasBefore : hasAfter
      const childClss = c('child', {
        on: isOn,
        off: !isOn,
        'has-earlier-turn': hasEarlierTurn,
        'no-earlier-turn': !hasEarlierTurn,
        'has-later-turn': hasLaterTurn,
        'no-later-turn': !hasLaterTurn
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
