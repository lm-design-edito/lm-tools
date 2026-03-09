import { useState, useEffect, type FunctionComponent } from 'react'
import {
  Subtitles,
  type Props as SubtitlesProps
} from '~/components/Subtitles/index.js'
import { CompDisplayer } from '../../utils/CompDisplayer/index.js'
import { subtitles as publicClassName } from '~/components/public-classnames.js'

const name = 'Subtitles'
const description = `
Subtitle synchronization component. Fetches or receives an SRT source, parses it,
and renders subtitle groups whose individual spans are styled according to the
current media timecode.

### Group elements
Each subtitle group is a \`<div>\` with the following:
- \`--curr\` modifier when the group contains the subtitle at the current timecode.
- \`data-start-sub-pos\` — ID of the first subtitle in the group.
- \`data-end-sub-pos\` — ID of the last subtitle in the group.

### Subtitle span elements
Each individual subtitle is a \`<span>\` with the following:
- \`--prev\` modifier when the subtitle's start time is at or before the last elapsed subtitle.
- \`--curr\` modifier when \`timecodeMs\` falls within the subtitle's \`[start, end]\` interval.
- \`data-sub-pos\` — the subtitle's numeric ID from the SRT source.

@param props - Component properties.
@see {@link Props}
@returns A root \`<div>\` containing the rendered subtitle groups, or an empty \`<div>\`
when \`timecodeMs\` is undefined or no subtitles have been parsed yet.`

const tsxDetails = `
/**
 * Props for the {@link Subtitles} component.
 *
 * @property src - URL of an SRT file to fetch. Ignored if \`srtFileContent\` is provided.
 * If both are undefined, no subtitles are loaded.
 * @property srtFileContent - Raw SRT string used directly, bypassing any network fetch.
 * Takes precedence over \`src\`.
 * @property subsGroups - Optional array of subtitle IDs that act as group boundaries,
 * splitting the full subtitle list into named sections. If omitted, all subtitles
 * belong to a single group.
 * @property timecodeMs - Current media position in milliseconds. Drives which subtitles
 * receive the \`--prev\` and \`--curr\` modifiers. When \`undefined\`, nothing is rendered.
 * @property isEnded - When \`true\`, forces the last group to be treated as current,
 * regardless of \`timecodeMs\`. Useful to keep the final subtitle group visible after
 * media playback finishes.
 * @property onSubsLoad - Callback invoked with the raw SRT string after a successful
 * fetch and parse. Not called when \`srtFileContent\` is used directly.
 * @property onSubsError - Callback invoked with an \`Error\` if the fetch or parse step fails.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the root element, after the subtitle groups.
 */
export type Props = PropsWithChildren<WithClassName<{
  src?: string
  srtFileContent?: string
  subsGroups?: number[]
  timecodeMs?: number
  isEnded?: boolean
  onSubsLoad?: (subs?: string) => void
  onSubsError?: (error?: Error) => void
}>>`


/* Demo CSS */
export const demoStyles = `
.${publicClassName} {
  position: relative;
}

.${publicClassName}__group,
.${publicClassName}__sub {
  opacity: 0;
  transition: opacity 0.3s ease-in;
}

.${publicClassName}__group.${publicClassName}__group--curr,
.${publicClassName}__group.${publicClassName}__group--prev,
.${publicClassName}__sub.${publicClassName}__sub--curr,
.${publicClassName}__sub.${publicClassName}__sub--prev {
  opacity: 1;
}`

const srtFileContent = `1
00:00:00,599 --> 00:00:00,608
Il faut

2
00:00:00,709 --> 00:00:00,888
que

3
00:00:01,000 --> 00:00:01,012
j'enlève`

const demoProps: SubtitlesProps = {
  src: 'https://assets-decodeurs.lemonde.fr/redacweb/2305-audio-quote-assets/massyka.srt',
  timecodeMs: 0
}

const demoNextTickTimecode = 500
const demoMaxTimecode =  29000 + demoNextTickTimecode

export const SubtitlesDemo: FunctionComponent = () => {
  const [timecodeMs, setTimecodeMs] = useState(0)
  return <CompDisplayer
    name={name}
    description={description}
    tsxDetails={tsxDetails}
    demoProps={{ ...demoProps, timecodeMs }}
    demoStyles={demoStyles}>
    <input  
      type='range'
      min={0}
      max={demoMaxTimecode}
      value={timecodeMs}
      onChange={(e) => setTimecodeMs(Number(e.target.value))} />
    <span> {timecodeMs}ms</span>
    <Subtitles {...demoProps} timecodeMs={timecodeMs} />
  </CompDisplayer>
}
