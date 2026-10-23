import {
  useRef,
  type JSX,
  type PropsWithChildren,
  type FunctionComponent
} from 'react'
import type { WithClassName } from '../../agnostic/@react/types/index.js'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../../agnostic/css/merge-class-names/index.js'
import {
  compIdAttribute,
  useCompId,
  type WithCompId
} from '../utils/comp-id/index.js'
import {
  useIntersectionObserver,
  type ObserverOptions,
  type OnIntersected
} from '../utils/intersection/index.js'
import { intersectionObserver as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the IntersectionObserverComponent.
 *
 * @property onIntersected - See {@link OnIntersected}.
 * @property root - See {@link ObserverOptions.root}.
 * @property rootMargin - See {@link ObserverOptions.rootMargin}.
 * @property threshold - See {@link ObserverOptions.threshold}.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the observed element.
 */
export type Props = WithCompId<PropsWithChildren<WithClassName<{
  onIntersected?: OnIntersected
} & ObserverOptions>>>

/**
 * Component that observes its root element using the IntersectionObserver API
 * and notifies consumers about visibility changes.
 *
 * A div and `useIntersectionObserver`, and nothing else. A component that
 * already renders the element it wants watched should use the hook and keep its own
 * root, rather than gain a wrapper it has no other use for.
 *
 * @param props - Component properties.
 * @see {@link Props}
 *
 * @returns A div element wrapping `children`, observed for intersection changes.
 *
 * @remarks
 * - Adds an `is-intersecting` modifier class when the element is intersecting.
 */
export const IntersectionObserverComponent: FunctionComponent<Props> = ({
  compId: givenCompId,
  onIntersected,
  root,
  rootMargin,
  threshold,
  className,
  children
}): JSX.Element => {
  const compId = useCompId(givenCompId)

  const rootRef = useRef<HTMLDivElement>(null)
  const ioEntry = useIntersectionObserver(
    rootRef,
    { root, rootMargin, threshold },
    onIntersected
  )

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const isIntersecting = ioEntry?.isIntersecting ?? false
  const rootClss = mergeClassNames(
    c(null, { 'is-intersecting': isIntersecting }),
    className
  )
  return <div
    {...compIdAttribute(compId)}
    className={rootClss}
    ref={rootRef}>
    {children}
  </div>
}
