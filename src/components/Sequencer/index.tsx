import {
  useState,
  useEffect,
  useCallback,
  Children,
  type FunctionComponent,
  useRef
} from 'react'
import { absoluteModulo } from '../../agnostic/numbers/absolute-modulo/index.js'
import { clamp } from '../../agnostic/numbers/clamp/index.js'
import {
  type Props as IOCompProps,
  IntersectionObserverComponent
} from '../IntersectionObserver/index.js'
import {
  type ControlledProps,
  SequencerControlled
} from './index.controlled.js'

/**
 * Props for the {@link Sequencer} component.
 *
 * Extends {@link ControlledProps} (minus `_modifiers`, which are derived
 * internally) with uncontrolled playback and viewport-driven behaviour.
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
 * @property actionHandlers - Optional handlers for imperative actions triggered
 * by external events:
 * - `intersected` — forwarded verbatim to the internal
 * {@link IntersectionObserverComponent}'s `onIntersected`, called on every
 * intersection change regardless of controlled state.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 * - `isPlaying` — called with the new play state whenever it changes.
 * - `stepChanged` — called with the new forwarded step index whenever it changes.
 */
export type Props = Omit<ControlledProps, '_modifiers'> & {
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
  actionHandlers?: {
    intersected?: IOCompProps['onIntersected']
  }
  stateHandlers?: {
    isPlaying?: (isPlaying: boolean) => void
    stepChanged?: (step: number) => void
  }
}

/**
 * Uncontrolled, self-advancing sequencer component. Drives a
 * {@link SequencerControlled} instance with an internal tempo-based interval,
 * optional loop/clamp boundary behaviour, and viewport-driven play/reset triggers
 * via an {@link IntersectionObserverComponent}.
 *
 * Supports mixed controlled/uncontrolled usage: passing `step` disables the
 * internal interval while still applying loop/clamp arithmetic before forwarding
 * to the controlled layer. Passing `play` disables internal play state management
 * while still allowing viewport handlers to fire `actionHandlers.intersected`.
 *
 * ### Forwarded modifiers to {@link SequencerControlled}
 * The following `_modifiers` are computed and injected automatically:
 * - `playing` — `true` when the effective play state is active.
 * - `at-start` — `true` when the forwarded step is `0`.
 * - `at-end` — `true` when the forwarded step equals `stepsCount - 1`.
 *
 * ### Forwarded data attributes to {@link SequencerControlled}
 * - `data-tempo` — the current `tempo` value.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @see {@link SequencerControlled}
 * @returns An {@link IntersectionObserverComponent} wrapping a
 * {@link SequencerControlled} with the computed step and modifiers applied.
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
  actionHandlers,
  stateHandlers,
  ...controlledProps
}) => {
  // State
  const { step, activateOnStep, children } = controlledProps
  const [internalPlay, setInternalPlay] = useState(play ?? false)
  const [internalStep, setInternalStep] = useState(step ?? defaultStep ?? 0)
  const actualPlay = play ?? internalPlay
  const actualStep = step ?? internalStep
  const actualPlayRef = useRef(actualPlay)

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
  const forwardedStepRef = useRef(forwardedStep)

  // State change handlers
  useEffect(() => {
    if (actualPlay !== actualPlayRef.current) {
      actualPlayRef.current = actualPlay
      stateHandlers?.isPlaying?.(actualPlay)
    }
    if (forwardedStep !== forwardedStepRef.current) {
      forwardedStepRef.current = forwardedStep
      stateHandlers?.stepChanged?.(forwardedStep)
    }
  }, [actualPlay, forwardedStep])

  // Action handlers
  const handleIntersection = useCallback<NonNullable<IOCompProps['onIntersected']>>(({ ioEntry, observer }) => {
    if (play === true || step !== undefined) return
    const { isIntersecting } = ioEntry ?? {}
    actionHandlers?.intersected?.({ ioEntry, observer })
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
    actionHandlers
  ])

  // Rendering
  return <IntersectionObserverComponent
    onIntersected={handleIntersection}>
    <SequencerControlled
      {...controlledProps}
      step={forwardedStep}
      _modifiers={{
        playing: actualPlay,
        'at-start': forwardedStep === 0,
        'at-end': forwardedStep === stepsCount - 1
      }}
      _dataAttributes={{ tempo }} />
  </IntersectionObserverComponent>
}
