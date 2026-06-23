import { type FunctionComponent } from 'react'
import {
  Iframe,
  type Props as IframeProps
} from '~/components/Iframe/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { iframe as publicClassName } from '~/components/public-classnames.js'

const name = 'Iframe'

const description = `
Iframe component with React-to-HTML rendering support.

Renders either:
- A raw HTML string via the \`srcDoc\` attribute, or
- A ReactNode rendered into static HTML via \`renderToStaticMarkup\`.

### Rendering strategy
1. If \`children\` is defined (non-nullish), it is rendered to static HTML
   and used as iframe content.
2. Otherwise, \`srcDoc\` is used as-is.

The resulting content is wrapped in a minimal HTML document:
\`<!doctype html><html><body>...</body></html>\`.

### Notes
- The iframe content is static (no hydration, no client-side React inside iframe).
- \`children\` overrides \`srcDoc\`.
- Useful for embedding server-rendered UI fragments or documentation blocks.

@param props - Component properties.
@see {@link Props}
@returns A styled iframe element with computed HTML document content.
`

/* Demo CSS */
const demoStyles = ``

/* TSX Details */

const tsxDetails = `
/**
 * Props for the {@link Iframe} component.
 *
 * Extends native {@link IframeHTMLAttributes} with optional class name support.
 *
 * @property className - Additional class name(s) applied to the root element.
 * @property children - React content rendered as the iframe document body.
 * @property srcDoc - Raw HTML string used as iframe content when \`children\` is not provided.
 *
 * @remarks
 * This component behaves as a hybrid between a native \`<iframe>\` and a React renderer.
 *
 * Rendering priority:
 * - \`children\` takes precedence over \`srcDoc\` when provided.
 * - If \`children\` is \`null\` or \`undefined\`, \`srcDoc\` is used directly.
 *
 * When \`children\` is provided, it is converted to static HTML using
 * \`renderToStaticMarkup\` and injected into a complete HTML document:
 * \`<!doctype html><html><body>...</body></html>\`.
 */`

const demoProps1: IframeProps = {
  autoHeight: true,
  srcDoc: `<html>
  <body>
    <script>
      let count = 0
      window.setInterval(() => {
        if (count > 4) return;
        count ++;
        const newDiv = document.createElement('div')
        newDiv.style.height = '200px'
        newDiv.style.border = '1px solid black'
        document.body.append(newDiv)
      }, 1000)
    </script>
  </div>
</html>
`
}

export const IframeDemo: FunctionComponent = () => {
  return <CompDisplayer
  name={name}
  demoStyles={demoStyles}
  description={description}
  demoProps={demoProps1 as Record<string, unknown>}
  tsxDetails={tsxDetails}>
    <Iframe {...demoProps1} />
  </CompDisplayer>
}
