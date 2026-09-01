import { useState, type FunctionComponent } from 'react'
import {
  Textarea,
  type Props as TextareaProps
} from '~/components/Textarea/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Textarea'

const description = `
Textarea field supporting controlled and uncontrolled usage.

Renders a native \`<textarea>\` with optional label and error feedback. All
standard textarea attributes are forwarded to the underlying element.

### CSS elements
- \`label\`
- \`error\`

@param props - Component properties.
@see {@link Props}

@returns A labelled textarea with optional error feedback.

@remarks
- In controlled mode (\`value\` defined), the displayed value is fully driven
  by the parent and internal state is never updated.
- In uncontrolled mode, internal state is initialized from \`defaultValue\` and
  updated before \`onChange\` is forwarded.
- \`onChange\` fires in both modes.
`

/* Demo CSS */
const demoStyles = ``

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link Textarea} component.
 *
 * Extends all native {@link TextareaHTMLAttributes} and {@link WithClassName}
 * with optional label, error content, and automatic height adjustment.
 *
 * @property label - Content rendered as an associated \`<label>\`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the textarea. When omitted, no error is rendered.
 * @property autoHeight - When \`true\`, grows and shrinks the textarea to fit its
 * content on every value change. Defaults to \`false\`.
 * @property className - Additional class name(s) applied to the textarea element.
 */
export type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
  autoHeight?: boolean
}>
`

const demoProps: TextareaProps = {
  label: 'Label',
  error: 'Error',
  defaultValue: 'lorem ipsum',
  autoHeight: true
}

export const TextareaDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    demoProps={demoProps as Record<string, unknown>}
    tsxDetails={tsxDetails}>
    <Textarea {...demoProps} />
  </CompDisplayer>
}
