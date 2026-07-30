import type { ParsedSub, SubGroupBoundaries } from './types.js'

/**
 * Converts an SRT timecode (hh:mm:ss,ms) to milliseconds.
 *
 * @param timecode - Timecode string (e.g. '00:01:23,456').
 * @returns The time in milliseconds.
 */
export const getTimecodeToMs = (timecode: string): number => {
  const [hours = '0', minutes = '0', secondsAndMs = '0,0'] = timecode.split(':')
  const [seconds = '0', milliseconds = '0'] = secondsAndMs.split(',')
  let result = parseInt(hours) * 60 * 60 * 1000
  result += parseInt(minutes) * 60 * 1000
  result += parseInt(seconds) * 1000
  result += parseInt(milliseconds)
  return result
}

/**
 * Parses a raw SRT subtitle text into a list of {@link ParsedSub} objects.
 *
 * @param rawSubs - Raw subtitle content in SRT format.
 * @returns Array of parsed subtitle entries.
 */
export const parseSubs = (rawSubs: string): ParsedSub[] => {
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

/**
 * Computes subtitle groups with their boundaries (startId, endId).
 *
 * @param subsGroups - Array of group-end subtitle IDs.
 * @param highestSubId - Highest subtitle ID in the track.
 * @returns Array of {@link SubGroupBoundaries}.
 */
export const computeSubGroupsWithBoundaries = (
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

/**
 * Returns the current subtitle group based on the last preceding subtitle ID and playback state.
 *
 * @param subsGroupsWithBoundaries - Array of groups with their boundaries.
 * @param lastPrevSubId - ID of the last subtitle that has already passed.
 * @param isEnded - Whether playback has ended.
 * @returns The current group, or `undefined` if none matches.
 */
export const getCurrentGroup = (
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
