import {
  type FunctionComponent,
  type ButtonHTMLAttributes,
  type ReactNode
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { button as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

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
export type Props = ButtonHTMLAttributes<HTMLButtonElement> & WithClassName<{
  label?: ReactNode
  error?: ReactNode
}>

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
  label,
  error,
  className,
  ...rest
}) => {
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
  return <button {...rest} className={c(rootClss)} />
}
