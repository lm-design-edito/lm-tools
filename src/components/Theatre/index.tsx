import {
  useEffect,
  useState,
  useRef,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
  type MouseEventHandler
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
 * internal state. Use together with {@link Props.onToggleClick} for fully
 * controlled usage.
 * @property defaultIsOn - Default state for the theatre mode.
 * @property exitOnEscape — When uncontrolled and on, toggles internal state to off when 'esc' key is pressed
 * @property exitOnBgClick — When uncontrolled and on, toggles internal state to off when the background is clicked
 * @property stateHandlers - Callbacks called after the internal state changed
 * @property stateHandlers.toggled - Callback invoked after the state changed
 * @property actionHandlers - Callbacks called after a user action on children elements
 * @property actionHandlers.toggleClick - Callback invoked when either the open or close
 * button is clicked, the 'esc' key pressed or the background clicked. Receives the theatre state value (`isOn`) at the time of the click,
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
  exitOnEscape?: boolean
  exitOnBgClick?: boolean
  stateHandlers?: {
    toggled?: (isOn: boolean) => void
  }
  actionHandlers?: {
    toggleClick?: (prevIsOn: boolean) => void
  }
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
  exitOnEscape,
  exitOnBgClick,
  stateHandlers,
  actionHandlers,
  children,
  className
}) => {
  // State & refs
  const [internalIsOn, setInternalIsOn] = useState(defaultIsOn ?? false)
  const stageRef = useRef(null)
  const isTheatreOn = isOn ?? internalIsOn
  const prevIsTheatreOnRef = useRef(isTheatreOn)

  // Handlers
  const handleCloseBtnClick: MouseEventHandler<HTMLDivElement> = () => {
    actionHandlers?.toggleClick?.(isTheatreOn)
    if (isOn === undefined) setInternalIsOn(false)
  }
  const handleOpenBtnClick: MouseEventHandler<HTMLDivElement> = () => {
    actionHandlers?.toggleClick?.(isTheatreOn)
    if (isOn === undefined) setInternalIsOn(true)
  }

  const handleStageBgClick: MouseEventHandler<HTMLDivElement> = e => {
    if (exitOnBgClick !== true) return
    if (e.target !== stageRef.current) return
    actionHandlers?.toggleClick?.(isTheatreOn)
    if (isOn === undefined) setInternalIsOn(false)
  }

  // Effects
  useEffect(() => {
    if (prevIsTheatreOnRef.current !== isTheatreOn) {
      stateHandlers?.toggled?.(isTheatreOn)
      prevIsTheatreOnRef.current = isTheatreOn
    }
  }, [isTheatreOn, stateHandlers])

  useEffect(() => {
    if (exitOnEscape === true
      || !isTheatreOn
      || isOn !== undefined) return
    const listener = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      actionHandlers?.toggleClick?.(isTheatreOn)
      setInternalIsOn(false)
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [exitOnEscape, isTheatreOn, isOn])

  // Render
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'on': isTheatreOn,
    'off': !isTheatreOn
  }), className)
  const stageClass = c('stage')
  const openBtnClass = c('open-btn')
  const closeBtnClass = c('close-btn')
  return <div className={rootClss}>
    {children}
    <div
      className={stageClass}
      onClick={handleStageBgClick}
      ref={stageRef}>
      {isTheatreOn && children}
    </div>
    <div
      className={closeBtnClass}
      onClick={handleCloseBtnClick}>
      {closeBtnContent}
    </div>
    <div
      className={openBtnClass}
      onClick={handleOpenBtnClick}>
      {openBtnContent}
    </div>
  </div>
}
