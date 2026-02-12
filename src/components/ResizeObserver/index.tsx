import {
  useRef,
  useEffect,
  useState,
  type PropsWithChildren,
  type JSX,
  FunctionComponent
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { resizeObserver as publicClassName } from '../public-classnames.js'
import cssModule from './style.module.css'

/**
 * Props for the ResizeObserverComponent.
 *
 * @property className - Optional additional class name(s) applied to the root element.
 * @property onResize - Callback invoked when the element is resized.
 * Receives the `ResizeObserverEntry` from the observed element, or `undefined` if none.
 * @property children - React children rendered inside the root element. Only the root element is observed
 */
export type Props = PropsWithChildren<WithClassName<{
  onResize?: (entry: ResizeObserverEntry | undefined) => void
}>>

/**
 * Component that observes its own size changes and exposes the dimensions.
 * Updates are exposed both via data attributes (e.g., `data-width`) and CSS custom properties
 * (e.g., `--<prefix>-width`, `--<prefix>-width-px`) for styling or scripting purposes.
 * @param props - Component properties
 * @see {@link Props}
 * @returns A div wrapping `children`, with resize observation applied.
 */
export const ResizeObserverComponent: FunctionComponent<Props> = ({
  className,
  onResize,
  children
}): JSX.Element => {
  // Refs, effects & handlers
  const [roEntry, setRoEntry] = useState<ResizeObserverEntry>()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const createObserver = (): void => {
    const root = rootRef.current
    observerRef.current?.disconnect()
    if (root === null) return
    observerRef.current = new ResizeObserver(entries => {
      const firstEntry = entries[0]
      if (firstEntry !== undefined) setRoEntry(firstEntry)
      if (onResize === undefined) return
      onResize(firstEntry)
    })
    observerRef.current.observe(root)
  }
  useEffect(() => {
    createObserver()
    return () => observerRef.current?.disconnect()
  }, [onResize])

  // Data attributes, CSS custom props & Rendering
  const { x, y, top, left, bottom, right, width, height } = roEntry?.contentRect ?? {}
  const contentRect = { x, y, top, left, bottom, right, width, height }
  const dataAttributes = Object
    .entries(contentRect)
    .reduce<Record<string, string>>((acc, [key, val]) => {
    if (val === undefined) return acc
    return { ...acc, [`data-${key}`]: val.toString() }
  }, {})
  const cssCustomProps = Object
    .entries(contentRect)
    .reduce<Record<string, string>>((acc, [key, val]) => {
    if (val === undefined) return acc
    return {
      ...acc,
      [`--${publicClassName}-${key}`]: val.toString(),
      [`--${publicClassName}-${key}-px`]: `${val.toString()}px`
    }
  }, {})
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <div
    {...dataAttributes}
    className={rootClss}
    ref={rootRef}
    style={{ ...cssCustomProps }}>
    {children}
  </div>
}
