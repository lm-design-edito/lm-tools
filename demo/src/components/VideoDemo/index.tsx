import { type FunctionComponent } from 'react'
import {
  Video,
  type Props as VideoProps
} from '~/components/Video/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

import { video as publicClassName } from '~/components/public-classnames.js'

const name = 'Video'
const description = <>
  Component to display a video.<br /><br />
  Wordings can be customed. <br />
</>
const tsxDetails = `'Use wisely'`


/* Demo CSS */
const demoStyles = `

.${publicClassName}__timeline {
  position: relative;
  width: 100%;
  height: 10px;
  background-color: lightgray;
}
.${publicClassName}__timeline:before {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: red;
  transform-origin: left;
  transform: scaleX(var(--progress));
}
`

const props: VideoProps = {
  pauseBtnContent: 'Mettre en pause',
  playBtnContent: 'Lire',
  soundOnBtnContent: 'Activer le son',
  soundOffBtnContent: 'Désactiver le son',
  fullscreenBtnContent: 'Passer en plein écran',
  sources: [{
    src: 'https://assets-decodeurs.lemonde.fr/redacweb/2507-st-louis/siege.mp4',
    type: 'video/mp4'
  }],
  controls: true,
  autoPlay: true,
  loop: true,
  tracks: [{
    kind: 'subtitles',
    src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt',
    srclang: 'fr',
    label: 'Français',
    default: true
  }]
}

export const VideoDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoStyles={demoStyles}
    demoProps={props}
    >
    <Video {...props} />
  </CompDisplayer>
}
