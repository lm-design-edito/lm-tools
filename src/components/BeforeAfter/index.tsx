import {
  type FunctionComponent,
  useRef,
  useState
} from 'react'
import { useStateChangeDispatch } from '../../agnostic/@react/effects/use-state-change-dispatch/index.js'
import { useCompId } from '../utils/comp-id/index.js'
import {
  useCommandSurrender,
  useCommands
} from '../utils/commands/index.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import {
  BEFORE_AFTER_ACTION_VERB_ARGUMENTS,
  BEFORE_AFTER_ACTION_VERB_DOMAINS,
  type BeforeAfterActionDomain
} from './types.js'
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
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`
 * and the five `visibility*` settings.
 */
// What this layer owns rather than forwards. `isVisible` is measured here, and `rootRef`
// is how it reaches an element it does not render itself — plumbing between the two
// files, never a way in.
export type Props = {
  defaultRatio?: number
  onRatioChanged?: (ratio: number) => void
}
  & Omit<ControlledProps, 'isVisible' | 'rootRef'>
  & VisibilityProps

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
 * ### Commands
 * - `ratio:<0–1>` — moves the divider. A value outside the range is warned about and
 *   does nothing.
 *
 * **A verb never contradicts a prop**: it is inert while `ratio` arrived as one. **And a
 * command yields to the reader** — dragging the divider or clicking in the component
 * hands the `ratio` domain over for the rest of the mount. `:force` opts out.
 *
 * @remarks
 * - In controlled mode (`ratio` defined), the divider position is fully driven by
 *   the parent. The internal state goes on following the component's own controls, so
 *   a parent that stops providing the prop lands on what the reader last did.
 * - `onDragged` and `onClicked` fire in both modes — a controlled parent needs
 *   them to know where the pointer went.
 * - `onRatioChanged` fires in both modes too, and never on mount.
 */
export const BeforeAfter: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  mode = 'horizontal',
  ratio,
  defaultRatio = 0.5,
  onDragged,
  onClicked,
  onRatioChanged,
  ...controlledProps
}) => {
  // The id is resolved here and handed down, so the two layers share one rather than
  // minting one each. The ref goes the same way: this layer observes a root rendered
  // below, so it mints the box and hands it down.
  const compId = useCompId(givenCompId)
  const rootRef = useRef<HTMLDivElement>(null)

  // State
  const [internalRatio, setInternalRatio] = useState(defaultRatio)
  const effectiveRatio = ratio ?? internalRatio

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

  // Commands
  //
  // Annotated with this component's vocabulary: the layer takes any name, so the
  // annotation is what keeps a misspelled domain from compiling.
  const surrender: (domain: BeforeAfterActionDomain) => void = useCommandSurrender(
    compId,
    BEFORE_AFTER_ACTION_VERB_DOMAINS
  )
  useCommands(compId, {
    ratio: ({ args }) => {
      const arg = args[0]
      if (arg === undefined || !BEFORE_AFTER_ACTION_VERB_ARGUMENTS.ratio(arg)) {
        // eslint-disable-next-line no-console
        console.warn(`"ratio" was sent an argument it cannot read: "${arg ?? ''}"`)
        return
      }
      if (ratio !== undefined) return
      setInternalRatio(Number(arg))
    }
  })

  // State dispatch
  useStateChangeDispatch(effectiveRatio, onRatioChanged)

  // User action handlers
  const moveDividerTo = (xRatio: number, yRatio: number): void => {
    surrender('ratio')
    setInternalRatio(mode === 'horizontal' ? xRatio : yRatio)
  }
  const handleDrag = ({ xRatio, yRatio }: { xRatio: number, yRatio: number }): void => {
    const x = toDividerRatio(xRatio)
    const y = toDividerRatio(yRatio)
    onDragged?.({ xRatio: x, yRatio: y })
    moveDividerTo(x, y)
  }
  const handleClick = ({ xRatio, yRatio }: { xRatio: number, yRatio: number }): void => {
    const x = toDividerRatio(xRatio)
    const y = toDividerRatio(yRatio)
    onClicked?.({ xRatio: x, yRatio: y })
    moveDividerTo(x, y)
  }

  // Rendering
  return <ControlledBeforeAfter
    {...controlledProps}
    compId={compId}
    rootRef={rootRef}
    isVisible={isVisible}
    mode={mode}
    ratio={effectiveRatio}
    onDragged={handleDrag}
    onClicked={handleClick} />
}
