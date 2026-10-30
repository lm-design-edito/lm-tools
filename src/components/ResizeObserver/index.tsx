import {
  useRef,
  useEffect,
  useState,
  type JSX,
  type FunctionComponent
} from 'react'
import type {
  ChildrenProps,
  ClassNameProps
} from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import { resizeObserver as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

type ROEntryWithBoundingRect = {
  entry: ResizeObserverEntry
  boundingClientRect: DOMRect
}

/**
 * Props for the ResizeObserverComponent.
 *
 * @property className - Optional additional class name(s) applied to the root element.
 * @property onResized - Callback invoked when the element is resized.
 * Receives the `ResizeObserverEntry` from the observed element, or `undefined` if none.
 * @property children - React children rendered inside the root element. Only the root element is observed
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
export type Props = {
  onResized?: (entry: ROEntryWithBoundingRect) => void
}
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

/**
 * Component that observes its own size changes and exposes the measured content
 * rect on its root element. Both sets stay absent until the first measurement
 * lands.
 *
 * ### Root element modifiers
 * - `--measured` — a first measurement landed, so the sets below are populated.
 * - `--visible` — the component has settled into view. Absent until something asks
 * about visibility, since nothing is observed before that.
 *
 * ### Data attributes
 * `data-x`, `data-y`, `data-top`, `data-left`, `data-bottom`, `data-right`,
 * `data-width` and `data-height` — the content rect, as plain numbers. They carry
 * what a custom property cannot reach: `content: attr(data-width)`, and attribute
 * selectors.
 *
 * ### CSS custom properties
 * The same eight measurements, each exposed twice: `--lm-resize-observer-width`
 * carries the ready-to-use `px` length, `--lm-resize-observer-width-raw` the
 * plain number for `calc()`. Same pattern for `-x`, `-y`, `-top`, `-left`,
 * `-bottom`, `-right` and `-height`.
 *
 * @param props - Component properties
 * @see {@link Props}
 * @returns A div wrapping `children`, with resize observation applied.
 */
export const ResizeObserverComponent: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  className,
  onResized,
  children
}): JSX.Element => {
  const compId = useCompId(givenCompId)

  // Refs, effects & handlers
  const [roEntry, setRoEntry] = useState<ROEntryWithBoundingRect>()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
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
  const createObserver = (): void => {
    const root = rootRef.current
    observerRef.current?.disconnect()
    if (root === null) return
    observerRef.current = new ResizeObserver(entries => {
      const firstEntry = entries[0]
      if (firstEntry !== undefined) {
        const boundingClientRect = firstEntry.target.getBoundingClientRect()
        const fullEntry: ROEntryWithBoundingRect = {
          entry: firstEntry,
          boundingClientRect
        }
        setRoEntry(fullEntry)
        if (onResized === undefined) return
        onResized(fullEntry)
      }
    })
    observerRef.current.observe(root)
  }
  useEffect(() => {
    createObserver()
    return () => observerRef.current?.disconnect()
  }, [onResized])

  // Data attributes, CSS custom props & Rendering
  const contentRect = roEntry?.entry.contentRect
  let dataAttributes: Record<string, string> = {}
  let cssCustomProps: Record<string, string> = {}
  if (contentRect !== undefined) {
    const { x, y, top, left, bottom, right, width, height } = contentRect
    dataAttributes = {
      'data-x': `${x}`,
      'data-y': `${y}`,
      'data-top': `${top}`,
      'data-left': `${left}`,
      'data-bottom': `${bottom}`,
      'data-right': `${right}`,
      'data-width': `${width}`,
      'data-height': `${height}`
    }
    cssCustomProps = {
      '--lm-resize-observer-x': `${x}px`,
      '--lm-resize-observer-x-raw': `${x}`,
      '--lm-resize-observer-y': `${y}px`,
      '--lm-resize-observer-y-raw': `${y}`,
      '--lm-resize-observer-top': `${top}px`,
      '--lm-resize-observer-top-raw': `${top}`,
      '--lm-resize-observer-left': `${left}px`,
      '--lm-resize-observer-left-raw': `${left}`,
      '--lm-resize-observer-bottom': `${bottom}px`,
      '--lm-resize-observer-bottom-raw': `${bottom}`,
      '--lm-resize-observer-right': `${right}px`,
      '--lm-resize-observer-right-raw': `${right}`,
      '--lm-resize-observer-width': `${width}px`,
      '--lm-resize-observer-width-raw': `${width}`,
      '--lm-resize-observer-height': `${height}px`,
      '--lm-resize-observer-height-raw': `${height}`
    }
  }
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    measured: contentRect !== undefined,
    visible: isVisible === true
  }), className)
  return <div
    {...dataAttributes}
    {...compIdAttribute(compId)}
    className={rootClss}
    ref={rootRef}
    style={{ ...cssCustomProps }}>
    {children}
  </div>
}
