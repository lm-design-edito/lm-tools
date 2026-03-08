import { type FunctionComponent } from 'react'
import {
  ResizeObserverComponent,
  type Props as RSOProps
} from '~/components/ResizeObserver/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'ResizeObserverComponent'
const description = 'Some description'
const tsxDetails = `
type ResizeObserverEntryWithBoundingRect = {
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
  onResize?: (entry: ResizeObserverEntryWithBoundingRect) => void
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
