import {
  type ReactNode,
  useRef,
  useEffect,
  type JSX
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { isNotFalsy } from '../../agnostic/booleans/is-falsy/index.js'
import { eventListener } from '../public-classnames.js'
import cssModule from './styles.module.css'

export type Props = {
  className?: string
  type?: string | string[]
  targetSelector?: string
  onEvent?: (e: Event) => void
  content?: ReactNode
  children?: ReactNode
}

export const EventListenerComponent = ({
  className,
  type,
  targetSelector,
  onEvent,
  content,
  children
}: Props): JSX.Element => {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (onEvent === undefined
      || type === undefined
      || root === null) return
    const typeArr = Array.isArray(type)
      ? type
      : [type]
    const elements = Array.from(targetSelector === undefined
      ? [root]
      : root.querySelectorAll(targetSelector))

    // Add listeners
    elements.forEach(elt => {
      typeArr.forEach(type => {
        elt.addEventListener(type, onEvent)
      })
    })

    // Cleanup function to remove listeners
    return () => {
      elements.forEach(elt => {
        typeArr.forEach(type => {
          elt.removeEventListener(type, onEvent)
        })
      })
    }
  }, [targetSelector, type, onEvent])

  // Class names & rendering
  const c = clss(eventListener, { cssModule })
  const wrapperClassName = [c(null), className].filter(isNotFalsy).join(' ')
  return <span className={wrapperClassName} ref={rootRef}>
    {children}
    {content}
  </span>
}
