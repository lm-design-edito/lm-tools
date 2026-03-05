import { type FunctionComponent } from 'react'
import {
  EventListenerComponent,
  type Props as ELCompProps
} from '~/components/EventListener/index.js'
import { eventListener as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'EventListenerComponent'
const description = <>Event listener wrapper around arbitrary children</>
const tsxDetails = `
type Props = {
  className?: string
  type?: string | string[]
  targetSelector?: string
  onEvent?: (e: Event) => void
  children?: ReactNode
}

`

const demoStyles = `
  .${publicClassName} > .${publicClassName} {
    padding: 40px;
    background: cornflowerblue;
    cursor: pointer;
  }

`

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
