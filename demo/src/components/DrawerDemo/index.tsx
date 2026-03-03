import { type FunctionComponent } from 'react'
import {
  Drawer,
  type Props as DrawerProps
} from '~/components/Drawer/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'Drawer'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props: DrawerProps = {
  initialIsOpened: true,
  openerContent: 'Open this',
  closerContent: 'Close this',
  children: <div style={{ width: 200, height: 200, backgroundColor: 'slateblue' }}></div>
}

export const DrawerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <Drawer {...props} />
  </CompDisplayer>
}
