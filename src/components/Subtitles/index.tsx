import {
  type FunctionComponent,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { toError } from '../../agnostic/misc/cast/index.js'
import { unknownToString } from '../../agnostic/errors/unknown-to-string/index.js'
import type { WithClassName } from '../utils/types.js'
import { mergeClassNames } from '../utils/index.js'
import { subtitles as publicClassName } from '../public-classnames.js'
import cssModule from './styles.module.css'

/**
 * A single parsed subtitle entry from an SRT file.
 *
 * @property id - Sequential subtitle number.
 * @property start - Start time in milliseconds.
 * @property end - End time in milliseconds.
 * @property content - Subtitle text content.
 */
export type ParsedSub = {
  id: number
  start?: number
  end?: number
  content?: string
}

/**
 * The inclusive ID boundaries of a subtitle group.
 *
 * @property startId - ID of the first subtitle in the group.
 * @property endId - ID of the last subtitle in the group.
 */
export type SubGroupBoundaries = {
  startId: number
  endId: number
}

/** Converts an SRT timecode (hh:mm:ss,ms) to milliseconds. */
const getTimecodeToMs = (timecode: string): number => {
  const [hours = '0', minutes = '0', secondsAndMs = '0,0'] = timecode.split(':')
  const [seconds = '0', milliseconds = '0'] = secondsAndMs.split(',')
  let result = parseInt(hours) * 60 * 60 * 1000
  result += parseInt(minutes) * 60 * 1000
  result += parseInt(seconds) * 1000
  result += parseInt(milliseconds)
  return result
}

/** Parses a raw SRT subtitle text into a list of {@link ParsedSub} entries. */
const parseSubs = (rawSubs: string): ParsedSub[] => {
  const numberRegex = /^\d+$/v
  const timecodeRegex = /^[0-9]+:[0-9]+:[0-9]+,[0-9]+\s*-->\s*[0-9]+:[0-9]+:[0-9]+,[0-9]+$/v
  const parsedSubs: ParsedSub[] = []

  rawSubs.split('\n').forEach(line => {
    if (line.trim() === '') return
    const lastParsedSub = parsedSubs[parsedSubs.length - 1]
    const matchId = line.match(numberRegex)
    const matchTimecode = line.match(timecodeRegex)
    // id
    if (matchId !== null) {
      if (lastParsedSub === undefined
        || lastParsedSub.content !== undefined) {
        const parsedSub: ParsedSub = { id: parseInt(line) }
        parsedSubs.push(parsedSub)
        return
      }
    }

    // timecode
    if (matchTimecode !== null) {
      if (lastParsedSub?.id !== undefined) {
        const [rawStart = '', rawEnd = ''] = line.split('-->')
        const startTime = rawStart.trim()
        const endTime = rawEnd.trim()
        lastParsedSub.start = getTimecodeToMs(startTime)
        lastParsedSub.end = getTimecodeToMs(endTime)
        return
      }
    }

    // content
    if (lastParsedSub?.id !== undefined
      && lastParsedSub.start !== undefined
      && lastParsedSub.end !== undefined) {
      if (lastParsedSub.content !== undefined) {
        lastParsedSub.content += `\n${line}`
        return
      }
      lastParsedSub.content = line
    }
  })

  return parsedSubs
}

/** Computes subtitle groups with their inclusive `startId` / `endId` boundaries. */
const computeSubGroupsWithBoundaries = (
  subsGroups: number[] | undefined,
  highestSubId: number
): SubGroupBoundaries[] => {
  const fallback = [{ startId: 1, endId: highestSubId }]
  if (subsGroups === undefined || subsGroups.length === 0) return fallback
  const emptySubGroupBoundaries: SubGroupBoundaries[] = []
  return subsGroups.reduce(
    (acc, curr, currIndex) => {
      const lastInAcc = acc[acc.length - 1]
      const startId = lastInAcc === undefined ? 1 : lastInAcc.endId + 1
      const endId = curr
      if (currIndex === subsGroups.length - 1
        && endId !== highestSubId) {
        return [
          ...acc,
          { startId, endId },
          { startId: endId + 1, endId: highestSubId }
        ]
      }
      return [...acc, { startId, endId }]
    },
    emptySubGroupBoundaries
  )
}

/** Returns the group holding the last elapsed subtitle, or the last group once playback ended. */
const getCurrentGroup = (
  subsGroupsWithBoundaries: SubGroupBoundaries[],
  lastPrevSubId: number | undefined,
  isEnded: boolean | undefined
): SubGroupBoundaries | undefined => {
  const previousGroups = subsGroupsWithBoundaries.filter(group => group.startId <= (lastPrevSubId ?? 0))
  if (previousGroups.length === 0) return isEnded === true
    ? subsGroupsWithBoundaries[subsGroupsWithBoundaries.length - 1]
    : subsGroupsWithBoundaries[0]
  return previousGroups[previousGroups.length - 1]
}

/**
 * Props for the {@link Subtitles} component.
 *
 * @property src - URL of an SRT file to fetch. Ignored if `srtFileContent` is provided.
 * If both are undefined, no subtitles are loaded.
 * @property srtFileContent - Raw SRT string used directly, bypassing any network fetch.
 * Takes precedence over `src`.
 * @property subsGroups - Optional array of subtitle IDs that act as group boundaries,
 * splitting the full subtitle list into named sections. If omitted, all subtitles
 * belong to a single group.
 * @property timecodeMs - Current media position in milliseconds. Drives which subtitles
 * receive the `--prev` and `--curr` modifiers. When `undefined`, nothing is rendered.
 * @property isEnded - When `true`, forces the last group to be treated as current,
 * regardless of `timecodeMs`. Useful to keep the final subtitle group visible after
 * media playback finishes.
 * @property onLoaded - Callback invoked with the raw SRT string after a successful
 * fetch and parse. Not called when `srtFileContent` is used directly.
 * @property onParsed - Callback invoked with the raw SRT string has been parsed.
 * @property onLoadFailed - Callback invoked with an `Error` if the fetch or parse step fails.
 * @property className - Optional additional class name(s) applied to the root element.
 * @property children - React children rendered inside the root element, after the subtitle groups.
 */
export type Props = PropsWithChildren<WithClassName<{
  src?: string
  srtFileContent?: string
  subsGroups?: number[]
  timecodeMs?: number
  isEnded?: boolean
  onLoaded?: (subs: string) => void
  onParsed?: (subs: ParsedSub[]) => void
  onLoadFailed?: (error: Error) => void
}>>

/**
 * Subtitle synchronization component. Fetches or receives an SRT source, parses it,
 * and renders subtitle groups whose individual spans are styled according to the
 * current media timecode.
 *
 * ### Group elements
 * Each subtitle group is a `<div>` with the following:
 * - `--curr` modifier when the group contains the subtitle at the current timecode.
 * - `data-start-sub-pos` — ID of the first subtitle in the group.
 * - `data-end-sub-pos` — ID of the last subtitle in the group.
 *
 * ### Subtitle span elements
 * Each individual subtitle is a `<span>` with the following:
 * - `--prev` modifier when the subtitle's start time is at or before the last elapsed subtitle.
 * - `--curr` modifier when `timecodeMs` falls within the subtitle's `[start, end]` interval.
 * - `data-sub-pos` — the subtitle's numeric ID from the SRT source.
 *
 * @param props - Component properties.
 * @see {@link Props}
 * @returns A root `<div>` containing the rendered subtitle groups, or an empty `<div>`
 * when `timecodeMs` is undefined or no subtitles have been parsed yet.
 */
export const Subtitles: FunctionComponent<Props> = ({
  src,
  srtFileContent,
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
  const [parsedSubs, setParsedSubs] = useState<ParsedSub[]>([])
  const pParsedSubs = useRef(parsedSubs)

  // State change handlers
  useEffect(() => {
    if (pParsedSubs.current === parsedSubs) return
    onParsed?.(parsedSubs)
  }, [parsedSubs])

  // Effects
  const fetchAndParseSubs = useCallback(async (
    src?: string,
    srtFileContent?: string
  ): Promise<void> => {
    if (srtFileContent !== undefined) return setParsedSubs(parseSubs(srtFileContent))
    if (src === undefined) return
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await fetch(src)
      const srtContent = await response.text()
      onLoaded?.(srtContent)
      const parsedSubs = parseSubs(srtContent)
      setParsedSubs(parsedSubs)
    } catch (error) {
      setLoadError(error instanceof Error
        ? error
        : new Error(unknownToString(error)))
      // eslint-disable-next-line no-console
      console.error(error)
      onLoadFailed?.(toError(error))
    } finally {
      setIsLoading(false)
    }
  }, [onLoadFailed, onLoaded])

  useEffect(() => {
    fetchAndParseSubs(src, srtFileContent)
      // eslint-disable-next-line no-console
      .catch((error: unknown) => { console.error(error) })
  }, [fetchAndParseSubs, src, srtFileContent])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
      loading: isLoading,
      error: loadError !== null
    }),
    className
  )
  const prevSubs = parsedSubs.filter(({ start }) => start !== undefined && start < (timecodeMs ?? 0))
  const lastPrevSub = prevSubs[prevSubs.length - 1]
  const highestSubId = Math.max(...parsedSubs.map(sub => sub.id))
  const subsGroupsWithBoundaries = computeSubGroupsWithBoundaries(subsGroups, highestSubId)
  const currentGroup = getCurrentGroup(subsGroupsWithBoundaries, lastPrevSub?.id, isEnded)
  return <div className={rootClss}>{
    timecodeMs !== undefined
    && parsedSubs.length > 0
    && subsGroupsWithBoundaries.map(group => {
      const groupSubs = parsedSubs.filter(sub => sub.id >= group.startId && sub.id <= group.endId)
      const totalSubs = groupSubs.length
      const groupClass = c('group', { curr: currentGroup?.startId === group.startId })
      const subsNodes = groupSubs.map((sub, subIndex) => {
        let subText = sub.content?.trim() ?? ''
        if (subIndex !== totalSubs - 1) subText += ' '
        const subClass = c('sub', {
          prev: sub.start !== undefined
            && lastPrevSub?.start !== undefined
            && sub.start <= lastPrevSub.start,
          curr: sub.start !== undefined
            && timecodeMs >= sub.start
            && sub.end !== undefined
            && timecodeMs <= sub.end
        })
        return <span
          key={sub.id}
          className={subClass}
          data-sub-pos={sub.id}>
          {subText}
        </span>
      })
      return <div
        className={groupClass}
        key={group.startId}
        data-start-sub-pos={group.startId}
        data-end-sub-pos={group.endId}>
        {subsNodes}
      </div>
    })
  }</div>
}
