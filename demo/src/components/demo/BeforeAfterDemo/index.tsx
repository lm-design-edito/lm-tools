import { type FunctionComponent } from 'react'
import {
  BeforeAfter,
  type Props as BeforeAfterProps
} from '~/components/BeforeAfter/index.js'
import { beforeAfter as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'BeforeAfter'

const description = `
Before/after comparison component with optional controlled and uncontrolled behavior.

Wraps {@link BeforeAfterControlled} and manages internal divider position when
operating in uncontrolled mode. The active axis used to derive the ratio from
pointer position depends on \`mode\`: horizontal interactions use the x ratio,
vertical interactions use the y ratio.

@remarks
- In controlled mode (\`ratio\` defined), divider position is fully driven by the prop
  and internal state is never updated.
- In uncontrolled mode, internal state is initialized from \`defaultRatio\` and updated
  on both drag and click interactions.
- \`actionHandlers.dragged\` and \`actionHandlers.clicked\` are always forwarded to the
  underlying controlled component, regardless of mode.

@param props - Component properties.
@see {@link Props}
@returns A {@link BeforeAfterControlled} instance with ratio state managed internally when uncontrolled.

–

Controlled before/after comparison component.

Renders two content panels separated by a draggable divider whose position
is expressed as a ratio between \`0\` and \`1\`. Supports both mouse and touch
interactions, distinguishing clicks from drags.

The active ratio is exposed as:
- CSS custom properties:
  - \`--{prefix}-ratio\`
  - \`--{prefix}-ratio-percent\`
- A \`data-ratio\` attribute on the root element.

### CSS modifiers
- \`horizontal\` — applied when \`mode\` is \`'horizontal'\`.
- \`vertical\` — applied when \`mode\` is \`'vertical'\`.

### CSS elements
- \`before\`
- \`after\`

@param props - Component properties.
@see {@link Props}
@returns A split-panel container with pointer interaction handlers and ratio state applied.
`

/* Demo CSS */
const demoStyles = `
.${publicClassName} {
  position: relative;
  overflow: hidden;
}

.${publicClassName}__before,
.${publicClassName}__after {
  pointer-events: none;
  user-select: none;
}

.${publicClassName}__after {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    transparent var(--${publicClassName}-ratio-percent),
    black calc(var(--${publicClassName}-ratio-percent) + 0.1%),
    black 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    transparent var(--${publicClassName}-ratio-percent),
    black calc(var(--${publicClassName}-ratio-percent) + 0.1%),
    black 100%
  );
}

.${publicClassName}.${publicClassName}--vertical .${publicClassName}__after {
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent var(--${publicClassName}-ratio-percent),
    black calc(var(--${publicClassName}-ratio-percent) + 0.1%),
    black 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    transparent var(--${publicClassName}-ratio-percent),
    black calc(var(--${publicClassName}-ratio-percent) + 0.1%),
    black 100%
  );
}

.${publicClassName}__separator {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--${publicClassName}-ratio-percent);
  transform: translateX(-50%);
  width: 4px;
  background: black;
}
`

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link BeforeAfter} component.
 *
 * Extends {@link ControlledProps} with uncontrolled defaults and state callbacks.
 * When \`ratio\` is provided (inherited from {@link ControlledProps}), the component
 * operates in controlled mode and internal state is ignored.
 *
 * @property defaultRatio - Initial divider position in uncontrolled mode, as a value
 * between \`0\` and \`1\`. Ignored when \`ratio\` is provided. Defaults to \`0.5\`.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 *   - \`ratioChanged\` — called after the internal ratio has been updated, with the new ratio value.
 * 
 */

/**
 * Props for the {@link BeforeAfterControlled} component.
 *
 * Extends {@link WithClassName} with layout, content, and interaction configuration.
 *
 * @property mode - Layout orientation of the split. Defaults to \`'horizontal'\`.
 * @property ratio - Position of the divider as a value between \`0\` and \`1\`.
 * Values outside this range are clamped automatically. Defaults to \`0\`.
 * @property before - Content rendered in the first (before) panel.
 * @property after - Content rendered in the second (after) panel.
 * @property actionHandlers - Optional user action callbacks:
 *   - \`dragged\` — called on each pointer move while dragging, with the current
 *     x and y ratios relative to the component bounds.
 *   - \`clicked\` — called on pointer release when no drag occurred, with the
 *     x and y ratios of the release position.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Arbitrary content to inject inside the component
 */
`

const demoProps: BeforeAfterProps = {
  before: <div style={{ width: 500, height: 300, background: 'coral' }}><button>CORAL</button></div>,
  after: <div style={{ width: 800, height: 300, background: 'cornflowerblue' }}><button>BLUE</button></div>,
  actionHandlers: {
    dragged: (x, y) => console.log('x:', x, 'y:', y),
    clicked: (x, y) => console.log('x:', x, 'y:', y)
  }
}

export const BeforeAfterDemo: FunctionComponent = () => {
  return <CompDisplayer
  name={name}
  demoStyles={demoStyles}
  description={description}
  demoProps={demoProps as Record<string, unknown>}
  tsxDetails={tsxDetails}>
    <div style={{ display: 'inline-block' }}>
      <BeforeAfter {...demoProps} />
    </div>
  </CompDisplayer>
}
