import {
  type MouseEvent,
  type FunctionComponent,
  type ReactNode,
  useRef,
  useState
} from 'react'
import { useStateChangeDispatch } from '../../agnostic/@react/effects/use-state-change-dispatch/index.js'
import type {
  ChildrenProps,
  ClassNameProps
} from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  ResizeObserverComponent,
  type Props as ResizeObserverProps
} from '../ResizeObserver/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import {
  useCommandSurrender,
  useCommands
} from '../utils/commands/index.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import { drawer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'
import {
  DRAWER_ACTION_VERB_DOMAINS,
  type DrawerActionDomain
} from './types.js'

/**
 * Props for the {@link Drawer} component.
 *
 * @property titleContent - Content rendered in the bar beside the toggler. Left out,
 * the block renders empty and a stylesheet fills it — which is also how a title that
 * differs between the two states is written, CSS having no way to swap an injected node.
 * @property togglerContent - Content rendered inside the toggler. Left out, the button
 * renders empty and a stylesheet fills it.
 * @property toggleOnBar - Whether a click anywhere in the bar toggles, not only one on
 * the toggler. `false` by default, so the component has a single click target. The
 * toggler stays the only focusable control either way, so this adds a pointer shortcut
 * and never a second way in.
 * @property defaultIsOpened - Initial open state in uncontrolled mode.
 * Ignored when `isOpened` is provided. Defaults to `false`.
 * @property isOpened - Controlled open state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property onTogglerClicked - Called when the toggler is clicked, before the drawer
 * reacts, with the open state as it was — so the direction it is about to take is its
 * negation.
 * @property onIsOpenedChanged - Called after the open state changed, with the
 * new value.
 * @property onContentResized - Called after the measured content size changed,
 * with the new width and height in pixels. Never on mount.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Drawer content.
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`
 * and the five `visibility*` settings.
 */
export type Props = {
  titleContent?: ReactNode
  togglerContent?: ReactNode
  toggleOnBar?: boolean
  defaultIsOpened?: boolean
  isOpened?: boolean
  onTogglerClicked?: (isOpened: boolean) => void
  onIsOpenedChanged?: (isOpened: boolean) => void
  onContentResized?: (dimensions: { width: number, height: number }) => void
}
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

/**
 * Drawer component supporting controlled and uncontrolled usage.
 *
 * The content is measured through a {@link ResizeObserverComponent} so its
 * dimensions can drive the open/close transition from CSS alone.
 *
 * ### Commands
 * - `open` / `close` — the two states a reader's controls also reach. There is no
 *   `toggle`: `whenVisible='open'` with `whenHidden='close'` says it, and a verb that
 *   reads the state before writing it would undo itself when sent twice.
 *
 * **A verb never contradicts a prop**: both are inert while `isOpened` arrived as one.
 * **And a command yields to the reader** — clicking either control hands the `opening`
 * domain over for the rest of the mount, which silences `open` and `close` together, so
 * a drawer the reader dismissed is not reopened on the next pass. `:force` opts out.
 *
 * ### CSS modifiers
 * - `opened` — the drawer is open.
 * - `closed` — the drawer is closed.
 * - `--visible` — the component has settled into view. Absent until something asks
 *   about visibility, since nothing is observed before that.
 *
 * - `--measured` — the content has been measured, so the properties below are set.
 *
 * ### CSS elements
 * - `bar` — the row, rendered in both states; `opened` / `closed` on the root is what
 *   tells them apart.
 * - `title` — the fillable block inside the bar.
 * - `toggler` — the control, a real `<button>`, always rendered.
 * - `content`
 *
 * ### CSS custom properties on the root element
 * - `--lm-drawer-content-width` / `--lm-drawer-content-width-raw`
 * - `--lm-drawer-content-height` / `--lm-drawer-content-height-raw`
 * Absent until the first measurement lands.
 *
 * ### Data attributes on the root element
 * Absent until the first measurement lands.
 * - `data-content-width`, `data-content-height` — the measured content size.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` holding the bar and the measured content.
 *
 * @remarks
 * - In controlled mode (`isOpened` defined), the open state is fully driven by
 *   the parent. The internal state goes on following the component's own controls, so
 *   a parent that stops providing the prop lands on what the reader last did.
 * - `onTogglerClicked` fires in both modes — a controlled parent needs it to know a
 *   click happened at all.
 * - `onIsOpenedChanged` fires in both modes too, and never on mount.
 * - **One bar serves both states.** The same elements render open and closed, and the
 *   root's `opened` / `closed` modifiers are what a stylesheet reads to tell them
 *   apart — including to write two different titles, which an injected node cannot do.
 * - **The toggler is the control, the bar is at most a shortcut.** `toggleOnBar` adds a
 *   handler on the row for pointer convenience; the button remains the only focusable
 *   way in, and a click on it is ignored by the bar rather than counted twice.
 */
