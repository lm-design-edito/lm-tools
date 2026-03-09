import { type FunctionComponent } from 'react'
import {
  ShadowRootComponent,
  type Props as SRCompProps
} from '~/components/ShadowRoot/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'ShadowRootComponent'

const description = `
Component that creates a Shadow Root on its host element and renders
its children inside that Shadow Root using a React portal.

@param props - Component properties
@see {@link Props}
@returns A host \`div\` element that owns the created Shadow Root.`

const tsxDetails = `/**
 * Props for the ShadowRootComponent.
 *
 * @property className - Optional additional class name(s) applied to the host element
 * that owns the Shadow Root.
 * @property mode - Shadow DOM mode. \`"open"\` exposes the shadowRoot via \`element.shadowRoot\`,
 * \`"closed"\` keeps it inaccessible from the outside. Defaults to \`"open"\`.
 * @property delegatesFocus - When true, enables focus delegation from the host
 * to the first focusable element inside the Shadow Root.
 * @property slotAssignment - Slot assignment mode. \`"named"\` uses standard named slot behavior,
 * \`"manual"\` requires manual slot assignment via \`HTMLSlotElement.assign()\`.
 * @property adoptedStyleSheets - Array of constructable \`CSSStyleSheet\` instances
 * assigned to \`shadowRoot.adoptedStyleSheets\` (if supported by the browser).
 * @property injectedStyles - Raw CSS string injected into the Shadow Root inside a \`<style>\` element.
 * Useful as a fallback when constructable stylesheets are not used.
 * @property onMount - Callback invoked once the Shadow Root is created.
 * Receives the created \`ShadowRoot\` instance.
 * @property children - React children rendered inside the Shadow Root via a React portal.
 */
export type Props = PropsWithChildren<WithClassName<{
  mode?: 'open' | 'closed'
  delegatesFocus?: boolean
  slotAssignment?: 'named' | 'manual'
  adoptedStyleSheets?: CSSStyleSheet[]
  injectedStyles?: string
  onMount?: (shadowRoot: ShadowRoot) => void
}>>`

const demoProps: SRCompProps = {
  injectedStyles: `div {
  border-radius: 40px;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5em;
}`,
  children: <div style={{ width: 200, height: 200, backgroundColor: 'black' }}>In the shadow</div>
}

export const ShadowRootDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}>
    <ShadowRootComponent {...demoProps} />
  </CompDisplayer>
}
