import {
  type ChangeEvent,
  type FunctionComponent,
  type ReactNode,
  type TextareaHTMLAttributes,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { textarea as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Textarea} component.
 *
 * Extends all native {@link TextareaHTMLAttributes} and {@link WithClassName}
 * with optional label, error content, and automatic height adjustment.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the textarea. When omitted, no error is rendered.
 * @property autoHeight - When `true`, grows and shrinks the textarea to fit its
 * content on every value change. Defaults to `false`.
 * @property className - Additional class name(s) applied to the textarea element.
 */
export type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
  autoHeight?: boolean
}>

/**
 * Textarea field supporting controlled and uncontrolled usage.
 *
 * Renders a native `<textarea>` with optional label and error feedback. All
 * standard textarea attributes are forwarded to the underlying element.
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
 * @returns A labelled textarea with optional error feedback.
 *
 * @remarks
 * - In controlled mode (`value` defined), the displayed value is fully driven
 *   by the parent and internal state is never updated.
 * - In uncontrolled mode, internal state is initialized from `defaultValue` and
 *   updated before `onChange` is forwarded.
 * - `onChange` fires in both modes.
 */
export const Textarea: FunctionComponent<Props> = ({
  label,
  error,
  autoHeight = false,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}) => {
  // State & refs
  const [id] = useState(`_${randomHash(12)}`)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  // Fx. dep. `autoHeight`, `currentValue` - fit the height to the content
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!autoHeight || textarea === null) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [autoHeight, currentValue])

  // User action handlers
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <textarea
      {...rest}
      ref={textareaRef}
      id={id}
      className={rootClss}
      value={currentValue}
      onChange={handleChange} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
