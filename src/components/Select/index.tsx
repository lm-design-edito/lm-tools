import {
  type FunctionComponent,
  type SelectHTMLAttributes,
  type ReactNode,
  useState,
  type PropsWithChildren
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { select as publicClassName } from '../public-classnames.js'
import { mergeClassNames } from '../utils/index.js'
import cssModule from './styles.module.css'

export type Props = SelectHTMLAttributes<HTMLSelectElement> & PropsWithChildren<WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>>

export const Select: FunctionComponent<Props> = ({
  label,
  error,
  className,
  children,
  ...rest
}) => {
  const [id] = useState(`_${randomHash(12)}`)
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <span className={rootClss}>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <select {...rest} className={c('select')} id={id}>
      {children}
    </select>
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </span>
}
