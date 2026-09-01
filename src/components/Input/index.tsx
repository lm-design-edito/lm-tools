import {
  type ChangeEvent,
  type FunctionComponent,
  type InputHTMLAttributes,
  type ReactNode,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { input as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Input} component.
 *
 * Extends all native {@link InputHTMLAttributes} and {@link WithClassName}
 * with optional label and error content.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the input. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the input element.
 */
export type Props = InputHTMLAttributes<HTMLInputElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>

/**
 * Input field supporting controlled and uncontrolled usage.
 *
 * Renders a native `<input>` with optional label and error feedback. All
 * standard input attributes are forwarded to the underlying element.
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
 * @returns A labelled input with optional error feedback.
 *
 * @remarks
 * - In controlled mode (`value` defined), the displayed value is fully driven
 *   by the parent and internal state is never updated.
 * - In uncontrolled mode, internal state is initialized from `defaultValue` and
 *   updated before `onChange` is forwarded.
 * - `onChange` fires in both modes.
 */
export const Input: FunctionComponent<Props> = ({
  label,
  error,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}) => {
  // State
  const [id] = useState(`_${randomHash(12)}`)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  // User action handlers
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <input
      {...rest}
      id={id}
      className={rootClss}
      value={currentValue}
      onChange={handleChange} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
