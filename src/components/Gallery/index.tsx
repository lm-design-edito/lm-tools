import {
  type FunctionComponent,
  type PropsWithChildren,
  Children,
  useEffect,
  useState,
  useRef,
  type ReactNode
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { gallery as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the Gallery component.
 *
 * @property paddingLeft - Left padding applied to the first slot. Accepts a number (pixels) or any valid CSS length value.
 * If not provided, falls back to `padding` or `0px`.
 * @property paddingRight - Right padding applied to the last slot. Accepts a number (pixels) or any valid CSS length value.
 * If not provided, falls back to `padding` or `0px`.
 * @property padding - Shorthand horizontal padding applied to both ends when `paddingLeft` and/or `paddingRight`
 * are not explicitly defined. Accepts a number (pixels) or any valid CSS length value.
 * @property prevButtonContent - Content rendered inside the "previous" navigation control.
 * Defaults to the string `"prev"` when not provided.
 * @property nextButtonContent - Content rendered inside the "next" navigation control.
 * Defaults to the string `"next"` when not provided.
 * @property paginationContent - Content rendered inside each pagination item.
 * Can be:
 * - A ReactNode used for all pages,
 * - A function receiving the page index and returning a ReactNode,
 * - Undefined, in which case the page index is displayed.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Elements rendered as gallery slots. Each child is wrapped in a slot container.
 */
export type Props = PropsWithChildren<WithClassName<{
  paddingLeft?: string | number
  paddingRight?: string | number
  padding?: string | number
  prevButtonContent?: ReactNode
  nextButtonContent?: ReactNode
  paginationContent?: ReactNode | ((page: number) => ReactNode)
}>>

/**
 * Horizontally scrollable gallery component with navigation controls and pagination.
 *
 * Tracks the active slot based on scroll position and exposes state through CSS class names
 * and a `data-current` attribute on the root element.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A container element wrapping:
 * - A scrollable area containing each child in a slot wrapper,
 * - Previous/next navigation controls,
 * - Pagination controls allowing direct slot activation.
 */
export const Gallery: FunctionComponent<Props> = ({
  paddingLeft,
  paddingRight,
  padding,
  prevButtonContent,
  nextButtonContent,
  paginationContent,
  children,
  className
}) => {
  // State & refs
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [canGoLeft, setCanGoLeft] = useState(false)
  const [canGoRight, setCanGoRight] = useState(false)
  const childrenCount = Children.count(children)

  // Scroll position calculation
  useEffect(() => {
    const scrollerElt = scrollerRef.current
    if (scrollerElt === null) return
    scrollerElt.scrollBy(-1, 0)
    let animationFrame: number | null = null
    const update = (): void => {
      animationFrame = null
      const { scrollLeft, clientWidth, scrollWidth } = scrollerElt
      const center = scrollLeft + clientWidth / 2
      const children = Array.from(scrollerElt.children) as HTMLElement[]
      let closestIndex = 0
      let closestDistance = Infinity
      children.forEach((child, index) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2
        const distance = Math.abs(center - childCenter)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })
      setActiveIndex(closestIndex)
      setCanGoLeft(scrollLeft > 0)
      setCanGoRight(scrollLeft + clientWidth < scrollWidth)
    }
    const onScroll = (): void => {
      if (animationFrame !== null) return
      animationFrame = requestAnimationFrame(update)
    }
    scrollerElt.addEventListener('scroll', onScroll, { passive: true })
    update()
    return (): void => {
      scrollerElt.removeEventListener('scroll', onScroll)
      if (animationFrame !== null) cancelAnimationFrame(animationFrame)
    }
  }, [])

  // Forced slot activation handler
  const handleActivateSlot = (targetPos: number): void => {
    if (targetPos < 0) { targetPos = 0 }
    if (targetPos >= childrenCount) { targetPos = childrenCount }
    if (targetPos === activeIndex) return
    if (targetPos < activeIndex && !canGoLeft) return
    if (targetPos > activeIndex && !canGoRight) return
    const scrollerElt = scrollerRef.current
    if (scrollerElt === null) return
    const minPos = Math.min(targetPos, activeIndex)
    const maxPos = Math.max(targetPos, activeIndex)
    const absScrollDist = Array.from(scrollerElt.children)
      .reduce((acc, curr, pos) => {
        if (pos < minPos || pos > maxPos) return acc
        const slotWidth = curr.getBoundingClientRect().width
        if (pos === minPos || pos === maxPos) return acc + (slotWidth / 2)
        return acc + slotWidth
      }, 0)
    scrollerElt.scrollBy({
      left: targetPos < activeIndex ? -1 * absScrollDist : absScrollDist,
      behavior: 'smooth'
    })
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      'at-first': activeIndex === 0,
      'at-last': activeIndex === childrenCount - 1,
      'can-go-left': canGoLeft,
      'can-go-right': canGoRight
    }),
    className
  )
  const scrollerClss = c('scroller')
  const childClss = c('slot')
  const actionsClss = c('actions')
  const prevBtnClss = c('prev')
  const nextBtnClss = c('next')
  const paginationClss = c('pagination')
  const pageClss = c('page')
  const dataAttributes: Record<string, string> = { 'data-current': `${activeIndex}` }
  const actualPaddingLeft = typeof paddingLeft === 'number'
    ? `${paddingLeft}px`
    : typeof paddingLeft === 'string'
      ? paddingLeft
      : typeof padding === 'number'
        ? `${padding}px`
        : padding ?? '0px'
  const actualPaddingRight = typeof paddingRight === 'number'
    ? `${paddingRight}px`
    : typeof paddingRight === 'string'
      ? paddingRight
      : typeof padding === 'number'
        ? `${padding}px`
        : padding ?? '0px'
  return <div
    className={rootClss}
    {...dataAttributes}>

    {/* Scroller */}
    <div className={scrollerClss} ref={scrollerRef}>
      {Children.map(children, (child, pos) => {
        const style: Record<string, string | undefined> = {
          'margin-left': pos === 0
            ? actualPaddingLeft
            : undefined,
          'margin-right': pos === Children.count(children) - 1
            ? actualPaddingRight
            : undefined
        }
        return <div
          key={pos}
          className={`${childClss} thing-${pos}`}
          style={{ ...style }}>
          {child}
        </div>
      })}
    </div>

    {/* Actions */}
    <div className={actionsClss}>
      <div
        className={prevBtnClss}
        onClick={() => handleActivateSlot(activeIndex - 1)}>
        {prevButtonContent ?? 'prev'}
      </div>
      <div
        className={nextBtnClss}
        onClick={() => handleActivateSlot(activeIndex + 1)}>
        {nextButtonContent ?? 'next'}
      </div>
    </div>

    {/* Pagination */}
    <div className={paginationClss}>
      {Children.map(children, (_, pos) => <div
        className={pageClss}
        data-page={pos}
        onClick={() => handleActivateSlot(pos)}>
        {typeof paginationContent === 'string'
          ? paginationContent
          : typeof paginationContent === 'function'
            ? paginationContent(pos)
            : pos}
      </div>)}
    </div>
  </div>
}
