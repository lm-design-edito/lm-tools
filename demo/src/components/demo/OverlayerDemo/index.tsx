import { useState, type FunctionComponent } from 'react'
import {
  Overlayer,
  type Props as OverlayerProps
} from '~/components/Overlayer/index.js'
import { overlayer as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Overlayer'
const description = `
Absolute positioning overlay component. Renders a base content layer and
stacks one or more overlays on top of it, each independently positioned via
percentage coordinates and a justify alignment.

### Child elements
- \`__base\` — wrapping \`<div>\` that contains \`children\`.
- \`__overlay\` — one \`<div>\` per entry in \`overlays\` (falsy \`content\` entries
are omitted).

### CSS custom properties on each overlay element
- \`--PRIVATE-left\` — derived from \`xPercent\` (e.g. \`42%\`). Used internally
to set the horizontal anchor position.
- \`--PRIVATE-top\` — derived from \`yPercent\` (e.g. \`10%\`). Used internally
to set the vertical anchor position.
- \`--PRIVATE-translate-x\` — derived from \`justify\`. Used internally to shift
the overlay relative to its anchor.

@param props - Component properties.
@see {@link Props}
@returns A root \`<div>\` containing the base layer and all positioned overlay elements.
`

const tsxDetails = `
/**
 * Describes a single overlay positioned over the base content.
 *
 * @property content - React node rendered inside the overlay element.
 * If falsy, the overlay is not rendered.
 * @property xPercent - Horizontal position of the overlay anchor as a percentage
 * of the root element's width. Defaults to \`0\`.
 * @property yPercent - Vertical position of the overlay anchor as a percentage
 * of the root element's height. Defaults to \`0\`.
 * @property justify - Controls the horizontal alignment of the overlay relative
 * to its anchor point via a CSS \`translateX\`:
 * - \`'left'\` — anchor is at the left edge of the overlay (\`0%\`).
 * - \`'center'\` — anchor is at the horizontal center (\`-50%\`). Default when omitted.
 * - \`'right'\` — anchor is at the right edge (\`-100%\`).
 * - \`number\` — arbitrary percentage offset (e.g. \`25\` produces \`-25%\`).
 */
type Overlay = {
  content?: ReactNode
  xPercent?: number
  yPercent?: number
  justify?: 'left' | 'center' | 'right' | number
}

/**
 * Props for the {@link Overlayer} component.
 *
 * @property overlays - Array of {@link Overlay} descriptors rendered on top of
 * the base content. Overlays with falsy \`content\` are skipped.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - Content rendered in the base layer, below all overlays.
 */
export type Props = PropsWithChildren<WithClassName<{
  overlays?: Array<Overlay>
}>>`

const demoStyles = `
.${publicClassName} {
  position: relative;
}

.${publicClassName}__overlay {
  position: absolute;
  bottom: calc(100% - var(--PRIVATE-top));
  left: var(--PRIVATE-left);
  transform: translateX(var(--PRIVATE-translate-x));
}
`

const demoProps: OverlayerProps = {
  children: <div style={{
    width: '100%',
    height: '40vw',
    backgroundColor: 'coral'
  }} />,
  overlays: [{
    content: 'Simple centered label',
    xPercent: 50,
    yPercent: 50,
    justify: 'right'
  }, {
    content: <div>Div in the corner</div>,
    xPercent: 10,
    yPercent: 90,
    justify: 100
  }, {
    content: <div>Div in the corner</div>,
    xPercent: 10,
    yPercent: 90,
    justify: 0
  }]
}

export const OverlayerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <Overlayer {...demoProps} />
  </CompDisplayer>
}
