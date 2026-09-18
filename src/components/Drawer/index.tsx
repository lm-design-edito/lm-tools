import {
  type MouseEvent,
  type PropsWithChildren,
  type FunctionComponent,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import {
  ResizeObserverComponent,
  type Props as ResizeObserverProps
} from '../ResizeObserver/index.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { drawer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

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
 */
export type Props = PropsWithChildren<WithClassName<{
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
}>>

/**
 * Marks whatever a `…BtnSelector` points at with the command's `-btn` public class.
 *
 * **The class is the single source of truth**, for CSS and for the click handler alike:
 * without it, a stylesheet would have no way to reach the toggle — the selector is a
 * JavaScript prop and leaves no trace in the markup — and the two would answer the
 * question « what is the toggle » by different means.
 *
 * The no-selector case never gets here: the class is then written straight into the
 * bar's own `className`, because the whole bar *is* the toggle. So this hook only ever
 * runs to narrow that down to a few descendants.
 *
 * **It writes into DOM that React owns.** React does not reset an attribute it has not
 * diffed, so the class survives an ordinary re-render — but a bar whose own `className`
 * changes would be rewritten, class included. Hence `content` among the dependencies:
 * whatever makes the content change is also what repairs the marking, before paint.
 *
 * An invalid selector marks the bar itself. A consumer typo would otherwise leave no
 * toggle at all and a drawer that no longer opens; falling back to the whole bar is the
 * behaviour they had before writing the selector.
 */
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

/**
 * Whether a click on a command should toggle the drawer.
 *
 * The test is « did the click land inside a marked element », never the selector itself:
 * {@link useToggleMarking} has already resolved what the toggle is. `contains` comes on
 * top of `closest` because a marked element could, in principle, sit outside this bar.
 */
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
 * ### CSS modifiers
 * - `opened` — the drawer is open.
 * - `closed` — the drawer is closed.
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
 *   the parent and internal state is never updated.
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
  // State
  const [internalIsOpened, setInternalIsOpened] = useState(defaultIsOpened)
  const [contentDimensions, setContentDimensions] = useState<{
    width: number
    height: number
  }>()
  const openerRef = useRef<HTMLDivElement | null>(null)
  const closerRef = useRef<HTMLDivElement | null>(null)
  const isControlled = isOpenedProp !== undefined
  const isOpened = isOpenedProp ?? internalIsOpened
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
  useChangeDispatch(isOpened, onIsOpenedChanged)
  useChangeDispatch(
    contentDimensions,
    dimensions => { if (dimensions !== undefined) onContentResized?.(dimensions) },
    (a, b) => a?.width === b?.width && a?.height === b?.height
  )

  // User action handlers
  const handleOpenerClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!isToggleHit(event, openerBtnClss)) return
    onOpenerClicked?.(isOpened)
    if (isControlled) return
    setInternalIsOpened(true)
  }
  const handleCloserClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!isToggleHit(event, closerBtnClss)) return
    onCloserClicked?.(isOpened)
    if (isControlled) return
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
    measured: contentDimensions !== undefined
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
