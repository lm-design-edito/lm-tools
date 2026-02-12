import {
  useRef,
  useEffect,
  useState,
  type PropsWithChildren,
  type FunctionComponent
} from 'react'
import { createPortal } from 'react-dom'
import { clss } from '../../agnostic/css/clss/index.js'
import { shadowRoot as publicClassName } from '../public-classnames.js'
import { mergeClassNames } from '../utils/index.js'
import type { WithClassName } from '../utils/types.js'
import cssModule from './styles.module.css'

/**
 * Props for the ShadowRootComponent.
 *
 * @property className - Optional additional class name(s) applied to the host element
 * that owns the Shadow Root.
 * @property mode - Shadow DOM mode. `"open"` exposes the shadowRoot via `element.shadowRoot`,
 * `"closed"` keeps it inaccessible from the outside. Defaults to `"open"`.
 * @property delegatesFocus - When true, enables focus delegation from the host
 * to the first focusable element inside the Shadow Root.
 * @property slotAssignment - Slot assignment mode. `"named"` uses standard named slot behavior,
 * `"manual"` requires manual slot assignment via `HTMLSlotElement.assign()`.
 * @property adoptedStyleSheets - Array of constructable `CSSStyleSheet` instances
 * assigned to `shadowRoot.adoptedStyleSheets` (if supported by the browser).
 * @property injectedStyles - Raw CSS string injected into the Shadow Root inside a `<style>` element.
 * Useful as a fallback when constructable stylesheets are not used.
 * @property onMount - Callback invoked once the Shadow Root is created.
 * Receives the created `ShadowRoot` instance.
 * @property children - React children rendered inside the Shadow Root via a React portal.
 */
export type Props = PropsWithChildren<
  WithClassName<{
    mode?: 'open' | 'closed'
    delegatesFocus?: boolean
    slotAssignment?: 'named' | 'manual'
    adoptedStyleSheets?: CSSStyleSheet[]
    injectedStyles?: string
    onMount?: (shadowRoot: ShadowRoot) => void
  }>
>

/**
 * Component that creates a Shadow Root on its host element and renders
 * its children inside that Shadow Root using a React portal.
 *
 * @param props - Component properties
 * @see {@link Props}
 * @returns A host `div` element that owns the created Shadow Root.
 */
export const ShadowRootComponent: FunctionComponent<Props> = ({
  mode = 'open',
  delegatesFocus,
  slotAssignment,
  adoptedStyleSheets,
  injectedStyles,
  onMount,
  className,
  children
}) => {
  // Refs, state & effects
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)
  useEffect(() => {
    if (!hostRef.current || shadowRoot) return
    const root = hostRef.current.attachShadow({ mode, delegatesFocus, slotAssignment })
    if (adoptedStyleSheets && 'adoptedStyleSheets' in root) { root.adoptedStyleSheets = adoptedStyleSheets }
    if (injectedStyles) {
      const styleEl = document.createElement('style')
      styleEl.textContent = injectedStyles
      root.appendChild(styleEl)
    }
    setShadowRoot(root)
    onMount?.(root)
  }, [
    mode,
    delegatesFocus,
    slotAssignment,
    adoptedStyleSheets,
    injectedStyles,
    onMount,
    shadowRoot
  ])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  return <div
    ref={hostRef}
    className={rootClss}>
    {shadowRoot && createPortal(children, shadowRoot)}
  </div>
}
