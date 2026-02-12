import {
  useState,
  useEffect,
  type ReactNode,
  type PropsWithChildren,
  type JSX,
  type FunctionComponent
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
 * @property togglerContent - Content rendered inside the dismiss toggler.
 * If not provided, the toggler is not rendered.
 * @property isOn - Controls the visibility state. When defined, the component
 * behaves as a controlled component.
 * @property onDismissed - Callback invoked after the disclaimer is dismissed
 * in uncontrolled mode.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Additional content rendered below the disclaimer panel.
 */
export type Props = PropsWithChildren<WithClassName<{
  content?: ReactNode
  togglerContent?: ReactNode
  isOn?: boolean
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
export const Disclaimer: FunctionComponent<Props> = ({
  content,
  togglerContent,
  isOn: isOnProp,
  onDismissed,
  children,
  className
}): JSX.Element => {
  // State & handlers
  const [internalIsOn, setInternalIsOn] = useState(isOnProp ?? true)
  const isOn = isOnProp ?? internalIsOn
  const handleDismissClick = (): void => {
    if (isOnProp !== undefined) return
    setInternalIsOn(false)
    onDismissed?.()
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, { on: isOn, off: !isOn }), className)
  const panelClss = c('panel')
  const contentClss = c('content')
  const btnClss = c('toggler')
  return <div className={rootClss}>
    <div className={panelClss}>
      {isNotFalsy(content) && <div
        className={contentClss}>
        {content}
      </div>}
      {isNotFalsy(togglerContent) && <div
        className={btnClss}
        onClick={handleDismissClick}>
        {togglerContent}
      </div>}
    </div>
    {children}
  </div>
}
