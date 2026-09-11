import { useState, useEffect, type FunctionComponent } from 'react'
import {
  Lightbox,
  type Props as LightboxProps
} from '~/components/Lightbox/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { lightbox as publicClassName } from '~/components/public-classnames.js'

const name = 'Lightbox'

const description = `
Lightbox mode component. Wraps content in a toggleable fullscreen-like "stage"
overlay. Supports both controlled and uncontrolled usage.

When \`isOn\` is not provided the component manages its own open/closed state
internally. When \`isOn\` is provided it acts as the source of truth and the
internal state is ignored.

### Root element modifiers
The root \`<div>\` receives the public class name defined by \`lightbox\` and the
following BEM-style modifier classes:
- \`--on\` — when lightbox mode is active.
- \`--off\` — when lightbox mode is inactive.

### Child elements
- \`__stage\` — container rendered inside the root that holds the duplicated
\`children\` when lightbox mode is active. Only mounted when \`isOn\` is \`true\`.
- \`__open-btn\` — clickable element that activates lightbox mode.
- \`__close-btn\` — clickable element that deactivates lightbox mode.

@param props - Component properties.
@see {@link Props}
@returns A root \`<div>\` containing the children in their original position,
a stage overlay with the duplicated children (when active), and the open/close
toggle buttons.`

const tsxDetails = `/**
 * Props for the {@link Lightbox} component.
 *
 * @property closeBtnContent - Custom content rendered inside the close/exit button.
 * @property openBtnContent - Custom content rendered inside the open/enter button.
 * @property isOn - Controlled lightbox mode state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property defaultIsOn - Initial lightbox mode state in uncontrolled mode.
 * Ignored when \`isOn\` is provided. Defaults to \`false\`.
 * @property exitOnEscape - When \`true\`, pressing \`Escape\` while the stage is
 * open counts as a toggle.
 * @property exitOnBgClick - When \`true\`, clicking the stage background — and
 * not its content — counts as a toggle.
 * @property onOpenButtonClicked - Called when the open button is clicked, before
 * the lightbox reacts, with the state as it was.
 * @property onCloseButtonClicked - Called when the close button is clicked,
 * before the lightbox reacts, with the state as it was.
 * @property onBackgroundClicked - Called when the stage background is clicked
 * (only while \`exitOnBgClick\` is \`true\`), before the lightbox reacts.
 * @property onEscapePressed - Called when \`Escape\` is pressed (only while
 * \`exitOnEscape\` is \`true\`), before the lightbox reacts.
 * @property onIsOnChanged - Called after the lightbox mode changed, with the new
 * value.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Content rendered both in the default slot and, when lightbox
 * mode is active, duplicated inside the stage element.
 */
export type Props = PropsWithChildren<WithClassName<{
  closeBtnContent?: ReactNode
  openBtnContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  exitOnEscape?: boolean
  exitOnBgClick?: boolean
  onOpenButtonClicked?: (isOn: boolean) => void
  onCloseButtonClicked?: (isOn: boolean) => void
  onBackgroundClicked?: (isOn: boolean) => void
  onEscapePressed?: (isOn: boolean) => void
  onIsOnChanged?: (isOn: boolean) => void
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

.${publicClassName}__stage {
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

.${publicClassName}.${publicClassName}--on .${publicClassName}__stage {
  background-color: rgb(15, 15, 15, 0.95);
  display: flex;
  opacity: 1;
  pointer-events: auto;
}

.${publicClassName}.${publicClassName}--on .${publicClassName}__stage > * {
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

export const LightboxDemo: FunctionComponent = () => {
  const [isLightboxOn, setIsLightboxOn] = useState<boolean | undefined>(false)

  const demoProps: LightboxProps = {
    isOn: isLightboxOn,
    openBtnContent: <button>Ouvrir le théâtre</button>,
    closeBtnContent: <button>Fermer le théâtre</button>,
    exitOnEscape: true,
    exitOnBgClick: true,
    onOpenButtonClicked: () => { setIsLightboxOn(true) },
    onCloseButtonClicked: () => { setIsLightboxOn(false) },
    onBackgroundClicked: () => { setIsLightboxOn(false) },
    onEscapePressed: () => { setIsLightboxOn(false) },
    // eslint-disable-next-line no-console
    onIsOnChanged: isOn => { console.log('Lightbox toggled. Is on:', isOn) }
  }

  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    demoProps={demoProps}
    tsxDetails={tsxDetails}>
    <span>isOn: </span>
    <button onClick={() => setIsLightboxOn(undefined)}>{isLightboxOn === undefined ? <strong>undefined</strong> : 'undefined'}</button>
    <button onClick={() => setIsLightboxOn(true)}>{isLightboxOn === true ? <strong>true</strong> : 'true'}</button>
    <button onClick={() => setIsLightboxOn(false)}>{isLightboxOn === false ? <strong>false</strong> : 'false'}</button>
    <Lightbox
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
    </Lightbox>
  </CompDisplayer>
}
