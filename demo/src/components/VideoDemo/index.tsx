import { type FunctionComponent } from 'react'
import {
  Video,
  type Props as VideoProps
} from '~/components/Video/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'Video'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props1: VideoProps = {
  sources: 'https://assets-decodeurs.lemonde.fr/redacweb/2507-st-louis/siege.mp4',
  controls: true,
  autoPlay: true,
  loop: true
}

const props2: VideoProps = {
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
    tsxDetails={tsxDetails}>
    <Video {...props1} />
    <Video {...props2} />
  </CompDisplayer>
}
