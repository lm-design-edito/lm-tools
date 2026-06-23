import {
  type FunctionComponent,
  useState
} from 'react'
import {
  ControlledTextarea,
  type Props as ControlledProps
} from './index.controlled.js'

/**
 * Props for the {@link Textarea} component.
 *
 * Alias of {@link ControlledProps}.
 *
 * All native textarea attributes remain available, including `value`,
 * `defaultValue`, and `onChange`, allowing the component to operate
 * in either controlled or hybrid mode.
 */
export type Props = ControlledProps

/**
 * Textarea field component supporting controlled and hybrid usage.
 *
 * Wraps {@link ControlledTextarea} and automatically manages the textarea
 * value when no `value` prop is provided.
 *
 * ### CSS elements
 * - `label`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A labelled textarea with optional internal value management.
 *
 * @remarks
 * - In controlled mode (`value` defined), the textarea value is fully driven
 *   by the parent component and internal state is never updated.
 * - In hybrid mode, internal state is initialized from `defaultValue` and
 *   subsequently manages value updates itself.
 * - In hybrid mode, the internal value is updated before forwarding the
 *   `onChange` callback.
 * - `defaultValue` is only used to initialize internal state and is not
 *   forwarded to the underlying controlled component.
 */
export const Textarea: FunctionComponent<Props> = ({
  defaultValue,
  value,
  onChange,
  ...rest
}) => {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')
  const currentValue = isControlled ? value : internal
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    if (!isControlled) setInternal(e.target.value)
    onChange?.(e)
  }
  return <ControlledTextarea
    {...rest}
    value={currentValue}
    onChange={handleChange} />
}
