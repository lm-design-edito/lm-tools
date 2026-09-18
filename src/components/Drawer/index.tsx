import {
  type MouseEvent,
  type PropsWithChildren,
  type FunctionComponent,
  type ReactNode,
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
 * landing inside a matching descendant does. An invalid selector is ignored, and the
 * bar stays whole.
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
 * Whether a click on a command should toggle the drawer.
 *
 * Without a selector the whole bar is the toggle, which is the common case. With one,
 * the click has to land inside a matching descendant **of that same bar** — hence the
 * `contains` check on top of `closest`, without which a selector could be satisfied by
 * an ancestor sitting outside the drawer entirely.
 *
 * An invalid selector makes `closest` throw. A consumer typo would then break every
 * click on the drawer, so it is caught and the bar simply stays whole: degrading to the
 * default behaviour beats a command that no longer opens anything.
 */
function isToggleHit (event: MouseEvent<HTMLDivElement>, selector?: string): boolean {
  if (selector === undefined) return true
  const { target, currentTarget } = event
  if (!(target instanceof Element)) return false
  try {
    const hit = target.closest(selector)
    return hit !== null && currentTarget.contains(hit)
  } catch (err) {
    return true
  }
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
 *   bar and the selector is tested against the click's target, so nothing in the markup
 *   changes and a consumer keeps full control of what the row contains. The flip side:
 *   the component can't know which element is the toggle, so a `cursor` on the bar is
 *   the consumer's business either way.
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
  const isControlled = isOpenedProp !== undefined
  const isOpened = isOpenedProp ?? internalIsOpened
  // Une barre écrite une fois sert les deux états : le plus souvent un titre et une
  // bascule, identiques ouverts et fermés, que les modifieurs de la racine suffisent à
  // distinguer en CSS. `undefined` seul retombe — un `null` explicite reste un closer
  // vide, et le consommateur garde le moyen de n'en rendre aucun.
  const resolvedCloserContent = closerContent === undefined ? openerContent : closerContent
  const resolvedCloserBtnSelector = closerBtnSelector ?? openerBtnSelector

  // State dispatch
  useChangeDispatch(isOpened, onIsOpenedChanged)
  useChangeDispatch(
    contentDimensions,
    dimensions => { if (dimensions !== undefined) onContentResized?.(dimensions) },
    (a, b) => a?.width === b?.width && a?.height === b?.height
  )

  // User action handlers
  const handleOpenerClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!isToggleHit(event, openerBtnSelector)) return
    onOpenerClicked?.(isOpened)
    if (isControlled) return
    setInternalIsOpened(true)
  }
  const handleCloserClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (!isToggleHit(event, resolvedCloserBtnSelector)) return
    onCloserClicked?.(isOpened)
    if (isControlled) return
    setInternalIsOpened(false)
  }
  const handleContentResized: ResizeObserverProps['onResized'] = ({ entry }): void => {
    const { width, height } = entry.contentRect
    setContentDimensions({ width, height })
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    'opened': isOpened,
    'closed': !isOpened,
    measured: contentDimensions !== undefined
  }), className)
  const openerClss = c('opener')
  const closerClss = c('closer')
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
    <div className={openerClss} onClick={handleOpenerClick}>{openerContent}</div>
    <div className={closerClss} onClick={handleCloserClick}>{resolvedCloserContent}</div>
    <div className={contentClss}>
      <ResizeObserverComponent onResized={handleContentResized}>
        {children}
      </ResizeObserverComponent>
    </div>
  </div>
}
