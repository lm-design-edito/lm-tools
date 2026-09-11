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
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { lightbox as publicClassName } from '../public-classnames.js'
import {
  close as closeLightbox,
  getState,
  membersOf,
  open as openLightbox,
  register,
  soloGroupOf,
  step,
  subscribe,
  unregister
} from './store.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Lightbox} component.
 *
 * @property group - The group(s) this lightbox belongs to. Members of a group share
 * one lightbox and are navigable from it, in document order. The **first** group is the
 * one a click on this member opens; the others only matter when another member opens
 * them. Declaring none makes it a group of its own.
 * @property closeBtnContent - Content rendered inside the close button.
 * @property openBtnContent - Content rendered inside the open button. Left empty, the
 * button is still rendered: a stylesheet hides an empty control with `:empty`, and the
 * lightbox is then opened by whatever the consumer wires up.
 * @property prevBtnContent - Content rendered inside the previous button. The button is
 * always rendered; the root's `navigable` modifier says whether it has anywhere to go.
 * @property nextBtnContent - Content rendered inside the next button, same.
 * @property isOn - Controlled state. When defined, this member is driven by the
 * parent and the shared registry never opens or closes it.
 * @property defaultIsOn - Whether the lightbox starts open, in uncontrolled mode.
 * Ignored when `isOn` is provided. Defaults to `false`.
 * @property exitOnEscape - When `true`, pressing `Escape` closes the lightbox.
 * @property navOnArrowKeys - When `true`, the left and right arrow keys move through
 * the open group. Only has an effect on a group of more than one member.
 * @property exitOnBgClick - When `true`, clicking the backdrop, and not its
 * content, closes it.
 * @property openOnClick - When `true`, clicking the content opens the lightbox. An
 * affordance layered on the open button, never a replacement for it: a click is
 * mouse and touch only, and the button is what a keyboard reaches.
 * @property onOpenButtonClicked - Called when the open button is clicked, before the
 * lightbox reacts, with the state as it was.
 * @property onCloseButtonClicked - Same, for the close button.
 * @property onPrevButtonClicked - Same, for the previous button.
 * @property onNextButtonClicked - Same, for the next button.
 * @property onBackgroundClicked - Called when the backdrop is clicked (only
 * while `exitOnBgClick` is `true`), before the lightbox reacts.
 * @property onContentClicked - Called when the content is clicked while closed (only
 * while `openOnClick` is `true`), before the lightbox reacts.
 * @property onEscapePressed - Called when `Escape` is pressed while the lightbox is open
 * (only while `exitOnEscape` is `true`), before the lightbox reacts.
 * @property onPrevArrowPressed - Called when the left arrow is pressed while the lightbox
 * is open (only while `navOnArrowKeys` is `true`), before the lightbox reacts.
 * @property onNextArrowPressed - Same, for the right arrow.
 * @property onIsOnChanged - Called after this member's state changed, with the new
 * value.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - The content, rendered in place while closed and moved onto the
 * inside the lightbox while open.
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
  openOnClick?: boolean
  navOnArrowKeys?: boolean
  onOpenButtonClicked?: (isOn: boolean) => void
  onCloseButtonClicked?: (isOn: boolean) => void
  onPrevButtonClicked?: (isOn: boolean) => void
  onNextButtonClicked?: (isOn: boolean) => void
  onBackgroundClicked?: (isOn: boolean) => void
  onContentClicked?: (isOn: boolean) => void
  onEscapePressed?: (isOn: boolean) => void
  onPrevArrowPressed?: (isOn: boolean) => void
  onNextArrowPressed?: (isOn: boolean) => void
  onIsOnChanged?: (isOn: boolean) => void
}>>

