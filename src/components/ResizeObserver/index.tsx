import {
  useRef,
  useEffect,
  useState,
  type PropsWithChildren
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { resizeObserver as publicClassName } from '../public-classnames.js'
import cssModule from './style.module.css'

export type Props = PropsWithChildren<WithClassName<{
  onResize?: (entry: ResizeObserverEntry | undefined) => void
}>>

export const ResizeObserverComponent = ({
  className,
  onResize,
  children
}: Props) => {
  // Refs, effects & handlers
  const [roEntry, setRoEntry] = useState<ResizeObserverEntry>()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const createObserver = () => {
    const root = rootRef.current
    observerRef.current?.disconnect()
    if (root === null) return
    observerRef.current = new ResizeObserver(entries => {
      const firstEntry = entries[0]
      if (firstEntry !== undefined) setRoEntry(firstEntry)
      if (onResize === undefined) return
      onResize(firstEntry)
    })
    Array
      .from(root.children)
      .forEach(child => observerRef.current?.observe(child))
  }
  useEffect(() => {
    createObserver()
    return () => observerRef.current?.disconnect()
  }, [onResize])

  // Data attributes, CSS custom props & Rendering
  const {
    x,
    y,
    top,
    left,
    bottom,
    right,
    width,
    height
  } = (roEntry ?? {}).contentRect ?? {}
  const rawDataAttributes = { x, y, top, left, bottom, right, width, height }
  const rawCssCustomProps = { x, y, top, left, bottom, right, width, height }
  const dataAttributes = Object
    .entries(rawDataAttributes)
    .reduce((acc, [key, val]) => {
      if (val === undefined) return acc
      return { ...acc, [`data-${key}`]: val.toString() }
    }, {} as Record<string, string>)
  const cssCustomProps = Object
    .entries(rawCssCustomProps)
    .reduce((acc, [key, val]) => {
      if (val === undefined) return acc
      return {
        ...acc,
        [`--${publicClassName}-${key}`]: val.toString(),
        [`--${publicClassName}-${key}-px`]: `${val.toString()}px`
      }
    }, {} as Record<string, string>)
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
