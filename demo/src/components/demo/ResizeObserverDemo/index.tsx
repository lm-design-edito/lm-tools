import { type FunctionComponent } from 'react'
import {
  ResizeObserverComponent,
  type Props as RSOProps
} from '~/components/ResizeObserver/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'ResizeObserverComponent'

const description = `
Component that observes its own size changes and exposes the dimensions.
Updates are exposed both via data attributes (e.g., \`data-width\`) and CSS custom properties
(e.g., \`--<prefix>-width\`, \`--<prefix>-width-px\`) for styling or scripting purposes.
@param props - Component properties
@see {@link Props}
@returns A div wrapping \`children\`, with resize observation applied.`

const tsxDetails = `
type ROEntryWithBoundingRect = {
  entry: ResizeObserverEntry
  boundingClientRect: DOMRect
}

/**
 * Props for the ResizeObserverComponent.
 *
 * @property className - Optional additional class name(s) applied to the root element.
 * @property onResize - Callback invoked when the element is resized.
 * Receives the \`ResizeObserverEntry\` from the observed element, or \`undefined\` if none.
 * @property children - React children rendered inside the root element. Only the root element is observed
 */
export type Props = PropsWithChildren<WithClassName<{
  onResize?: (entry: ROEntryWithBoundingRect) => void
}>>`

const demoProps: RSOProps = {
  children: <div style={{
    width: '50%',
    height: '600px',
    backgroundColor: 'coral',
    position: 'relative'
  }}>
    <span>resize me!!</span>
    <div style={{
      position: 'absolute',
      left: '70%',
      width: '70%',
      height: '200px',
      backgroundColor: 'cornflowerblue'
    }} />
  </div>
}

export const ResizeObserverDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}>
    <ResizeObserverComponent {...demoProps} />
  </CompDisplayer>
}
