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

/**
 * Props for the {@link Select} component.
 *
 * Extends all native {@link SelectHTMLAttributes} and {@link WithClassName}
 * with optional label, error content, and option children.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the select. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - `<option>` or `<optgroup>` elements rendered inside the select.
 */
export type Props = SelectHTMLAttributes<HTMLSelectElement> & PropsWithChildren<WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>>

/**
 * Select field component with optional label and error message.
 *
 * Renders a native `<select>` element inside a wrapper, with a stable
 * auto-generated `id` used to associate the label via `htmlFor`.
 * All standard select attributes are forwarded to the underlying element.
 *
 * ### CSS elements
 * - `label`
 * - `select`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A labelled select wrapper with optional error feedback.
 */
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
