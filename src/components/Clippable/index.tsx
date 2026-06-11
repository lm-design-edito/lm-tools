import {
  type PropsWithChildren,
  type JSX,
  type FunctionComponent,
  type MouseEvent,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { clippable as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Clippable} component.
 *
 * Extends {@link WithClassName} with clipboard-related configuration and callbacks.
 *
 * @property toClip - Content written to the clipboard. When omitted, the current
 * content container's `innerHTML` is used. A function may be provided to transform
 * the current content before it is written.
 * @property actionHandlers - Optional user action callbacks:
 *   - `clicked` — called when the copy button is clicked, before clipboard content is resolved.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 *   - `clipped` — called after content has been successfully written to the clipboard.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Content rendered inside the copyable container.
 */
export type Props = PropsWithChildren<WithClassName<{
  toClip?: string | ((curr: string | undefined) => string | undefined)
  actionHandlers?: {
    clicked?: (
      e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
      rawContent: string | undefined
    ) => void
  }
  stateHandlers?: {
    clipped?: (content: string) => void
  }
}>>

/**
 * Clipboard-enabled container component.
 *
 * Renders arbitrary content alongside a copy control. When activated,
 * the component writes HTML content to the clipboard using the
 * `text/html` MIME type.
 *
 * Supports content overriding and transformation through the `toClip`
 * prop, as well as action and state callbacks.
 *
 * ### CSS modifiers
 * The following modifiers are applied automatically:
 * - `clipped` — `true` during the 3 seconds following a successful clipboard write.
 *
 * ### CSS elements
 * - `copy`
 * - `content`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A copy-enabled content container with clipboard state modifiers applied.
 */
export const Clippable: FunctionComponent<Props> = ({
  className,
  children,
  toClip,
  actionHandlers,
  stateHandlers
}): JSX.Element => {
  // State & refs
  const [beenRecentlyClipped, setBeenRecentlyClipped] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const clippedTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  // User action handlers
  const handleCopyClick = async (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): Promise<void> => {
    const rawhHtml = contentRef.current?.innerHTML
    actionHandlers?.clicked?.(e, rawhHtml)
    const html = typeof toClip === 'string'
      ? toClip
      : typeof toClip === 'function'
        ? toClip(rawhHtml)
        : rawhHtml
    if (html === undefined) return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' })
        })
      ])
    } catch (err) {
      console.error(err)
    }
    stateHandlers?.clipped?.(html)
    setBeenRecentlyClipped(true)
    if (clippedTimeoutRef.current !== null) clearTimeout(clippedTimeoutRef.current)
    clippedTimeoutRef.current = setTimeout(() => {
      setBeenRecentlyClipped(false)
    }, 3000)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    clipped: beenRecentlyClipped
  }), className)
  const copyClss = c('copy')
  const contentClss = c('content')
  return <div className={rootClss}>
    <button
      type='button'
      className={copyClss}
      onClick={e => { void handleCopyClick(e) }} />
    <div
      ref={contentRef}
      className={contentClss}>
      {children}
    </div>
  </div>
}
