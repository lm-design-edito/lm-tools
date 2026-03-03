import { type FunctionComponent } from 'react'
import {
  Subtitles,
  type Props as SubtitlesProps
} from '~/components/Subtitles/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'

const name = 'Subtitles'
const description = 'Some description'
const tsxDetails = `'Use wisely'`

const props1: SubtitlesProps = {
  src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt',
  timecodeMs: 29752
}

const srtFileContent = `
1
00:00:00,599 --> 00:00:00,608
Il faut

2
00:00:00,709 --> 00:00:00,888
que

3
00:00:01,000 --> 00:00:01,012
j'enlève`

const props2: SubtitlesProps = {
  src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt',
  srtFileContent,
  timecodeMs: 29752
}

export const SubtitlesDemo: FunctionComponent = () => {
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}>
    <Subtitles {...props1} />
    <Subtitles {...props2} />
  </CompDisplayer>
}
