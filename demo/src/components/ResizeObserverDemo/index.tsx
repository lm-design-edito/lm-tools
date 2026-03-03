import { type FunctionComponent } from 'react'
import {
  ResizeObserverComponent,
  type Props as RSOProps
} from '~/components/ResizeObserver/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'ResizeObserverComponent'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props: RSOProps = {
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
    tsxDetails={tsxDetails}>
    <ResizeObserverComponent {...props} />
  </CompDisplayer>
}
