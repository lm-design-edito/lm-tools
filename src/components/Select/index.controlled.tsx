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
 * Props for the {@link ControlledSelect} component.
 *
 * Extends all native {@link SelectHTMLAttributes} and {@link WithClassName}
 * with optional label, error content, and option children.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the select. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the select element.
 * @property children - `<option>` or `<optgroup>` elements rendered inside the select.
 */
export type Props = SelectHTMLAttributes<HTMLSelectElement> & PropsWithChildren<WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>>

/**
 * Controlled select field component.
 *
 * Renders a native `<select>` element with optional label and error feedback.
 * The selected value is entirely driven by the provided `value` prop and all
 * native select attributes are forwarded to the underlying element.
 *
 * A stable auto-generated `id` is created on mount and used to associate the
 * rendered label through the `htmlFor` attribute.
 *
 * ### CSS elements
 * - `label`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A labelled controlled select with optional error feedback.
 *
 * @remarks
 * - The component does not manage its own selection state.
 * - Consumers are responsible for updating `value` in response to `onChange`.
 * - Additional `className` values are merged with the component public class name
 *   and applied to the underlying `<select>` element.
 */
export const ControlledSelect: FunctionComponent<Props> = ({
  label,
  error,
  value,
  className,
  children,
  ...rest
}) => {
  const [id] = useState(`_${randomHash(12)}`)
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <select
      {...rest}
      className={rootClss}
      id={id}
      value={value}
      onChange={e => {
        rest.onChange?.(e)
        if (value === undefined) return
        if (typeof value === 'number') { e.target.value = `${value}` }
        else if (typeof value === 'string') { e.target.value = value }
        else {
          // value is readonly string[]
          // not supported for <select>; ignore or normalize if needed
        }
      }}>
      {children}
    </select>
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
