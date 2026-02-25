import {
  type PropsWithChildren,
  type FunctionComponent,
  useState,
  useEffect
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import {
  IntersectionObserverComponent,
  type Props as IOCompProps
} from '../IntersectionObserver/index.js'
import {
  Paginator,
  type Props as PaginatorProps
} from '../Paginator/index.js'
import {
  ResizeObserverComponent,
  type Props as RSOCompProps
} from '../ResizeObserver/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { scrllgngn as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

type PropsCommonBlock = PropsWithChildren<{
  id?: string
  trackScroll?: boolean
}>

type PropsScrollBlock = PropsCommonBlock & {
  depth?: 'scroll'
}

type PropsStickyBlock = PropsCommonBlock & {
  depth: 'back' | 'front'
  zIndex?: number
}

type PropsBlock = PropsScrollBlock | PropsStickyBlock

type PropsPage = {
  id?: string
  blocks?: PropsBlock[]
}

export type Props = WithClassName<{
  pages?: PropsPage[]
  thresholdOffsetPercent?: number
  stickyBlocksLazyLoadDistance?: number
  forceStickBlocks?: 'before' | 'after' | 'both' | 'none'
}>

type BlockConsolidatedData = {
  displayOnPages: number[]
}

export const Scrllgngn: FunctionComponent<Props> = ({
  pages,
  thresholdOffsetPercent,
  stickyBlocksLazyLoadDistance = 2,
  forceStickBlocks,
  className
}) => {
  // State
  const [topVisible, setTopVis] = useState(false)
  const [contentVisible, setCntVis] = useState(false)
  const [bottomVisible, setBtmVis] = useState(false)
  const [currentPagePos, setCurrentPagePos] = useState<number>(0)
  const [stickyBlocks, setStickyBlocks] = useState(new Map<string, PropsStickyBlock & BlockConsolidatedData>())
  const [partialBoundingRect, setPartialBoundingRect] = useState<{
    left: number
    right: number
    width: number
    height: number
  }>()

  // Sticky blocks calculations
  useEffect(() => {
    let consolidatedBlocks = new Map<string, PropsBlock & BlockConsolidatedData>()
    for (const page of pages ?? []) {
      const pageIndex = pages?.indexOf(page) ?? -1
      for (const block of page.blocks ?? []) {
        const blockId = block.id ?? randomHash(12)
        const found = consolidatedBlocks.get(blockId)
        if (found !== undefined) consolidatedBlocks.set(blockId, {
          ...found,
          ...block,
          displayOnPages: [
            ...found.displayOnPages,
            pageIndex
          ]
        })
        else consolidatedBlocks.set(blockId, {
          ...block,
          displayOnPages: [pageIndex]
        })
      }
    }
    let consolidatedStickyBlocks = new Map(Array
      .from(consolidatedBlocks)
      .filter((e): e is [string, PropsStickyBlock & BlockConsolidatedData] => {
        const block = e[1]
        return block.depth === 'back'
          || block.depth === 'front'
      }))
    setStickyBlocks(consolidatedStickyBlocks)
  }, [pages])

  const lazyLoadedBackBlocks = Array
    .from(stickyBlocks)
    .filter(([, block]) => block.depth === 'back'
      && block.displayOnPages.some(dispPage => {
        const absDiff = Math.abs(dispPage - currentPagePos)
        return absDiff <= stickyBlocksLazyLoadDistance
      })
    ).map(([, block]) => block)
    .sort((a, b) => {
      return (a.zIndex ?? -Infinity) - (b.zIndex ?? -Infinity)
    })

  const lazyLoadedFrontBlocks = Array
    .from(stickyBlocks)
    .filter(([, block]) => block.depth === 'front'
      && block.displayOnPages.some(dispPage => {
        const absDiff = Math.abs(dispPage - currentPagePos)
        return absDiff <= stickyBlocksLazyLoadDistance
      })
    ).map(([, block]) => block)
    .sort((a, b) => {
      return (a.zIndex ?? -Infinity) - (b.zIndex ?? -Infinity)
    })

  // Handlers
  const handleTopBoundDetect: IOCompProps['onIntersection'] = e => setTopVis(e.ioEntry?.isIntersecting ?? false)
  const handleCntDetect: IOCompProps['onIntersection'] = e => setCntVis(e.ioEntry?.isIntersecting ?? false)
  const handleBtmBoundDetect: IOCompProps['onIntersection'] = e => setBtmVis(e.ioEntry?.isIntersecting ?? false)
  const handlePageChange: PaginatorProps['onPageChange'] = pages => {
    const curPagePos = pages.findIndex(page => page.position === 'curr')
    if (curPagePos === -1) return
    return setCurrentPagePos(curPagePos)
  }
  const handleResize: RSOCompProps['onResize'] = ({ boundingClientRect }) => {
    if (partialBoundingRect === undefined
      || boundingClientRect.left !== partialBoundingRect.left
      || boundingClientRect.right !== partialBoundingRect.right
      || boundingClientRect.height !== partialBoundingRect.height
      || boundingClientRect.width !== partialBoundingRect.width
    ) setPartialBoundingRect(boundingClientRect)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      'top-visible': topVisible,
      'content-visible': contentVisible,
      'bottom-visible': bottomVisible,
      'force-stick-blocks-before': forceStickBlocks === 'before',
      'force-stick-blocks-after': forceStickBlocks === 'after',
      'force-stick-blocks-both': forceStickBlocks === 'both'
    }),
    className
  )
  const customCssProps: Record<string, string> = {}
  if (partialBoundingRect?.left !== undefined) {
    customCssProps[`--${publicClassName}-screen-left`] = `${partialBoundingRect.left}px`,
    customCssProps['--PRIVATE-left'] = `${partialBoundingRect.left}px`
  }
  if (partialBoundingRect?.right !== undefined) {
    customCssProps[`--${publicClassName}-screen-right`] = `${partialBoundingRect.right}px`
    customCssProps['--PRIVATE-right'] = `${partialBoundingRect.right}px`
  }
  if (partialBoundingRect?.width !== undefined) {
    customCssProps[`--${publicClassName}-screen-width`] = `${partialBoundingRect.width}px`
    customCssProps['--PRIVATE-width'] = `${partialBoundingRect.width}px`
  }
  if (partialBoundingRect?.height !== undefined) {
    customCssProps[`--${publicClassName}-screen-height`] = `${partialBoundingRect.height}px`
    customCssProps['--PRIVATE-height'] = `${partialBoundingRect.height}px`
  }
  return <div
    className={rootClss}
    data-current-page-pos={currentPagePos}
    style={{ ...customCssProps }}>
    <ResizeObserverComponent onResize={handleResize}>
      {/* Top bound detection */}
      <div className={c('top-bound')}>
        <IntersectionObserverComponent onIntersection={handleTopBoundDetect} />
      </div>

      {/* Back blocks */}
      <div className={c('back-blocks')}>
        {lazyLoadedBackBlocks.map((block, blockPos) => {
          const isActive = block.displayOnPages.includes(currentPagePos)
          const blockClss = c('back-block', {
            active: isActive,
            'lazy-loaded': !isActive
          })
          return <div
            className={blockClss}
            style={{ zIndex: blockPos }}>
            {block.children}
          </div>
        })}
      </div>

      {/* Front blocks */}
      <div className={c('front-blocks')}>
        {lazyLoadedFrontBlocks.map((block, blockPos) => {
          const isActive = block.displayOnPages.includes(currentPagePos)
          const blockClss = c('front-block', {
            active: isActive,
            'lazy-loaded': !isActive
          })
          return <div
            className={blockClss}
            style={{ zIndex: blockPos }}>
            {block.children}
          </div>
        })}
      </div>

      {/* Scrolling content */}
      <div className={c('scrolling-content')}>
        <IntersectionObserverComponent onIntersection={handleCntDetect}>
          <Paginator
            thresholdOffsetPercent={thresholdOffsetPercent}
            onPageChange={handlePageChange}>
            {pages?.map(page => {
              const scrollBlocks = page.blocks
                ?.filter(b => b.depth === 'scroll'
                  || b.depth === undefined) ?? []
              return <>{scrollBlocks.map(b => b.children)}</>
            })}
          </Paginator>
        </IntersectionObserverComponent>
      </div>

      {/* Bottom bound detection */}
      <div className={c('bottom-bound')}>
        <IntersectionObserverComponent onIntersection={handleBtmBoundDetect} />
      </div>
    </ResizeObserverComponent>
  </div>
}
