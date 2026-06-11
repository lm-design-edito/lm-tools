import { type FunctionComponent } from 'react'
import {
  Clippable,
  type Props as ClippableProps
} from '~/components/Clippable/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import {
  clippable as publicClassName,
} from '~/components/public-classnames.js'

const name = 'Clippable'

const description = `
Clipboard-enabled container component.

Renders arbitrary content alongside a copy control. When activated,
the component writes HTML content to the clipboard using the
\`text/html\` MIME type.

Supports content overriding and transformation through the \`toClip\`
prop, as well as action and state callbacks.

### CSS modifiers
The following modifiers are applied automatically:
- \`clipped\` — \`true\` during the 3 seconds following a successful clipboard write.

### CSS elements
- \`copy\`
- \`content\`

@param props - Component properties.
@see {@link Props}
@returns A copy-enabled content container with clipboard state modifiers applied.
`

/* Demo CSS */
const demoStyles = `
.${publicClassName} {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  width: fit-content;
  gap: 12px;
  align-items: center;
}

.${publicClassName}::after {
  content: 'Clipped';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  user-select: none;
  background-color: coral;
  opacity: 0;
  transition: opacity 200ms;
}

.${publicClassName}.${publicClassName}--clipped::after {
  height: unset;
  opacity: 1;
}

.${publicClassName}__copy::before {
  content: 'Copy';
}
`

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link Clippable} component.
 *
 * Extends {@link WithClassName} with clipboard-related configuration and callbacks.
 *
 * @property toClip - Content written to the clipboard. When omitted, the current
 * content container's \`innerHTML\` is used. A function may be provided to transform
 * the current content before it is written.
 * @property actionHandlers - Optional user action callbacks:
 *   - \`clicked\` — called when the copy button is clicked, before clipboard content is resolved.
 * @property stateHandlers - Optional callbacks invoked when derived state changes:
 *   - \`clipped\` — called after content has been successfully written to the clipboard.
 * @property className - Additional class name(s) applied to the root element.
 * @property children - Content rendered inside the copyable container.
 */
`

const demoProps1: ClippableProps = {
  children: <div>Clippable content</div>,
  toClip: curr => {
    const copied = `!!${curr}!!`
    console.log(copied)
    return copied
  }
}

export const ClippableDemo: FunctionComponent = () => {
  return <CompDisplayer
  name={name}
  demoStyles={demoStyles}
  description={description}
  demoProps={demoProps1 as Record<string, unknown>}
  tsxDetails={tsxDetails}>
    <Clippable {...demoProps1} />
  </CompDisplayer>
}
