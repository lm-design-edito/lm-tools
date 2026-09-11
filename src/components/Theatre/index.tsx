import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FunctionComponent,
  type MouseEventHandler,
  type PropsWithChildren,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { theatre as publicClassName } from '../public-classnames.js'
import {
  close as closeStage,
  getState,
  membersOf,
  open as openStage,
  register,
  soloGroupOf,
  step,
  subscribe,
  unregister
} from './store.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Theatre} component.
 *
 * @property group - The group(s) this theatre belongs to. Members of a group share
 * one stage and are navigable from it, in document order. The **first** group is the
 * one a click on this member opens; the others only matter when another member opens
 * them. Declaring none makes it a group of its own.
 * @property closeBtnContent - Content rendered inside the close button.
 * @property openBtnContent - Content rendered inside the open button.
 * @property prevBtnContent - Content rendered inside the previous button, shown only
 * when the open group holds more than one member.
 * @property nextBtnContent - Content rendered inside the next button, same condition.
 * @property isOn - Controlled state. When defined, this member is driven by the
 * parent and the shared registry never opens or closes it.
 * @property defaultIsOn - Whether the stage starts open, in uncontrolled mode.
 * Ignored when `isOn` is provided. Defaults to `false`.
 * @property exitOnEscape - When `true`, pressing `Escape` closes the stage.
 * @property navOnArrowKeys - When `true`, the left and right arrow keys move through
 * the open group. Only has an effect on a group of more than one member.
 * @property exitOnBgClick - When `true`, clicking the stage background, and not its
 * content, closes it.
 * @property onOpenButtonClicked - Called when the open button is clicked, before the
 * theatre reacts, with the state as it was.
 * @property onCloseButtonClicked - Same, for the close button.
 * @property onPrevButtonClicked - Same, for the previous button.
 * @property onNextButtonClicked - Same, for the next button.
 * @property onBackgroundClicked - Called when the stage background is clicked (only
 * while `exitOnBgClick` is `true`), before the theatre reacts.
 * @property onEscapePressed - Called when `Escape` is pressed while the stage is open
 * (only while `exitOnEscape` is `true`), before the theatre reacts.
 * @property onPrevArrowPressed - Called when the left arrow is pressed while the stage
 * is open (only while `navOnArrowKeys` is `true`), before the theatre reacts.
 * @property onNextArrowPressed - Same, for the right arrow.
 * @property onIsOnChanged - Called after this member's state changed, with the new
 * value.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - The content, rendered in place while closed and moved onto the
 * stage while open.
 */
export type Props = PropsWithChildren<WithClassName<{
  group?: string | string[]
  closeBtnContent?: ReactNode
  openBtnContent?: ReactNode
  prevBtnContent?: ReactNode
  nextBtnContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  exitOnEscape?: boolean
  exitOnBgClick?: boolean
  navOnArrowKeys?: boolean
  onOpenButtonClicked?: (isOn: boolean) => void
  onCloseButtonClicked?: (isOn: boolean) => void
  onPrevButtonClicked?: (isOn: boolean) => void
  onNextButtonClicked?: (isOn: boolean) => void
  onBackgroundClicked?: (isOn: boolean) => void
  onEscapePressed?: (isOn: boolean) => void
  onPrevArrowPressed?: (isOn: boolean) => void
  onNextArrowPressed?: (isOn: boolean) => void
  onIsOnChanged?: (isOn: boolean) => void
}>>

/**
 * Lightbox component. Holds content in place until opened, then moves it onto a stage
 * covering the page.
 *
 * ### CSS modifiers
 * - `on` - this member is on stage.
 * - `off` - it is not.
 * - `grouped` - it belongs to a group it did not invent, so navigation is possible.
 *
 * ### CSS elements
 * - `placeholder` - holds the content's last measured size while it is away.
 * - `stage` - the overlay, portalled to `document.body`, mounted only while open.
 * - `stage-content` - wraps the moved content inside the stage.
 * - `open-btn`, `close-btn`, `prev-btn`, `next-btn`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` holding the content or its placeholder, plus, while open, a
 * stage portalled to the end of `document.body`.
 *
 * @remarks
 * - **[WIP]** Moving a `<video>` keeps it playing on desktop browsers; iOS has been
 *   known to pause on a DOM move. Not worth guarding against for now.
 * - **The content is moved, not copied.** A portal relocates the DOM node without
 *   changing the element's place in the React tree, so the instance is never
 *   unmounted: a playing video keeps playing, at its timecode, and lands back where it
 *   was on close. Rendering `children` twice would mount a second, fresh instance and
 *   leave the first one running behind the stage.
 * - **The stage is portalled to `document.body`.** A `position: fixed` stage left in
 *   the article would be trapped by the first ancestor carrying a `transform`, a
 *   `filter` or a `contain`, which becomes its containing block.
 * - **A placeholder keeps the layout still.** Its size is the content's last measured
 *   one, read while closed; without it the article would collapse around the hole the
 *   content leaves.
 * - **Groups are held outside React**, in `./store.ts`: a consumer may render each
 *   component in a root of its own, in which case members of a group share no tree
 *   and a context could not reach from one to the other.
 * - The stage is rendered by whichever member is on it, so navigating hands it over.
 *   None of the content is remounted in the process.
 * - This component ships **no appearance**: covering the page, the backdrop and the
 *   buttons are the consumer stylesheet's business. Without one, the content is moved
 *   to the end of the document and nothing looks like a lightbox.
 */
