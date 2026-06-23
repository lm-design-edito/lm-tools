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
 * Controlled input field component.
 *
 * Renders a native `<input>` element with optional label and error feedback.
 * The input value is entirely driven by the provided `value` prop and all
 * native input attributes are forwarded to the underlying element.
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
 * @returns A labelled controlled input with optional error feedback.
 *
 * @remarks
 * - The component does not manage its own value state.
 * - Consumers are responsible for updating `value` in response to `onChange`.
 * - Additional `className` values are merged with the component public class name
 *   and applied to the underlying `<input>` element.
 */
export const ControlledInput: FunctionComponent<Props> = ({
  label,
  error,
  value,
  className,
  ...rest
}) => {
  const [id] = useState(`_${randomHash(12)}`)
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <input
      {...rest}
      id={id}
      className={rootClss}
      value={value ?? ''}
      onChange={e => {
        rest.onChange?.(e)
        if (value === undefined) return
        if (typeof value === 'number') { e.target.value = `${value}` }
        else if (typeof value === 'string') { e.target.value = value }
        else {
          // value is readonly string[]
          // not supported for <input>; ignore or normalize if needed
        }
      }} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
