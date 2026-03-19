import {
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { overlayer as publicClassname } from '../public-classnames.js'
import cssModule from './styles.module.css'

type Overlay = {
  content?: ReactNode
  xPercent?: number
  yPercent?: number
  justify?: 'left' | 'center' | 'right' | number
}

export type Props = PropsWithChildren<WithClassName<{
  overlays?: Array<Overlay>
}>>

export const Overlayer: FunctionComponent<Props> = ({
  overlays,
  children,
  className
}) => {
  const c = clss(publicClassname, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  const baseClss = c('base')
  return <div className={rootClss}>
    <div className={baseClss}>{children}</div>
    {overlays?.map(({
      content,
      xPercent = 0,
      yPercent = 0,
      justify
    }) => {
      const overlayClss = c('overlay')
      let computedTranslateX: string
      if (typeof justify === 'number') { computedTranslateX = `-${justify}%` }
      else if (justify === 'center') { computedTranslateX = '-50%' }
      else if (justify === 'left') { computedTranslateX = '0%' }
      else if (justify === 'right') { computedTranslateX = '-100%' }
      else { computedTranslateX = '-50%' }
      const overlayCustomProps: Record<string, string> = {
        [`--PRIVATE-left`]: `${xPercent}%`,
        [`--PRIVATE-top`]: `${yPercent}%`,
        [`--PRIVATE-translate-x`]: computedTranslateX
      }
      if (isFalsy(content)) return null
      return <div
        className={overlayClss}
        style={overlayCustomProps}>
        {content}
      </div>
    })}
  </div>
}
