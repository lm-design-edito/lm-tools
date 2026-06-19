import {
  type FunctionComponent,
  type InputHTMLAttributes,
  type ReactNode,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { input as publicClassName } from '../public-classnames.js'
import { mergeClassNames } from '../utils/index.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Input} component.
 *
 * Extends all native {@link InputHTMLAttributes} and {@link WithClassName}
 * with optional label and error content.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the input. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = InputHTMLAttributes<HTMLInputElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>

/**
 * Input field component with optional label and error message.
 *
 * Renders a native `<input>` element inside a wrapper, with a stable
 * auto-generated `id` used to associate the label via `htmlFor`.
 * All standard input attributes are forwarded to the underlying element.
 *
 * ### CSS elements
 * - `label`
 * - `input`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A labelled input wrapper with optional error feedback.
 */
export const Input: FunctionComponent<Props> = ({
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
    <input {...rest} className={c('input')} id={id} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </span>
}
