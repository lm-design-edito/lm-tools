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

/**
 * Props for the {@link Textarea} component.
 *
 * Extends all native {@link TextareaHTMLAttributes} and {@link WithClassName}
 * with optional label and error content.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the textarea. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>

/**
 * Textarea field component with optional label and error message.
 *
 * Renders a native `<textarea>` element inside a wrapper, with a stable
 * auto-generated `id` used to associate the label via `htmlFor`.
 * All standard textarea attributes are forwarded to the underlying element.
 *
 * ### CSS elements
 * - `label`
 * - `textarea`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A labelled textarea wrapper with optional error feedback.
 */
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
