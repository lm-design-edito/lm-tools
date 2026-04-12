import {
  type FunctionComponent,
  useState,
  useCallback,
  useEffect
} from 'react'
import {
  BeforeAfterControlled,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link BeforeAfter} component.
 *
 * Extends {@link ControlledProps} (minus `_modifiers`, which are derived
 * internally) with uncontrolled ratio and direction management.
 *
 * @property defaultRatio - Initial ratio value (0 to 1). Used if `ratio` is not provided. Defaults to `0`.
 * @property direction - Slider orientation: `'horizontal'` (default) or `'vertical'`.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 *   - `ratio` — called with the new ratio whenever it changes.
 */
export type Props = ControlledProps & {
  defaultRatio?: number
  direction?: 'horizontal' | 'vertical'
  stateHandlers?: {
    ratio?: (ratio: number) => void
  }
}

/**
 * Props for the {@link BeforeAfter} component.
 *
 * Extends {@link ControlledProps} with uncontrolled ratio and direction management.
 *
 * @property defaultRatio - Initial ratio value (0 to 1). Used if `ratio` is not provided. Defaults to `0`.
 * @property direction - Slider orientation: `'horizontal'` (default) or `'vertical'`. If horizontal, the ratio is calced as the horizontal pointer position over the element width. If vertical, it's the vertical pointer position over the element height.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 *   - `ratio` — called with the new ratio whenever it changes.
 *
 * @see {@link ControlledProps}
 */

/**
 * Uncontrolled, self-updating before/after slider component. Drives a
 * {@link BeforeAfterControlled} instance with internal ratio state and direction,
 * supporting both controlled and uncontrolled usage.
 *
 * Supports mixed controlled/uncontrolled usage: passing `ratio` disables internal ratio state,
 * but still allows direction and stateHandlers to be used. Passing `defaultRatio` sets the initial ratio.
 *
 * ### Forwarded modifiers to {@link BeforeAfterControlled}
 * The following `_modifiers` are computed and injected automatically:
 * - `horizontal` — `true`.
 * - `vertical` — `true`.
 *
 * ### Forwarded CSS custom properties to {@link BeforeAfterControlled}
 * - `--before-after-ratio` — the current ratio value (0 to 1, fixed to 8 decimals).
 * - `--before-after-ratio-percent` — the current ratio as a percentage (0 to 100).
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @see {@link BeforeAfterControlled}
 * @returns A {@link BeforeAfterControlled} with computed ratio and orientation modifiers applied.
 */
export const BeforeAfter: FunctionComponent<Props> = ({
  direction,
  defaultRatio,
  stateHandlers,
  ...controlledProps
}) => {
  const { actionHandlers, ratio } = controlledProps
  const [internalRatio, setInternalRatio] = useState(ratio ?? defaultRatio ?? 0)

  const handlePointer = useCallback((
    e: PointerEvent,
    targetHRatio: number,
    targetVRatio: number,
    ratio: number | null,
    element: HTMLDivElement
  ) => {
    if (direction === 'vertical') setInternalRatio(targetVRatio)
    else setInternalRatio(targetHRatio)
    actionHandlers?.pointer?.(e, targetHRatio, targetVRatio, ratio, element)
  }, [direction, actionHandlers?.pointer])

  useEffect(() => {
    stateHandlers?.ratio?.(internalRatio)
  }, [internalRatio, stateHandlers?.ratio])

  return <BeforeAfterControlled
    {...controlledProps}
    _modifiers={{
      horizontal: direction !== 'vertical',
      vertical: direction === 'vertical'
    }}
    ratio={ratio ?? internalRatio}
    actionHandlers={{ pointer: handlePointer }} />
}
