import { srtTimecodeToMs } from '../srt-timecode-to-ms/index.js'
import type { SrtCue } from './types.js'

/** Splits on the blank line that separates two cues, whatever the line endings were. */
const cueSeparatorRegexp = /\n[ \t]*\n/v
const idRegexp = /^\d+$/v
const cueArrow = '-->'

/** Reads `hh:mm:ss,mmm --> hh:mm:ss,mmm`, or nothing. */
function parseTimecodeLine (line: string): { start: number, end: number } | null {
  if (!line.includes(cueArrow)) return null
  const [rawStart = '', rawEnd = ''] = line.split(cueArrow)
  const start = srtTimecodeToMs(rawStart)
  const end = srtTimecodeToMs(rawEnd)
  if (start === null || end === null) return null
  return { start, end }
}

/** Turns one blank-line-delimited block into a cue, or drops it. */
function parseCue (block: string, fallbackId: number): SrtCue | null {
  const lines = block.split('\n')
  const firstLine = lines[0]
  if (firstLine === undefined) return null
  // The id line is optional: some writers leave it out, and skipping it here is what
  // lets the timecode line be found either way.
  const hasIdLine = idRegexp.test(firstLine.trim())
  const id = hasIdLine ? parseInt(firstLine.trim(), 10) : fallbackId
  const rest = hasIdLine ? lines.slice(1) : lines
  const timecodeLine = rest[0]
  if (timecodeLine === undefined) return null
  const timecode = parseTimecodeLine(timecodeLine)
  if (timecode === null) return null
  const content = rest.slice(1).join('\n').trim()
  if (content === '') return null
  return { id, ...timecode, content }
}

/**
 * Parses an SRT subtitle file.
 *
 * Cues are delimited by blank lines, which is the format's only structural marker —
 * reading line by line instead would leave the parser guessing, and a cue whose text
 * is a bare number (`1914`) would read as the next cue's id.
 *
 * Line endings are normalised first, so a CRLF file — the format's de facto norm —
 * parses like any other.
 *
 * @param rawSrt - The file's contents.
 * @returns The cues that parsed, in file order. A block missing a usable timecode or
 * any text is dropped rather than returned half-built, so the result never holds a
 * cue a consumer has to check.
 */
export function parseSrt (rawSrt: string): SrtCue[] {
  const cues: SrtCue[] = []
  const blocks = rawSrt
    .replace(/\r\n?/gv, '\n')
    .split(cueSeparatorRegexp)
  for (const block of blocks) {
    if (block.trim() === '') continue
    const cue = parseCue(block, cues.length + 1)
    if (cue !== null) cues.push(cue)
  }
  return cues
}
