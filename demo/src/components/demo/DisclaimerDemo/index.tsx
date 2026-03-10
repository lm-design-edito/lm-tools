import { type FunctionComponent } from 'react'
import {
  Disclaimer,
  type Props as DisclaimerProps
} from '~/components/Disclaimer/index.js'
import { disclaimer as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

/* Name */
const name = 'Disclaimer'

/* Description */
const description = `
Component that displays a dismissible disclaimer panel.

Supports both controlled (\`isOn\` provided) and uncontrolled modes.

@param props - Component properties.
@see {@link Props}

@remarks
- In controlled mode, visibility is driven by \`isOn\` and internal state
  does not toggle automatically.
- In uncontrolled mode, the component manages its own visibility state.
- Applies \`on\` and \`off\` modifier classes depending on visibility state.`

/* TSX Details */
const tsxDetails = `
/**
 * Props for the Disclaimer component.
 *
 * @property content - Content displayed inside the disclaimer panel.
 * @property togglerContent - Content rendered inside the dismiss toggler.
 * If not provided, the toggler is not rendered.
 * @property isOn - Controls the visibility state. When defined, the component
 * behaves as a controlled component.
 * @property defaultIsOn - Default visibility state for uncontrolled mode.
 * @property stateHandlers - Callbacks invoked after state changes.
 * @property stateHandlers.toggled - Callback invoked after the disclaimer state changes.
 * @property actionHandlers - Callbacks invoked before actions are committed.
 * @property actionHandlers.dismissClick - Callback invoked before the disclaimer is dismissed.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Additional content rendered below the disclaimer panel.
 */
export type Props = PropsWithChildren<WithClassName<{
  content?: ReactNode
  togglerContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  stateHandlers?: {
    toggled?: (isOn: boolean) => void
  }
  actionHandlers?: {
    dismissClick?: (prevIsOn: boolean) => void
  }
}>>`

/* Demo CSS */
export const demoStyles = `
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
