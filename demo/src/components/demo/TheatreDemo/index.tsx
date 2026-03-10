import { useState, useEffect, type FunctionComponent } from 'react'
import {
  Theatre,
  type Props as TheatreProps
} from '~/components/Theatre/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { theatre as publicClassName } from '~/components/public-classnames.js'

const name = 'Theatre'

const description = `
Theatre mode component. Wraps content in a toggleable fullscreen-like "stage"
overlay. Supports both controlled and uncontrolled usage.

When \`isOn\` is not provided the component manages its own open/closed state
internally. When \`isOn\` is provided it acts as the source of truth and the
internal state is ignored.

### Root element modifiers
The root \`<div>\` receives the public class name defined by \`theatre\` and the
following BEM-style modifier classes:
- \`--on\` — when theatre mode is active.
- \`--off\` — when theatre mode is inactive.

### Child elements
- \`__stage\` — container rendered inside the root that holds the duplicated
\`children\` when theatre mode is active. Only mounted when \`isOn\` is \`true\`.
- \`__open-btn\` — clickable element that activates theatre mode.
- \`__close-btn\` — clickable element that deactivates theatre mode.

@param props - Component properties.
@see {@link Props}
@returns A root \`<div>\` containing the children in their original position,
a stage overlay with the duplicated children (when active), and the open/close
toggle buttons.`

const tsxDetails = `/**
 * Props for the {@link Theatre} component.
 *
 * @property closeBtnContent - Custom content rendered inside the close/exit button.
 * @property openBtnContent - Custom content rendered inside the open/enter button.
 * @property isOn - Controlled theatre mode state. When provided, overrides the
 * internal state. Use together with {@link Props.onToggleClick} for fully
 * controlled usage.
 * @property defaultIsOn - Default state for the theatre mode.
 * @property exitOnEscape — When uncontrolled and on, toggles internal state to off when 'esc' key is pressed
 * @property exitOnBgClick — When uncontrolled and on, toggles internal state to off when the background is clicked
 * @property onToggleClick - Callback invoked when either the open or close
 * button is clicked. Receives the theatre state value (\`isOn\`) at the time of the click,
 * i.e. the previous state before the toggle.
 * @property onToggled - Callback invoked after the state changed
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Content rendered both in the default slot and, when theatre
 * mode is active, duplicated inside the stage element.
 */
export type Props = PropsWithChildren<WithClassName<{
  closeBtnContent?: ReactNode
  openBtnContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  exitOnEscape?: boolean
  exitOnBgClick?: boolean
  onToggleClick?: (prevIsOn: boolean) => void
  onToggled?: (isOn: boolean) => void
}>>`

/* Demo CSS */
export const demoStyles = `
.${publicClassName} button {
  cursor: pointer;
}

.${publicClassName}.${publicClassName}--on {
  background-color: rgba(0, 0, 0, 0.8);
  transition: background 0.3s ease-in;
}

.dsed-theatre__stage {
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: env(safe-area-inset-left, 0);
  right: env(safe-area-inset-right, 0);
  bottom: env(safe-area-inset-bottom, 0);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
  background-color: transparent;
  opacity: 0;
  transition: background 200ms, opacity 200ms;
}

.${publicClassName}.${publicClassName}--on .dsed-theatre__stage {
  background-color: rgb(15, 15, 15, 0.95);
  display: flex;
  opacity: 1;
  pointer-events: auto;
}

.${publicClassName}.${publicClassName}--on .dsed-theatre__stage > * {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.${publicClassName}__close-btn {
  position: fixed;
  top: calc(16px + env(safe-area-inset-top, 0));
  right: calc(16px + env(safe-area-inset-right, 0));
  z-index: 10000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms;
}
  
.${publicClassName}.${publicClassName}--on .${publicClassName}__close-btn {
  opacity: 1;
  pointer-events: auto;
}`

export const TheatreDemo: FunctionComponent = () => {
  const [isTheatreOn, setIsTheatreOn] = useState<boolean | undefined>(false)

  const demoProps: TheatreProps = {
    isOn: isTheatreOn,
    openBtnContent: <button>Ouvrir le théâtre</button>,
    closeBtnContent: <button>Fermer le théâtre</button>,
    exitOnEscape: true,
    exitOnBgClick: true,
    onToggleClick: prev => prev === true && setIsTheatreOn(false),
    onToggled: isOn => console.log('Theatre toggled. Is on:', isOn)
  }

  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    demoProps={demoProps}
    tsxDetails={tsxDetails}>
    <span>isOn: </span>
    <button onClick={() => setIsTheatreOn(undefined)}>{isTheatreOn === undefined ? <strong>undefined</strong> : 'undefined'}</button>
    <button onClick={() => setIsTheatreOn(true)}>{isTheatreOn === true ? <strong>true</strong> : 'true'}</button>
    <button onClick={() => setIsTheatreOn(false)}>{isTheatreOn === false ? <strong>false</strong> : 'false'}</button>
    <Theatre
      {...demoProps}>
      <div style={{
        width: '300px',
        height: '200px',
        backgroundColor: 'lightblue',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        Contenu à basculer en mode théâtre
      </div>
    </Theatre>
  </CompDisplayer>
}
