import {
  type ChangeEvent,
  type FunctionComponent,
  type InputHTMLAttributes,
  type ReactNode,
  useState
} from 'react'
import type { ClassNameProps } from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import { input as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Input} component.
 *
 * Extends all native {@link InputHTMLAttributes} and {@link ClassNameProps}
 * with optional label and error content.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the input. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the input element.
 */
export type Props = {
  label?: ReactNode
  error?: ReactNode
}
  & InputHTMLAttributes<HTMLInputElement>
  & ClassNameProps
  & CompIdProps

/**
 * Input field supporting controlled and uncontrolled usage.
 *
 * Renders a native `<input>` with optional label and error feedback. All
 * standard input attributes are forwarded to the underlying element.
 *
 * A stable auto-generated `id` is created on mount and used to associate the
 * rendered label through the `htmlFor` attribute.
 *
 * ### Root element modifiers
 * - `--controlled` — the value comes from the parent, not from inside.
 * - `--empty` / `--filled` — whether the current value is the empty string.
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
 * - In controlled mode (`value` defined), the displayed value is fully driven by
 *   the parent. The internal state goes on following the component's own controls, so
 *   a parent that stops providing the prop lands on what the reader last did.
 * - The internal state starts from `defaultValue` and is updated before `onChange`
 *   is forwarded, controlled or not.
 * - `onChange` fires in both modes.
 */
export const Input: FunctionComponent<Props> = ({
  compId: givenCompId,
  label,
  error,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}) => {
  const compId = useCompId(givenCompId)

  // State
  const [id] = useState(`_${randomHash(12)}`)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined
  const currentValue = value ?? internalValue

  // User action handlers
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInternalValue(e.target.value)
    onChange?.(e)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      controlled: isControlled,
      empty: currentValue === '',
      filled: currentValue !== ''
    }),
    className
  )
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <input
      {...rest}
      {...compIdAttribute(compId)}
      id={id}
      className={rootClss}
      value={currentValue}
      onChange={handleChange} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
