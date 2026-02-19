import { useCallback, useEffect, useState, type FunctionComponent, type PropsWithChildren } from 'react'
import type { WithClassName } from '../utils/types.js'
import { clss, type ClssMaker } from '../../agnostic/css/clss/index.js'
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

type SubData = {
  id: number
  start?: number
  end?: number
  content?: string
}

type SubGroupBoundaries = {
  startId: number
  endId: number
}

export const Subtitles: FunctionComponent<Props> = ({
  subsSrc,
  subsGroups,
  timecodeInMs,
  isEnded,
  className,
  onSubsLoad,
  onSubsError
}) => {
  const [parsedSubs, setParsedSubs] = useState<SubData[]>([])

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

  const parseSubs = (rawSubs: string): SubData[] => {
    const numberRegex = /^\d+$/
    const timecodeRegex = /^[0-9]+:[0-9]+:[0-9]+,[0-9]+\s*-->\s*[0-9]+:[0-9]+:[0-9]+,[0-9]+$/

    const parsedSubs: SubData[] = []
    rawSubs.split('\n').forEach(line => {
      if (line.trim() === '') return
      const lastAddedElement = parsedSubs[parsedSubs.length - 1] as SubData | undefined
      const looksLikeId = line.match(numberRegex)
      const looksLikeTimecode = line.match(timecodeRegex)

      // id
      if (looksLikeId !== null) {
        if (lastAddedElement === undefined) {
          const subData: SubData = { id: parseInt(line) }
          parsedSubs.push(subData)
          return
        }
        if (lastAddedElement.content !== undefined) {
          const subData: SubData = { id: parseInt(line) }
          parsedSubs.push(subData)
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

  const getSubtitlesContent = (c: ClssMaker, parsedSubs: SubData[], subsGroups?: number[], timecodeInMs?: number): React.ReactNode => {
    if (timecodeInMs === undefined) return null

    const alreadyPronouncedSubs = parsedSubs.filter(({ start }) => (start != null) && start < timecodeInMs)
    const lastPronouncedSub = alreadyPronouncedSubs[alreadyPronouncedSubs.length - 1] ?? null
    const highestSubId = Math.max(...parsedSubs.map(sub => sub.id))

    const subsGroupsWithBoundaries: SubGroupBoundaries[] = subsGroups?.reduce(
      (acc, curr, currIndex) => {
        const lastInAcc = acc[acc.length - 1]
        const startId = lastInAcc === undefined ? 1 : lastInAcc.endId + 1
        const endId = curr
        if (currIndex === (subsGroups?.length ?? 0) - 1
          && endId !== highestSubId) {
          return [
            ...acc,
            { startId, endId },
            { startId: endId + 1, endId: highestSubId }
          ]
        }
        return [...acc, { startId, endId }]
      },
      [] as SubGroupBoundaries[]
    ) ?? []
    const alreadyPronouncedGroups = subsGroupsWithBoundaries.filter(group => group.startId <= (lastPronouncedSub?.id ?? 0))

    const activeGroup = alreadyPronouncedGroups.length === 0
      ? (isEnded === true
          ? subsGroupsWithBoundaries[subsGroupsWithBoundaries.length - 1]
          : subsGroupsWithBoundaries[0])
      : alreadyPronouncedGroups[alreadyPronouncedGroups.length - 1]

    const subsArray: React.ReactNode[] = []
    subsGroupsWithBoundaries.forEach((group) => {
      const groupSubs = parsedSubs.filter(sub => sub.id >= group.startId && sub.id <= group.endId)
      const subsNodes: React.ReactNode[] = []
      groupSubs.forEach((sub, subIndex, array) => {
        let subText = sub.content?.trim() ?? ''
        if (subIndex !== array.length - 1) subText += ' '

        const subModifiers = []
        if (isEnded !== true && sub.start !== undefined && lastPronouncedSub?.start !== undefined && sub.start <= lastPronouncedSub.start) {
          subModifiers.push('pronounced')
        }

        if (sub.start !== undefined && timecodeInMs >= sub.start && sub.end !== undefined && timecodeInMs <= sub.end) {
          subModifiers.push('active')
        }

        const subClass = c('sub', subModifiers)
        subsNodes.push(<span key={sub.id} className={subClass}>{subText}</span>)
      })

      const groupModifiers = []
      if (activeGroup?.startId === group.startId) {
        groupModifiers.push('active')
      }

      const groupClass = c('group', groupModifiers)
      subsArray.push(<div className={groupClass} key={group.startId}>{subsNodes}</div>)
    })

    return subsArray
  }

  const fetchAndParseSubs = useCallback(async (src?: string): Promise<void> => {
    if (src === undefined) {
      return
    }
    try {
      const response = await fetch(src)
      const subsData = await response.text()
      const parsedSubs = parseSubs(subsData)
      setParsedSubs(parsedSubs)
      onSubsLoad?.(subsData)
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
      {getSubtitlesContent(c, parsedSubs, subsGroups, timecodeInMs)}
    </div>
  )
}
