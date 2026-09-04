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
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { theatre as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Theatre} component.
 *
 * @property closeBtnContent - Content rendered inside the close/exit button.
 * @property openBtnContent - Content rendered inside the open/enter button.
 * @property isOn - Controlled theatre mode state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property defaultIsOn - Initial theatre mode state in uncontrolled mode.
 * Ignored when `isOn` is provided. Defaults to `false`.
 * @property exitOnEscape - When `true`, pressing `Escape` while the stage is
 * open counts as a toggle.
 * @property exitOnBgClick - When `true`, clicking the stage background — and
 * not its content — counts as a toggle.
 * @property onOpenButtonClicked - Called when the open button is clicked, before
 * the theatre reacts, with the state as it was.
 * @property onCloseButtonClicked - Called when the close button is clicked,
 * before the theatre reacts, with the state as it was.
 * @property onBackgroundClicked - Called when the stage background is clicked
 * (only while `exitOnBgClick` is `true`), before the theatre reacts, with the
 * state as it was.
 * @property onEscapePressed - Called when `Escape` is pressed while the stage is
 * open (only while `exitOnEscape` is `true`), before the theatre reacts, with
 * the state as it was.
 * @property onIsOnChanged - Called after the theatre mode changed, with the new
 * value.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Content rendered both in the default slot and, when
 * theatre mode is active, duplicated inside the stage element.
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
}>>

/**
 * Theatre mode component. Wraps content in a toggleable fullscreen-like "stage"
 * overlay.
 *
 * ### CSS modifiers
 * - `on` — theatre mode is active.
 * - `off` — theatre mode is inactive.
 *
 * ### CSS elements
 * - `stage` — holds the duplicated `children`, mounted only when `isOn`.
 * - `open-btn`
 * - `close-btn`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` containing the children in their original position,
 * a stage overlay with the duplicated children when active, and both toggles.
 *
 * @remarks
 * - In controlled mode (`isOn` defined), the state is fully driven by the
 *   parent and internal state is never updated.
 * - The four toggle-source handlers fire in both modes — a controlled parent
 *   needs them to know a toggle was requested at all.
 * - `onIsOnChanged` fires in both modes too, and never on mount.
 */
export const Theatre: FunctionComponent<Props> = ({
  closeBtnContent,
  openBtnContent,
  isOn: isOnProp,
  defaultIsOn = false,
  exitOnEscape,
  exitOnBgClick,
  onOpenButtonClicked,
  onCloseButtonClicked,
  onBackgroundClicked,
  onEscapePressed,
  onIsOnChanged,
  children,
  className
}) => {
  // State & refs
  const [internalIsOn, setInternalIsOn] = useState(defaultIsOn)
  const stageRef = useRef<HTMLDivElement>(null)
  const isControlled = isOnProp !== undefined
  const isOn = isOnProp ?? internalIsOn

  // State dispatch
  useChangeDispatch(isOn, onIsOnChanged)

  // User action handlers
  const requestToggle = (targetIsOn: boolean): void => {
    if (isControlled) return
    setInternalIsOn(targetIsOn)
  }
  const handleOpenButtonClick: MouseEventHandler<HTMLDivElement> = () => {
    onOpenButtonClicked?.(isOn)
    requestToggle(true)
  }
  const handleCloseButtonClick: MouseEventHandler<HTMLDivElement> = () => {
    onCloseButtonClicked?.(isOn)
    requestToggle(false)
  }
  const handleStageBgClick: MouseEventHandler<HTMLDivElement> = e => {
    if (exitOnBgClick !== true) return
    if (e.target !== stageRef.current) return
    onBackgroundClicked?.(isOn)
    requestToggle(false)
  }

  // Fx. dep. `exitOnEscape`, `isOn` - close the stage on the Escape key
  useEffect(() => {
    if (exitOnEscape !== true || !isOn) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      onEscapePressed?.(isOn)
      requestToggle(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [exitOnEscape, isOn, isControlled, onEscapePressed])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'on': isOn,
    'off': !isOn
  }), className)
  const stageClss = c('stage')
  const openBtnClss = c('open-btn')
  const closeBtnClss = c('close-btn')
  return <div className={rootClss}>
    {children}
    <div
      className={stageClss}
      onClick={handleStageBgClick}
      ref={stageRef}>
      {isOn && children}
    </div>
    <div
      className={closeBtnClss}
      onClick={handleCloseButtonClick}>
      {closeBtnContent}
    </div>
    <div
      className={openBtnClss}
      onClick={handleOpenButtonClick}>
      {openBtnContent}
    </div>
  </div>
}
