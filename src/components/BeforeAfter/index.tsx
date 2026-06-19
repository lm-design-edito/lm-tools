import { type FunctionComponent, useState } from 'react'
import {
  BeforeAfterControlled,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link BeforeAfter} component.
 *
 * Extends {@link ControlledProps} with uncontrolled defaults and state callbacks.
 * When `ratio` is provided (inherited from {@link ControlledProps}), the component
 * operates in controlled mode and internal state is ignored.
 *
 * @property defaultRatio - Initial divider position in uncontrolled mode, as a value
 * between `0` and `1`. Ignored when `ratio` is provided. Defaults to `0.5`.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 *   - `ratioChanged` — called after the internal ratio has been updated, with the new ratio value.
 */
export type Props = ControlledProps & {
  defaultRatio?: number
  stateHandlers?: {
    ratioChanged?: (ratio: number) => void
  }
}

/**
 * Before/after comparison component with optional controlled and uncontrolled behavior.
 *
 * Wraps {@link BeforeAfterControlled} and manages internal divider position when
 * operating in uncontrolled mode. The active axis used to derive the ratio from
 * pointer position depends on `mode`: horizontal interactions use the x ratio,
 * vertical interactions use the y ratio.
 *
 * @remarks
 * - In controlled mode (`ratio` defined), divider position is fully driven by the prop
 *   and internal state is never updated.
 * - In uncontrolled mode, internal state is initialized from `defaultRatio` and updated
 *   on both drag and click interactions.
 * - `actionHandlers.dragged` and `actionHandlers.clicked` are always forwarded to the
 *   underlying controlled component, regardless of mode.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A {@link BeforeAfterControlled} instance with ratio state managed internally when uncontrolled.
 */
export const BeforeAfter: FunctionComponent<Props> = ({
  mode = 'horizontal',
  actionHandlers,
  stateHandlers,
  ratio,
  defaultRatio = 0.5,
  ...controlledProps
}) => {
  const [internalRatio, setInternalRatio] = useState(defaultRatio)
  const isControlled = ratio !== undefined
  const effectiveRatio = isControlled ? ratio : internalRatio
  const handleDrag = (x: number, y: number): void => {
    x = 1.02 * x - 0.01
    y = 1.02 * y - 0.01
    actionHandlers?.dragged?.(x, y)
    if (!isControlled) {
      setInternalRatio(mode === 'horizontal' ? x : y)
      stateHandlers?.ratioChanged?.(mode === 'horizontal' ? x : y)
    }
  }
  const handleClick = (x: number, y: number): void => {
    x = 1.02 * x - 0.01
    y = 1.02 * y - 0.01
    actionHandlers?.clicked?.(x, y)
    if (!isControlled) {
      setInternalRatio(mode === 'horizontal' ? x : y)
      stateHandlers?.ratioChanged?.(mode === 'horizontal' ? x : y)
    }
  }
  return <BeforeAfterControlled
    {...controlledProps}
    mode={mode}
    ratio={effectiveRatio}
    actionHandlers={{
      dragged: handleDrag,
      clicked: handleClick
    }} />
}
