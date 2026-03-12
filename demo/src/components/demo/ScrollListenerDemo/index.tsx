import { useEffect, useState, type FunctionComponent } from 'react'
import {
  ScrollListener,
  type Props as ScrollListenerProps
} from '~/components/ScrollListener/index.js'
import { random, randomInt } from '~/agnostic/random/random/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { scrollListener } from '~/components/public-classnames.js'

const name = 'ScrollListener'

const description = `
Component that listens to global scroll events and exposes scroll-related data
through CSS custom properties and optional state callbacks.

The component measures both global scroll metrics (window size, document size,
scroll offsets) and local metrics relative to the component (dimensions and
position within the document).

Computed values are exposed as CSS variables on the root element, enabling
scroll-driven styling without additional JavaScript.

Scroll observation can optionally start only when the component becomes visible
and stop when it leaves the viewport.

@param props - Component properties.
@see {@link Props}
@returns A container element exposing scroll metrics through CSS variables and
wrapping its children inside an IntersectionObserver boundary.`

const tsxDetails = `/**
 * Props for the ScrollListener component.
 *
 * @property startOnVisible - When \`true\`, scroll tracking starts only when the component
 * becomes visible in the viewport. Visibility is detected using an IntersectionObserver.
 * @property stopOnHidden - When \`true\`, scroll tracking stops when the component leaves
 * the viewport.
 * @property stateHandlers - Optional callbacks invoked when internal state changes.
 * @property stateHandlers.scrollDataChanged - Called whenever the computed scroll data
 * changes. Receives the current {@link ScrollState} or \`undefined\`.
 * @property stateHandlers.visibilityChanged - Called when the visibility state of the
 * component changes. Receives \`true\` when the component is intersecting the viewport,
 * otherwise \`false\`.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React nodes rendered inside the scroll listener container.
 */
export type Props = PropsWithChildren<WithClassName<{
  stopOnHidden?: boolean
  startOnVisible?: boolean
  stateHandlers?: {
    scrollDataChanged?: (scrollData?: ScrollState) => void
    visibilityChanged?: (isVisible: boolean) => void
  }
}>>`

const demoStyles = ``

const demoProps: ScrollListenerProps = {
  stopOnHidden: true,
  startOnVisible: true,
  children: <div style={{
    backgroundColor: 'yellow',
      width: 700,
      height: 700
    }}>
    <div style={{
      transform: `translateY(calc(var(--dsed-scroll-listener-self-outer-scrolled-y-ratio) * 700px))`
    }}>SCROLL ME BABYYYY</div>
  </div>
}

export const ScrollListenerDemo: FunctionComponent = () => {
  const [count, setCount] = useState(1)
  useEffect(() => {}, [])
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    {Array(Math.max(count, 0)).fill(null).map(e => <>
      <div style={{ height: '200vh' }}>Scroll down...</div>
      <ScrollListener {...demoProps} />
      <div style={{ height: '200vh' }}>Scroll down...</div>
    </>)}
  </CompDisplayer>
}
