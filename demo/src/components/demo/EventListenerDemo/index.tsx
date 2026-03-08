import { type FunctionComponent } from 'react'
import {
  EventListenerComponent,
  type Props as ELCompProps
} from '~/components/EventListener/index.js'
import { eventListener as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'EventListenerComponent'

/** Description */
const description = `
Component that attaches one or multiple DOM event listeners to its root element
or to matching descendants.

@param props - Component properties
@see {@link Props}
@returns A span element wrapping \`children\`, with configured event listeners.`


const tsxDetails = `
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
}`

const demoStyles = `
.${publicClassName} > .${publicClassName} {
  padding: 40px;
  background: cornflowerblue;
  cursor: pointer;
}`

const demoProps: ELCompProps = {
  type: 'click',
  onEvent: () => console.log('click'),
  children: <EventListenerComponent
    type='mouseenter'
    onEvent={() => console.log('mouseenter')}>
    Click or hover me and check the console!
  </EventListenerComponent>
}

export const EventListenerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <EventListenerComponent {...demoProps} />
  </CompDisplayer>
}
