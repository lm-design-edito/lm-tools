export function secondsToMs (seconds: number): number {
  return seconds * 1000
}

export function formatTime (ms: number, format: string, fps: number = 25): string {
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
  const result = Object
    .keys(tokens)
    .sort((a, b) => b.length - a.length)
    .reduce(
      (acc, t) => acc.replace(new RegExp(t, 'g'), String(tokens[t])),
      format
    )
  return result
}
