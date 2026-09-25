import {
  type PropsWithChildren,
  type FunctionComponent,
  type MouseEvent,
  type ReactNode,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { clippable as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/** How long the `clipped` modifier stays on after a successful write. */
const clippedModifierDurationMs = 3000

/**
 * Props for the {@link Clippable} component.
 *
 * @property toClip - Content written to the clipboard. When omitted, the
 * content container's `innerHTML` is used. A function may be provided to
 * transform that current content before it is written.
 * @property copyBtnContent - What the copy button shows at rest. Left out, the button
 * renders empty and a stylesheet fills it — `:empty::before` — which is how every
 * control in this library takes its default look without the component deciding on a
 * word or a glyph.
 * @property clippedBtnContent - What it shows during the three seconds after a
 * successful write. Left out, the button is empty in that state too, and the same
 * stylesheet hook applies. It does **not** fall back to `copyBtnContent`: the two states
 * say different things, and an article that names one without the other means the other
 * to come from the stylesheet.
 * @property onCopyClicked - Called when the copy button is clicked, before the
 * clipboard content is resolved, with `event` and the container's `rawHtml`.
 * @property onClipped - Called once content has been written to the clipboard.
 * Not called when the write fails.
 * @property onCopyFailed - Called when the clipboard write throws, with the
 * error. When set, the error is no longer logged to the console.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Content rendered inside the copyable container.
 */
export type Props = PropsWithChildren<WithClassName<{
  toClip?: string | ((curr: string | undefined) => string | undefined)
  copyBtnContent?: ReactNode
  clippedBtnContent?: ReactNode
  onCopyClicked?: (payload: {
    event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
    rawHtml: string | undefined
  }) => void
  onClipped?: (content: string) => void
  onCopyFailed?: (error: unknown) => void
}>>

/**
 * Clipboard-enabled container. Renders arbitrary content alongside a copy
 * control that writes it to the clipboard, as both `text/html` and `text/plain`.
 *
 * ### CSS modifiers
 * - `clipped` — on during the 3 seconds following a successful write.
 *
 * ### CSS elements
 * - `copy`
 * - `content`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A copy-enabled content container.
 *
 * @remarks
 * A failed clipboard write fires `onCopyFailed` (or is logged when that prop is
 * unset) and leaves the component untouched: neither `onClipped` nor the
 * `clipped` modifier fires.
 */
export const Clippable: FunctionComponent<Props> = ({
  className,
  children,
  toClip,
  copyBtnContent,
  clippedBtnContent,
  onCopyClicked,
  onClipped,
  onCopyFailed
}) => {
  // State & refs
  const [hasBeenRecentlyClipped, setHasBeenRecentlyClipped] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const clippedTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  // User action handlers
  const handleCopyClick = async (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): Promise<void> => {
    const rawHtml = contentRef.current?.innerHTML
    onCopyClicked?.({ event: e, rawHtml })
    const html = typeof toClip === 'string'
      ? toClip
      : typeof toClip === 'function'
        ? toClip(rawHtml)
        : rawHtml
    if (html === undefined) return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' })
        })
      ])
    } catch (err) {
      if (onCopyFailed !== undefined) onCopyFailed(err)
      // eslint-disable-next-line no-console
      else console.error(err)
      return
    }
    onClipped?.(html)
    setHasBeenRecentlyClipped(true)
    if (clippedTimeoutRef.current !== null) clearTimeout(clippedTimeoutRef.current)
    clippedTimeoutRef.current = setTimeout(
      () => setHasBeenRecentlyClipped(false),
      clippedModifierDurationMs
    )
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    clipped: hasBeenRecentlyClipped
  }), className)
  const copyClss = c('copy')
  const contentClss = c('content')
  return <div className={rootClss}>
    <button
      type='button'
      className={copyClss}
      onClick={e => { void handleCopyClick(e) }}>
      {hasBeenRecentlyClipped ? clippedBtnContent : copyBtnContent}
    </button>
    <div
      ref={contentRef}
      className={contentClss}>
      {children}
    </div>
  </div>
}
