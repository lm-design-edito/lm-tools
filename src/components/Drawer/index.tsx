import {
  type MouseEvent,
  type FunctionComponent,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
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
 * @property openerContent - Content rendered inside the opener control. Not
 * necessarily a button: a command is a bar, and most consumers put a title *and* a
 * toggle in it — hence `openerContent` rather than `openerBtnContent`.
 * @property closerContent - Content rendered inside the closer control. Defaults to
 * `openerContent`, so a bar written once serves both states and CSS tells them apart
 * through the root modifiers. Pass `null` to render an empty closer.
 * @property openerBtnSelector - CSS selector picking the toggle *inside*
 * `openerContent`. Without it the whole bar opens the drawer; with it, only a click
 * landing inside a matching descendant does. Whatever it points at receives the
 * `opener-btn` class, so CSS can reach the toggle too. An invalid selector falls back
 * to the whole bar.
 * @property closerBtnSelector - Same, for the closer. Defaults to
 * `openerBtnSelector`, like the content it goes with.
 * @property defaultIsOpened - Initial open state in uncontrolled mode.
 * Ignored when `isOpened` is provided. Defaults to `false`.
 * @property isOpened - Controlled open state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property onOpenerClicked - Called when the opener is clicked, before the
 * drawer reacts, with the open state as it was.
 * @property onCloserClicked - Called when the closer is clicked, before the
 * drawer reacts, with the open state as it was.
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
  openerContent?: ReactNode
  closerContent?: ReactNode
  openerBtnSelector?: string
  closerBtnSelector?: string
  defaultIsOpened?: boolean
  isOpened?: boolean
  onOpenerClicked?: (isOpened: boolean) => void
  onCloserClicked?: (isOpened: boolean) => void
  onIsOpenedChanged?: (isOpened: boolean) => void
  onContentResized?: (dimensions: { width: number, height: number }) => void
}
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

// A `…BtnSelector` lets a consumer name which descendant of the bar is clickable — the
// title stays inert, the chevron opens. The selector is resolved here into the public
// `-btn` class, which is then the only answer to « what is the toggle »: `isToggleHit`
// reads that class, a stylesheet reaches it. No selector means the whole bar, and the
// class is written at render time instead; an invalid one falls back to the bar rather
// than leaving a drawer that never opens.
//
// `content` is a dependency because this writes into DOM React owns: a re-render that
// changes the bar's own `className` takes the hand-written class with it.
//
// [WIP] Naming a child through a CSS selector is this component's idea alone, and
// nothing else in the library reaches into its children that way. Worth a second look
// before anything copies it.
function useToggleMarking (
  barRef: RefObject<HTMLDivElement | null>,
  selector: string | undefined,
  btnClassName: string,
  content: ReactNode
): void {
  useLayoutEffect(() => {
    const bar = barRef.current
    if (bar === null) return
    bar.querySelectorAll(`.${btnClassName}`).forEach(node => { node.classList.remove(btnClassName) })
    if (selector === undefined) return
    bar.classList.remove(btnClassName)
    try {
      bar.querySelectorAll(selector).forEach(node => { node.classList.add(btnClassName) })
    } catch (err) {
      bar.classList.add(btnClassName)
    }
  }, [barRef, selector, btnClassName, content])
}

