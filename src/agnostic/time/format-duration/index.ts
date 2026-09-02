/**
 * Renders a duration into a caller-defined pattern.
 *
 * The pattern is a free-form string in which the following tokens are replaced,
 * longest first, so that `mm` is consumed before `m`:
 *
 * - `hh`, `mm`, `ss` — hours, minutes and seconds, zero-padded to two digits.
 * - `ms` — the remaining milliseconds, zero-padded to three digits.
 * - `frame` — the remaining milliseconds expressed in frames, zero-padded to two
 *   digits.
 * - `h`, `m`, `s`, `f` — the same four values, unpadded.
 *
 * @remarks
 * Since `h`, `m`, `s` and `f` are tokens on their own, **every** occurrence of
 * those letters is substituted, wherever it sits. The format is a token pattern,
 * not a template one can write prose in: `'mm min ss'` renders as `'01 1in 01'`.
 * Separate the fields with punctuation.
 *
 * @param ms - The duration, in milliseconds.
 * @param format - The pattern to fill, e.g. `'mm:ss:ms'`.
 * @param fps - Frame rate used to derive the `frame` and `f` tokens. Defaults to `25`.
 * @returns The formatted duration.
 *
 * Every field is a remainder of the one above it, never a total: at one hour and
 * a half, `mm` is `30`, not `90`. A pattern that omits `hh` therefore loses the
 * hours rather than folding them into the minutes.
 *
 * @example
 * formatDuration(3_723_456, 'hh:mm:ss') // '01:02:03'
 * formatDuration(3_723_456, 'mm:ss:ms') // '02:03:456'
 */
export function formatDuration (
  ms: number,
  format: string,
  fps = 25
): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const frames = Math.floor(((ms % 1000) / 1000) * fps)
  const msRest = Math.floor(ms % 1000)
  const tokens: Record<string, string | number> = {
    hh: String(hours).padStart(2, '0'),
    mm: String(minutes).padStart(2, '0'),
    ss: String(seconds).padStart(2, '0'),
    frame: String(frames).padStart(2, '0'),
    ms: String(msRest).padStart(3, '0'),
    h: hours,
    m: minutes,
    s: seconds,
    f: frames
  }
  return Object
    .keys(tokens)
    .sort((a, b) => b.length - a.length)
    .reduce(
      (acc, t) => acc.replace(new RegExp(t, 'gv'), String(tokens[t])),
      format
    )
}