/**
 * Lightbox component. Holds content in a box that a stylesheet lifts over the page
 * when opened.
 *
 * ### CSS modifiers
 * - `on` - this member is open.
 * - `off` - it is not.
 * - `grouped` - it belongs to a group it did not invent.
 * - `navigable` - that group holds someone else, so the previous and next controls
 *   have somewhere to go.
 * - `open-on-click` - the content itself opens the lightbox, so a stylesheet can say
 *   so with a cursor. Named after the prop it mirrors, as modifiers are.
 *
 * ### CSS elements
 * - `placeholder` - holds the content's last measured size while it is out of flow.
 * - `backdrop` - the box the content always lives in; a stylesheet takes it out of
 *   flow and over the page while the root carries `--on`.
 * - `content` - wraps the content inside the backdrop.
 * - `open-btn`, `close-btn`, `prev-btn`, `next-btn`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` holding a placeholder, the backdrop the content lives in,
 * and the controls.
 *
 * @remarks
 * - **The content never moves.** It stays in the same box, at the same place in the
 *   React tree, open or closed; only the box's positioning changes, and that is a
 *   stylesheet's business. Nothing is unmounted, so a playing video keeps playing at
 *   its timecode. Rendering `children` in two branches - one in place, one on a stage
 *   - would mount a fresh instance on every flip, React reconciling by position.
 * - **Nothing leaves the component's own subtree.** No portal, no `document.body`: a
 *   component has no business writing outside the scope it was handed.
 * - **A placeholder keeps the layout still.** Its size is the content's last measured
 *   one, read while closed; without it the article would collapse around the hole left
 *   once the backdrop goes out of flow.
 * - **A `position: fixed` backdrop is contained by the first ancestor carrying a
 *   `transform`, a `filter` or a `contain`**, which becomes its containing block. That
 *   is wanted, not suffered: where several articles are preloaded side by side and
 *   slid through by a transformed container, containment is what keeps an offscreen
 *   article's lightbox offscreen. The top layer - `<dialog>` with `showModal()`, or
 *   the popover API - would do the opposite, being document-wide and above
 *   everything, and paint over whichever article is being read.
 * - **Groups are held outside React**, in `./store.ts`: a consumer may render each
 *   component in a root of its own, in which case members of a group share no tree
 *   and a context could not reach from one to the other.
 * - Every member holds its own backdrop; only the open one is lifted over the page.
 *   Navigating a group therefore lowers one and lifts another, and neither one's
 *   content is touched.
 * - This component ships **no appearance**: covering the page, the backdrop and the
 *   buttons are the consumer stylesheet's business. Without one, the content is moved
 *   to the end of the document and nothing looks like a lightbox.
 */
export const Lightbox: FunctionComponent<Props> = ({
  group,
  closeBtnContent,
  openBtnContent,
  prevBtnContent,
  nextBtnContent,
  isOn: isOnProp,
  defaultIsOn = false,
  exitOnEscape,
  exitOnBgClick,
  openOnClick,
  navOnArrowKeys,
  onOpenButtonClicked,
  onCloseButtonClicked,
  onPrevButtonClicked,
  onNextButtonClicked,
  onBackgroundClicked,
  onContentClicked,
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
  const backdropRef = useRef<HTMLDivElement>(null)
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
  // standing observer: the content of a lightbox rarely resizes, and one observer per
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
    openLightbox(ownGroup, id)
  }, [isControlled, ownGroup, id])
  const requestClose = useCallback((): void => {
    if (isControlled) return
    closeLightbox()
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
  const handleContentClick: MouseEventHandler<HTMLDivElement> = () => {
    if (openOnClick !== true || isOn) return
    onContentClicked?.(isOn)
    requestOpen()
  }
  const handleBackdropClick: MouseEventHandler<HTMLDivElement> = e => {
    if (exitOnBgClick !== true) return
    if (e.target !== backdropRef.current) return
    onBackgroundClicked?.(isOn)
    requestClose()
  }

  // Fx. dep. exitOnEscape, isOn, requestClose, onEscapePressed - Escape closes the
  // lightbox. Listens only while open, so a page of closed lightboxes holds no
  // listener.
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
  // lightbox is open and the group holds someone else, so the keys stay the page's the
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
  // uncontrolled lightbox asked to start open says so once, and never again: the
  // registry owns the state from then on.
  useEffect(() => {
    if (hasAppliedDefault || isControlled || !defaultIsOn) return
    setHasAppliedDefault(true)
    openLightbox(ownGroup, id)
  }, [hasAppliedDefault, isControlled, defaultIsOn, ownGroup, id])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    on: isOn,
    off: !isOn,
    grouped: isGrouped,
    navigable: siblingsCount > 1,
    'open-on-click': openOnClick === true && !isOn
  }), className)
  const size = sizeRef.current
  // Nothing here is conditional. React reconciles by position, so a branch that
  // appears and disappears shifts what follows it - and moving `children` between two
  // positions would unmount and remount them, the very thing this component exists to
  // avoid. Which control is reachable, and when, is the stylesheet's business: the
  // root carries a modifier per state, and `:empty` tells a control with no content
  // from one that has some.
  return <div
    className={rootClss}
    ref={rootRef}>
    <div
      className={c('placeholder')}
      style={isOn && size !== null ? { width: size.width, height: size.height } : undefined} />
    <div
      className={c('backdrop')}
      onClick={handleBackdropClick}
      ref={backdropRef}>
      <div
        className={c('content')}
        onClick={handleContentClick}>
        {children}
      </div>
      <button
        type='button'
        className={c('close-btn')}
        onClick={handleCloseButtonClick}>
        {closeBtnContent}
      </button>
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
    </div>
    <button
      type='button'
      className={c('open-btn')}
      onClick={handleOpenButtonClick}>
      {openBtnContent}
    </button>
  </div>
}
