import {
  useState,
  type ReactNode,
  type PropsWithChildren,
  type FunctionComponent
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { disclaimer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Disclaimer} component.
 *
 * @property children - Content displayed inside the disclaimer panel.
 * @property togglerContent - Content rendered inside the dismiss toggler.
 * When omitted, the toggler is not rendered.
 * @property sensitiveContent - The content the disclaimer gates, rendered below the panel.
 * @property isOn - Controlled visibility state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property defaultIsOn - Initial visibility state in uncontrolled mode.
 * Ignored when `isOn` is provided. Defaults to `true`.
 * @property onDismissClicked - Called when the toggler is clicked, before the
 * disclaimer reacts, with the visibility state as it was.
 * @property onIsOnChanged - Called after the visibility state changed, with the
 * new value.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = PropsWithChildren<WithClassName<{
  togglerContent?: ReactNode
  sensitiveContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  onDismissClicked?: (isOn: boolean) => void
  onIsOnChanged?: (isOn: boolean) => void
}>>

/**
 * Dismissible disclaimer panel, gating the content it wraps.
 *
 * ### CSS modifiers
 * - `on` — the disclaimer is showing.
 * - `off` — the disclaimer has been dismissed.
 *
 * ### CSS elements
 * - `panel`
 * - `content` — wraps `children`.
 * - `toggler`
 * - `sensitive` — wraps `sensitiveContent`.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` holding the disclaimer panel and the gated content.
 *
 * @remarks
 * - In controlled mode (`isOn` defined), visibility is fully driven by the
 *   parent and internal state is never updated.
 * - `onDismissClicked` fires in both modes — a controlled parent needs it to
 *   know a click happened at all.
 * - `onIsOnChanged` fires in both modes too, and never on mount.
 */
export const Disclaimer: FunctionComponent<Props> = ({
  children,
  togglerContent,
  sensitiveContent,
  isOn: isOnProp,
  defaultIsOn = true,
  onDismissClicked,
  onIsOnChanged,
  className
}) => {
  // State
  const [internalIsOn, setInternalIsOn] = useState(defaultIsOn)
  const isControlled = isOnProp !== undefined
  const isOn = isOnProp ?? internalIsOn

  // State dispatch
  useChangeDispatch(isOn, onIsOnChanged)

  // User action handlers
  const handleDismissClick = (): void => {
    onDismissClicked?.(isOn)
    if (isControlled) return
    setInternalIsOn(false)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    on: isOn,
    off: !isOn
  }), className)
  const panelClss = c('panel')
  const contentClss = c('content')
  const togglerClss = c('toggler')
  const sensitiveClss = c('sensitive')
  return <div className={rootClss}>
    <div className={panelClss}>
      {children !== undefined && <div className={contentClss}>
        {children}
      </div>}
      {togglerContent !== undefined && <div
        className={togglerClss}
        onClick={handleDismissClick}>
        {togglerContent}
      </div>}
    </div>
    <div className={sensitiveClss}>
      {sensitiveContent}
    </div>
  </div>
}
