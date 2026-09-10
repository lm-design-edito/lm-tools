import {
  type FunctionComponent,
  useEffect,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { toError } from '../../agnostic/misc/cast/index.js'
import { parseSrt } from '../../agnostic/subtitles/parse-srt/index.js'
import type { SrtCue } from '../../agnostic/subtitles/parse-srt/types.js'
import type { WithClassName } from '../utils/types.js'
import {
  mergeClassNames,
  useChangeDispatch
} from '../utils/index.js'
import { subtitles as publicClassName } from '../public-classnames.js'
import {
  lastElapsedPos as toLastElapsedPos,
  normalizeGroupBoundaries,
  toCurrentGroup,
  toSubGroups
} from './utils.js'
import cssModule from './styles.module.css'

/**
 * Props for the {@link Subtitles} component.
 *
 * The three sources are tried in order — `cues`, then `srtFileContent`, then `src` —
 * and the first one present wins. With none of them, nothing is rendered.
 *
 * @property cues - Already parsed cues, used as they are. Spares a consumer that
 * holds them — from a previous `onParsed`, or from its own call to `parseSrt` —
 * having to serialise them back to SRT.
 * @property srtFileContent - A raw SRT string, parsed directly with no network call.
 * @property src - URL of an SRT file to fetch and parse.
 * @property subsGroups - Positions to split the cues on, each the **position** of a
 * group's last cue — not the id written in the file. Order doesn't matter, and
 * duplicate or out-of-range positions are ignored. Omitted, every cue belongs to one
 * group.
 * @property timecodeMs - Current media position in milliseconds. Drives the `--prev`
 * and `--curr` modifiers. While it is `undefined`, no group is rendered.
 * @property isEnded - When `true`, the last group is the current one whatever
 * `timecodeMs` says, so the closing subtitles stay up once playback is over.
 * @property onLoaded - Called with the raw SRT string once fetched. Only fires for
 * `src`, since the other two sources fetch nothing.
 * @property onParsed - Called with the cues after they changed. Never on mount.
 * @property onLoadFailed - Called with an `Error` when the fetch fails, the response
 * is not ok, or the parse throws.
 * @property className - Optional additional class name(s) applied to the root element.
 */
export type Props = WithClassName<{
  cues?: SrtCue[]
  srtFileContent?: string
  src?: string
  subsGroups?: number[]
  timecodeMs?: number
  isEnded?: boolean
  onLoaded?: (subs: string) => void
  onParsed?: (subs: SrtCue[]) => void
  onLoadFailed?: (error: Error) => void
}>

/**
 * Subtitle synchronization component. Takes an SRT source — parsed cues, a raw
 * string, or a URL to fetch — and renders its cues in groups, marking where the
 * media currently is.
 *
 * ### CSS elements
 * - `lm-subtitles` — the root. Carries `--loading` while a fetch is in flight, and
 * `--error` once one failed. Both are cleared when a new source starts loading.
 * - `lm-subtitles__group` — one per group. Carries `--curr` when the reader is in it.
 * - `lm-subtitles__sub` — one per cue. Carries `--prev` once the playhead has passed
 * its start, and `--curr` while the playhead is inside its interval.
 *
 * ### Data attributes
 * On a group: `data-start-sub-pos` and `data-end-sub-pos`, its bounds as positions
 * in the cue array. On a cue: `data-sub-pos`, its position, and `data-sub-id`, the
 * number written in the file.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` holding the subtitle groups, empty while there is no
 * timecode or no cue.
 *
 * @remarks
 * Uncontrolled only. The cues are state, fed by whichever source is set: there is no
 * controlled variant, because a consumer holding its own cues passes them as `cues`
 * and owns them outright.
 *
 * Cues are rendered back to back with no separator — the space between two of them
 * is presentation, and belongs in a stylesheet (`lm-subtitles__sub + …::before`, a
 * `word-spacing`, whatever suits) rather than in the text content, where it would
 * come back out of `textContent`.
 */
export const Subtitles: FunctionComponent<Props> = ({
  cues,
  srtFileContent,
  src,
  subsGroups,
  timecodeMs,
  isEnded,
  className,
  onLoaded,
  onParsed,
  onLoadFailed
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [parsedSubs, setParsedSubs] = useState<SrtCue[]>([])

  // The load handlers are read through refs so the effect below can depend on the
  // source alone. Depending on their identity re-fetches on every parent render —
  // and `Video` re-renders several times a second as the timecode moves.
  const onLoadedRef = useRef(onLoaded)
  const onLoadFailedRef = useRef(onLoadFailed)
  useEffect(() => {
    onLoadedRef.current = onLoaded
    onLoadFailedRef.current = onLoadFailed
  })

  // State dispatch
  useChangeDispatch(parsedSubs, onParsed)

  // Fx. dep. cues, srtFileContent, src - Load from whichever source is set
  useEffect(() => {
    setIsLoading(false)
    setLoadError(null)
    if (cues !== undefined) return setParsedSubs(cues)
    if (srtFileContent !== undefined) return setParsedSubs(parseSrt(srtFileContent))
    if (src === undefined) return setParsedSubs([])
    let isCurrent = true
    setIsLoading(true)
    const load = async (): Promise<void> => {
      try {
        const response = await fetch(src)
        // A 404 serves an HTML page: `text()` resolves, the parse yields nothing, and
        // without this the component would report a success it never had.
        if (!response.ok) throw new Error(`Could not load ${src}: ${response.status} ${response.statusText}`)
        const srtContent = await response.text()
        if (!isCurrent) return
        onLoadedRef.current?.(srtContent)
        setParsedSubs(parseSrt(srtContent))
      } catch (error) {
        if (!isCurrent) return
        const asError = toError(error)
        setLoadError(asError)
        setParsedSubs([])
        onLoadFailedRef.current?.(asError)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    void load()
    return () => { isCurrent = false }
  }, [cues, srtFileContent, src])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      loading: isLoading,
      error: loadError !== null
    }),
    className
  )
  const lastElapsedPos = toLastElapsedPos(parsedSubs, timecodeMs)
  const boundaries = normalizeGroupBoundaries(subsGroups, parsedSubs.length - 1)
  const groups = toSubGroups(boundaries, parsedSubs.length - 1)
  const currentGroup = toCurrentGroup(groups, lastElapsedPos, isEnded)
  return <div className={rootClss}>
    {timecodeMs !== undefined && groups.map(group => {
      const groupClss = c('group', { curr: currentGroup?.startPos === group.startPos })
      return <div
        key={group.startPos}
        className={groupClss}
        data-start-sub-pos={group.startPos}
        data-end-sub-pos={group.endPos}>
        {parsedSubs.slice(group.startPos, group.endPos + 1).map((sub, indexInGroup) => {
          const subPos = group.startPos + indexInGroup
          const subClss = c('sub', {
            prev: subPos <= lastElapsedPos,
            curr: timecodeMs >= sub.start && timecodeMs <= sub.end
          })
          return <span
            key={subPos}
            className={subClss}
            data-sub-pos={subPos}
            data-sub-id={sub.id}>
            {sub.content}
          </span>
        })}
      </div>
    })}
  </div>
}
