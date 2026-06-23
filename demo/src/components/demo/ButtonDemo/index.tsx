import { type FunctionComponent } from 'react'
import {
  Button,
  type Props as ButtonProps
} from '~/components/Button/index.js'
import { button as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Button'

const description = `
Base button component.

Renders a native \`<button>\` element with scoped class names applied.
All standard button attributes are forwarded to the underlying element.

@param props - Component properties.
@see {@link Props}
@returns A styled native button element.
`

/* Demo CSS */
const demoStyles = ``

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link Button} component.
 *
 * Extends all native {@link ButtonHTMLAttributes} and {@link WithClassName}
 * with optional label and error content.
 *
 * @property label - Content rendered as the button label.
 * @property error - Content rendered to convey an error state associated with the button.
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = ButtonHTMLAttributes<HTMLButtonElement> & WithClassName<{}>
`

const demoProps: ButtonProps = {
  children: <>TRUC</>
}

export const ButtonDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    demoProps={demoProps as Record<string, unknown>}
    tsxDetails={tsxDetails}>
    <Button {...demoProps} />
  </CompDisplayer>
}
