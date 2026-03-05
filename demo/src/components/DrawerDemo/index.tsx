import { type FunctionComponent } from 'react'
import {
  Drawer,
  type Props as DrawerProps
} from '~/components/Drawer/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'
import { drawer as publicClassName } from '~/components/public-classnames.js'

/* Name */
const name = 'Drawer'

/* Description */
const description = <>
  Calculates the dimensions of its content and exposes them as CSS custom properties.<br /><br />
  If <code>isOpened</code> prop is not undefined, the component becomes controlled by it.<br />
  Otherwise, the click on the toggler toggles the internal state to <code>opened / closed</code>.
</>

/* TSX Details */
const tsxDetails = `
type Props = PropsWithChildren<WithClassName<{
  openerContent?: ReactNode
  closerContent?: ReactNode
  initialIsOpened?: boolean
  isOpened?: boolean
  onToggle?: (isOpen: boolean) => void
}>>

`

/* Demo CSS */
const demoStyles = `
.${publicClassName}.${publicClassName}--opened .${publicClassName}__opener {
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
}
`

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
