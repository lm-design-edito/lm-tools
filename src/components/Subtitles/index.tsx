import { useCallback, useEffect, useState } from 'react'
import type { FunctionComponent, PropsWithChildren } from 'react'
import type { WithClassName } from '../utils/types.js'
import { clss } from '../../agnostic/css/clss/index.js'
import type { ClssMaker } from '../../agnostic/css/clss/index.js'
import { subtitles as publicClassName } from '../public-classnames.js'
import { mergeClassNames } from '../utils/index.js'
import cssModule from './styles.module.css'
import { toError } from '../../agnostic/misc/cast/index.js'

export type Props = PropsWithChildren<WithClassName<{
  subsSrc?: string
  subsGroups?: number[]
  timecodeInMs?: number
  isEnded?: boolean
  onSubsLoad?: (subs?: string) => void
  onSubsError?: (error?: Error) => void
}>>

type ParsedSub = {
  id: number
  start?: number
  end?: number
  content?: string
}

type SubGroupBoundaries = {
  startId: number
  endId: number
}

/**
 * Subtitles component for displaying and synchronizing subtitles (SRT) with a media timeline.
 *
 * @component
 * @param subSrc - URL of the subtitles file (SRT format). If undefined, no fetch is performed.
 * @param subGroups - Optional array of subtitle IDs to define group boundaries. If undefined, all subtitles are in a single group.
 * @param timecodeInMs - Current time in milliseconds. Determines which subtitles are active/pronounced.
 * @param isEnded - If true, marks the last group as active (useful when media playback is finished).
 * @param className - Additional class name(s) for the root element.
 * @param onSubsLoad - Callback called with the raw SRT content after successful fetch and parse.
 * @param onSubsError - Callback called with an Error if fetching or parsing fails.
 * @param children - Optional children rendered inside the root container, after the subtitles.
 *
 * @example
 * <Subtitles
 *   subsSrc="/subs/movie.srt"
 *   timecodeInMs={currentTime}
 *   subsGroups={[10, 20]}
 *   onSubsLoad={handleSubsLoad}
 *   onSubsError={handleSubsError}
 * >
 *   <div>Custom footer or overlay</div>
 * </Subtitles>
 *
 * @returns Render a div containing the subtitles and any children passed as props. Subtitles are grouped and given classnames according to their timing and state (active, pronounced, etc).
 */
