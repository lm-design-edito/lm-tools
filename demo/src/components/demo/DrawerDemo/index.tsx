import { type FunctionComponent } from 'react'
import {
  Drawer,
  type Props as DrawerProps
} from '~/components/Drawer/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { drawer as publicClassName } from '~/components/public-classnames.js'

/* Name */
const name = 'Drawer'

/* Description */
const description = `Drawer component with optional controlled and uncontrolled behavior.

@remarks
- In controlled mode (\`isOpened\` defined), visibility is fully driven by the prop.
- In uncontrolled mode, internal state is initialized from \`initialIsOpened\`.
- The component measures its content using \`ResizeObserverComponent\`
  and exposes the dimensions:
  - As CSS custom properties:
    --{prefix}-content-height
    --{prefix}-content-height-px
    --{prefix}-content-width
    --{prefix}-content-width-px
  - As \`data-content-width\` and \`data-content-height\` attributes.

CSS modifier classes:
- \`opened\` when open
- \`closed\` when closed`

/* TSX Details */
const tsxDetails = `/**
 * Props for the Drawer component.
 *
 * @property openerContent - Content rendered inside the opener control.
 * @property closerContent - Content rendered inside the closer control.
 * @property initialIsOpened - Initial open state in uncontrolled mode.
 * Ignored when \`isOpened\` is provided.
 * @property isOpened - Controlled open state. When defined, the component
 * behaves as a controlled component and internal state is ignored.
 * @property onToggle - Callback invoked when the open state changes due to
 * user interaction (only in uncontrolled mode). Receives the next state.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Drawer content.
 */
export type Props = PropsWithChildren<WithClassName<{
  openerContent?: ReactNode
  closerContent?: ReactNode
  initialIsOpened?: boolean
  isOpened?: boolean
  onToggle?: (isOpen: boolean) => void
}>>`

/* Demo CSS */
const demoStyles = `.${publicClassName}.${publicClassName}--opened .${publicClassName}__opener {
  display: none;
}

.${publicClassName}.${publicClassName}--closed .${publicClassName}__closer {
  display: none;
}

.${publicClassName}__content {
  height: 0;
  opacity: 0;
  transition: opacity 200ms, height 200ms 200ms;
  overflow: hidden;
}

.${publicClassName}.${publicClassName}--opened .${publicClassName}__content {
  height: var(--${publicClassName}-content-height-px);
  opacity: 1;
  transition: height 200ms, opacity 200ms 200ms;
}`

/* Demo props */
const demoProps: DrawerProps = {
  initialIsOpened: true,
  openerContent: <button>Open this</button>,
  closerContent: <button>Close this</button>,
  children: <div style={{
    width: 200,
    height: 200,
    backgroundColor: 'slateblue'
  }} />
}

export const DrawerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <Drawer {...demoProps} />
    --
  </CompDisplayer>
}
