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
const description = `Drawer component supporting controlled and uncontrolled usage.

The content is measured through a \`ResizeObserverComponent\` so its dimensions
can drive the open/close transition from CSS alone.

### CSS modifiers
- \`opened\` — the drawer is open.
- \`closed\` — the drawer is closed.

### CSS elements
- \`opener\`
- \`closer\`
- \`content\`

### CSS custom properties on the root element
- \`--{prefix}-content-width\` / \`--{prefix}-content-width-px\`
- \`--{prefix}-content-height\` / \`--{prefix}-content-height-px\`

### Data attributes on the root element
- \`data-content-width\`, \`data-content-height\` — the measured content size.
Absent until the first measurement lands.

@remarks
- In controlled mode (\`isOpened\` defined), the open state is fully driven by
  the parent and internal state is never updated.
- \`onOpenerClicked\` and \`onCloserClicked\` fire in both modes — a controlled
  parent needs them to know a click happened at all.
- \`onIsOpenedChanged\` fires in both modes too, and never on mount.`

/* TSX Details */
const tsxDetails = `/**
 * Props for the {@link Drawer} component.
 *
 * @property openerContent - Content rendered inside the opener control.
 * @property closerContent - Content rendered inside the closer control.
 * @property defaultIsOpened - Initial open state in uncontrolled mode.
 * Ignored when \`isOpened\` is provided. Defaults to \`false\`.
 * @property isOpened - Controlled open state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property onOpenerClicked - Called when the opener is clicked, before the
 * drawer reacts, with the open state as it was.
 * @property onCloserClicked - Called when the closer is clicked, before the
 * drawer reacts, with the open state as it was.
 * @property onIsOpenedChanged - Called after the open state changed, with the
 * new value.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Drawer content.
 */
export type Props = PropsWithChildren<WithClassName<{
  openerContent?: ReactNode
  closerContent?: ReactNode
  defaultIsOpened?: boolean
  isOpened?: boolean
  onOpenerClicked?: (isOpened: boolean) => void
  onCloserClicked?: (isOpened: boolean) => void
  onIsOpenedChanged?: (isOpened: boolean) => void
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
  defaultIsOpened: true,
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