export const Subtitles: FunctionComponent<Props> = ({
  subsSrc,
  subsGroups,
  timecodeInMs,
  isEnded,
  children,
  className,
  onSubsLoad,
  onSubsError
}) => {
  const [parsedSubs, setParsedSubs] = useState<ParsedSub[]>([])

  const c = clss(publicClassName, { cssModule })
  const rootClss = mergeClassNames(
    c(null, {
    }),
    className
  )

  const getTimecodeToMs = (timecode: string): number => {
    const [hours = '0', minutes = '0', secondsAndMs = '0,0'] = timecode.split(':')
    const [seconds = '0', milliseconds = '0'] = secondsAndMs.split(',')
    let result = parseInt(hours) * 60 * 60 * 1000
    result += parseInt(minutes) * 60 * 1000
    result += parseInt(seconds) * 1000
    result += parseInt(milliseconds)
    return result
  }

  const parseSubs = (rawSubs: string): ParsedSub[] => {
    const numberRegex = /^\d+$/
    const timecodeRegex = /^[0-9]+:[0-9]+:[0-9]+,[0-9]+\s*-->\s*[0-9]+:[0-9]+:[0-9]+,[0-9]+$/
    const parsedSubs: ParsedSub[] = []
    rawSubs.split('\n').forEach(line => {
      if (line.trim() === '') return
      const lastAddedElement = parsedSubs[parsedSubs.length - 1] as ParsedSub | undefined
      const looksLikeId = line.match(numberRegex)
      const looksLikeTimecode = line.match(timecodeRegex)
      // id
      if (looksLikeId !== null) {
        if (lastAddedElement === undefined) {
          const ParsedSub: ParsedSub = { id: parseInt(line) }
          parsedSubs.push(ParsedSub)
          return
        }
        if (lastAddedElement.content !== undefined) {
          const ParsedSub: ParsedSub = { id: parseInt(line) }
          parsedSubs.push(ParsedSub)
          return
        }
      }
      // timecode
      if (looksLikeTimecode !== null) {
        if (lastAddedElement?.id !== undefined) {
          const [rawStart = '', rawEnd = ''] = line.split('-->')
          const startTime = rawStart.trim()
          const endTime = rawEnd.trim()
          lastAddedElement.start = getTimecodeToMs(startTime)
          lastAddedElement.end = getTimecodeToMs(endTime)
          return
        }
      }

      // content
      if (lastAddedElement?.id !== undefined
        && lastAddedElement?.start !== undefined
        && lastAddedElement?.end !== undefined) {
        if (lastAddedElement?.content !== undefined) {
          lastAddedElement.content += '\n' + line
          return
        }
        lastAddedElement.content = line
      }
    })

    return parsedSubs
  }

  const computeSubGroupsWithBoundaries = (
    subsGroups: number[] | undefined,
    highestSubId: number
  ): SubGroupBoundaries[] => {
    const fallback = [{ startId: 1, endId: highestSubId }]
    if (subsGroups === undefined || subsGroups.length === 0) {
      return fallback
    }
    const emptySubGroupBoundaries: SubGroupBoundaries[] = []
    return subsGroups?.reduce(
      (acc, curr, currIndex) => {
        const lastInAcc = acc[acc.length - 1]
        const startId = lastInAcc === undefined ? 1 : lastInAcc.endId + 1
        const endId = curr
        if (currIndex === (subsGroups?.length ?? 0) - 1 && endId !== highestSubId) {
          return [
            ...acc,
            { startId, endId },
            { startId: endId + 1, endId: highestSubId }
          ]
        }
        return [...acc, { startId, endId }]
      },
      emptySubGroupBoundaries
    ) ?? fallback
  }

  const getActiveGroup = (
    subsGroupsWithBoundaries: SubGroupBoundaries[],
    lastPronouncedSubId: number | undefined,
    isEnded: boolean | undefined
  ): SubGroupBoundaries | undefined => {
    const alreadyPronouncedGroups = subsGroupsWithBoundaries.filter(
      group => group.startId <= (lastPronouncedSubId ?? 0)
    )

    if (alreadyPronouncedGroups.length === 0) {
      return isEnded === true
        ? subsGroupsWithBoundaries[subsGroupsWithBoundaries.length - 1]
        : subsGroupsWithBoundaries[0]
    }
    return alreadyPronouncedGroups[alreadyPronouncedGroups.length - 1]
  }

  const renderSubtitle = (
    c: ClssMaker,
    sub: ParsedSub,
    subIndex: number,
    totalSubs: number,
    timecodeInMs: number,
    lastPronouncedStart: number | undefined,
    isEnded: boolean | undefined
  ): React.ReactNode => {
    let subText = sub.content?.trim() ?? ''
    if (subIndex !== totalSubs - 1) subText += ' '
    const subModifiers = []
    if (isEnded !== true && sub.start !== undefined && lastPronouncedStart !== undefined && sub.start <= lastPronouncedStart) {
      subModifiers.push('pronounced')
    }
    if (sub.start !== undefined && timecodeInMs >= sub.start && sub.end !== undefined && timecodeInMs <= sub.end) {
      subModifiers.push('active')
    }
    const subClass = c('sub', subModifiers)
    return <span key={sub.id} className={subClass}>{subText}</span>
  }

  const renderSubGroup = (
    c: ClssMaker,
    group: SubGroupBoundaries,
    parsedSubs: ParsedSub[],
    timecodeInMs: number,
    lastPronouncedStart: number | undefined,
    isActiveGroup: boolean,
    isEnded: boolean | undefined
  ): React.ReactNode => {
    const groupSubs = parsedSubs.filter(sub => sub.id >= group.startId && sub.id <= group.endId)

    // eslint-disable-next-line @typescript-eslint/promise-function-async
    const subsNodes = groupSubs.map((sub, subIndex) => {
      return renderSubtitle(c, sub, subIndex, groupSubs.length, timecodeInMs, lastPronouncedStart, isEnded)
    })
    const groupModifiers = isActiveGroup ? ['active'] : []
    const groupClass = c('group', groupModifiers)
    return <div className={groupClass} key={group.startId}>{subsNodes}</div>
  }

  const renderSubtitles = (
    c: ClssMaker,
    parsedSubs: ParsedSub[],
    subsGroups?: number[],
    timecodeInMs?: number
  ): React.ReactNode => {
    if (timecodeInMs === undefined) return null
    if (parsedSubs.length === 0) return null

    const alreadyPronouncedSubs = parsedSubs.filter(({ start }) => start != null && start < timecodeInMs)
    const lastPronouncedSub = alreadyPronouncedSubs[alreadyPronouncedSubs.length - 1]
    const highestSubId = Math.max(...parsedSubs.map(sub => sub.id))

    const subsGroupsWithBoundaries = computeSubGroupsWithBoundaries(subsGroups, highestSubId)
    const activeGroup = getActiveGroup(subsGroupsWithBoundaries, lastPronouncedSub?.id, isEnded)

    // eslint-disable-next-line @typescript-eslint/promise-function-async
    return subsGroupsWithBoundaries.map(group =>
      renderSubGroup(
        c,
        group,
        parsedSubs,
        timecodeInMs,
        lastPronouncedSub?.start,
        activeGroup?.startId === group.startId,
        isEnded
      )
    )
  }
  const fetchAndParseSubs = useCallback(async (src?: string): Promise<void> => {
    if (src === undefined) {
      return
    }
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
    void fetchAndParseSubs(subsSrc)
  }, [fetchAndParseSubs, subsSrc])

  return (
    <div className={rootClss}>
    {renderSubtitles(c, parsedSubs, subsGroups, timecodeInMs)}
    {children}
    </div>
  )
}
