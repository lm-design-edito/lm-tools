import {
  useState,
  type ReactNode,
  type PropsWithChildren,
  type JSX,
  type FunctionComponent,
  useEffect,
  useRef
} from 'react'
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
 * @property defaultIsOn - Default visibility state for uncontrolled mode.
 * @property onDismissClick - Callback invoked before the disclaimer is dismissed
 * @property onToggled - Callback invoked after the disclaimer state changes.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Additional content rendered below the disclaimer panel.
 */
export type Props = PropsWithChildren<WithClassName<{
  content?: ReactNode
  togglerContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  onDismissClick?: (prevIsOn: boolean) => void
  onToggled?: (isOn: boolean) => void
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
  defaultIsOn: defaultIsOnProp,
  onToggled,
  onDismissClick,
  children,
  className
}): JSX.Element => {
  // State & refs
  const [internalIsOn, setInternalIsOn] = useState(isOnProp ?? defaultIsOnProp ?? true)
  const isOn = isOnProp ?? internalIsOn
  const pIsOn = useRef(isOn)

  // State change handlers
  useEffect(() => {
    if (pIsOn.current === isOn) return
    onToggled?.(isOn)
    pIsOn.current = isOn
  }, [isOn])

  // User actions handlers
  const handleDismissClick = (): void => {
    onDismissClick?.(isOn)
    if (isOnProp !== undefined) return
    setInternalIsOn(false)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      on: isOn,
      off: !isOn
    }),
    className
  )
  const panelClss = c('panel')
  const contentClss = c('content')
  const btnClss = c('toggler')
  const sensitiveClss = c('sensitive')
  return <div className={rootClss}>
    <div className={panelClss}>
      {content !== undefined && <div
        className={contentClss}>
        {content}
      </div>}
      {togglerContent !== undefined && <div
        className={btnClss}
        onClick={handleDismissClick}>
        {togglerContent}
      </div>}
    </div>
    <div className={sensitiveClss}>
      {children}
    </div>
  </div>
}
