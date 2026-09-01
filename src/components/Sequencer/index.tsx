import {
  useState,
  useEffect,
  useCallback,
  Children,
  type FunctionComponent
} from 'react'
import { absoluteModulo } from '../../agnostic/numbers/absolute-modulo/index.js'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import {
  type Props as IOCompProps,
  IntersectionObserverComponent
} from '../IntersectionObserver/index.js'
import { useChangeDispatch } from '../utils/index.js'
import {
  type Props as ControlledProps,
  ControlledSequencer
} from './index.controlled.js'

/**
 * Props for the {@link Sequencer} component.
 *
 * Extends {@link ControlledProps} — minus `isPlaying` and `tempo`, which this
 * component derives itself — with uncontrolled playback and viewport-driven
 * behaviour.
 *
 * @property defaultStep - Initial step index when running in uncontrolled mode.
 * Ignored if `step` is provided. Defaults to `0`.
 * @property tempo - Playback speed in beats per minute. The interval between
 * steps is derived as `1000 / (tempo / 60)` ms. Clamped to a minimum of `1`.
 * Defaults to `60`.
 * @property play - Controlled play state. When provided, overrides the internal
 * play state. The auto-advance interval only runs when this is `true`.
 * @property loop - When `true`, the step wraps around using absolute modulo so
 * it never exceeds the number of steps.
 * @property clampFirst - When `true` (and `loop` is `false`), clamps the step
 * to `0` at the lower bound, preventing negative step values.
 * @property clampLast - When `true` (and `loop` is `false`), clamps the step
 * to `stepsCount - 1` at the upper bound, preventing overflow.
 * @property resetOnVisible - When `true`, resets the internal step to `0` each
 * time the component enters the viewport. No-op when `step` or `play` is controlled.
 * @property resetOnHidden - When `true`, resets the internal step to `0` each
 * time the component leaves the viewport. No-op when `step` or `play` is controlled.
 * @property playOnVisible - When `true`, starts internal playback when the
 * component enters the viewport. No-op when `play` is controlled.
 * @property pauseOnHidden - When `true`, pauses internal playback when the
 * component leaves the viewport. No-op when `play` is controlled.
 * @property onIntersected - Forwarded verbatim to the internal
 * {@link IntersectionObserverComponent}, and called on every intersection
 * change whichever mode the sequencer runs in.
 * @property onIsPlayingChanged - Called after the effective play state changed,
 * with the new value.
 * @property onStepChanged - Called after the forwarded step changed, with the
 * new value.
 */
export type Props = Omit<ControlledProps, 'isPlaying' | 'tempo'> & {
  defaultStep?: number
  tempo?: number
  play?: boolean
  loop?: boolean
  clampFirst?: boolean
  clampLast?: boolean
  resetOnVisible?: boolean
  resetOnHidden?: boolean
  playOnVisible?: boolean
  pauseOnHidden?: boolean
  onIntersected?: IOCompProps['onIntersected']
  onIsPlayingChanged?: (isPlaying: boolean) => void
  onStepChanged?: (step: number) => void
}

/**
 * Uncontrolled, self-advancing sequencer component. Drives a
 * {@link ControlledSequencer} instance with an internal tempo-based interval,
 * optional loop/clamp boundary behaviour, and viewport-driven play/reset triggers
 * via an {@link IntersectionObserverComponent}.
 *
 * Supports mixed controlled/uncontrolled usage: passing `step` disables the
 * internal interval while still applying loop/clamp arithmetic before forwarding
 * to the controlled layer. Passing `play` disables internal play state management
 * while still allowing viewport handlers to fire `onIntersected`.
 *
 * ### Forwarded to {@link ControlledSequencer}
 * - `step` — the effective step, after loop/clamp arithmetic.
 * - `isPlaying` — the effective play state, controlled or internal.
 * - `tempo` — the current tempo, which the controlled layer exposes as `data-tempo`.
 *
 * The `--at-start` and `--at-end` modifiers are derived by the controlled layer
 * from `step` and the children count.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @see {@link ControlledSequencer}
 * @returns An {@link IntersectionObserverComponent} wrapping a
 * {@link ControlledSequencer} with the computed step and modifiers applied.
 */
export const Sequencer: FunctionComponent<Props> = ({
  defaultStep,
  tempo = 60,
  play,
  loop,
  clampFirst,
  clampLast,
  resetOnVisible,
  resetOnHidden,
  playOnVisible,
  pauseOnHidden,
  onIntersected,
  onIsPlayingChanged,
  onStepChanged,
  ...controlledProps
}) => {
  // State
  const { step, activateOnStep, children } = controlledProps
  const [internalPlay, setInternalPlay] = useState(play ?? false)
  const [internalStep, setInternalStep] = useState(step ?? defaultStep ?? 0)
  const actualPlay = play ?? internalPlay
  const actualStep = step ?? internalStep

  // Effects
  useEffect(() => {
    const clampedTempo = Math.max(tempo, 1)
    if (!actualPlay || step !== undefined) return
    const interval = window.setInterval(() => {
      setInternalStep(s => s + 1)
    }, 1000 / (clampedTempo / 60))
    return () => window.clearInterval(interval)
  }, [actualPlay, tempo, step])

  // Forwarded step calculation
  const stepsCount = activateOnStep !== undefined
    ? activateOnStep.length
    : Children.toArray(children).length
  let forwardedStep: number
  if (loop === true) {
    forwardedStep = absoluteModulo(actualStep, stepsCount)
  } else {
    const leftClamp = clampFirst === true ? 0 : -Infinity
    const rightClamp = clampLast === true ? stepsCount - 1 : Infinity
    forwardedStep = clamp(actualStep, leftClamp, rightClamp)
  }

  // State dispatch
  useChangeDispatch(actualPlay, onIsPlayingChanged)
  useChangeDispatch(forwardedStep, onStepChanged)

  // Action handlers
  const handleIntersection = useCallback<NonNullable<IOCompProps['onIntersected']>>(({ ioEntry, observer }) => {
    onIntersected?.({ ioEntry, observer })
    if (play === true || step !== undefined) return
    const { isIntersecting } = ioEntry ?? {}
    if (isIntersecting === true) {
      if (resetOnVisible === true) setInternalStep(0)
      if (playOnVisible === true) setInternalPlay(true)
    } else {
      if (resetOnHidden === true) setInternalStep(0)
      if (pauseOnHidden === true) setInternalPlay(false)
    }
  }, [
    resetOnVisible,
    playOnVisible,
    resetOnHidden,
    pauseOnHidden,
    play,
    step,
    onIntersected
  ])

  // Rendering
  return <IntersectionObserverComponent
    onIntersected={handleIntersection}>
    <ControlledSequencer
      {...controlledProps}
      step={forwardedStep}
      isPlaying={actualPlay}
      tempo={tempo} />
  </IntersectionObserverComponent>
}
