import {
  type JSX,
  type FunctionComponent,
  type IframeHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import { iframe as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

const innerAutoHeightNitifier = (messageType: string): string => `<script>
  (() => {
    const notify = () => {
      const height = Math.max(
        document.body?.scrollHeight ?? 0,
        document.documentElement?.scrollHeight ?? 0
      )
      window.parent.postMessage({
        type: '${messageType}',
        height
      }, '*')
    }
    window.addEventListener('load', notify)
    const observer = new ResizeObserver(notify)
    observer.observe(document.body)
    observer.observe(document.documentElement)
    notify()
  })()
</script>`

/**
 * Props for the {@link Iframe} component.
 *
 * Extends native {@link IframeHTMLAttributes} with class name support and
 * automatic height adjustment.
 *
 * @property autoHeight - Enables automatic iframe height adjustment based on
 * document content size. Only supported with `srcDoc`.
 * @property className - Optional additional class names applied to the iframe.
 * @property style - Optional inline style applied to the iframe.
 * @property srcDoc - Raw HTML string rendered inside the iframe.
 */
export type Props = WithClassName<{
  autoHeight?: boolean
}> & Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'children'>

/**
 * Iframe component with optional automatic height adjustment.
 *
 * When `autoHeight` is enabled, the iframe injects a script that measures
 * document height and sends updates to the parent via `postMessage`.
 *
 * The parent component updates the iframe height via React state and `style`
 * prop (no direct DOM mutation).
 *
 * @param props - Component properties.
 * @see {@link Props}
 */
export const Iframe: FunctionComponent<Props> = ({
  autoHeight = false,
  className,
  srcDoc,
  style,
  ...iframeProps
}): JSX.Element => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [innerMessageType] = useState(`_${randomHash(10)}`)

  // Fx. dep. `autoHeight` - Handles messages from iframe content when autoHeight is enabled.
  useEffect(() => {
    if (!autoHeight) return
    const handleMessage = (event: MessageEvent): void => {
      const iframe = iframeRef.current
      if (iframe === null
        || event.source !== iframe.contentWindow
        || typeof event.data !== 'object'
        || event.data === null
        || event.data.type !== innerMessageType
        || typeof event.data.height !== 'number'
      ) return
      setHeight(event.data.height as number)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [autoHeight])

  const iframeStyle = useMemo(() => {
    const base = style ?? {}
    if (!autoHeight || height === null) return base
    return { ...base, height: `${height}px` }
  }, [style, autoHeight, height])

  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const html = useMemo(() => {
    const autoHeightScript = autoHeight
      ? innerAutoHeightNitifier(innerMessageType)
      : ''
    return `<!doctype html>
      <html>
        <body>
          ${srcDoc ?? ''}
          ${autoHeightScript}
        </body>
      </html>
    `
  }, [srcDoc, autoHeight])
  return <iframe
    {...iframeProps}
    ref={iframeRef}
    className={rootClss}
    style={iframeStyle}
    srcDoc={html} />
}
