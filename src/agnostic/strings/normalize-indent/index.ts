/**
 * Normalizes the indentation of a multi-line string.
 *
 * Removes all existing leading whitespace, replaces leading `|` characters with spaces,
 * and applies a uniform indentation to all lines.
 *
 * @param input - The multi-line string to normalize.
 * @param indentLevel - The number of spaces to prepend to each line after normalization. Defaults to `0`.
 * @returns The input string with normalized indentation.
 *
 * @example
 * const str = `
 * |function test() {
 * |  console.log('hi')
 * |}`;
 *
 * console.log(normalizeIndent(str, 2));
 * // Output:
 * // "  function test() {
 * //    console.log('hi')
 * //  }"
 */
export function normalizeIndent (input: string, indentLevel: number = 0) {
  const indent = (' ').repeat(indentLevel)
  const lines = input.split('\n')
  const noIndentLines = lines.map(line => line.replace(/^\s*/igm, ''))
  const pipeReplacedLines = noIndentLines.map(line => {
    const nbPipeCharsOnLineStart = line.match(/^\|+/igm)?.[0].length ?? 0
    const noPipeLine = line.slice(nbPipeCharsOnLineStart)
    const replacedPipes = (' ').repeat(nbPipeCharsOnLineStart)
    return replacedPipes + noPipeLine
  })
  const normalizedLines = pipeReplacedLines.map(line => indent + line)
  return normalizedLines.join('\n')
}
