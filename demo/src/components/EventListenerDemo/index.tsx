import { type FunctionComponent } from 'react'
import {
  EventListenerComponent,
  type Props as ELCompProps
} from '~/components/EventListener/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'EventListenerComponent'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props: ELCompProps = {
  type: 'click',
  onEvent: () => console.log('click'),
  children: <EventListenerComponent
    type='mouseenter'
    onEvent={() => console.log('mouseenter')}>
    Child
  </EventListenerComponent>
}

export const EventListenerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <EventListenerComponent {...props} />
  </CompDisplayer>
}