export const Theatre: FunctionComponent<Props> = ({
  group,
  closeBtnContent,
  openBtnContent,
  prevBtnContent,
  nextBtnContent,
  isOn: isOnProp,
  defaultIsOn = false,
  exitOnEscape,
  exitOnBgClick,
  navOnArrowKeys,
  onOpenButtonClicked,
  onCloseButtonClicked,
  onPrevButtonClicked,
  onNextButtonClicked,
  onBackgroundClicked,
  onEscapePressed,
  onPrevArrowPressed,
  onNextArrowPressed,
  onIsOnChanged,
  children,
  className
}) => {
  // State & refs
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef<{ width: number, height: number } | null>(null)
  const [hasAppliedDefault, setHasAppliedDefault] = useState(false)
  const isControlled = isOnProp !== undefined

  const declaredGroups = group === undefined
    ? []
    : (Array.isArray(group) ? group : [group])
  const isGrouped = declaredGroups.length > 0
  // A member without a group still needs one to be opened through: its own.
  const groups = isGrouped ? declaredGroups : [soloGroupOf(id)]
  // `groups` is never empty: a member without a declared group gets its own.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ownGroup = groups[0]!
  const groupsKey = groups.join(' ')

  const storeState = useSyncExternalStore(subscribe, getState, getState)
  const isOn = isOnProp ?? (storeState.openMemberId === id)
  const openGroup = storeState.openGroup
  const siblingsCount = isOn && openGroup !== null ? membersOf(openGroup).length : 0

  // Fx. dep. id, groupsKey - Joins the shared registry, which is what lets another
  // member reach this one. `getElement` rather than the element itself: the registry
  // reads it when it needs to order the group, and never holds it.
  useEffect(() => {
    register({ id, groups, getElement: () => rootRef.current })
    return () => unregister(id)
  }, [id, groupsKey])

  // Keeps the last size the content had in place, so the placeholder can hold it once
  // the content is gone. Measured while closed only, on render rather than through a
  // standing observer: the content of a theatre rarely resizes, and one observer per
  // image on a page is a cost with no return.
  useLayoutEffect(() => {
    if (isOn) return
    const root = rootRef.current
    if (root === null) return
    const { width, height } = root.getBoundingClientRect()
    if (width === 0 && height === 0) return
    sizeRef.current = { width, height }
  })

  // State dispatch
  useChangeDispatch(isOn, onIsOnChanged)

  // User action handlers
  const requestOpen = useCallback((): void => {
    if (isControlled) return
    openStage(ownGroup, id)
  }, [isControlled, ownGroup, id])
  const requestClose = useCallback((): void => {
    if (isControlled) return
    closeStage()
  }, [isControlled])

  const handleOpenButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    onOpenButtonClicked?.(isOn)
    requestOpen()
  }
  const handleCloseButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    onCloseButtonClicked?.(isOn)
    requestClose()
  }
  const handlePrevButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    onPrevButtonClicked?.(isOn)
    step(-1)
  }
  const handleNextButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    onNextButtonClicked?.(isOn)
    step(1)
  }
  const handleStageBgClick: MouseEventHandler<HTMLDivElement> = e => {
    if (exitOnBgClick !== true) return
    if (e.target !== stageRef.current) return
    onBackgroundClicked?.(isOn)
    requestClose()
  }

  // Fx. dep. exitOnEscape, isOn, requestClose, onEscapePressed - Escape closes the
  // stage. Listens only while open, so a page of closed theatres holds no listener.
  useEffect(() => {
    if (exitOnEscape !== true || !isOn) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return
      onEscapePressed?.(isOn)
      requestClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [exitOnEscape, isOn, requestClose, onEscapePressed])

  // Fx. dep. navOnArrowKeys, isOn, siblingsCount, onPrevArrowPressed,
  // onNextArrowPressed - The arrow keys walk the open group. Bound only while the
  // stage is open and the group holds someone else, so the keys stay the page's the
  // rest of the time.
  useEffect(() => {
    if (navOnArrowKeys !== true || !isOn || siblingsCount < 2) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowLeft') {
        onPrevArrowPressed?.(isOn)
        step(-1)
      } else if (e.key === 'ArrowRight') {
        onNextArrowPressed?.(isOn)
        step(1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navOnArrowKeys, isOn, siblingsCount, onPrevArrowPressed, onNextArrowPressed])

  // Fx. dep. hasAppliedDefault, isControlled, defaultIsOn, ownGroup, id - An
  // uncontrolled theatre asked to start open says so once, and never again: the
  // registry owns the state from then on.
  useEffect(() => {
    if (hasAppliedDefault || isControlled || !defaultIsOn) return
    setHasAppliedDefault(true)
    openStage(ownGroup, id)
  }, [hasAppliedDefault, isControlled, defaultIsOn, ownGroup, id])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    on: isOn,
    off: !isOn,
    grouped: isGrouped
  }), className)
  const size = sizeRef.current
  const stage = isOn
    ? createPortal(
      <div
        className={c('stage')}
        onClick={handleStageBgClick}
        ref={stageRef}>
        <div className={c('stage-content')}>{children}</div>
        <button
          type='button'
          className={c('close-btn')}
          onClick={handleCloseButtonClick}>
          {closeBtnContent}
        </button>
        {siblingsCount > 1 && <>
          <button
            type='button'
            className={c('prev-btn')}
            onClick={handlePrevButtonClick}>
            {prevBtnContent}
          </button>
          <button
            type='button'
            className={c('next-btn')}
            onClick={handleNextButtonClick}>
            {nextBtnContent}
          </button>
        </>}
      </div>,
      document.body
    )
    : null
  return <div
    className={rootClss}
    ref={rootRef}>
    {isOn
      ? <div
        className={c('placeholder')}
        style={size === null ? undefined : { width: size.width, height: size.height }} />
      : children}
    <button
      type='button'
      className={c('open-btn')}
      onClick={handleOpenButtonClick}>
      {openBtnContent}
    </button>
    {stage}
  </div>
}
