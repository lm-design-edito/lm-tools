import {
  type FunctionComponent,
  useState
} from 'react'
import {
  ControlledSelect,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link Select} component.
 *
 * Alias of {@link ControlledProps}.
 *
 * All native select attributes remain available, including `value`,
 * `defaultValue`, and `onChange`, allowing the component to operate
 * in either controlled or hybrid mode.
 */
export type Props = ControlledProps

/**
 * Select field component supporting controlled and hybrid usage.
 *
 * Wraps {@link ControlledSelect} and automatically manages the selected
 * value when no `value` prop is provided.
 *
 * ### CSS elements
 * - `label`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A labelled select with optional internal selection management.
 *
 * @remarks
 * - In controlled mode (`value` defined), the selected value is fully driven
 *   by the parent component and internal state is never updated.
 * - In hybrid mode, internal state is initialized from `defaultValue` and
 *   subsequently manages selection updates itself.
 * - In hybrid mode, the internal value is updated before forwarding the
 *   `onChange` callback.
 * - `defaultValue` is only used to initialize internal state and is not
 *   forwarded to the underlying controlled component.
 */
export const Select: FunctionComponent<Props> = ({
  defaultValue,
  value,
  onChange,
  ...rest
}) => {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')
  const currentValue = isControlled ? value : internal
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (!isControlled) setInternal(e.target.value)
    onChange?.(e)
  }
  return <ControlledSelect
    {...rest}
    value={currentValue}
    onChange={handleChange} />
}
