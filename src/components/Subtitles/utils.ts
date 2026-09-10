import type { SrtCue } from '../../agnostic/subtitles/parse-srt/types.js'

/**
 * The inclusive bounds of a subtitle group, as **positions** in the cue array.
 *
 * Positions rather than file ids: an SRT concatenated from several files, or edited
 * by hand, numbers its cues however it likes, and nothing guarantees a run starting
 * at 1. A consumer shouldn't have to know a file's numbering to split it.
 *
 * @property startPos - Position of the group's first cue.
 * @property endPos - Position of its last cue.
 */
export type SubGroupBounds = {
  startPos: number
  endPos: number
}

/**
 * Puts a consumer's group boundaries in a state the group builder can use.
 *
 * Out-of-range, duplicate and unordered boundaries all produce overlapping or
 * inverted groups downstream — the same cue rendered twice, colliding keys. Rather
 * than demand a sorted array and break quietly when it isn't, normalise here.
 *
 * @param boundaries - The positions a consumer asked to split on, in any order.
 * @param lastPos - Position of the last cue.
 * @returns The usable boundaries, ascending, without duplicates, and without the
 * last position — which ends the final group anyway.
 */
export function normalizeGroupBoundaries (
  boundaries: number[] | undefined,
  lastPos: number
): number[] {
  if (boundaries === undefined) return []
  const usable = boundaries.filter(pos => Number.isInteger(pos) && pos >= 0 && pos < lastPos)
  return [...new Set(usable)].sort((a, b) => a - b)
}

/**
 * Cuts the cue array into groups.
 *
 * @param boundaries - Normalised boundaries, each the position of a group's last cue.
 * See {@link normalizeGroupBoundaries}.
 * @param lastPos - Position of the last cue.
 * @returns One group per section, in order. A single group spanning everything when
 * no boundary is given, and nothing at all when there is no cue to group.
 */
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

/**
 * Finds the last cue the playhead has already reached.
 *
 * @param cues - The parsed cues, in order.
 * @param timecodeMs - Current media position, absent while nothing plays.
 * @returns Its position, or `-1` when the playhead sits before the first cue. One
 * number, computed once: `--prev` on a cue and the current group both read from it,
 * and deriving them separately lets them disagree on a file with duplicate or
 * out-of-order start times.
 */
export function lastElapsedPos (cues: SrtCue[], timecodeMs?: number): number {
  if (timecodeMs === undefined) return -1
  let found = -1
  cues.forEach((cue, pos) => {
    if (cue.start < timecodeMs) found = pos
  })
  return found
}

/**
 * Picks the group the reader is in.
 *
 * @param groups - The groups, in order.
 * @param lastElapsedPos - Position of the last elapsed cue, `-1` before the first.
 * @param isEnded - Whether playback is over.
 * @returns The group holding that cue. Once playback has ended, the last group
 * whatever the timecode says — which is what `isEnded` is for. The first group
 * before anything has elapsed.
 */
export function toCurrentGroup (
  groups: SubGroupBounds[],
  lastElapsedPos: number,
  isEnded?: boolean
): SubGroupBounds | undefined {
  if (isEnded === true) return groups[groups.length - 1]
  if (lastElapsedPos < 0) return groups[0]
  return groups.find(group => group.startPos <= lastElapsedPos && lastElapsedPos <= group.endPos)
}
