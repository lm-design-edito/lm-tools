import {
  type FunctionComponent,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState
} from 'react'
import { clss } from '../../agnostic/css/clss/index.js'
import { toError } from '../../agnostic/misc/cast/index.js'
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

export type Props = PropsWithChildren<WithClassName<{
  src?: string
  srtFileContent?: string
  subsGroups?: number[]
  timecodeMs?: number
  isEnded?: boolean
  onSubsLoad?: (subs?: string) => void
  onSubsError?: (error?: Error) => void
}>>

// [WIP] JSDOC pas à jour

/**
 * Subtitles component for displaying and synchronizing subtitles (SRT) with a media timeline.
 *
 * @component
 * @param subSrc - URL of the subtitles file (SRT format). If undefined, no fetch is performed.
 * @param subGroups - Optional array of subtitle IDs to define group boundaries. If undefined, all subtitles are in a single group.
 * @param timecodeMs - Current time in milliseconds. Determines which subtitles are current/prev.
 * @param isEnded - If true, marks the last group as current (useful when media playback is finished).
 * @param className - Additional class name(s) for the root element.
 * @param onSubsLoad - Callback called with the raw SRT content after successful fetch and parse.
 * @param onSubsError - Callback called with an Error if fetching or parsing fails.
 * @param children - Optional children rendered inside the root container, after the subtitles.
 *
 * @example
 * <Subtitles
 *   src="/subs/movie.srt"
 *   timecodeMs={currentTime}
 *   subsGroups={[10, 20]}
 *   onSubsLoad={handleSubsLoad}
 *   onSubsError={handleSubsError}>
 *   <div>Custom footer or overlay</div>
 * </Subtitles>
 *
 * @returns Render a div containing the subtitles and any children passed as props.
 * Subtitles are grouped and given class names according to their timing and state (current, prev, etc).
 */
export const Subtitles: FunctionComponent<Props> = ({
  src,
  srtFileContent,
  subsGroups,
  timecodeMs,
  isEnded,
  className,
  onSubsLoad,
  onSubsError
}) => {
  // State
  const [parsedSubs, setParsedSubs] = useState<ParsedSub[]>([])

  // Effects
  const fetchAndParseSubs = useCallback(async (src?: string, srtFileContent?: string): Promise<void> => {
    if (src === undefined) return
    if (srtFileContent !== undefined) return setParsedSubs(parseSubs(srtFileContent))
    try {
      const response = await fetch(src)
      const srtContent = await response.text()
      const parsedSubs = parseSubs(srtContent)
      setParsedSubs(parsedSubs)
      onSubsLoad?.(srtContent)
    } catch (error) {
      console.error(error)
      onSubsError?.(toError(error))
    }
  }, [onSubsError, onSubsLoad])

  useEffect(() => {
    fetchAndParseSubs(src, srtFileContent)
      .catch((error) => { console.error(error) })
  }, [fetchAndParseSubs, src, srtFileContent])

  // Rendering
  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(c(null), className)
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
