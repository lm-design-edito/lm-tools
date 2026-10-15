import type { SrtCue } from '../../agnostic/subtitles/parse-srt/types.js'

export type SubGroupBounds = {
  startPos: number
  endPos: number
}

export function normalizeGroupBoundaries (
  boundaries: number[] | undefined,
  lastPos: number
): number[] {
  if (boundaries === undefined) return []
  const usable = boundaries.filter(pos => Number.isInteger(pos) && pos >= 0 && pos < lastPos)
  return [...new Set(usable)].sort((a, b) => a - b)
}

export function toSubGroups (boundaries: number[], lastPos: number): SubGroupBounds[] {
  if (lastPos < 0) return []
  const groups: SubGroupBounds[] = []
  let startPos = 0
  for (const endPos of boundaries) {
    groups.push({ startPos, endPos })
    startPos = endPos + 1
  }
  groups.push({ startPos, endPos: lastPos })
  return groups
}

export function lastElapsedPos (cues: SrtCue[], timecodeMs?: number): number {
  if (timecodeMs === undefined) return -1
  let found = -1
  cues.forEach((cue, pos) => {
    if (cue.start < timecodeMs) found = pos
  })
  return found
}

export function toCurrentGroup (
  groups: SubGroupBounds[],
  lastElapsedPos: number,
  isEnded?: boolean
): SubGroupBounds | undefined {
  if (isEnded === true) return groups[groups.length - 1]
  if (lastElapsedPos < 0) return groups[0]
  return groups.find(group => group.startPos <= lastElapsedPos && lastElapsedPos <= group.endPos)
}
