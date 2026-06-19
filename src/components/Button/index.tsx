import {
  type FunctionComponent,
  type ButtonHTMLAttributes,
  type ReactNode
} from 'react'
import { clss } from '@design-edito/tools/agnostic/css/clss'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { button as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

export type Props = ButtonHTMLAttributes<HTMLButtonElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>

export const Button: FunctionComponent<Props> = ({
  label,
  error,
  className,
  ...rest
}) => {
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <button {...rest} className={c(rootClss)} />
}
