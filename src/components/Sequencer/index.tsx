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
import {
  SEQUENCER_ACTION_VERB_ARGUMENTS,
  type SequencerEasing
} from './types.js'
import {
  getChildActiveItems,
  hasDataLastItemAttribute,
  resolveEasing
} from './utils.js'

type DirectionProps =
  | { reverse?: boolean, alternate?: undefined }
  | { reverse?: undefined, alternate?: boolean }

/**
 * @property totalItems - How many items. Falls back to the child marked
 * `data-last-item`, then to the number of **element** children.
 * @property itemMap - What an item means, by item: at `i` the active item is
 * `itemMap[i]`. One may be skipped, repeated, or match no child at all.
 * @property step - The count, taken over by the consumer. The tempo then advances
 * nothing.
 * @property defaultStep - The step to start from. Ignored when `step` is provided.
 * @property play - Whether it advances, taken over. The verbs then no longer reach it.
 * @property defaultPlay - Whether it starts advancing, `false` by default.
 * @property tempo - Counter ticks per minute. A lap lasts `totalItems` ticks whatever
 * an easing does inside it.
 * @property loop - Whether it wraps round. `false` by default, so it ends.
 * @property reverse - Whether it runs down the items, taken over. **Exclusive with
 * `alternate`**, in the types and at runtime.
 * @property alternate - Whether it turns round at each end. Composes with `loop`, holds
 * each end for two steps, so a round trip is two laps exactly.
 * @property defaultReverse - Which way it starts, alternating included. `false` is
 * `forward`.
 * @property easing - How a lap's time spreads over its items: a dwell is a slice of the
 * curve, so a curve redistributes the lap without lengthening it.
 * @property reverseEasing - The curve of a backward pass, read from where it starts.
 * Absent, that pass replays the forward dwells in reverse order.
 * @property onItemChanged - The item changed, with `item` and its `activeItem`.
 * @property onStarted - The count arrived on a lap's first step.
 * @property onEnded - A lap's last step ran out of time. The instant, where
 * `onIsEndedChanged` is the state.
 * @property onIsPlayingChanged - The effective play state changed, its drop at the end
 * included.
 * @property onIsReversedChanged - The effective direction changed.
 * @property onIsEndedChanged - It ended, or left that state. **The end is the count
 * leaving the last item played, not arriving on it.**
 * @property onLooped - A wrap, or an alternating turn — both lap boundaries.
 * @property onReachedFirstItem - The item became `0`, so under `reverse` it fires where
 * the sequence ends.
 * @property onReachedLastItem - The item became the last one.
 *
 * No handler fires on mount. Plus the triggers of {@link VisibilityProps}.
 */
export type Props = {
  totalItems?: number
  itemMap?: number[]
  step?: number
  defaultStep?: number
  play?: boolean
  defaultPlay?: boolean
  tempo?: number
  loop?: boolean
  defaultReverse?: boolean
  easing?: SequencerEasing
  reverseEasing?: SequencerEasing
  onItemChanged?: (payload: { item: number, activeItem: number }) => void
  onStarted?: () => void
  onEnded?: () => void
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onIsReversedChanged?: (isReversed: boolean) => void
  onIsEndedChanged?: (isEnded: boolean) => void
  onLooped?: () => void
  onReachedFirstItem?: () => void
  onReachedLastItem?: () => void
}
  & DirectionProps
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

