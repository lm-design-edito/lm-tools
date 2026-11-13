import {
  useRef,
  useEffect,
  useState,
  type FunctionComponent
} from 'react'
import { createPortal } from 'react-dom'
import type {
  ChildrenProps,
  ClassNameProps
} from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import { shadowRoot as publicClassName } from '../public-classnames.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
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
 * @property children - React children rendered inside the Shadow Root via a React portal.
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
export type Props = {
  mode?: 'open' | 'closed'
  delegatesFocus?: boolean
  slotAssignment?: 'named' | 'manual'
  adoptedStyleSheets?: CSSStyleSheet[]
}
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

/**
 * Component that creates a Shadow Root on its host element and renders
 * its children inside that Shadow Root using a React portal.
 *
 * ### Root element modifiers
 * - `--attached` — the shadow root exists and the children are rendered into it.
 * Absent on the first render, before the host element is in the document.
 * - `--visible` — the component has settled into view. Absent until something asks
 * about visibility, since nothing is observed before that.
 *
 * @param props - Component properties
 * @see {@link Props}
 * @returns A host `div` element that owns the created Shadow Root.
 */
export const ShadowRootComponent: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  mode = 'open',
  delegatesFocus,
  slotAssignment,
  adoptedStyleSheets,
  className,
  children
}) => {
  const compId = useCompId(givenCompId)

  // Refs, state & effects
  const hostRef = useRef<HTMLDivElement | null>(null)
  const isVisible = useVisibilityTriggers(compId, hostRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null)
  useEffect(() => {
    if (hostRef.current === null || shadowRoot !== null) return
    const root = hostRef.current.attachShadow({ mode, delegatesFocus, slotAssignment })
    if (adoptedStyleSheets !== undefined
      && 'adoptedStyleSheets' in root) {
      root.adoptedStyleSheets = adoptedStyleSheets
    }
    setShadowRoot(root)
  }, [
    mode,
    delegatesFocus,
    slotAssignment,
    adoptedStyleSheets
  ])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    attached: shadowRoot !== null,
    visible: isVisible === true
  }), className)
  return <div
    {...compIdAttribute(compId)}
    ref={hostRef}
    className={rootClss}>

    {shadowRoot !== null && createPortal(children, shadowRoot)}
  </div>
}
