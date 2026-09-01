import { useState, type FunctionComponent } from 'react'
import {
  Select,
  type Props as SelectProps
} from '~/components/Select/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Select'

const description = `
Select field supporting controlled and uncontrolled usage.

Renders a native \`<select>\` with optional label and error feedback. All
standard select attributes are forwarded to the underlying element.

### CSS elements
- \`label\`
- \`error\`

@param props - Component properties.
@see {@link Props}

@returns A labelled select with optional error feedback.

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
 * Props for the {@link Select} component.
 *
 * Extends all native {@link SelectHTMLAttributes} and {@link WithClassName}
 * with optional label, error content, and option children.
 *
 * @property label - Content rendered as an associated \`<label>\`. When omitted, no label is rendered.
 * @property error - Content rendered as an error message below the select. When omitted, no error is rendered.
 * @property className - Additional class name(s) applied to the select element.
 * @property children - \`<option>\` or \`<optgroup>\` elements rendered inside the select.
 */
export type Props = SelectHTMLAttributes<HTMLSelectElement> & PropsWithChildren<WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>>
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
