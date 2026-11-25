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
  getChildActiveItems,
  hasDataLastItemAttribute
} from './utils.js'

// A step is time and an item is place: `reverse` makes the two run opposite ways, and
// `itemMap` turns the item into the active item children are matched on.

/**
 * @property totalItems - How many items the sequence has. Falls back to the first child
 * marked `data-last-item`, which sets the count to its own position plus one, and then
 * to the number of **element** children: text and whitespace never count, which matters
 * more than it looks — an article writes its children across several lines, and a text
 * node counting as an item would put every index out by one.
 * @property itemMap - Rewrites what an item means, **by item and nothing else**: at item
 * `i` the active item is `itemMap[i]` when there is one, and `i` otherwise. `[2, 6, 7]`
 * over seven items plays `2, 6, 7, 3, 4, 5, 6` — an item may be skipped, may come back,
 * and may not correspond to any child at all, in which case nothing lights up and that
 * is a legal thing to write.
 * @property step - The step, taken over by the consumer: the count the tempo advances,
 * laps included, and what the item is read from. Provided, the tempo stops advancing
 * anything: the count is theirs.
 * @property defaultStep - The step to start from. Ignored when `step` is provided.
 * @property play - Whether the sequence advances, taken over by the consumer. Provided,
 * it is the whole answer and the instructions no longer reach it, the way `step` takes
 * the count over from the tempo.
 * @property defaultPlay - Whether it starts advancing. `false` by default, and the
 * starting point a `'play'` instruction moves from — not a setting, hence `default…`.
 * @property tempo - Speed in steps per minute: one step every `60000 / tempo` ms, so `60`
 * is a step per second. Clamped to a minimum of `1`.
 * @property loop - Whether the sequence wraps round. **`false` by default**, so a
 * sequence ends the way a video does rather than running forever.
 * @property reverse - Whether the sequence runs backward — down the items instead of up
 * them — taken over by the consumer. Provided, the `direction` verb no longer reaches it.
 * **`reverse` and `alternate` are mutually exclusive**, in the types and at runtime: a
 * sequence whose direction is the consumer's has nothing left to alternate, so `reverse`
 * wins and the conflict is logged.
 * @property alternate - Whether the sequence turns round at each end instead of starting
 * over. **It composes with `loop`**: alone it is one round trip and then the end, with
 * `loop` the round trips follow one another. The item it turns on plays once — `5, 6, 5`
 * and not `5, 6, 6, 5` — so a round trip over seven items is two laps of six steps, the
 * first starting forward on item `0` and the second backward on item `6`, plus the step
 * that brings it home. Ignored on a sequence of one item, which has nothing to alternate.
 * @property defaultReverse - Which way it starts running. `false` by default, which is
 * `forward`, and the direction a `direction` instruction moves from — not a setting,
 * hence `default…`. **It is also where an alternating sequence starts**, `reverse` being
 * closed to it.
 * @property onItemChanged - Called when the item changes, with `item` and the
 * `activeItem` it resolves to. Never on mount.
 * @property onIsPlayingChanged - Called once the effective play state changed — which
 * includes it dropping to `false` on its own at the end.
 * @property onIsReversedChanged - Called once the effective direction changed.
 * @property onIsEndedChanged - Called when the sequence ends, or leaves that state.
 * **The end is the count leaving the last item played, not arriving on it** — that item
 * is owed its step like every other one, and a sequence paused on it has not ended. An
 * alternating sequence ends once it is home again; a looping one never ends, so never
 * emits.
 * @property onLooped - Called on each wrap, and on each turn of an alternating sequence,
 * both being a lap boundary. Only while the sequence can lap, so a one-shot `alternate`
 * emits once, at its turn, and a sequence that neither loops nor alternates never does.
 * @property onReachedFirstItem - Called when the item becomes `0`. Named on the items, so
 * under `reverse` it fires where the sequence ends.
 * @property onReachedLastItem - Called when the item becomes the last one. This is the
 * arrival, where `onIsEndedChanged` is the departure: on a sequence playing forward they
 * are one step apart.
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
// The two cannot be written together: a union rather than a runtime check alone, so the
// mistake is caught where it is made.
type DirectionProps =
  | { reverse?: boolean, alternate?: undefined }
  | { reverse?: undefined, alternate?: boolean }

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
  onItemChanged?: (payload: { item: number, activeItem: number }) => void
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
 * there would be nothing to class and nothing to show for the item it would consume.
 *
 * ### Items and steps
 * **An item is a place in the sequence and a step is one beat of the tempo.** The two
 * carry the whole vocabulary: an item is an index among the children and never moves, a
 * step is a count that keeps growing as the sequence plays, and `reverse` is what makes
 * them run opposite ways. Everything named `first`, `last`, `forward` or `backward`
 * belongs to the items; everything named `start`, `end`, `earlier` or `later` belongs to
 * the steps, and follows the direction.
 *
 * **A lap is one pass over the items**, which is also the unit `alternate` is built on: a
 * round trip is two laps, the second one running the items back down, and the direction
 * is the parity of the lap rather than a state of its own.
 *
 * ### Where the sequence ends
 * A child marked `data-last-item` ends it, and what follows still takes part — through
 * `data-items` alone. That is what lets an article write the items in reading order and
 * put the children belonging to several of them at once **after**, where they read as
 * what they are, rather than having their position counted as an item of its own:
 *
 * ```html
 * <div>1</div><div>2</div><div data-last-item>3</div>
 * <div data-items="0, 1">both of the first two</div>
 * ```
 *
 * Three items, four children. A trailing child that names no item never lights up, which
 * is the honest reading of « it is not part of the sequence ».
 *
 * ### Disclosure
 * Under a standing `Disclaimer` the tempo does not run, from `defaultPlay` no more than
 * from a verb, and the component sends nothing. The step is kept, so dismissing the panel
 * resumes where the article left it instead of restarting.
 *
 * ### Commands
 * - `play` / `pause` — the tempo runs or stops.
 * - `direction:forward` / `direction:backward` — which way it runs, up the items or down
 *   them.
 * - `jump-to:<n>`, `jump-first`, `jump-last`, `jump-forward-by:<n>`,
 *   `jump-backward-by:<n>` — items, which `reverse` never moves. A negative `n` on
 *   `jump-to` counts back from the end, so `jump-to:-1` is the last item; the two
 *   `jump-*-by` carry their direction in the verb and take a plain count.
 * - `jump-start`, `jump-end`, `jump-by:<n>` — steps, which it does move. `jump-start` is
 *   where playback begins, the last item under `reverse`, and `jump-by:1` the next item
 *   played whichever way the sequence runs. On an alternating sequence the three read the
 *   cycle, so `jump-end` is the far turn and `jump-start` home.
 *
 * **A verb never contradicts a prop**: `play` and `pause` are inert while `play` arrived
 * as one, `direction` while `reverse` did, every `jump-*` while `step` did. **A command
 * never surrenders either** — there is no control to touch here, so `:force` has nothing
 * to override.
 *
 * **`direction` sets the direction a sequence starts from**, which `alternate` then flips
 * lap by lap: it mirrors the whole pattern rather than freezing it on one side.
 *
 * **Nothing is clamped here, and that is the exception in the library**: elsewhere a
 * position outside the component lands on the nearest end, but a step past the last item
 * is a real step in the next lap, so there is no outside to be brought back from.
 *
 * `play` on a sequence that has ended does nothing, since ending is what stops it:
 * `['jump-start', 'play']` is how it starts again, and a `loop` sequence never ends so
 * never meets the case. An absolute jump stays in the lap it was made from, so it is not
 * a wrap and `onLooped` does not fire.
 *
 * @remarks
 * ### On the root
 * `--playing`, `--at-start`, `--at-end`, `--reverse`, `--ended`, `--visible`, plus
 * `data-item`, `data-active-item`, `data-total-items`, `data-tempo`, `data-lap` and
 * `data-step`. `--at-start` and `--at-end` are steps, so `reverse` swaps which end of the
 * items they land on, and on an alternating sequence they are the two turns of the cycle.
 * `--reverse` is the direction being run and not the prop, so it comes and goes lap by
 * lap while `alternate` is on.
 *
 * The same six numbers are also published as custom properties —
 * `--lm-sequencer-item`, `--lm-sequencer-active-item`, `--lm-sequencer-total-items`,
 * `--lm-sequencer-tempo`, `--lm-sequencer-lap` and `--lm-sequencer-step`, the count that
 * keeps growing across laps (`lap × total` plus the step reached in it). **A data
 * attribute selects, a custom property computes**: `attr()` cannot feed a `calc()`, so a
 * rule that wants to turn something by a degree per step needs the property, and gets it
 * on every descendant since custom properties inherit —
 * `transform: rotate(calc(var(--lm-sequencer-step) * 5deg))`.
 *
 * No `-raw` twin as `ResizeObserver` has: every one of these is a bare number, and none
 * of them would mean anything with a unit attached.
 *
 * ### On each element child
 * The `__child` element class, then three pairs, one of each always present:
 * - `--on` / `--off` — whether it belongs to the active item.
 * - `--has-earlier-turn` / `--no-earlier-turn` — whether a turn of its own came earlier
 *   in this lap's playback.
 * - `--has-later-turn` / `--no-later-turn` — whether it has another one left in this lap.
 *
 * **The three pairs are derived, not remembered.** The order of the whole lap is known
 * from `itemMap` and the direction alone, so « has it been shown yet » is a question
 * about the items playback has already passed, not about what happened since mount. A
 * child active at items 1 and 6 therefore has no earlier turn at 1 and one at 6 — the
 * other way round under `reverse` — and the answer is the same on every lap without
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
  onItemChanged,
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
  // One item has nothing to alternate, and neither has a sequence whose direction the
  // consumer holds — the conflict is said below rather than thrown.
  const isAlternating = reverse === undefined && alternate === true && itemsCount > 1
  const lapLength = isAlternating ? itemsCount - 1 : itemsCount
  const cycleLength = isAlternating ? 2 * lapLength : lapLength
  // A round trip comes home, so its last step is the one after its two laps rather than
  // the last of them.
  const lastStep = isAlternating ? cycleLength : itemsCount - 1
  // The count runs one past the end so the last item played gets a step of its own; what
  // is read from here on is this one, which stops there.
  const publishedStep = loop === true
    ? rawStep
    : clamp(rawStep, 0, Math.max(lastStep, 0))
  const stepInCycle = cycleLength > 0 ? absoluteModulo(publishedStep, cycleLength) : 0
  // Past the far end an alternating cycle walks the items back down, which is the whole
  // of the alternation.
  const forwardItem = isAlternating && stepInCycle >= itemsCount
    ? cycleLength - stepInCycle
    : stepInCycle
  const isBaseReversed = reverse ?? internalReverse
  // Its own inverse, so it also reads an item back as the forward item that plays it.
  const oppositeItemWhenBaseReversed = (sourceItem: number): number => isBaseReversed
    ? Math.max(itemsCount - 1, 0) - sourceItem
    : sourceItem
  const item = oppositeItemWhenBaseReversed(forwardItem)
  const activeItem = itemMap?.[item] ?? item

  // Ended is leaving the last item played, not arriving on it.
  const isEnded = loop !== true && itemsCount > 0 && rawStep > lastStep
  // A sequence withheld by a disclaimer does not advance. Read here rather than in the
  // clock, so the `playing` modifier and `onIsPlayingChanged` say the same thing the
  // tempo does — and so the step is kept, the reader landing where the article left it.
  const { isDisclosed } = useDisclosure()
  const isPlaying = (play ?? internalPlay) && !isEnded && isDisclosed

  // A lap counter rather than a comparison of items: `onLooped` has to fire on the wrap
  // itself, and the item on either side of it says nothing about having crossed.
  const lapCount = lapLength > 0 ? Math.floor(publishedStep / lapLength) : 0
  // A one-shot round trip comes home on the first step of a third lap — the lap it ends
  // on rather than one it runs, so the count keeps that step and the lap does not.
  const lap = loop !== true && isAlternating ? Math.min(lapCount, 1) : lapCount
  const isReversed = isAlternating
    ? isBaseReversed !== (absoluteModulo(lap, 2) === 1)
    : isBaseReversed
  // A lap is a wrap or a turn, so there is none without `loop` or `alternate` — where the
  // internal count would report `1` past the end.
  const publishedLap = loop === true || isAlternating ? lap : 0

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

  // An absolute jump writes a step in the cycle it was made from, so it never reads as a
  // wrap.
  const cycleStart = loop === true && cycleLength > 0
    ? Math.floor(publishedStep / cycleLength) * cycleLength
    : 0
  const jumpToStepInCycle = (targetStepInCycle: number): void => {
    if (step !== undefined) return
    setInternalStep(cycleStart + targetStepInCycle)
  }

  // A negative item counts back from the end, `-1` being the last one. An alternating
  // cycle plays most items twice, and the jump lands on the first of the two.
  const jumpToItem = (targetItem: number): void => {
    const resolvedItem = targetItem < 0 ? itemsCount + targetItem : targetItem
    jumpToStepInCycle(oppositeItemWhenBaseReversed(resolvedItem))
  }

  // Relative to the count and not to the item, so it keeps the lap it is in and a step
  // back from an ended sequence lands on the last item rather than nowhere.
  const jumpBySteps = (stepDelta: number): void => {
    if (step !== undefined) return
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
    'jump-end': () => { jumpToStepInCycle(Math.max(itemsCount - 1, 0)) },
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
  // Said rather than thrown: a conflict is a written mistake, and the component keeps
  // running on `reverse`.
  useEffect(() => {
    if (givenReverse === undefined || givenAlternate !== true) return
    // eslint-disable-next-line no-console
    console.warn('`reverse` and `alternate` cannot both be set on a sequencer: `alternate` is ignored while `reverse` is.')
  }, [givenReverse, givenAlternate])

  useEffect(() => {
    if (!isPlaying || step !== undefined || itemsCount <= 0) return
    const interval = window.setInterval(
      () => setInternalStep(current => current + 1),
      60000 / Math.max(tempo, 1)
    )
    return () => window.clearInterval(interval)
  }, [isPlaying, step, itemsCount, tempo])

  useEffect(() => {
    if (loop !== true && !isAlternating) return
    if (lap === hasLapped) return
    setHasLapped(lap)
    onLooped?.()
  }, [lap, loop])

  // State dispatch
  useStateChangeDispatch(item, () => onItemChanged?.({ item, activeItem }))
  useStateChangeDispatch(isPlaying, onIsPlayingChanged)
  useStateChangeDispatch(isReversed, onIsReversedChanged)
  useStateChangeDispatch(isEnded, onIsEndedChanged)
  useStateChangeDispatch(item === 0, atFirst => { if (atFirst) onReachedFirstItem?.() })
  useStateChangeDispatch(
    itemsCount > 0 && item === itemsCount - 1,
    atLast => { if (atLast) onReachedLastItem?.() }
  )

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    playing: isPlaying,
    'at-start': stepInCycle === 0,
    'at-end': itemsCount > 0 && stepInCycle === itemsCount - 1,
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
