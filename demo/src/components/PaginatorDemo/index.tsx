import { type FunctionComponent } from 'react'
import {
  Paginator,
  type Props as PaginatorProps
} from '~/components/Paginator/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'Paginator'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props: PaginatorProps = {
  thresholdOffsetPercent: 80,
  children: [
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'darkgrey' }}>Page 1</div>,
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'tan' }}>Page 2</div>,
    <div style={{ width: '100%', height: '120vh', backgroundColor: 'plum' }}>Page 3</div>
  ]
}

export const PaginatorDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <Paginator {...props} />
  </CompDisplayer>
}
