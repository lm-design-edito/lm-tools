import { type FunctionComponent } from 'react'
import {
  Sequencer,
  type Props as SequencerProps
} from '~/components/Sequencer/index.js'
import { sequencer as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Sequencer'
const description = `
Uncontrolled, self-advancing sequencer component. Drives a
{@link SequencerControlled} instance with an internal tempo-based interval,
optional loop/clamp boundary behaviour, and viewport-driven play/reset triggers
via an {@link IntersectionObserverComponent}.

Supports mixed controlled/uncontrolled usage: passing \`step\` disables the
internal interval while still applying loop/clamp arithmetic before forwarding
to the controlled layer. Passing \`play\` disables internal play state management
while still allowing viewport handlers to fire \`actionHandlers.intersected\`.

### Forwarded modifiers to {@link SequencerControlled}
The following \`_modifiers\` are computed and injected automatically:
- \`playing\` — \`true\` when the effective play state is active.
- \`at-start\` — \`true\` when the forwarded step is \`0\`.
- \`at-end\` — \`true\` when the forwarded step equals \`stepsCount - 1\`.

### Forwarded data attributes to {@link SequencerControlled}
- \`data-tempo\` — the current \`tempo\` value.

@param props - Component properties.
@see {@link Props}
@see {@link SequencerControlled}
@returns An {@link IntersectionObserverComponent} wrapping a
{@link SequencerControlled} with the computed step and modifiers applied.`

const tsxDetails = `
/**
 * Props for the {@link SequencerControlled} component.
 *
 * This is the low-level controlled interface. All state is driven externally —
 * the component holds no internal state of its own. For the uncontrolled
 * version that reacts to external events and derives these props automatically,
 * see the default export of the parent module.
 *
 * @property step - Zero-based index of the currently active step. Determines
 * which child is marked active, which are previous, and which are next.
 * Defaults to \`0\`.
 * @property activateOnStep - Optional 2D array that overrides the default
 * one-child-per-step activation logic. Each entry at index \`i\` is the list of
 * child indices that should be active when \`step === i\`, allowing multiple
 * children to be simultaneously active on a given step. When omitted, exactly
 * one child is active at a time (the child at index \`step\`).
 * @property _modifiers - Internal modifier flags forwarded directly to the
 * BEM class builder on the root element. Intended to be injected by the
 * uncontrolled wrapper; avoid setting manually in consumer code.
 * - \`playing\` — sequence is currently progressing.
 * - \`at-start\` — current step is the first step.
 * - \`at-end\` — current step is the last step.
 * @property _dataAttributes - Internal data attribute values forwarded to the
 * root element as \`data-<key>\`. Intended to be injected by the uncontrolled
 * wrapper; avoid setting manually in consumer code.
 * - \`tempo\` — exposed as \`data-tempo\`, reflects the current playback tempo.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - The items to sequence. Each child is wrapped in a
 * classifier \`<div>\` and receives one of the \`--active\`, \`--previous\`, or
 * \`--next\` modifiers depending on its position relative to the current \`step\`.
 */
export type ControlledProps = PropsWithChildren<WithClassName<{
  step?: number
  activateOnStep?: number[][]
  _modifiers?: {
    playing?: boolean
    'at-start'?: boolean
    'at-end'?: boolean
  }
  _dataAttributes?: {
    tempo?: number
  }
}>>
  
/**
 * Props for the {@link Sequencer} component.
 *
 * Extends {@link ControlledProps} (minus \`_modifiers\`, which are derived
 * internally) with uncontrolled playback and viewport-driven behaviour.
 *
 * @property defaultStep - Initial step index when running in uncontrolled mode.
 * Ignored if \`step\` is provided. Defaults to \`0\`.
 * @property tempo - Playback speed in beats per minute. The interval between
 * steps is derived as \`1000 / (tempo / 60)\` ms. Clamped to a minimum of \`1\`.
 * Defaults to \`60\`.
 * @property play - Controlled play state. When provided, overrides the internal
 * play state. The auto-advance interval only runs when this is \`true\`.
 * @property loop - When \`true\`, the step wraps around using absolute modulo so
 * it never exceeds the number of steps.
 * @property clampFirst - When \`true\` (and \`loop\` is \`false\`), clamps the step
 * to \`0\` at the lower bound, preventing negative step values.
 * @property clampLast - When \`true\` (and \`loop\` is \`false\`), clamps the step
 * to \`stepsCount - 1\` at the upper bound, preventing overflow.
 * @property resetOnVisible - When \`true\`, resets the internal step to \`0\` each
 * time the component enters the viewport. No-op when \`step\` or \`play\` is controlled.
 * @property resetOnHidden - When \`true\`, resets the internal step to \`0\` each
 * time the component leaves the viewport. No-op when \`step\` or \`play\` is controlled.
 * @property playOnVisible - When \`true\`, starts internal playback when the
 * component enters the viewport. No-op when \`play\` is controlled.
 * @property playOnVisibleMaxCount - Sets a maximum amount of automatic plays when the
 * comp becomes visible.
 * @property pauseOnHidden - When \`true\`, pauses internal playback when the
 * component leaves the viewport. No-op when \`play\` is controlled.
 * @property actionHandlers - Optional handlers for imperative actions triggered
 * by external events:
 * - \`intersected\` — forwarded verbatim to the internal
 * {@link IntersectionObserverComponent}'s \`onIntersected\`, called on every
 * intersection change regardless of controlled state.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 * - \`isPlaying\` — called with the new play state whenever it changes.
 * - \`stepChanged\` — called with the new forwarded step index whenever it changes.
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
  playOnVisibleMaxCount?: number
  pauseOnHidden?: boolean
  actionHandlers?: {
    intersected?: IOCompProps['onIntersected']
  }
  stateHandlers?: {
    isPlaying?: (isPlaying: boolean) => void
    stepChanged?: (step: number) => void
  }
}`

const demoStyles = `
.${publicClassName}__child {
  display: inline-block;
  transition: opacity 400ms;
}

.${publicClassName}__child.${publicClassName}__child--next {
  opacity: 0;
}

.${publicClassName}__child.${publicClassName}__child--prev {
  opacity: .6;
}

.${publicClassName}__child.${publicClassName}__child--current {
  opacity: 1;
  font-weight: 800;
}`

const childDivStyle = {
  display: 'flex',
  'justify-content': 'center',
  'align-items': 'center',
  width: '60px',
  height: '60px',
  margin: '4px',
  background: 'coral',
  transition: 'opacity 400ms'
}

const demoProps: SequencerProps = {
  playOnVisible: true,
  pauseOnHidden: true,
  loop: true,
  tempo: 1200,
  clampLast: true,
  children: [
    <div style={childDivStyle}>1</div>,
    <div style={childDivStyle}>2</div>,
    <div style={childDivStyle}>3</div>,
    <div style={childDivStyle}>4</div>,
    <div style={childDivStyle}>5</div>,
    <div style={childDivStyle}>6</div>,
    <div style={childDivStyle}>7</div>,
    <div style={childDivStyle}>8</div>,
    <div style={childDivStyle}>9</div>,
    <div style={childDivStyle}>10</div>,
    <div style={childDivStyle}>11</div>,
    <div style={childDivStyle}>12</div>,
    <div style={childDivStyle}>13</div>,
    <div style={childDivStyle}>14</div>,
    <div style={childDivStyle}>15</div>,
    <div style={childDivStyle}>16</div>
  ]
}

export const SequencerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <div style={{ height: '40vh' }}>Scroll down in order to make the sequencer enter the viewport</div>
    <Sequencer {...demoProps} />
  </CompDisplayer>
}
