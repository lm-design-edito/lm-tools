import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
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
import { sequencer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

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
 * @property totalSteps - How many steps the sequence has. Falls back to the number of
 * **element** children: text and whitespace never count, which matters more than it
 * looks — an article writes its children across several lines, and a text node counting
 * as a step would put every index out by one.
 * @property stepMap - Rewrites what a position means, **by position and nothing else**:
 * at position `i` the active step is `stepMap[i]` when there is one, and `i` otherwise.
 * `[2, 6, 7]` over seven steps plays `2, 6, 7, 3, 4, 5, 6` — a step may be skipped, may
 * come back, and may not correspond to any child at all, in which case nothing lights up
 * and that is a legal thing to write.
 * @property step - The position, taken over by the consumer. Provided, the tempo stops
 * advancing anything: the counter is theirs.
 * @property defaultStep - The position to start from. Ignored when `step` is provided.
 * @property play - Whether the sequence advances. **There are no controls in this
 * component** — nothing to click, so nothing to surrender to — and this is the only way
 * it moves on its own.
 * @property tempo - Speed in beats per minute: one step every `60000 / tempo` ms, so `60`
 * is a step per second. Clamped to a minimum of `1`.
 * @property loop - Whether the sequence wraps round. **`false` by default**, so a
 * sequence ends the way a video does rather than running forever.
 * @property onStepChanged - Called when the position changes, with the position and the
 * active step it resolves to. Never on mount.
 * @property onIsPlayingChanged - Called once the effective play state changed — which
 * includes it dropping to `false` on its own at the end.
 * @property onIsEndedChanged - Called when the sequence reaches its last step, or leaves
 * it. A looping sequence never ends, so never emits.
 * @property onLooped - Called on each wrap, only while `loop` is `true`.
 * @property onReachedFirstStep - Called when the position becomes `0`.
 * @property onReachedLastStep - Called when the position becomes the last one.
 */
export type Props = PropsWithChildren<WithClassName<{
  totalSteps?: number
  stepMap?: number[]
  step?: number
  defaultStep?: number
  play?: boolean
  tempo?: number
  loop?: boolean
  onStepChanged?: (step: number, activeStep: number) => void
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onIsEndedChanged?: (isEnded: boolean) => void
  onLooped?: () => void
  onReachedFirstStep?: () => void
  onReachedLastStep?: () => void
}>>

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
 * part: they carry no class, so they simply stay visible throughout.
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
  const [internalStep, setInternalStep] = useState(step ?? defaultStep ?? 0)
  const [hasLapped, setHasLapped] = useState(0)

  // Children, split once: what takes part and what merely renders.
  const childrenArr = Children.toArray(children)
  const elements = childrenArr.filter(isValidElement)
  const stepsCount = Math.max(totalSteps ?? elements.length, 0)

  // The two numbers
  const rawStep = step ?? internalStep
  const position = stepsCount > 0
    ? (loop === true
        ? absoluteModulo(rawStep, stepsCount)
        : clamp(rawStep, 0, stepsCount - 1))
    : 0
  const activeStep = stepMap?.[position] ?? position

  // A sequence that does not loop stops on its last step, and says so rather than
  // claiming to still be playing. Derived rather than held: nothing has to be unset when
  // `loop` or `step` changes under it.
  const isEnded = loop !== true && stepsCount > 0 && position >= stepsCount - 1
  const isPlaying = (play ?? false) && !isEnded

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
