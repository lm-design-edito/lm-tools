export function makeTextBlock (
  text: string,
  vPadding = 1,
  hPadding = vPadding
): string {
  const lines = text.split('\n')
  const longestLine = Math.max(...lines.map(line => line.length))
  const textBlockArr = new Array(lines.length + 2 * vPadding)
    .fill(null)
    .map(() => new Array<string>(longestLine + (hPadding * 2)).fill(' '))
  lines.forEach((line, linePos) => {
    const chars = line.split('')
    textBlockArr[linePos + vPadding]?.splice(hPadding, chars.length, ...chars)
  })
  return textBlockArr
    .map(lineArr => lineArr.join(''))
    .join('\n')
}
