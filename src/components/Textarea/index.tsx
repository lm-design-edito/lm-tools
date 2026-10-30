import {
  type ChangeEvent,
  type FunctionComponent,
  type ReactNode,
  type TextareaHTMLAttributes,
  useLayoutEffect,
  useRef,
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
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import { textarea as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Textarea} component.
 *
 * Extends all native {@link TextareaHTMLAttributes} and {@link ClassNameProps}
 * with optional label, error content, and automatic height adjustment.
 *
 * @property label - Content rendered as an associated `<label>`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the textarea. When omitted, no error is rendered.
 * @property autoHeight - When `true`, grows and shrinks the textarea to fit its
 * content on every value change. Defaults to `false`.
 * @property className - Additional class name(s) applied to the textarea element.
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
export type Props = {
  label?: ReactNode
  error?: ReactNode
  autoHeight?: boolean
}
  & TextareaHTMLAttributes<HTMLTextAreaElement>
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

/**
 * Textarea field supporting controlled and uncontrolled usage.
 *
 * Renders a native `<textarea>` with optional label and error feedback. All
 * standard textarea attributes are forwarded to the underlying element.
 *
 * A stable auto-generated `id` is created on mount and used to associate the
 * rendered label through the `htmlFor` attribute.
 *
 * ### Root element modifiers
 * - `--controlled` — the value comes from the parent, not from inside.
 * - `--empty` / `--filled` — whether the current value is the empty string.
 * - `--visible` — the field has settled into view. Absent until something asks about
 * visibility, since nothing is observed before that.
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
 * - In controlled mode (`value` defined), the displayed value is fully driven by
 *   the parent. The internal state goes on following the component's own controls, so
 *   a parent that stops providing the prop lands on what the reader last did.
 * - The internal state starts from `defaultValue` and is updated before `onChange`
 *   is forwarded, controlled or not.
 * - `onChange` fires in both modes.
 */
export const Textarea: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  label,
  error,
  autoHeight = false,
  value,
  defaultValue,
  onChange,
  className,
  ...rest
}) => {
  const compId = useCompId(givenCompId)

  // State & refs
  const [id] = useState(`_${randomHash(12)}`)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isControlled = value !== undefined
  const currentValue = value ?? internalValue
  const isVisible = useVisibilityTriggers(compId, textareaRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })

  // Fx. dep. `autoHeight`, `currentValue` - fit the height to the content
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!autoHeight || textarea === null) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [autoHeight, currentValue])

  // User action handlers
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setInternalValue(e.target.value)
    onChange?.(e)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      controlled: isControlled,
      empty: currentValue === '',
      filled: currentValue !== '',
      visible: isVisible === true
    }),
    className
  )
  return <>
    {isNotFalsy(label) && <label className={c('label')} htmlFor={id}>{label}</label>}
    <textarea
      {...rest}
      {...compIdAttribute(compId)}
      ref={textareaRef}
      id={id}
      className={rootClss}
      value={currentValue}
      onChange={handleChange} />
    {isNotFalsy(error) && <span className={c('error')}>{error}</span>}
  </>
}
