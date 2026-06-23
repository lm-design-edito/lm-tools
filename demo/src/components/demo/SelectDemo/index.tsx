import { useState, type FunctionComponent } from 'react'
import {
  Select,
  type Props as SelectProps
} from '~/components/Select/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Select'

const description = `
Select field component supporting controlled and hybrid usage.

Wraps {@link ControlledSelect} and automatically manages the input value
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
 * Props for the {@link Select} component.
 *
 * Alias of {@link ControlledProps}.
 *
 * All native input attributes remain available, including \`value\`
 * and \`onChange\`, allowing the component to operate in either
 * controlled or hybrid mode.
 */
export type Props = ControlledProps & {}
`

const demoProps: SelectProps = {
  label: 'Label',
  error: 'Error',
  children: <>
    <option value='1'>1</option>
    <option value='2'>2</option>
    <option value='3'>3</option>
  </>,
  defaultValue: '3'
}

export const SelectDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    demoProps={demoProps as Record<string, unknown>}
    tsxDetails={tsxDetails}>
    <Select {...demoProps} />
  </CompDisplayer>
}
