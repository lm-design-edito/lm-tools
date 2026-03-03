import { type FunctionComponent } from 'react'
import {
  ShadowRootComponent,
  type Props as SRCompProps
} from '~/components/ShadowRoot/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'ShadowRootComponent'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props: SRCompProps = {
  children: <div style={{ width: 200, height: 200, backgroundColor: 'slateblue' }}></div>
}

export const ShadowRootDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <ShadowRootComponent {...props} />
  </CompDisplayer>
}
