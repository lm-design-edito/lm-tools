import { type FunctionComponent } from 'react'
import {
  IntersectionObserverComponent,
  type Props as IOCompProps
} from '~/components/IntersectionObserver/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'IntersectionObserverComponent'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props: IOCompProps = {
  onIntersection: details => console.log(details),
  children: <div style={{
    backgroundColor: 'red',
    width: 400,
    height: 400
  }} />
}

export const IntersectionObserverDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <IntersectionObserverComponent {...props} />
  </CompDisplayer>
}
