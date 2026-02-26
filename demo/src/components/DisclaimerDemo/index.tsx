import { type FunctionComponent } from 'react'
import {
  Disclaimer,
  type Props as DisclaimerProps
} from '~/components/Disclaimer/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'Disclaimer'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props: DisclaimerProps = {
  content: 'Are you sure you want to see this?',
  togglerContent: 'Lets go',
  children: <div>Disclosed content</div>
}

export const DisclaimerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <Disclaimer {...props} />
  </CompDisplayer>
}
