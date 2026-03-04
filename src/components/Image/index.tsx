import {
  type FunctionComponent,
  type PropsWithChildren
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { img as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

export type Props = PropsWithChildren<WithClassName<{
  src?: string
  alt?: string
  canTheatre?: boolean
  onTheatreToggle?: (open: boolean) => void
}>>

export const Image: FunctionComponent<Props> = ({
  src,
  alt,
  canTheatre,
  onTheatreToggle,

  className
}) => {
  const c = clss(publicClassName, {
    cssModule,
    cssModuleRoot: 'theatre'
  })
  const rootClss = mergeClassNames(c(null, {}), className)

  return (
    <img src={src} alt ={alt} className={rootClss} />
  )
}
