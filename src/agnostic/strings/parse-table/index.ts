import { Outcome } from '../../misc/outcome'

export type ParseTableLineModeOptions<T extends Record<string, string>> = {
  inputToLines: (input: string) => string[]
  headLinePos: number
  headLineToHeaders: (input: string) => string[]
  bodyLinesBounds: [number, number] // [start, end]
  bodyLineToCellValue: (input: string) => string[]
  schema: (obj: unknown) => T | undefined
}

export type ParseTableColumnModeOptions<T extends Record<string, string>> = {
  inputToLines: (input: string) => string[]
  headLinePos: number
  bodyLinesBounds: [number, number] // [start, end]
  columns: number[]
  headerRefine: (header: string) => string
  valueRefine: (value: string) => string
  schema: (obj: unknown) => T | undefined
}

export type ParseTableOptions<T extends Record<string, string>> = ParseTableLineModeOptions<T> | ParseTableColumnModeOptions<T>

const defaultLineModeOptions: ParseTableLineModeOptions<any> = {
  inputToLines: i => i.split('\n'),
  headLinePos: 0,
  headLineToHeaders: h => h.split('\t'),
  bodyLinesBounds: [1, Infinity],
  bodyLineToCellValue: i => i.split('\t'),
  schema: i => i
}

const defaultColumnModeOptions: ParseTableColumnModeOptions<any> = {
  inputToLines: i => i.split('\n'),
  headLinePos: 0,
  bodyLinesBounds: [1, Infinity],
  columns: [],
  headerRefine: h => h,
  valueRefine: v => v,
  schema: i => i
}

/**
 * Parses a tabular string input into an array of objects, where each object represents a row in the table.
 *
 * There are two parsing modes:
 *
 * 1. **Delimiter-based parsing** (default)  
 *    - The table is split into rows and then into cells using functions such as splitting on `\n` and `\t`.  
 *    - The header row is parsed into an array of header names, which are mapped to each cell value.  
 *    - Defaults: `inputToLines = s => s.split('\n')`, `headLinePos = 0`, `headLineToHeaders = h => h.split('\t')`,
 *      `bodyLinesBounds = [0, Infinity]`, `bodyLineToCellValue = r => r.split('\t')`.
 *
 * 2. **Column-slice parsing**  
 *    - The table is split into fixed-width columns based on start indices provided in `options.columns`.  
 *    - The header row and body rows are sliced using these column boundaries.  
 *    - Each header and cell value can be refined with user-provided functions.  
 *    - Defaults: `inputToLines = s => s.split('\n')`, `headLinePos = 0`, `bodyLinesBounds = [1, Infinity]`,
 *      `headerRefine = h => h`, `valueRefine = v => v`.
 *
 * @template T - The type of the objects in the resulting array, extending `Record<string, string>`.
 * @param {string} table - The string representation of the table to be parsed.
 * @param {Partial<ParseTableOptions<T>> & { schema: (obj: unknown) => T }} options - Configuration options for parsing the table.
 *
 * ### Required
 * @param {function(unknown): T} options.schema - Function to validate and transform each row object.
 *
 * ### Common (optional)
 * @param {function(string): string[]} [options.inputToLines] - Function to split the input string into lines. Default: `s => s.split('\n')`.
 * @param {number} [options.headLinePos] - Index of the header line. Default: `0`.
 * @param {[number, number]} [options.bodyLinesBounds] - Tuple `[start, end]` indicating the range of lines to parse as body rows.
 *
 * ### Delimiter-based (optional, used when `columns` is not provided)
 * @param {function(string): string[]} [options.headLineToHeaders] - Function to parse the header line into an array of header names. Default: `h => h.split('\t')`.
 * @param {function(string): string[]} [options.bodyLineToCellValue] - Function to parse each body line into an array of cell values. Default: `r => r.split('\t')`.
 *
 * ### Column-slice (optional, used when `columns` is provided)
 * @param {number[]} [options.columns] - Starting indices for each column. The last column extends to the end of the line.
 * @param {function(string): string} [options.headerRefine] - Function to clean or normalize header names. Default: `h => h`.
 * @param {function(string): string} [options.valueRefine] - Function to clean or normalize cell values. Default: `v => v`.
 *
 * @returns {Outcome.Either<T[], string>} An `Outcome` containing either:
 *   - `success = true` with an array of parsed row objects, or
 *   - `success = false` with an error message.
 *
 * @throws Will return a failure outcome if the header line cannot be found.
 *
 * @example
 * // Delimiter-based parsing (default)
 * const table = 'name\tage\nAlice\t30\nBob\t25';
 * const result = parseTable(table, { schema: row => row });
 * if (result.success) {
 *   console.log(result.payload); // [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]
 * }
 *
 * @example
 * // Column-slice parsing
 * const table = 'Name      Age\nAlice     30 \nBob       25 ';
 * const result = parseTable(table, {
 *   schema: row => row,
 *   columns: [0, 10, 15],
 *   headerRefine: h => h.trim(),
 *   valueRefine: v => v.trim()
 * });
 * if (result.success) {
 *   console.log(result.payload); // [{ Name: 'Alice', Age: '30' }, { Name: 'Bob', Age: '25' }]
 * }
 */
export function parseTable<T extends Record<string, string>> (
  table: string,
  _options: Partial<ParseTableOptions<T>> & { schema: (obj: unknown) => T }
): Outcome.Either<T[], string> {
  const options: ParseTableOptions<T> = 'columns' in _options
    ? { ...defaultColumnModeOptions, ..._options }
    : { ...defaultLineModeOptions, ..._options }
  const lines = options.inputToLines(table)
  const headLine = lines.at(options.headLinePos)
  if (headLine === undefined) return Outcome.makeFailure('Head line not found')
  if ('headLineToHeaders' in options) {
    const headers = options.headLineToHeaders(headLine)
    const bodyLines = lines.slice(options.bodyLinesBounds[0], options.bodyLinesBounds[1])
    const bodyLinesSplit = bodyLines.map(options.bodyLineToCellValue)
    const rows: T[] = []
    bodyLinesSplit.forEach(line => {
      const row: Record<string, string> = {}
      line.forEach((cell, cellPos) => {
        const cellName = headers.at(cellPos)
        if (cellName === undefined) return
        const cellValue = cell
        row[cellName] = cellValue as any
      })
      const checked = options.schema(row)
      if (checked === undefined) return
      rows.push(checked)
    })
    return Outcome.makeSuccess(rows)
  } else {
    const colBounds: [number, number][] = options.columns.reduce((acc, colStartPos, colIndex) => {
      const nextColStartPos = options.columns.at(colIndex + 1)
      if (nextColStartPos === undefined) return [...acc, [colStartPos, Infinity]]
      return [...acc, [colStartPos, nextColStartPos]]
    }, [] as [number, number][])
    const bodyLines = lines.slice(options.bodyLinesBounds[0], options.bodyLinesBounds[1])
    const headers = colBounds.map(([start, end]) => options.headerRefine(headLine.slice(start, end)))
    const rows: T[] = []
    bodyLines.forEach(line => {
      const row: Record<string, string> = {}
      colBounds.forEach(([start, end], colIndex) => {
        const header = headers.at(colIndex)
        if (header === undefined) return
        const cellValue = line.slice(start, end)
        row[header] = cellValue as any
      })
      const checked = options.schema(row)
      if (checked === undefined) return
      rows.push(checked)
    })
    return Outcome.makeSuccess(rows)
  }
}
