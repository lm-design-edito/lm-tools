import {
  type PropsWithChildren,
  type FunctionComponent,
  type ReactNode
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { IntersectionObserverComponent } from '../IntersectionObserver/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { scrllgngn as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

// [WIP] transitions ?

/* Props */

type PropsCommonBlock = PropsWithChildren<{
  id?: string
  zIndex?: number
  trackScroll?: boolean
}>

type PropsScrollBlock = PropsCommonBlock & {
  depth?: 'scroll'
}

type PropsStickyBlock = PropsCommonBlock & {
  depth: 'back' | 'front'
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
  className
}) => {
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  return <div className={rootClss}>
    {/* Top bound detection */}
    <IntersectionObserverComponent>
    </IntersectionObserverComponent>
    
    {/* Content */}
    <IntersectionObserverComponent>
    </IntersectionObserverComponent>
    
    {/* Bottom bound detection */}
    <IntersectionObserverComponent>
    </IntersectionObserverComponent>
  </div>
}
