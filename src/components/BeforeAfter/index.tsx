import {
  type FunctionComponent,
  useState
} from 'react'
import { useChangeDispatch } from '../utils/index.js'
import {
  ControlledBeforeAfter,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Pointer ratios are stretched by this much on each side before becoming the
 * divider position, so the very edges stay reachable without having to land the
 * pointer exactly on the component's border.
 */
const edgeOvershoot = 0.01

/** Turns a raw pointer ratio into a divider position, edges included. */
function toDividerRatio (pointerRatio: number): number {
  return pointerRatio * (1 + 2 * edgeOvershoot) - edgeOvershoot
}

/**
 * Props for the {@link BeforeAfter} component.
 *
 * Extends {@link ControlledProps} with uncontrolled divider positioning. When
 * `ratio` is provided, the component operates in controlled mode.
 *
 * @property defaultRatio - Initial divider position in uncontrolled mode,
 * between `0` and `1`. Ignored when `ratio` is provided. Defaults to `0.5`.
 * @property onRatioChanged - Called after the divider position changed, with the
 * new ratio.
 */
export type Props = ControlledProps & {
  defaultRatio?: number
  onRatioChanged?: (ratio: number) => void
}

/**
 * Before/after comparison component supporting controlled and uncontrolled usage.
 *
 * Turns the pointer ratios reported by {@link ControlledBeforeAfter} into a
 * divider position, reading the axis that matches `mode`: the x ratio when
 * horizontal, the y ratio when vertical.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @see {@link ControlledBeforeAfter} for the rendered markup and CSS elements.
 * @returns A {@link ControlledBeforeAfter} with the divider position managed
 * internally when uncontrolled.
 *
 * @remarks
 * - In controlled mode (`ratio` defined), the divider position is fully driven
 *   by the parent and internal state is never updated.
 * - `onDragged` and `onClicked` fire in both modes — a controlled parent needs
 *   them to know where the pointer went.
 * - `onRatioChanged` fires in both modes too, and never on mount.
 */
export const BeforeAfter: FunctionComponent<Props> = ({
  mode = 'horizontal',
  ratio,
  defaultRatio = 0.5,
  onDragged,
  onClicked,
  onRatioChanged,
  ...controlledProps
}) => {
  // State
  const [internalRatio, setInternalRatio] = useState(defaultRatio)
  const isControlled = ratio !== undefined
  const effectiveRatio = isControlled ? ratio : internalRatio

  // State dispatch
  useChangeDispatch(effectiveRatio, onRatioChanged)

  // User action handlers
  const moveDividerTo = (xRatio: number, yRatio: number): void => {
    if (isControlled) return
    setInternalRatio(mode === 'horizontal' ? xRatio : yRatio)
  }
  const handleDrag = (xRatio: number, yRatio: number): void => {
    const x = toDividerRatio(xRatio)
    const y = toDividerRatio(yRatio)
    onDragged?.(x, y)
    moveDividerTo(x, y)
  }
  const handleClick = (xRatio: number, yRatio: number): void => {
    const x = toDividerRatio(xRatio)
    const y = toDividerRatio(yRatio)
    onClicked?.(x, y)
    moveDividerTo(x, y)
  }

  // Rendering
  return <ControlledBeforeAfter
    {...controlledProps}
    mode={mode}
    ratio={effectiveRatio}
    onDragged={handleDrag}
    onClicked={handleClick} />
}
