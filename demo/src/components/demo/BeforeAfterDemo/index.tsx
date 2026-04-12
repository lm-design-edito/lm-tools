import { type FunctionComponent } from 'react'
import {
  BeforeAfter,
  type Props as BeforeAfterProps
} from '~/components/BeforeAfter/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import {
  beforeAfter as publicClassName,
} from '~/components/public-classnames.js'

const name = 'BeforeAfter'

const description = `
Uncontrolled, self-updating before/after slider component. Drives a
{@link BeforeAfterControlled} instance with internal ratio state and direction,
supporting both controlled and uncontrolled usage.

Supports mixed controlled/uncontrolled usage: passing \`ratio\` disables internal ratio state,
but still allows direction and stateHandlers to be used. Passing \`defaultRatio\` sets the initial ratio.

### Forwarded modifiers to {@link BeforeAfterControlled}
The following \`_modifiers\` are computed and injected automatically:
- \`horizontal\` — \`true\` when the slider is horizontal.
- \`vertical\` — \`true\` when the slider is vertical.

### Forwarded CSS custom properties to {@link BeforeAfterControlled}
- \`--before-after-ratio\` — the current ratio value (0 to 1, fixed to 8 decimals).
- \`--before-after-ratio-percent\` — the current ratio as a percentage (0 to 100).

@param props - Component properties.
@see {@link Props}
@see {@link BeforeAfterControlled}
@returns A {@link BeforeAfterControlled} with computed ratio and orientation modifiers applied.
`

/* Demo CSS */
const demoStyles = `
.${publicClassName} {
  position: relative;
  display: flex;
  width: fit-content;
}

.${publicClassName}__before {
  position: relative;
  z-index: 1;
  filter: grayscale(100%) sepia(20%); ;
}

.${publicClassName}__after {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  mask-image: linear-gradient(
    to right,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
  -webkit-mask-image: linear-gradient(
    to right,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
}

.${publicClassName}--vertical .${publicClassName}__after {
  mask-image: linear-gradient(
    to bottom,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
}
`

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link BeforeAfterControlled} component.
 *
 * This is the low-level controlled interface. All state is driven externally —
 * the component holds no internal state of its own. For the uncontrolled
 * version that reacts to external events and derives these props automatically,
 * see the default export of the parent module.
 *
 * @property beforeContent - Content shown "before" (left or top).
 * @property afterContent - Content shown "after" (right or bottom).
 * @property ratio - Split ratio (0 to 1). Controlled by parent.
 * @property actionHandlers - Optional pointer (drag) callbacks:
 *   - \`pointer\` — called on pointer events with ratio and element info.
 * @property _modifiers - Orientation modifiers: \`horizontal\` or \`vertical\`.
 * @property className - Custom CSS class.
 * @property children - Optional children rendered inside the slider.
 */
export type ControlledProps = PropsWithChildren<WithClassName<{
  beforeContent?: React.ReactNode
  afterContent?: React.ReactNode
  ratio?: number
  actionHandlers?: {
    pointer?: (
      e: PointerEvent,
      targetHRatio: number,
      targetVRatio: number,
      ratio: number | null,
      element: HTMLDivElement
    ) => void
  }
  _modifiers?: {
    horizontal?: boolean
    vertical?: boolean
  }
  className?: string
}>>`

const demoProps1: BeforeAfterProps = {
  defaultRatio: 0.2,
  beforeContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="Before" />,
  afterContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="After" />,
  actionHandlers: {
    pointer: (e, targetHRatio, targetVRatio, ratio, element) => {
      // console.log('pointer'x, { e, targetHRatio, targetVRatio, ratio, element })
    }
  }
}

const demoProps2: BeforeAfterProps = {
  defaultRatio: 0.5,
  beforeContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="Before" />,
  afterContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="After" />,
  direction: 'vertical',
  actionHandlers: {
    pointer: (e, targetHRatio, targetVRatio, ratio, element) => {
      // console.log('pointer'x, { e, targetHRatio, targetVRatio, ratio, element })
    }
  }
}

export const BeforeAfterDemo: FunctionComponent = () => {
  return <CompDisplayer
  name={name}
  demoStyles={demoStyles}
  description={description}
  demoProps={demoProps1 as Record<string, unknown>}
  tsxDetails={tsxDetails}>
    <BeforeAfter {...demoProps1} />
    <BeforeAfter {...demoProps2} />
  </CompDisplayer>
}
