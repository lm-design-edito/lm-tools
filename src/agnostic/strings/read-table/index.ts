import { Outcome } from '../../misc/outcome'

export type ReadTableOptions<T extends Record<string, string>> = {
  inputToLines: (input: string) => string[]
  headLinePos: number
  headLineToHeaders: (input: string) => string[]
  bodyLinesBounds: [number, number] // [start, end]
  bodyLineToCellValue: (input: string) => string[]
  schema: (obj: unknown) => T
}

export const defaultOptions: ReadTableOptions<any> = {
  inputToLines: i => i.split('\n'),
  headLinePos: 0,
  headLineToHeaders: i => i.split('\t'),
  bodyLinesBounds: [1, Infinity],
  bodyLineToCellValue: i => i.split('\t'),
  schema: i => i
}

/**
 * Parses a tabular string input into an array of objects, where each object represents a row in the table.
 *
 * The input table is expected to be a string with rows separated by newlines and columns separated by tabs.
 * The first row is considered the header row, which defines the keys for the objects.
 *
 * @template T - The type of the objects in the resulting array, extending Record<string, string>.
 * @param {string} table - The string representation of the table to be parsed.
 * @param {ReadTableOptions<T>} [options=defaultOptions] - Configuration options for parsing the table.
 * @param {function(string): string[]} options.inputToLines - Function to split the input string into lines.
 * @param {number} options.headLinePos - The index of the header line in the lines array.
 * @param {function(string): string[]} options.headLineToHeaders - Function to parse the header line into an array of header names.
 * @param {[number, number]} options.bodyLinesBounds - Tuple indicating the start and end indices for body lines.
 * @param {function(string): string[]} options.bodyLineToCellValue - Function to parse each body line into an array of cell values.
 * @param {function(unknown): T} options.schema - Function to validate and transform each row object.
 * @returns {Outcome.Either<T[], string>} An Outcome object containing either the array of parsed objects or an error message.
 * @throws Will throw an error if the header line is not found.
 * @example
 * // Example usage:
 * const table = 'name\tage\nAlice\t30\nBob\t25';
 * const result = readTable(table);
 * if (result.success) {
 *   console.log(result.payload); // [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]
 * } else {
 *   console.error(result.error);
 * }
 */
export function readTable<T extends Record<string, string>> (
  table: string,
  options: ReadTableOptions<T> = defaultOptions
): Outcome.Either<T[], string> {
  const lines = options.inputToLines(table)
  const headLine = lines.at(options.headLinePos)
  if (headLine === undefined) return Outcome.makeFailure('Head line not found')
  const headers = options.headLineToHeaders(headLine)
  const bodyLines = lines.slice(options.bodyLinesBounds[0], options.bodyLinesBounds[1])
  const bodyLinesSplit = bodyLines.map(options.bodyLineToCellValue)
  const rows: T[] = bodyLinesSplit.map(line => {
    const row: Record<string, string> = {}
    line.forEach((cell, cellPos) => {
      const cellName = headers.at(cellPos)
      if (cellName === undefined) return
      const cellValue = cell
      row[cellName] = cellValue as any
    })
    const checked = options.schema(row)
    return checked
  })
  return Outcome.makeSuccess(rows)
}
