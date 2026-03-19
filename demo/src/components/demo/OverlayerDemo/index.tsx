import { useState, type FunctionComponent } from 'react'
import {
  Overlayer,
  type Props as OverlayerProps
} from '~/components/Overlayer/index.js'
import { overlayer as publicClassName } from '~/components/public-classnames.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'

const name = 'Overlayer'
const description = ``

const tsxDetails = ``

const demoStyles = `
.${publicClassName} {
  position: relative;
}

.${publicClassName}__overlay {
  position: absolute;
  bottom: calc(100% - var(--PRIVATE-top));
  left: var(--PRIVATE-left);
  transform: translateX(var(--PRIVATE-translate-x));
}
`

const demoProps: OverlayerProps = {
  children: <div style={{
    width: '100%',
    height: '40vw',
    backgroundColor: 'coral'
  }} />,
  overlays: [{
    content: 'Simple centered label',
    xPercent: 50,
    yPercent: 50,
    justify: 'right'
  }, {
    content: <div>Div in the corner</div>,
    xPercent: 10,
    yPercent: 90,
    justify: 100
  }, {
    content: <div>Div in the corner</div>,
    xPercent: 10,
    yPercent: 90,
    justify: 0
  }]
}

export const OverlayerDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={demoProps}
    demoStyles={demoStyles}>
    <Overlayer {...demoProps} />
  </CompDisplayer>
}
