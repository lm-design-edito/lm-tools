import { useState, type FunctionComponent } from 'react'
import {
  Input,
  type Props as InputProps
} from '~/components/Input/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Input'

const description = `
Input field supporting controlled and uncontrolled usage.

Renders a native \`<input>\` with optional label and error feedback. All
standard input attributes are forwarded to the underlying element.

### CSS elements
- \`label\`
- \`error\`

@param props - Component properties.
@see {@link Props}

@returns A labelled input with optional error feedback.

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
 * Props for the {@link Input} component.
 *
 * Extends all native {@link InputHTMLAttributes} and {@link WithClassName}
 * with optional label and error content.
 *
 * @property label - Content rendered as an associated \`<label>\`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the input. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the input element.
 */
export type Props = InputHTMLAttributes<HTMLInputElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>
`

const demoProps: InputProps = {
  label: 'Label',
  error: 'Error',
  // value: 'truc'
}

export const InputDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    demoProps={demoProps as Record<string, unknown>}
    tsxDetails={tsxDetails}>
    <Input {...demoProps} />
  </CompDisplayer>
}
