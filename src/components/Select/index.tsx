import {
  type ChangeEvent,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
  type SelectHTMLAttributes,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { select as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Select} component.
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
 * Select field supporting controlled and uncontrolled usage.
 *
 * Renders a native `<select>` with optional label and error feedback. All
 * standard select attributes are forwarded to the underlying element.
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
 * @returns A labelled select with optional error feedback.
 *
 * @remarks
 * - In controlled mode (`value` defined), the selection is fully driven by the
 *   parent and internal state is never updated.
 * - In uncontrolled mode, internal state is initialized from `defaultValue` and
 *   updated before `onChange` is forwarded.
 * - `onChange` fires in both modes.
 */
export const Select: FunctionComponent<Props> = ({
  label,
  error,
  value,
  defaultValue,
  onChange,
  className,
  children,
  ...rest
}) => {
  // State
  const [id] = useState(`_${randomHash(12)}`)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  // User action handlers
  const handleChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <select
      {...rest}
      id={id}
      className={rootClss}
      value={currentValue}
      onChange={handleChange}>
      {children}
    </select>
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
