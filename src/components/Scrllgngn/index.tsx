import {
  type PropsWithChildren,
  type FunctionComponent,
  type ReactNode,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { IntersectionObserverComponent } from '../IntersectionObserver/index.js'
import { Paginator } from '../Paginator/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { scrllgngn as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

// [WIP] transitions ?

/* Props */

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
  // stickyBlocksLazyLoadDistance?: number
  // stickyBlocksViewportHeight?: string // [WIP] No relative units, maybe some regex checks here?
  // stickyBlocksOffsetTop?: number // [WIP] this does not work well
  // forceStickBlocks?: 'before' | 'after' | 'both' | 'none'
  thresholdOffsetPercent?: number
  pages?: PropsPage[]
}>

export const Scrllgngn: FunctionComponent<Props> = ({
  className,
  pages
}) => {
  const [topVisible, setTopVis] = useState(false)
  const [contentVisible, setCntVis] = useState(false)
  const [bottomVisible, setBtmVis] = useState(false)

  const fixedBlocks = pages

  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      'top-visible': topVisible,
      'content-visible': contentVisible,
      'bottom-visible': bottomVisible
    }),
    className
  )
  return <div className={rootClss}>
    {/* Top bound detection */}
    <IntersectionObserverComponent onIntersection={({ ioEntry }) => setTopVis(ioEntry?.isIntersecting ?? false)} />
    
    {/* Content */}
    <IntersectionObserverComponent onIntersection={({ ioEntry }) => setCntVis(ioEntry?.isIntersecting ?? false)}>
      <Paginator>
        {pages?.map(page => {
          const scrollBlocks = page.blocks
            ?.filter(b => b.depth === 'scroll') ?? []
          return <>{scrollBlocks.map(block => block.children)}</>
        })}
      </Paginator>
    </IntersectionObserverComponent>
    
    {/* Bottom bound detection */}
    <IntersectionObserverComponent onIntersection={({ ioEntry }) => setBtmVis(ioEntry?.isIntersecting ?? false)} />
  </div>
}
