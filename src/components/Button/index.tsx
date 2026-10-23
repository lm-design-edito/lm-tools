import type {
  FunctionComponent,
  ButtonHTMLAttributes
} from 'react'
import type { WithClassName } from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId,
  type WithCompId
} from '../utils/comp-id/index.js'
import { button as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Button} component.
 *
 * Extends all native {@link ButtonHTMLAttributes} and {@link WithClassName}
 * with optional label and error content.
 *
 * @property className - Additional class name(s) applied to the root element.
 */
export type Props = WithCompId<ButtonHTMLAttributes<HTMLButtonElement> & WithClassName<Record<string, unknown>>>

/**
 * Base button component.
 *
 * Renders a native `<button>` element with scoped class names applied.
 * All standard button attributes are forwarded to the underlying element.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A styled native button element.
 */
export const Button: FunctionComponent<Props> = ({
  compId: givenCompId,
  className,
  ...rest
}) => {
  const compId = useCompId(givenCompId)

  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  return <button
    {...rest}
    {...compIdAttribute(compId)}
    className={rootClss} />
}
