import {
  type ReactNode,
  useRef,
  useEffect,
  type JSX,
  type FunctionComponent
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { mergeClassNames } from '../utils/index.js'
import { eventListener as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * Props for the EventListenerComponent.
 *
 * @property className - Optional additional class name(s) applied to the root element.
 * @property type - Event type or list of event types to listen to (e.g. "click", ["mouseenter", "focus"]).
 * @property targetSelector - Optional CSS selector used to match descendant elements
 * within the root element. If omitted, the listener is attached to the root element itself.
 * @property onEvent - Callback invoked when one of the specified events is triggered.
 * Receives the native DOM Event object.
 * @property children - React children rendered inside the root element.
 */
export type Props = {
  className?: string
  type?: string | string[]
  targetSelector?: string
  onEvent?: (e: Event) => void
  children?: ReactNode
}

/**
 * Component that attaches one or multiple DOM event listeners to its root element
 * or to matching descendants.
 * @param props - Component properties
 * @see {@link Props}
 * @returns A span element wrapping `children`, with configured event listeners.
 */
export const EventListenerComponent: FunctionComponent<Props> = ({
  className,
  type,
  targetSelector,
  onEvent,
  children
}): JSX.Element => {
  // Effects & refs
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (onEvent === undefined || type === undefined || root === null) return
    const typeArr = Array.isArray(type) ? type : [type]
    const elements = Array.from(targetSelector === undefined ? [root] : root.querySelectorAll(targetSelector))
    elements.forEach(e => typeArr.forEach(t => e.addEventListener(t, onEvent)))
    return () => elements.forEach(e => typeArr.forEach(t => e.removeEventListener(t, onEvent)))
  }, [targetSelector, type, onEvent])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(), className)
  return <div
    className={rootClss}
    ref={rootRef}>
    {children}
  </div>
}
