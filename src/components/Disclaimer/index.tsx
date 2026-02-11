import {
  useState,
  useEffect,
  type ReactNode,
  type PropsWithChildren,
  type JSX
} from 'react'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { disclaimer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the Disclaimer component.
 *
 * @property content - Content displayed inside the disclaimer panel.
 * @property buttonContent - Content rendered inside the dismiss button.
 * If not provided, the button is not rendered.
 * @property isOn - Controls the visibility state. When defined, the component
 * behaves as a controlled component.
 * @property onDismissClick - Callback invoked when the dismiss button is clicked.
 * @property onDismissed - Callback invoked after the disclaimer is dismissed
 * in uncontrolled mode.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Additional content rendered below the disclaimer panel.
 */
export type Props = PropsWithChildren<WithClassName<{
  content?: ReactNode
  buttonContent?: ReactNode
  isOn?: boolean
  onDismissClick?: () => void
  onDismissed?: () => void
}>>

/**
 * Component that displays a dismissible disclaimer panel.
 *
 * Supports both controlled (`isOn` provided) and uncontrolled modes.
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @remarks
 * - In controlled mode, visibility is driven by `isOn` and internal state
 *   does not toggle automatically.
 * - In uncontrolled mode, the component manages its own visibility state.
 * - Applies `on` and `off` modifier classes depending on visibility state.
 */
export const Disclaimer = ({
  content,
  buttonContent,
  isOn: isOnProp,
  onDismissClick,
  onDismissed,
  children,
  className
}: Props): JSX.Element => {
  // State, effects & handlers
  const [isOn, setIsOn] = useState(true)
  useEffect(() => {
    if (isOnProp === undefined) return
    if (isOnProp === isOn) return
    setIsOn(isOnProp)
  }, [isOnProp])
  const handleDismissClick = (): void => {
    if (onDismissClick !== undefined) onDismissClick()
    if (isOnProp !== undefined) return
    setIsOn(!isOn)
    if (onDismissed !== undefined) onDismissed()
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, { on: isOn, off: !isOn }),
    className
  )
  const panelClss = c('panel')
  const contentClss = c('content')
  const btnClss = c('button')
  return <div className={rootClss}>
    <div className={panelClss}>
      {isNotFalsy(content) && <span
        className={contentClss}>
        {content}
      </span>}
      {isNotFalsy(buttonContent) && <button
        className={btnClss}
        onClick={handleDismissClick}>
        {buttonContent}
      </button>}
    </div>
    {children}
  </div>
}
