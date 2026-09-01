import {
  type FunctionComponent,
  type PropsWithChildren,
  Children
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { sequencer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link ControlledSequencer} component.
 *
 * This is the low-level controlled interface. All state is driven externally —
 * the component holds no internal state of its own. For the uncontrolled
 * version that reacts to external events and derives these props automatically,
 * see the default export of the parent module.
 *
 * @property step - Zero-based index of the currently active step. Determines
 * which child is marked active, which are previous, and which are next.
 * Defaults to `0`.
 * @property activateOnStep - Optional 2D array that overrides the default
 * one-child-per-step activation logic. Each entry at index `i` is the list of
 * child indices that should be active when `step === i`, allowing multiple
 * children to be simultaneously active on a given step. When omitted, exactly
 * one child is active at a time (the child at index `step`).
 * @property isPlaying - Whether the sequence is currently progressing. The
 * controlled layer never advances on its own; this only drives the `--playing`
 * modifier. Defaults to `false`.
 * @property tempo - Playback speed in beats per minute, exposed as `data-tempo`
 * for styling and scripting. Purely informational here — the interval itself
 * lives in the uncontrolled wrapper. When omitted, no attribute is rendered.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - The items to sequence. Each child is wrapped in a
 * classifier `<div>` and receives one of the `--active`, `--previous`, or
 * `--next` modifiers depending on its position relative to the current `step`.
 */
export type Props = PropsWithChildren<WithClassName<{
  step?: number
  activateOnStep?: number[][]
  isPlaying?: boolean
  tempo?: number
}>>

/**
 * Controlled sequencer component. Renders each child inside a classifier
 * wrapper and assigns step-relative modifiers based on `step` and the optional
 * `activateOnStep` override map.
 *
 * This component is purely presentational and holds no internal state.
 * It is designed to be driven by the uncontrolled wrapper, which handles
 * timing, playback events, and derives the props passed here.
 *
 * ### Root element modifiers
 * The root `<div>` receives the public class name defined by `sequencer` and
 * the following BEM-style modifier classes:
 * - `--playing` — when `isPlaying` is `true`.
 * - `--at-start` — when the current step is the first step.
 * - `--at-end` — when the current step is the last step.
 *
 * ### Data attributes on the root element
 * - `data-step` — the current step index.
 * - `data-tempo` — current playback tempo, when `tempo` is provided.
 *
 * ### Child wrapper elements
 * Each child is wrapped in a `<div>` with the `__child` element class and
 * exactly one of the following mutually exclusive modifiers:
 * - `--active` — this child corresponds to the current step (or is included
 * in `activateOnStep[step]`).
 * - `--previous` — this child was active in a prior step.
 * - `--next` — this child has not yet been reached.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` containing one classifier wrapper per child.
 */
export const ControlledSequencer: FunctionComponent<Props> = ({
  step = 0,
  activateOnStep,
  isPlaying = false,
  tempo,
  className,
  children
}) => {
  const childrenArr = Children.toArray(children)
  const stepsCount = activateOnStep?.length ?? childrenArr.length

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    playing: isPlaying,
    'at-start': step === 0,
    'at-end': step === stepsCount - 1
  }), className)
  return <div
    className={rootClss}
    data-step={step}
    data-tempo={tempo}>
    {childrenArr
      .map((child, childPos) => {
        const thisStepActivateOnStep = activateOnStep?.[step]
        const isPrevious = activateOnStep === undefined
          ? childPos < step
          : [...activateOnStep]
              .slice(0, step)
              .some(list => list.includes(childPos))
        const isCurrent = activateOnStep === undefined
          ? childPos === step
          : Array.isArray(thisStepActivateOnStep)
            ? thisStepActivateOnStep.includes(childPos)
            : false
        const isNext = !isPrevious && !isCurrent
        const childClss = c('child', {
          current: isCurrent,
          prev: isPrevious,
          next: isNext
        })
        return <div
          key={childPos}
          className={childClss}>
          {child}
        </div>
      })}
  </div>
}