/**
 * A sequencer over its children, which it classifies and never moves.
 *
 * It renders no box of its own: the modifiers go onto the children themselves, by
 * `cloneElement`, so **a child has to honour `className`** or it silently gets none.
 * Non-element children take no part, and a fragment is opened rather than counted.
 *
 * **An item is a place in the sequence, a step is one beat of the tempo**, and `reverse`
 * makes the two run opposite ways: `first`, `last`, `forward` and `backward` name items
 * and never move, where `start`, `end`, the sign of `jump-by` and the child activation
 * flags name steps and follow the direction. A lap is `totalItems` steps.
 *
 * A child marked `data-last-item` ends the sequence, and children after it still take
 * part through `data-items`. The README holds the reasoning behind all of this.
 *
 * ### Commands
 * Inert while the prop each would contradict is provided, and nothing is clamped here:
 * a step past the last item is a real step in the next lap.
 * - `play` / `pause`.
 * - `direction:forward` / `direction:backward` — which way it runs.
 * - `jump-to:<n>`, `jump-first`, `jump-last`, `jump-forward-by:<n>`,
 *   `jump-backward-by:<n>` — items, which `reverse` never moves. A negative `n` on
 *   `jump-to` counts back from the end.
 * - `jump-start`, `jump-end`, `jump-by:<n>` — steps, which it does move. `jump-by:1` is
 *   the next item played whichever way the sequence runs.
 *
 * @remarks
 * ### CSS elements
 * On the root: `--playing`, `--at-first`, `--at-last`, `--reverse`, `--ended` and
 * `--visible`, with `data-item`, `data-active-item`, `data-total-items`, `data-tempo`,
 * `data-lap`, `data-step`, and the same six numbers as `--lm-sequencer-*` custom
 * properties. `--at-first` / `--at-last` name items, so a pass's own ends are
 * `.--at-first:not(.--reverse)` and `.--at-last.--reverse`.
 *
 * On each element child: `__child`, then `--on` / `--off` for the active item,
 * `--did-activate` when it has a turn at a step this lap has played, and
 * `--will-activate` when it has one still to come.
 *
 * @see {@link Props}
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
  totalItems,
  itemMap,
  step,
  defaultStep,
  play,
  defaultPlay,
  tempo = 60,
  loop,
  reverse,
  alternate,
  defaultReverse,
  easing,
  reverseEasing,
  onItemChanged,
  onStarted,
  onEnded,
  onIsPlayingChanged,
  onIsReversedChanged,
  onIsEndedChanged,
  onLooped,
  onReachedFirstItem,
  onReachedLastItem,
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
  const markedLast = elements.findIndex(hasDataLastItemAttribute)
  const impliedItems = markedLast === -1 ? elements.length : markedLast + 1
  const itemsCount = Math.max(totalItems ?? impliedItems, 0)

  // The numbers
  const rawStep = step ?? internalStep
  const isAlternating = reverse === undefined && alternate === true && itemsCount > 1
  const cycleLength = isAlternating ? 2 * itemsCount : itemsCount
  const lastStep = cycleLength - 1
  const publishedStep = loop === true
    ? rawStep
    : clamp(rawStep, 0, Math.max(lastStep, 0))
  const stepInCycle = cycleLength > 0 ? absoluteModulo(publishedStep, cycleLength) : 0
  const stepInLap = itemsCount > 0 ? absoluteModulo(publishedStep, itemsCount) : 0
  const forwardItem = isAlternating && stepInCycle >= itemsCount
    ? cycleLength - 1 - stepInCycle
    : stepInCycle
  const isBaseReversed = reverse ?? internalReverse
  const oppositeItemWhenBaseReversed = (sourceItem: number): number => isBaseReversed
    ? Math.max(itemsCount - 1, 0) - sourceItem
    : sourceItem
  const item = oppositeItemWhenBaseReversed(forwardItem)
  const activeItem = itemMap?.[item] ?? item

  const isEnded = loop !== true && itemsCount > 0 && rawStep > lastStep
  // Read here rather than in the clock, so the modifier, the handler and the tempo all
  // say the same thing — and the step survives being withheld.
  const { isDisclosed } = useDisclosure()
  const isPlaying = (play ?? internalPlay) && !isEnded && isDisclosed

  // A lap counter rather than a comparison of items: `onLooped` has to fire on the wrap
  // itself, and the item on either side of it says nothing about having crossed.
  const lap = itemsCount > 0 ? Math.floor(publishedStep / itemsCount) : 0
  const isReversed = isAlternating
    ? isBaseReversed !== (absoluteModulo(lap, 2) === 1)
    : isBaseReversed
  const publishedLap = loop === true || isAlternating ? lap : 0

  const lapDurationMs = itemsCount * (60000 / Math.max(tempo, 1))
  const passEasing = resolveEasing(isReversed ? reverseEasing ?? easing : easing)
  const easedStep = isReversed && reverseEasing === undefined
    ? Math.max(itemsCount - 1 - stepInLap, 0)
    : stepInLap
  const dwellMs = itemsCount > 0
    ? Math.max(
      lapDurationMs * (
        passEasing((easedStep + 1) / itemsCount) - passEasing(easedStep / itemsCount)
      ),
      0
    )
    : 0

  // Commands
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

  const stepStartedAtRef = useRef<number | null>(null)

  const cycleStart = loop === true && cycleLength > 0
    ? Math.floor(publishedStep / cycleLength) * cycleLength
    : 0
  const jumpToStepInCycle = (targetStepInCycle: number): void => {
    if (step !== undefined) return
    stepStartedAtRef.current = null
    setInternalStep(cycleStart + targetStepInCycle)
  }

  const jumpToItem = (targetItem: number): void => {
    const resolvedItem = targetItem < 0 ? itemsCount + targetItem : targetItem
    jumpToStepInCycle(oppositeItemWhenBaseReversed(resolvedItem))
  }

  const jumpBySteps = (stepDelta: number): void => {
    if (step !== undefined) return
    stepStartedAtRef.current = null
    setInternalStep(current => current + stepDelta)
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
      jumpToItem(Number(arg))
    },
    'jump-first': () => { jumpToItem(0) },
    'jump-last': () => { jumpToItem(Math.max(itemsCount - 1, 0)) },
    'jump-forward-by': ({ args }) => {
      const arg = readArgument('jump-forward-by', args)
      if (arg === null) return
      jumpBySteps(isReversed ? -Number(arg) : Number(arg))
    },
    'jump-backward-by': ({ args }) => {
      const arg = readArgument('jump-backward-by', args)
      if (arg === null) return
      jumpBySteps(isReversed ? Number(arg) : -Number(arg))
    },
    'jump-start': () => { jumpToStepInCycle(0) },
    'jump-end': () => { jumpToStepInCycle(Math.max(lastStep, 0)) },
    'jump-by': ({ args }) => {
      const arg = readArgument('jump-by', args)
      if (arg === null) return
      jumpBySteps(Number(arg))
    }
  })

  // Read wide on purpose: the types rule the pair out, so narrowing holds the two apart
  // — but an untyped caller can write both all the same.
  const givenReverse: boolean | undefined = reverse
  const givenAlternate: boolean | undefined = alternate
  useEffect(() => {
    if (givenReverse === undefined || givenAlternate !== true) return
    // eslint-disable-next-line no-console
    console.warn('`reverse` and `alternate` cannot both be set on a sequencer: `alternate` is ignored while `reverse` is.')
  }, [givenReverse, givenAlternate])

  // One timeout per step rather than an interval, since an easing gives each step its own
  // length. It is scheduled from when the step became due, so lateness does not add up.
  useEffect(() => {
    if (!isPlaying || step !== undefined || itemsCount <= 0) return
    const now = Date.now()
    const startedAt = stepStartedAtRef.current
    const dueAt = startedAt !== null && startedAt + dwellMs > now
      ? startedAt + dwellMs
      : now + dwellMs
    const timeout = window.setTimeout(
      () => {
        stepStartedAtRef.current = dueAt
        setInternalStep(current => current + 1)
      },
      Math.max(dueAt - now, 0)
    )
    return () => { window.clearTimeout(timeout) }
  }, [isPlaying, step, itemsCount, dwellMs, publishedStep])

  useEffect(() => {
    if (loop !== true && !isAlternating) return
    if (lap === hasLapped) return
    setHasLapped(lap)
    onLooped?.()
  }, [lap, loop, isAlternating])

  // State dispatch
  useStateChangeDispatch(item, () => onItemChanged?.({ item, activeItem }))
  useStateChangeDispatch(isPlaying, onIsPlayingChanged)
  useStateChangeDispatch(isReversed, onIsReversedChanged)
  useStateChangeDispatch(isEnded, ended => {
    onIsEndedChanged?.(ended)
    if (ended) onEnded?.()
  })
  useStateChangeDispatch(stepInLap === 0, atLapStart => { if (atLapStart) onStarted?.() })
  useStateChangeDispatch(
    itemsCount > 0 && stepInLap === itemsCount - 1,
    atLapEnd => { if (!atLapEnd) onEnded?.() }
  )
  useStateChangeDispatch(item === 0, atFirst => { if (atFirst) onReachedFirstItem?.() })
  useStateChangeDispatch(
    itemsCount > 0 && item === itemsCount - 1,
    atLast => { if (atLast) onReachedLastItem?.() }
  )

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    playing: isPlaying,
    'at-first': item === 0,
    'at-last': itemsCount > 0 && item === itemsCount - 1,
    reverse: isReversed,
    ended: isEnded,
    visible: isVisible === true
  }), className)

  const itemsOf = (declaredItems: number[]): number[] => {
    const items: number[] = []
    for (let i = 0; i < itemsCount; i += 1) {
      if (declaredItems.includes(itemMap?.[i] ?? i)) items.push(i)
    }
    return items
  }

  const cssCustomProps: Record<string, string> = {
    '--lm-sequencer-item': `${item}`,
    '--lm-sequencer-active-item': `${activeItem}`,
    '--lm-sequencer-total-items': `${itemsCount}`,
    '--lm-sequencer-tempo': `${tempo}`,
    '--lm-sequencer-lap': `${publishedLap}`,
    '--lm-sequencer-step': `${publishedStep}`
  }

  let elementIndex = -1
  return <div
    {...compIdAttribute(compId)}
    ref={rootRef}
    className={rootClss}
    data-item={item}
    data-active-item={activeItem}
    data-total-items={itemsCount}
    data-tempo={tempo}
    data-lap={publishedLap}
    data-step={publishedStep}
    style={{ ...cssCustomProps }}>
    {childrenArr.map((child, childPos): ReactNode => {
      if (!isValidElement(child)) return child
      elementIndex += 1
      const declaredItems = getChildActiveItems(child, elementIndex)
      const turnItems = itemsOf(declaredItems)
      const isOn = declaredItems.includes(activeItem)
      const hasBefore = turnItems.some(turnItem => turnItem < item)
      const hasAfter = turnItems.some(turnItem => turnItem > item)
      const didActivate = isReversed ? hasAfter : hasBefore
      const willActivate = isReversed ? hasBefore : hasAfter
      const childClss = c('child', {
        on: isOn,
        off: !isOn,
        'did-activate': didActivate,
        'will-activate': willActivate
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