export const Drawer: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  titleContent,
  togglerContent,
  toggleOnBar = false,
  defaultIsOpened = false,
  isOpened: isOpenedProp,
  onTogglerClicked,
  onIsOpenedChanged,
  onContentResized,
  className,
  children
}) => {
  const compId = useCompId(givenCompId)

  // State
  const [internalIsOpened, setInternalIsOpened] = useState(defaultIsOpened)
  const [contentDimensions, setContentDimensions] = useState<{
    width: number
    height: number
  }>()
  const rootRef = useRef<HTMLDivElement>(null)
  const isOpened = isOpenedProp ?? internalIsOpened
  const isVisible = useVisibilityTriggers(compId, rootRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })

  // Commands

  // Annotated with this component's vocabulary: the layer takes any name, so the
  // annotation is what keeps a misspelled domain from compiling.
  const surrender: (domain: DrawerActionDomain) => void = useCommandSurrender(
    compId,
    DRAWER_ACTION_VERB_DOMAINS
  )
  useCommands(compId, {
    open: () => { if (isOpenedProp === undefined) setInternalIsOpened(true) },
    close: () => { if (isOpenedProp === undefined) setInternalIsOpened(false) }
  })
  const c = clss(publicClassName, { cssModule })
  const togglerClss = c('toggler')

  // State dispatch
  useStateChangeDispatch(isOpened, onIsOpenedChanged)
  useStateChangeDispatch(
    contentDimensions,
    dimensions => { if (dimensions !== undefined) onContentResized?.(dimensions) },
    (a, b) => a?.width === b?.width && a?.height === b?.height
  )

  // User action handlers
  const toggle = (): void => {
    onTogglerClicked?.(isOpened)
    surrender('opening')
    setInternalIsOpened(!isOpened)
  }
  // The bar's own handler must ignore a click that came from the toggler, which already
  // toggled and whose event bubbles up through here.
  const handleBarClick = (event: MouseEvent<HTMLDivElement>): void => {
    const { target } = event
    if (target instanceof Element && target.closest(`.${togglerClss}`) !== null) return
    toggle()
  }
  const handleContentResized: ResizeObserverProps['onResized'] = ({ entry }): void => {
    const { width, height } = entry.contentRect
    setContentDimensions({ width, height })
  }

  // Rendering
  const rootClss = mergeClassNames(c(null, {
    'opened': isOpened,
    'closed': !isOpened,
    'measured': contentDimensions !== undefined,
    'visible': isVisible === true
  }), className)
  const barClss = c('bar')
  const titleClss = c('title')
  const contentClss = c('content')
  let dataAttributes: Record<string, string> = {}
  let customCssProps: Record<string, string> = {}
  if (contentDimensions !== undefined) {
    const { width, height } = contentDimensions
    dataAttributes = {
      'data-content-width': `${width}`,
      'data-content-height': `${height}`
    }
    customCssProps = {
      '--lm-drawer-content-width': `${width}px`,
      '--lm-drawer-content-width-raw': `${width}`,
      '--lm-drawer-content-height': `${height}px`,
      '--lm-drawer-content-height-raw': `${height}`
    }
  }
  return <div
    {...compIdAttribute(compId)}
    ref={rootRef}
    className={rootClss}
    {...dataAttributes}
    style={{ ...customCssProps }}>
    <div
      className={barClss}
      onClick={toggleOnBar ? handleBarClick : undefined}>
      <div className={titleClss}>{titleContent}</div>
      <button
        type='button'
        className={togglerClss}
        onClick={toggle}>{togglerContent}</button>
    </div>
    <div className={contentClss}>
      <ResizeObserverComponent onResized={handleContentResized}>
        {children}
      </ResizeObserverComponent>
    </div>
  </div>
}
