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
Exposes scroll metrics — both the document's and its own — as CSS custom
properties on its root element, so scroll-driven styling needs no JavaScript
of its own.

### Root element modifiers
- \`--tracking\` — it is measuring. The state, where \`--measured\` is its consequence:
  a listener that has stopped keeps its last values.
- \`--measured\` — a first measurement landed.
- \`--scrolling-up\` / \`--scrolling-down\` — the document's last known direction.

### Viewport behaviours
\`whenVisible\` and \`whenHidden\` take \`track\`, \`untrack\`, or a list, each optionally
suffixed by \`:once\` and \`:force\`. The old \`startOnVisible\` is
\`defaultTracking={false}\` plus \`whenVisible='track'\`, and \`stopOnHidden\` is
\`whenHidden='untrack'\` — which is exactly what this demo does.

### CSS custom properties on the root element
Each measurement comes as a \`px\` length under its bare name, and as a \`-raw\` twin holding the plain number:
- \`--{prefix}-window-width\`, \`--{prefix}-window-height\`
- \`--{prefix}-html-width\`, \`--{prefix}-html-height\`
- \`--{prefix}-scroll-x\`, \`--{prefix}-scroll-y\`
- \`--{prefix}-width\`, \`--{prefix}-height\`
- \`--{prefix}-offset-x\`, \`--{prefix}-offset-y\`

Ratios are unitless and have no twin:
- \`--{prefix}-window-scrolled-x-ratio\`, \`--{prefix}-window-scrolled-y-ratio\` —
  how far the document is scrolled.
- \`--{prefix}-self-inner-scrolled-x-ratio\`, \`--{prefix}-self-inner-scrolled-y-ratio\` —
  \`0\` when the element's start edge meets the viewport's start edge, \`1\` when
  its end edge meets the viewport's end edge. The span where it is fully visible.
- \`--{prefix}-self-outer-scrolled-x-ratio\`, \`--{prefix}-self-outer-scrolled-y-ratio\` —
  \`0\` when the element is about to enter the viewport, \`1\` once it has fully
  left it. The span where it overlaps the viewport at all.

@param props - Component properties.
@see {@link Props}
@returns A container exposing the metrics, with the children as its own. The observer
runs on the root itself, so there is no box between this element and them — which
matters here more than anywhere: a stylesheet animating on these properties cannot
move what sits one level below.

@remarks
All mounted instances share a single pair of \`scroll\` / \`resize\` listeners and
a single measurement pass per animation frame — the document is measured once
for everyone, each element only for itself. The listeners exist only while at
least one instance is tracking.`

const tsxDetails = `/**
 * Props for the {@link ScrollListener} component.
 *
 * @property tracking - Whether it is measuring, taken over by the consumer.
 * @property defaultTracking - Whether it starts measuring on mount, \`true\` by default.
 * @property onIsTrackingChanged - Called once the effective tracking state changed.
 * @property onScrollStateChanged - Called after the measured {@link ScrollState}
 * changed. Receives \`undefined\` until the first measurement lands.
 * @property onVisibilityChanged - Called when it enters or leaves the viewport, on the
 * settled state.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React nodes rendered inside the scroll listener container.
 */
export type Props = PropsWithChildren<WithClassName<{
  tracking?: boolean
  defaultTracking?: boolean
  onIsTrackingChanged?: (isTracking: boolean) => void
  onScrollStateChanged?: (scrollState?: ScrollState) => void
  onScrollProgressChanged?: (progress: number) => void
  onScrollDirectionChanged?: (direction: 'up' | 'down') => void
}>>
  & ViewportBehaviours<ScrollListenerAction>
  & { behavioursSuspended?: boolean }`

const demoStyles = ``

// Les deux anciennes props, dites dans la grammaire commune : `startOnVisible` est
// `defaultTracking: false` plus `whenVisible: 'track'`, et `stopOnHidden` est
// `whenHidden: 'untrack'`.
const demoProps: ScrollListenerProps = {
  defaultTracking: false,
  whenVisible: 'track',
  whenHidden: 'untrack',
  children: <div style={{
    backgroundColor: 'yellow',
      width: 700,
      height: 700
    }}>
    <div style={{
      transform: `translateY(calc(var(--lm-scroll-listener-self-outer-scrolled-y-ratio) * 700px))`
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
