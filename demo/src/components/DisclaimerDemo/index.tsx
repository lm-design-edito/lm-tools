import { useState, type FunctionComponent } from 'react'
import {
  Disclaimer,
  type Props as DisclaimerProps
} from '~/components/Disclaimer/index.js'
import { disclaimer as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

/* Name */
const name = 'Disclaimer'

/* Description */
const description = <>
  Simple component that hides its content behind a disclaimer panel.<br /><br />
  If <code>isOn</code> prop is not undefined, the component becomes controlled by it.<br />
  Otherwise, the click on the toggler sets the internal state to <code>disclosed</code>.
</>

/* TSX Details */
const tsxDetails = `
/* Props structure */

type Props = PropsWithChildren<WithClassName<{
  content?: ReactNode
  togglerContent?: ReactNode
  isOn?: boolean
  onDismissed?: () => void
}>>
  
/* Usage */

<Disclaimer {...props}>
  Sensitive content
</Disclaimer>

`

/* Demo CSS */
const demoStyles = `
.${publicClassName} {
  position: relative;
}

.${publicClassName}__panel {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  transition: opacity 200ms;
}

.${publicClassName}__panel button {
  margin-top: 16px;
  cursor: pointer;
}

.${publicClassName}.${publicClassName}--off .${publicClassName}__panel {
  opacity: 0;
  pointer-events: none
}

.${publicClassName}__sensitive {
  position: relative;
  z-index: 0;
}

`

/* Demo props */
const demoProps: DisclaimerProps = {
  content: 'Are you sure you want to see this?',
  togglerContent: <button>Show the content</button>,
  children: <div style={{
    height: 400,
    backgroundColor: 'red'
  }}>Disclosed content</div>
}

export const DisclaimerDemo: FunctionComponent = () => {
  const [isOn, setIsOn] = useState<boolean>()
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoStyles={demoStyles}
    demoProps={demoProps}>
    {/* <button></button> */}
    <Disclaimer {...demoProps} />
  </CompDisplayer>
}
