import { useState, useEffect, type FunctionComponent } from 'react'
import {
  Subtitles,
  type Props as SubtitlesProps
} from '~/components/Subtitles/index.js'
import { CompDisplayer } from '../CompDisplayer/index.js'
import { subtitles as publicClassName } from '~/components/public-classnames.js'

const name = 'Subtitles'
const description = 'Some description'
const tsxDetails = `'Use wisely'`


/* Demo CSS */
const demoStyles = `
.${publicClassName} {
  position: relative;
}

.${publicClassName}__group,
.${publicClassName}__sub {
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

.${publicClassName}__group--curr,
.${publicClassName}__group--prev,
.${publicClassName}__sub--curr,
.${publicClassName}__sub--prev {
  opacity: 1;
`

const props1: SubtitlesProps = {
  src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/chantal.srt',
  timecodeMs: 0
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
  timecodeMs: 0
}

const demoNextTickTimecode = 500
const demoMaxTimecode =  39210 + demoNextTickTimecode

export const SubtitlesDemo: FunctionComponent = () => {
  const [timecodeMs, setTimecodeMs] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimecodeMs(prev => {
        const next = prev + demoNextTickTimecode
        if (next >= demoMaxTimecode) {
          clearInterval(interval)
        }
        return next
      })
    }, demoNextTickTimecode)
    return () => clearInterval(interval)  
  }, []);

  console.log('timecodeMs', timecodeMs)

  return <CompDisplayer
    name={name}
    demoStyles={demoStyles}
    description={description}
    tsxDetails={tsxDetails}>
    <Subtitles {...props1} timecodeMs={timecodeMs} />
    <Subtitles {...props2} timecodeMs={timecodeMs} />
  </CompDisplayer>
}
