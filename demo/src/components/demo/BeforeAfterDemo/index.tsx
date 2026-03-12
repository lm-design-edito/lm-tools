import { type FunctionComponent } from 'react'
import {
  type Props as DemoProps
} from '~/components/Demo/index.js'
import { BeforeAfter, type Props as BeforeAfterProps } from '~/components/BeforeAfter/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import {
  beforeAfter as publicClassName,
} from '~/components/public-classnames.js'

const name = 'BeforeAfter'

const description = ``

/* Demo CSS */
const demoStyles = `
.${publicClassName} {
  position: relative;
  display: flex;
  width: fit-content;
}

.${publicClassName}__before {
  position: relative;
  z-index: 1;
  filter: grayscale(100%) sepia(20%); ;
}

.${publicClassName}__after {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  mask-image: linear-gradient(
    to right,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
  -webkit-mask-image: linear-gradient(
    to right,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
}

.${publicClassName}--vertical .${publicClassName}__after {
  mask-image: linear-gradient(
    to bottom,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    black var(--dsed-before-after-ratio-percent),
    transparent var(--dsed-before-after-ratio-percent)
  );
}
`

/* TSX Details */
const tsxDetails = `
`

const demoProps1: BeforeAfterProps = {
  defaultRatio: 0.2,
  beforeContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="Before" />,
  afterContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="After" />,
  actionHandlers: {
    pointer: (e, targetHRatio, targetVRatio, ratio, element) => {
      // console.log('pointer'x, { e, targetHRatio, targetVRatio, ratio, element })
    }
  }
}

const demoProps2: BeforeAfterProps = {
  defaultRatio: 0.5,
  beforeContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="Before" />,
  afterContent: <img draggable={false} src="https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg" alt="After" />,
  direction: 'vertical',
  actionHandlers: {
    pointer: (e, targetHRatio, targetVRatio, ratio, element) => {
      // console.log('pointer'x, { e, targetHRatio, targetVRatio, ratio, element })
    }
  }
}

export const BeforeAfterDemo: FunctionComponent = () => {

  return <CompDisplayer
  name={name}
  demoStyles={demoStyles}
  description={description}
  demoProps={demoProps1 as Record<string, unknown>}
  tsxDetails={tsxDetails}>
    <BeforeAfter {...demoProps1} />
    <BeforeAfter {...demoProps2} />
  </CompDisplayer>
}
