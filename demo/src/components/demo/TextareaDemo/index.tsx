import { useState, type FunctionComponent } from 'react'
import {
  Textarea,
  type Props as TextareaProps
} from '~/components/Textarea/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Textarea'

const description = `
Textarea field component supporting controlled and hybrid usage.

Wraps {@link ControlledTextarea} and automatically manages the input value
when no \`value\` prop is provided.

### CSS elements
- \`label\`
- \`error\`

@param props - Component properties.
@see {@link Props}

@returns A labelled input with optional internal value management.

@remarks
- When \`value\` is defined, the component behaves as a controlled component:
  displayed value updates are entirely driven by the parent component.
- When \`value\` is omitted, the component behaves in hybrid mode:
  it initializes an internal state from the initial \`value\` prop and
  subsequently manages value updates itself.
- In hybrid mode, the internal value is updated before forwarding
  the \`onChange\` callback.
`

/* Demo CSS */
const demoStyles = ``

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link Textarea} component.
 *
 * Alias of {@link ControlledProps}.
 *
 * All native input attributes remain available, including \`value\`
 * and \`onChange\`, allowing the component to operate in either
 * controlled or hybrid mode.
 */
export type Props = ControlledProps & {}
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
