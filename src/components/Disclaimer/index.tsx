import {
  useRef,
  useState,
  type ReactNode,
  type FunctionComponent
} from 'react'
import { useStateChangeDispatch } from '../../agnostic/@react/effects/use-state-change-dispatch/index.js'
import type {
  ChildrenProps,
  ClassNameProps
} from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { CompIdProps } from '../utils/comp-id/types.js'
import {
  useCommandSurrender,
  useCommands
} from '../utils/commands/index.js'
import { DisclosureProvider } from '../utils/disclosure/index.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { VisibilityProps } from '../utils/visibility/types.js'
import { disclaimer as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'
import {
  DISCLAIMER_ACTION_VERB_DOMAINS,
  type DisclaimerActionDomain
} from './types.js'

/**
 * Props for the {@link Disclaimer} component.
 *
 * @property children - The content the disclaimer withholds, rendered below the panel.
 * @property undisclosedContent - Content displayed inside the disclaimer panel,
 * until it is dismissed.
 * @property togglerContent - Content rendered inside the dismiss toggler.
 * When omitted, the toggler is not rendered.
 * @property isOn - Controlled visibility state. When defined, the component
 * behaves as a controlled component and internal state is never updated.
 * @property defaultIsOn - Initial visibility state in uncontrolled mode.
 * Ignored when `isOn` is provided. Defaults to `true`.
 * @property onDismissClicked - Called when the toggler is clicked, before the
 * disclaimer reacts, with the visibility state as it was.
 * @property onIsOnChanged - Called after the visibility state changed, with the
 * new value.
 * @property className - Optional additional class name(s) applied to the root element.
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`
 * and the five `visibility*` settings.
 */
export type Props = {
  undisclosedContent?: ReactNode
  togglerContent?: ReactNode
  isOn?: boolean
  defaultIsOn?: boolean
  onDismissClicked?: (isOn: boolean) => void
  onIsOnChanged?: (isOn: boolean) => void
}
  & ChildrenProps
  & ClassNameProps
  & CompIdProps
  & VisibilityProps

/**
 * Dismissible disclaimer panel, gating the content it wraps.
 *
 * ### Commands
 * - `dismiss` / `restore` — the panel goes, or comes back. Only `dismiss` has a gesture
 *   behind it, so `restore` is for an article re-arming the gate itself.
 *
 * **A verb never contradicts a prop**: both are inert while `isOn` arrived as one. **And
 * a command yields to the reader** — dismissing the panel hands the `disclosure` domain
 * over for the rest of the mount, which silences `restore` too, since putting a gate back
 * over content someone chose to reveal is exactly what this rule prevents. `:force` opts
 * out.
 *
 * ### Disclosure
 * **What this component withholds, the library knows about.** Its children are rendered
 * under a disclosure the whole subtree can read, so while the panel stands none of them
 * answers a command, none of them sends one, and the few that can start something — a
 * video's playback, a sequence's tempo — stay put. Dismissing the panel discloses them;
 * `restore` withholds them again.
 *
 * A disclaimer nested in another's children is withheld like anything else, so its own
 * `dismiss` is dropped while the outer panel stands. Accepting the inner one first is
 * exactly what an outer decision should prevent.
 *
 * ### CSS modifiers
 * - `on` — the disclaimer is showing.
 * - `off` — the disclaimer has been dismissed.
 * - `--visible` — the component has settled into view. Absent until something asks
 *   about visibility, since nothing is observed before that.
 *
 * ### CSS elements
 * - `panel`
 * - `content` — wraps `undisclosedContent`.
 * - `toggler`
 * - `sensitive` — wraps `children`.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` holding the disclaimer panel and the withheld content.
 *
 * @remarks
 * - In controlled mode (`isOn` defined), visibility is fully driven by
 *   the parent. The internal state goes on following the component's own controls, so
 *   a parent that stops providing the prop lands on what the reader last did.
 * - `onDismissClicked` fires in both modes — a controlled parent needs it to
 *   know a click happened at all.
 * - `onIsOnChanged` fires in both modes too, and never on mount.
 */
export const Disclaimer: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  children,
  undisclosedContent,
  togglerContent,
  isOn: isOnProp,
  defaultIsOn = true,
  onDismissClicked,
  onIsOnChanged,
  className
}) => {
  const compId = useCompId(givenCompId)

  // State
  const [internalIsOn, setInternalIsOn] = useState(defaultIsOn)
  const isOn = isOnProp ?? internalIsOn
  const rootRef = useRef<HTMLDivElement>(null)
  const isVisible = useVisibilityTriggers(compId, rootRef, {
    whenVisible,
    whenHidden,
    onVisibilityChanged,
    visibilityThreshold,
    visibilityRoot,
    visibilityRootMargin,
    visibilityOnAfterMs,
    visibilityOffAfterMs
  })

  // Commands
  //
  // Annotated with this component's vocabulary: the layer takes any name, so the
  // annotation is what keeps a misspelled domain from compiling.
  const surrender: (domain: DisclaimerActionDomain) => void = useCommandSurrender(
    compId,
    DISCLAIMER_ACTION_VERB_DOMAINS
  )
  useCommands(compId, {
    dismiss: () => { if (isOnProp === undefined) setInternalIsOn(false) },
    restore: () => { if (isOnProp === undefined) setInternalIsOn(true) }
  })

  // State dispatch
  useStateChangeDispatch(isOn, onIsOnChanged)

  // User action handlers
  const handleDismissClick = (): void => {
    onDismissClicked?.(isOn)
    surrender('disclosure')
    setInternalIsOn(false)
  }

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, {
    on: isOn,
    off: !isOn,
    visible: isVisible === true
  }), className)
  const panelClss = c('panel')
  const contentClss = c('content')
  const togglerClss = c('toggler')
  const sensitiveClss = c('sensitive')
  return <div
    {...compIdAttribute(compId)}
    ref={rootRef}
    className={rootClss}>
    <div className={panelClss}>
      {undisclosedContent !== undefined && <div className={contentClss}>
        {undisclosedContent}
      </div>}
      {togglerContent !== undefined && <div
        className={togglerClss}
        onClick={handleDismissClick}>
        {togglerContent}
      </div>}
    </div>
    <div className={sensitiveClss}>
      <DisclosureProvider isDisclosed={!isOn}>
        {children}
      </DisclosureProvider>
    </div>
  </div>
}
