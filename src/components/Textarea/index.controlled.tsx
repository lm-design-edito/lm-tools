import {
  type FunctionComponent,
  type TextareaHTMLAttributes,
  type ReactNode,
  useState,
  useLayoutEffect,
  useRef
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { randomHash } from '../../agnostic/random/uuid/index.js'
import type { WithClassName } from '../utils/types.js'
import { textarea as publicClassName } from '../public-classnames.js'
import { mergeClassNames } from '../utils/index.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link ControlledTextarea} component.
 *
 * Extends all native {@link TextareaHTMLAttributes} and {@link WithClassName}
 * with optional label, error content, and automatic height adjustment.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the textarea. When omitted, no error is rendered.
 * @property autoHeight - When `true`, automatically adjusts the textarea height
 * to fit its content. Defaults to `false`.
 * @property className - Additional class name(s) applied to the textarea element.
 */
export type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
  autoHeight?: boolean
}>

/**
 * Controlled textarea field component.
 *
 * Renders a native `<textarea>` element with optional label and error feedback.
 * The textarea value is entirely driven by the provided `value` prop and all
 * native textarea attributes are forwarded to the underlying element.
 *
 * A stable auto-generated `id` is created on mount and used to associate the
 * rendered label through the `htmlFor` attribute.
 *
 * When `autoHeight` is enabled, the textarea height automatically expands or
 * shrinks to match its content.
 *
 * ### CSS elements
 * - `label`
 * - `error`
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A labelled controlled textarea with optional error feedback.
 *
 * @remarks
 * - The component does not manage its own value state.
 * - Consumers are responsible for updating `value` in response to `onChange`.
 * - Additional `className` values are merged with the component public class name
 *   and applied to the underlying `<textarea>` element.
 * - When `autoHeight` is enabled, height recalculation occurs whenever the
 *   textarea value changes and every 500ms thereafter.
 */
export const ControlledTextarea: FunctionComponent<Props> = ({
  label,
  error,
  autoHeight = false,
  value,
  className,
  ...rest
}) => {
  const [id] = useState(`_${randomHash(12)}`)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handlers
  const adjustHeight = (): void => {
    const textarea = textareaRef.current
    if (textarea === null) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  // Fx. dep `authHeight`, `value` - Compute content height
  useLayoutEffect(() => {
    if (!autoHeight) return
    adjustHeight()
  }, [autoHeight, value])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <textarea
      {...rest}
      ref={textareaRef}
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
      }} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
