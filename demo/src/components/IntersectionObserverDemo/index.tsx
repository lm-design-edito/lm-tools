import { useEffect, type FunctionComponent } from 'react'
import {
  IntersectionObserverComponent,
  type Props as IOCompProps
} from '~/components/IntersectionObserver/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'IntersectionObserverComponent'
const description = <>
  Wrapper around its children that triggers css classes on intersection, optional <code>onIntersection</code> handler via its props, and dispatches optional global event via <code>dispatchedEventType</code>
</>
const tsxDetails = `
type ObserverOptions = {
  root?: HTMLElement
  rootMargin?: string
  threshold?: number[] | number
}

type Props = PropsWithChildren<WithClassName<{
  dispatchedEventType?: string
  onIntersection?: (details: {
    ioEntry?: IOE | undefined
    observer: IO
  }) => void
} & ObserverOptions>>

`

const dispatchedEventType = 'demoiocomp:intersection'
const demoProps: IOCompProps = {
  dispatchedEventType,
  onIntersection: details => console.log(details),
  children: <div style={{
    backgroundColor: 'red',
    width: 400,
    height: 400
  }} />
}

export const IntersectionObserverDemo: FunctionComponent = () => {
  useEffect(() => {
    const listener = (e: Event) => {
      console.log('Event caught!')
      console.log(e)
    }
    window.addEventListener(dispatchedEventType, listener)
    return () => window.removeEventListener(dispatchedEventType, listener)
  }, [])
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}>
    <div style={{ height: '100vh' }}>Scroll down to make the IO comp appear and check the console</div>
    <IntersectionObserverComponent {...demoProps} />
  </CompDisplayer>
}
