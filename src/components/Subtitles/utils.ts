import type { ParsedSub, SubGroupBoundaries } from './types.js'

/**
 * Convertit un timecode au format SRT (hh:mm:ss,ms) en millisecondes.
 * @param timecode - Timecode sous forme de chaîne (ex: '00:01:23,456')
 * @returns Le temps en millisecondes
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
 * Parse un texte brut de sous-titres SRT en une liste d'objets ParsedSub.
 * @param rawSubs - Sous-titres bruts au format SRT
 * @returns Tableau d'objets ParsedSub
 */
export const parseSubs = (rawSubs: string): ParsedSub[] => {
  const numberRegex = /^\d+$/
  const timecodeRegex = /^[0-9]+:[0-9]+:[0-9]+,[0-9]+\s*-->\s*[0-9]+:[0-9]+:[0-9]+,[0-9]+$/
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
      && lastParsedSub?.start !== undefined
      && lastParsedSub?.end !== undefined) {
      if (lastParsedSub?.content !== undefined) {
        lastParsedSub.content += '\n' + line
        return
      }
      lastParsedSub.content = line
    }
  })

  return parsedSubs
}

/**
 * Calcule les groupes de sous-titres avec leurs bornes (startId, endId).
 * @param subsGroups - Tableau d'IDs de fin de groupe
 * @param highestSubId - ID le plus élevé des sous-titres
 * @returns Tableau de SubGroupBoundaries
 */
export const computeSubGroupsWithBoundaries = (
  subsGroups: number[] | undefined,
  highestSubId: number
): SubGroupBoundaries[] => {
  const fallback = [{ startId: 1, endId: highestSubId }]
  if (subsGroups === undefined || subsGroups.length === 0) return fallback
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

/**
 * Retourne le groupe de sous-titres courant selon l'ID du dernier sous-titre précédent et l'état.
 * @param subsGroupsWithBoundaries - Tableau des groupes avec bornes
 * @param lastPrevSubId - ID du dernier sous-titre précédent
 * @param isEnded - Indique si la lecture est terminée
 * @returns Le groupe courant ou undefined
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