// Did the click land inside a marked element — never the selector itself, which
// `useToggleMarking` has already resolved. `contains` on top of `closest`, since a
// marked element could in principle sit outside this bar.
function isToggleHit (event: MouseEvent<HTMLDivElement>, btnClassName: string): boolean {
  const { target, currentTarget } = event
  if (!(target instanceof Element)) return false
  const hit = target.closest(`.${btnClassName}`)
  return hit !== null && currentTarget.contains(hit)
}

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
 * - `opener`
 * - `closer`
 * - `content`
 * - `opener-btn` / `closer-btn` — the toggle. On the bar itself when the whole bar is
 *   clickable, on whatever `openerBtnSelector` / `closerBtnSelector` point at otherwise.
 *   Always present, so a stylesheet has one place to look.
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
 * @returns A root `<div>` holding the opener, the closer and the measured content.
 *
 * @remarks
 * - In controlled mode (`isOpened` defined), the open state is fully driven by
 *   the parent. The internal state goes on following the component's own controls, so
 *   a parent that stops providing the prop lands on what the reader last did.
 * - `onOpenerClicked` and `onCloserClicked` fire in both modes — a controlled
 *   parent needs them to know a click happened at all.
 * - `onIsOpenedChanged` fires in both modes too, and never on mount.
 * - **A command is a bar, not a button.** Both content props take whatever the consumer
 *   puts in the row — most often a title and a toggle — and `closerContent` /
 *   `closerBtnSelector` default to their opener counterpart, so that bar is written
 *   once. What tells the two states apart is CSS, through the root modifiers.
 * - **`…BtnSelector` narrows the click, it does not move it.** The handler stays on the
 *   bar; the selector only decides which descendants carry the `-btn` class, and the
 *   handler asks that class. So the consumer keeps full control of what the row
 *   contains, and a stylesheet reaches the toggle without knowing the selector.
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
  openerContent,
  closerContent,
  openerBtnSelector,
  closerBtnSelector,
  defaultIsOpened = false,
  isOpened: isOpenedProp,
  onOpenerClicked,
  onCloserClicked,
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
  const openerRef = useRef<HTMLDivElement | null>(null)
  const closerRef = useRef<HTMLDivElement | null>(null)
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
  //
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
  // Une barre écrite une fois sert les deux états : le plus souvent un titre et une
  // bascule, identiques ouverts et fermés, que les modifieurs de la racine suffisent à
  // distinguer en CSS. `undefined` seul retombe — un `null` explicite reste un closer
  // vide, et le consommateur garde le moyen de n'en rendre aucun.
  const resolvedCloserContent = closerContent === undefined ? openerContent : closerContent
  const resolvedCloserBtnSelector = closerBtnSelector ?? openerBtnSelector

  // Class names
  // Le `-btn` désigne la bascule, et il existe dans tous les cas : posé ici quand la
  // barre entière en tient lieu, posé sur les descendants par {@link useToggleMarking}
  // quand un sélecteur la rétrécit. Une feuille n'a donc qu'un endroit où regarder, et
  // le gestionnaire de clic qu'une question à poser.
  const c = clss(publicClassName, { cssModule })
  const openerBtnClss = c('opener-btn')
  const closerBtnClss = c('closer-btn')
  useToggleMarking(openerRef, openerBtnSelector, openerBtnClss, openerContent)
  useToggleMarking(closerRef, resolvedCloserBtnSelector, closerBtnClss, resolvedCloserContent)

  // State dispatch
  useStateChangeDispatch(isOpened, onIsOpenedChanged)
  useStateChangeDispatch(
    contentDimensions,
    dimensions => { if (dimensions !== undefined) onContentResized?.(dimensions) },
    (a, b) => a?.width === b?.width && a?.height === b?.height
  )

  // User action handlers
  const handleOpenerClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!isToggleHit(event, openerBtnClss)) return
    onOpenerClicked?.(isOpened)
    surrender('opening')
    setInternalIsOpened(true)
  }
  const handleCloserClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!isToggleHit(event, closerBtnClss)) return
    onCloserClicked?.(isOpened)
    surrender('opening')
    setInternalIsOpened(false)
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
  const openerClss = openerBtnSelector === undefined
    ? mergeClassNames(c('opener'), openerBtnClss)
    : c('opener')
  const closerClss = resolvedCloserBtnSelector === undefined
    ? mergeClassNames(c('closer'), closerBtnClss)
    : c('closer')
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
      ref={openerRef}
      className={openerClss}
      onClick={handleOpenerClick}>{openerContent}</div>
    <div
      ref={closerRef}
      className={closerClss}
      onClick={handleCloserClick}>{resolvedCloserContent}</div>
    <div className={contentClss}>
      <ResizeObserverComponent onResized={handleContentResized}>
        {children}
      </ResizeObserverComponent>
    </div>
  </div>
}
