import {
  useState,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { theatre as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Theatre} component.
 *
 * @property closeBtnContent - Custom content rendered inside the close/exit button.
 * @property openBtnContent - Custom content rendered inside the open/enter button.
 * @property isOn - Controlled theatre mode state. When provided, overrides the
 * internal state. Use together with {@link Props.onTheatreToggleClick} for fully
 * controlled usage.
 * @property defaultIsOn - Default state for the theatre mode.
 * @property onTheatreToggleClick - Callback invoked when either the open or close
 * button is clicked. Receives the theatre state value (`isOn`) at the time of the click,
 * i.e. the previous state before the toggle.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Content rendered both in the default slot and, when theatre
 * mode is active, duplicated inside the stage element.
 */
export type Props = PropsWithChildren<WithClassName<{
  closeBtnContent?: ReactNode
  openBtnContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  onTheatreToggleClick?: (prevIsOn: boolean) => void
}>>

/**
 * Theatre mode component. Wraps content in a toggleable fullscreen-like "stage"
 * overlay. Supports both controlled and uncontrolled usage.
 *
 * When `isOn` is not provided the component manages its own open/closed state
 * internally. When `isOn` is provided it acts as the source of truth and the
 * internal state is ignored.
 *
 * ### Root element modifiers
 * The root `<div>` receives the public class name defined by `theatre` and the
 * following BEM-style modifier classes:
 * - `--on` — when theatre mode is active.
 * - `--off` — when theatre mode is inactive.
 *
 * ### Child elements
 * - `__stage` — container rendered inside the root that holds the duplicated
 * `children` when theatre mode is active. Only mounted when `isOn` is `true`.
 * - `__open-btn` — clickable element that activates theatre mode.
 * - `__close-btn` — clickable element that deactivates theatre mode.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` containing the children in their original position,
 * a stage overlay with the duplicated children (when active), and the open/close
 * toggle buttons.
 */
export const Theatre: FunctionComponent<Props> = ({
  closeBtnContent,
  openBtnContent,
  isOn,
  defaultIsOn,
  onTheatreToggleClick,
  children,
  className
}) => {
  const [internalIsOn, setInternalIsOn] = useState(defaultIsOn ?? false)
  const isTheatreOn = isOn ?? internalIsOn
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'on': isTheatreOn === true,
    'off': isTheatreOn === undefined || !isTheatreOn
  }), className)
  const stageClass = c('stage')
  const openBtnClass = c('open-btn')
  const closeBtnClass = c('close-btn')
  const handleCloseBtnClick = () => {
    onTheatreToggleClick?.(isTheatreOn)
    if (isOn === undefined) setInternalIsOn(false)
  }
  const handleOpenBtnClick = () => {
    onTheatreToggleClick?.(isTheatreOn)
    if (isOn === undefined) setInternalIsOn(true)
  }
  return <div className={rootClss}>
    {children}
    <div className={stageClass}>{isTheatreOn && children}</div>
    <div className={closeBtnClass} onClick={handleCloseBtnClick}>{closeBtnContent}</div>
    <div className={openBtnClass} onClick={handleOpenBtnClick}>{openBtnContent}</div>
  </div>
}
