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
import type { ParsedSub } from './types.js'
import {
  computeSubGroupsWithBoundaries,
  getCurrentGroup,
  parseSubs
} from './utils.js'
import cssModule from './styles.module.css'

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
    if (src === undefined) return
    if (srtFileContent !== undefined) return setParsedSubs(parseSubs(srtFileContent))
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
      console.error(error)
      onLoadFailed?.(toError(error))
    } finally {
      setIsLoading(false)
    }
  }, [onLoadFailed, onLoaded])

  useEffect(() => {
    fetchAndParseSubs(src, srtFileContent)
      .catch((error) => { console.error(error) })
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
  const prevSubs = parsedSubs.filter(({ start }) => start != null && start < (timecodeMs ?? 0))
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
