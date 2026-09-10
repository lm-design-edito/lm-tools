/** Matches `hh:mm:ss,mmm`, with any number of digits in each field. */
const timecodeRegexp = /^\s*(\d+):(\d+):(\d+),(\d+)\s*$/v

/**
 * Reads the fractional field as a **number of digits**, not as a value.
 *
 * SRT writes milliseconds as a decimal fraction of a second: `,5` is half a second,
 * where reading it as an integer would call it 5ms. Padding to three digits gives
 * the fraction its place value back, and truncating past them drops precision the
 * format doesn't carry.
 */
function fractionToMs (fraction: string): number {
  return parseInt(`${fraction}00`.slice(0, 3), 10)
}

/**
 * Converts an SRT timecode to milliseconds.
 *
 * @param timecode - A timecode in `hh:mm:ss,mmm` form. Surrounding whitespace is
 * tolerated; anything else is not a timecode.
 * @returns The position in milliseconds, or `null` when `timecode` doesn't parse —
 * a caller reading a subtitle file needs to tell a malformed line from one that
 * legitimately sits at zero.
 *
 * @example
 * srtTimecodeToMs('00:00:01,500') // 1500
 * srtTimecodeToMs('00:00:01,5')   // 1500, not 1005
 */
export function srtTimecodeToMs (timecode: string): number | null {
  const match = timecode.match(timecodeRegexp)
  if (match === null) return null
  const [, hours = '0', minutes = '0', seconds = '0', fraction = '0'] = match
  return parseInt(hours, 10) * 60 * 60 * 1000
    + parseInt(minutes, 10) * 60 * 1000
    + parseInt(seconds, 10) * 1000
    + fractionToMs(fraction)
}
