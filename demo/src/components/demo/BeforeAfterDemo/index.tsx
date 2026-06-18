import { type FunctionComponent } from 'react'
import {
  BeforeAfter,
  type Props as BeforeAfterProps
} from '~/components/BeforeAfter/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import {
  beforeAfter as publicClassName,
} from '~/components/public-classnames.js'

const name = 'BeforeAfter'

const description = ``

/* Demo CSS */
const demoStyles = ``

/* TSX Details */

const tsxDetails = ``

const demoProps: BeforeAfterProps = {
  actionHandlers: {
    dragged: (x, y) => console.log(x, y),
    clicked: (x, y) => console.log(x, y)
  }
}

export const BeforeAfterDemo: FunctionComponent = () => {
  return <CompDisplayer
  name={name}
  demoStyles={demoStyles}
  description={description}
  demoProps={demoProps as Record<string, unknown>}
  tsxDetails={tsxDetails}>
    <BeforeAfter {...demoProps} />
  </CompDisplayer>
}
