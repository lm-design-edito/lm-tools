import {
  type FunctionComponent,
  useState
} from 'react'
import {
  type Props as ControlledProps,
  ControlledInput
} from './index.controlled.js'

/**
 * Props for the {@link Input} component.
 *
 * Alias of {@link ControlledProps}.
 *
 * All native input attributes remain available, including `value`
 * and `onChange`, allowing the component to operate in either
 * controlled or hybrid mode.
 */
export type Props = ControlledProps

/**
 * Input field component supporting controlled and hybrid usage.
 *
 * Wraps {@link ControlledInput} and automatically manages the input value
 * when no `value` prop is provided.
 *
 * ### CSS elements
 * - `label`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A labelled input with optional internal value management.
 *
 * @remarks
 * - When `value` is defined, the component behaves as a controlled component:
 *   displayed value updates are entirely driven by the parent component.
 * - When `value` is omitted, the component behaves in hybrid mode:
 *   it initializes an internal state from the initial `value` prop and
 *   subsequently manages value updates itself.
 * - In hybrid mode, the internal value is updated before forwarding
 *   the `onChange` callback.
 */
export const Input: FunctionComponent<Props> = (props) => {
  const {
    value,
    defaultValue,
    onChange,
    ...rest
  } = props
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')
  const currentValue = isControlled ? value : internal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!isControlled) setInternal(e.target.value)
    onChange?.(e)
  }
  return <ControlledInput
    {...rest}
    value={currentValue}
    onChange={handleChange} />
}
