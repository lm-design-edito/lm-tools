import { useState, useEffect, type FunctionComponent } from 'react'
import {
  Image,
  type Props as ImageProps
} from '~/components/Image/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'
import { image as publicClassName } from '~/components/public-classnames.js'

const name = 'Image'
const description = <>
 A component that display an img tag.
</>
const tsxDetails = `'Use wisely'`


/* Demo CSS */
const demoStyles = `
`

const props: ImageProps = {
    src: 'https://assets-decodeurs.lemonde.fr/redacweb/2602-campus-engagement/campus-engagement-ep01-1.jpg',
    alt: 'Image demo'
}

export const ImageDemo: FunctionComponent = () => {
  const [isImageOn, setIsImageOn] = useState(false)
  
  return (
    <CompDisplayer
      name={name}
      demoStyles={demoStyles}
      description={description}
      demoProps={ props }
      tsxDetails={tsxDetails}
    >
      <Image {...props} />
    </CompDisplayer>
  )
}
