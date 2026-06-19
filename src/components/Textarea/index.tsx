import {
  type FunctionComponent,
  type TextareaHTMLAttributes,
  type ReactNode,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { textarea as publicClassName } from '../public-classnames.js'
import { mergeClassNames } from '../utils/index.js'
import cssModule from './styles.module.css'

export type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>

export const Textarea: FunctionComponent<Props> = ({
  label,
  error,
  className,
  ...rest
}) => {
  const [id] = useState(`_${randomHash(12)}`)
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <span className={rootClss}>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <textarea {...rest} className={c('textarea')} id={id} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </span>
}
