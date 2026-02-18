// import {
//   type PropsWithChildren,
//   type FunctionComponent,
//   type ReactNode,
//   useEffect,
//   useRef,
//   Children,
//   useState
// } from 'react'
// import { clss } from '../../agnostic/css/clss/index.js'
// import type { WithClassName } from '../utils/types.js'
// import { mergeClassNames } from '../utils/index.js'
// import { paginator as publicClassName } from '../public-classnames.js'
// import cssModule from './styles.module.css'

// export type Props = PropsWithChildren<WithClassName<{
//   thresholdOffset?: string | number
//   throttleDelayMs?: number
// }>>

// // [WIP] implement scroll direction
// // [WIP] on page change

// type PageState = {
//   position: 'prev' | 'curr' | 'next'
//   top: number
//   bottom: number
//   currCount: number
// }

// export const Paginator: FunctionComponent<Props> = ({
//   thresholdOffset,
//   throttleDelayMs = 50,
//   className,
//   children
// }) => {
//   // State, refs, effects
//   const [pagesState, setPagesState] = useState<Map<number, PageState>>(new Map())
//   const thresholdRef = useRef<HTMLDivElement>(null)
//   const pagesRef = useRef<HTMLDivElement>(null)
//   useEffect(() => {
//     let lastCall = 0
//     const handleScroll = () => {
//       if (thresholdRef.current === null
//         || pagesRef.current === null) return
//       const now = Date.now()
//       if (now - lastCall < throttleDelayMs) return
//       lastCall = now
//       const pages = Array.from(pagesRef.current.children)
//       const thresholdTop = thresholdRef.current.getBoundingClientRect().top
//       setPagesState(prevState => {
//         const nextState = new Map<number, PageState>()
//         pages.forEach((page, index) => {
//           const { top, bottom } = page.getBoundingClientRect()
//           let position: PageState['position']
//           if (bottom < thresholdTop) {
//             position = 'prev'
//           } else if (top >= thresholdTop) {
//             position = 'next'
//           } else {
//             position = 'curr'
//           }
//           const prev = prevState.get(index)
//           const currCount = position === 'curr'
//             ? (prev?.currCount ?? 0) + 1
//             : (prev?.currCount ?? 0)
//           nextState.set(index, {
//             position,
//             top,
//             bottom,
//             currCount
//           })
//         })
//         return nextState
//       })
//     }
//     window.addEventListener('scroll', handleScroll)
//     window.addEventListener('resize', handleScroll)
//     return () => {
//       window.removeEventListener('scroll', handleScroll)
//       window.removeEventListener('resize', handleScroll)
//     }
//   }, [throttleDelayMs])

//   // Rendering
//   const c = clss(publicClassName, { cssModule })
//   const rootClss = mergeClassNames(c(), className)
//   const thresholdClss = c('threshold')
//   const pagesClss = c('pages')
//   const thresholdTop = typeof thresholdOffset === 'string'
//     ? thresholdOffset
//     : typeof thresholdOffset === 'number'
//       ? `${thresholdOffset}px`
//       : '0px'
//   const childrenArr = Children.toArray(children)
//   return <div className={rootClss}>
//     {/* Threshold */}
//     <div
//       className={thresholdClss}
//       ref={thresholdRef}
//       style={{ top: thresholdTop }} />
//     {/* Pages */}
//     <div
//       className={pagesClss}
//       ref={pagesRef}>
//       {childrenArr.map((child, pos) => {
//         const state = pagesState.get(pos)
//         const pageClss = c('page', {
//           first: pos === 0,
//           last: pos === childrenArr.length - 1,
//           prev: state?.position === 'curr',
//           curr: state?.position === 'curr',
//           next: state?.position === 'curr'
//         })
//         return <div
//           className={pageClss}
//           data-page={pos}
//           data-top={state?.top}
//           data-bottom={state?.bottom}
//           data-curr-count={state?.currCount ?? 0}>
//           {child}
//         </div>
//       })}
//     </div>
//   </div>
// }

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

export type Props = PropsWithChildren<WithClassName<{
  thresholdOffsetPercent?: number
}>>

// [WIP] implement scroll direction
// [WIP] on page change

type PageState = {
  position: 'prev' | 'curr' | 'next'
  currCount: number
}

export const Paginator: FunctionComponent<Props> = ({
  thresholdOffsetPercent,
  className,
  children
}) => {
  // State, refs, effects
  const [pagesState, setPagesState] = useState<Map<number, PageState>>(new Map())
  const [directionState, setDirectionState] = useState<'forwards' | 'backwards' | null>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  // Catch scroll direction listening on scroll events
  useEffect(() => {
    let lastCall = 0
    let lastScrollY = window.scrollY
    const handleScroll = (e: Event) => {
      const now = Date.now()
      if (now - lastCall < 100) return
      lastCall = now
      const currentScrollY = window.scrollY
      setDirectionState(
        currentScrollY > lastScrollY
          ? 'forwards'
          : 'backwards'
      )
      lastScrollY = currentScrollY
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
    const observer = new IntersectionObserver(entries => {
      setPagesState(prevState => {
        const nextState = new Map(prevState)
        entries.forEach(entry => {
          const index = Number((entry.target as HTMLElement).dataset.page)
          const prev = prevState.get(index)
          const position: PageState['position'] = entry.isIntersecting
            ? 'curr'
            : entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0)
              ? 'prev'
              : 'next'
          const currCount = position === 'curr'
            ? (prev?.currCount ?? 0) + 1
            : (prev?.currCount ?? 0)
          nextState.set(index, { position, currCount })
        })
        return nextState
      })
    }, {
      rootMargin: `-${thresholdOffsetPercent ?? 0}% 0px -${100 - (thresholdOffsetPercent ?? 0)}% 0px`
    })
    pages.forEach(page => observer.observe(page))
    return () => observer.disconnect()
  }, [thresholdOffsetPercent])

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
          data-curr-count={state?.currCount ?? 0}>
          {child}
        </div>
      })}
    </div>
  </div>
}
