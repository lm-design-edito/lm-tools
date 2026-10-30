import {
  type FunctionComponent,
  type ButtonHTMLAttributes,
  useRef
} from 'react'
import type { WithClassName } from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId
} from '../utils/comp-id/index.js'
import type { WithCompId } from '../utils/comp-id/types.js'
import { useVisibilityTriggers } from '../utils/visibility/index.js'
import type { WithVisibility } from '../utils/visibility/types.js'
import { button as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Button} component.
 *
 * Extends all native {@link ButtonHTMLAttributes} and {@link WithClassName}
 * with optional label and error content.
 *
 * @property className - Additional class name(s) applied to the root element.
 *
 * Plus the visibility triggers of {@link VisibilityProps} — `whenVisible`, `whenHidden`,
 * `onVisibilityChanged` and the five `visibility*` settings.
 */
export type Props = WithVisibility<WithCompId<ButtonHTMLAttributes<HTMLButtonElement> & WithClassName<Record<string, unknown>>>>

/**
 * Base button component.
 *
 * Renders a native `<button>` element with scoped class names applied.
 * All standard button attributes are forwarded to the underlying element.
 *
 * ### Root element modifiers
 * - `--visible` — the component has settled into view. Absent until something asks
 *   about visibility, since nothing is observed before that.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A styled native button element.
 */
export const Button: FunctionComponent<Props> = ({
  compId: givenCompId,
  whenVisible,
  whenHidden,
  onVisibilityChanged,
  visibilityThreshold,
  visibilityRoot,
  visibilityRootMargin,
  visibilityOnAfterMs,
  visibilityOffAfterMs,
  className,
  ...rest
}) => {
  const compId = useCompId(givenCompId)
  const rootRef = useRef<HTMLButtonElement>(null)
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

  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null, { visible: isVisible === true }), className)
  return <button
    {...rest}
    {...compIdAttribute(compId)}
    ref={rootRef}
    className={rootClss} />
}
