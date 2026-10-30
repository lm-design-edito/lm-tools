import {
  type JSX,
  type FunctionComponent,
  type IframeHTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type { ClassNameProps } from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import { iframe as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

const innerAutoHeightNotifier = (messageType: string): string => `<script>
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
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
export type Props = {
  autoHeight?: boolean
}
  & Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'children'>
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

/**
 * Iframe component with optional automatic height adjustment.
 *
 * When `autoHeight` is enabled, the iframe injects a script that measures
 * document height and sends updates to the parent via `postMessage`.
 *
 * The parent component updates the iframe height via React state and `style`
 * prop (no direct DOM mutation).
 *
 * ### Root element modifiers
 * - `--auto-height` — the component is listening for a height from inside the frame.
 * - `--measured` — one has arrived, and the frame is sized to it.
 * - `--visible` — the component has settled into view. Absent until something asks
 * about visibility, since nothing is observed before that.
 *
 * @param props - Component properties.
 * @see {@link Props}
 */
export const Iframe: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  autoHeight = false,
  className,
  srcDoc,
  style,
  ...iframeProps
}): JSX.Element => {
  const compId = useCompId(givenCompId)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isVisible = useVisibilityTriggers(compId, iframeRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        || event.data.type !== innerMessageType
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        || typeof event.data.height !== 'number'
      ) return
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-type-assertion -- event.data.height was already checked to be a number above; event.data is typed any by MessageEvent
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
  const rootClss = mergeClassNames(
    c(null, {
      'auto-height': autoHeight,
      measured: height !== null,
      visible: isVisible === true
    }),
    className
  )
  const html = useMemo(() => {
    const autoHeightScript = autoHeight
      ? innerAutoHeightNotifier(innerMessageType)
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
    {...compIdAttribute(compId)}
    ref={iframeRef}
    className={rootClss}
    style={iframeStyle}
    srcDoc={html} />
}
