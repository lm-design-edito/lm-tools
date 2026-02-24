import {
  type PropsWithChildren,
  type FunctionComponent,
  useEffect,
  useRef,
  Children,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { paginator as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

type PageState = {
  position: 'prev' | 'curr' | 'next'
  currCount: number
}

type PagesState = Map<number, PageState>

type DirectionState = 'forwards' | 'backwards' | null

export type Props = PropsWithChildren<WithClassName<{
  thresholdOffsetPercent?: number
  onDirectionChange?: (direction: DirectionState) => void
  onPageChange?: (pages: PageState[]) => void
}>>

export const Paginator: FunctionComponent<Props> = ({
  thresholdOffsetPercent,
  onDirectionChange,
  onPageChange,
  className,
  children
}) => {
  // State, refs, effects
  const [pagesState, setPagesState] = useState<PagesState>(new Map())
  const [directionState, setDirectionState] = useState<DirectionState>(null)
  const pagesRef = useRef<HTMLDivElement>(null)

  // Catch scroll direction listening on scroll events
  useEffect(() => {
    let lastCall = 0
    let lastScrollY = window.scrollY
    const handleScroll = (e: Event): void => {
      const now = Date.now()
      if (now - lastCall < 100) return
      lastCall = now
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? 'forwards' : 'backwards'
      setDirectionState(direction)
      lastScrollY = currentScrollY
      if (onDirectionChange !== undefined) onDirectionChange(direction)
    }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Detect active pages with Intersection Observer
  useEffect(() => {
    if (pagesRef.current === null) return
    const pages = Array.from(pagesRef.current.children)
    const observerRootMargin = `-${thresholdOffsetPercent ?? 0}%`
      + ' 0px'
      + ` -${100 - (thresholdOffsetPercent ?? 0)}%`
      + ' 0px'
    const observer = new IntersectionObserver(entries => {
      setPagesState(prevState => {
        const nextState = new Map(prevState)
        entries.forEach(entry => {
          const index = pageIndexMap.get(entry.target)
          if (index === undefined) return
          const prev = prevState.get(index)
          const position: PageState['position'] = entry.isIntersecting
            ? 'curr'
            : entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0)
              ? 'prev'
              : 'next'
          const currCount = position === 'curr'
            && prev?.position !== 'curr'
            ? (prev?.currCount ?? 0) + 1
            : (prev?.currCount ?? 0)
          nextState.set(index, { position, currCount })
        })
        if (onPageChange !== undefined) onPageChange(
          Array
            .from(nextState)
            .map(([, state]) => state)
        )
        return nextState
      })
    }, { rootMargin: observerRootMargin })
    const pageIndexMap = new Map<Element, number>()
    pages.forEach((page, index) => {
      pageIndexMap.set(page, index)
      observer.observe(page)
    })
    return () => observer.disconnect()
  }, [thresholdOffsetPercent, children])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      forwards: directionState === 'forwards',
      backwards: directionState === 'backwards'
    }),
    className
  )
  const pagesClss = c('pages')
  const childrenArr = Children.toArray(children)
  return <div className={rootClss}>
    <div
      className={pagesClss}
      ref={pagesRef}>
      {childrenArr.map((child, pos) => {
        const state = pagesState.get(pos)
        const pageClss = c('page', {
          first: pos === 0,
          last: pos === childrenArr.length - 1,
          prev: state?.position === 'prev',
          curr: state?.position === 'curr',
          next: state?.position === 'next'
        })
        return <div
          className={pageClss}
          data-page={pos}
          data-curr-count={state?.currCount ?? 0}
          key={pos}>
          {child}
        </div>
      })}
    </div>
  </div>
}
