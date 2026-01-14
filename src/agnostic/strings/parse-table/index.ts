import * as Outcome from '../../misc/outcome/index.js'

/**
 * Options for delimiter-based table parsing mode.
 * 
 * In this mode, the table is split into rows and cells using delimiter functions.
 * The header row is parsed into column names, which are then mapped to each body row's cell values.
 * 
 * @template T - The type of objects in the resulting array, extending `Record<string, string>`.
 * 
 * @example
 * ```typescript
 * const options: ParseTableLineModeOptions<MyRow> = {
 *   mode: 'line',
 *   splitLines: input => input.split('\n'),
 *   headerPos: 0,
 *   splitHeaderCells: header => header.split('\t'),
 *   bodyBounds: [1, Infinity],
 *   splitBodyCells: row => row.split('\t'),
 *   schema: obj => validateMyRow(obj)
 * }
 * ```
 */
export type ParseTableLineModeOptions<T extends Record<string, string>> = {
  /** Parsing mode identifier. Must be 'line' for delimiter-based parsing. */
  mode?: 'line'
  /** Function to split the input string into lines. @default input => input.split('\n') */
  splitLines: (input: string) => string[]
  /** Zero-based index of the header line within the split lines array. @default 0 */
  headerPos: number
  /** Tuple `[start, end]` indicating the range of line indices to parse as body rows (inclusive start, exclusive end). Use `Infinity` as the end value to parse until the last line. @default [1, Infinity] */
  bodyBounds: [number, number]
  /** Function to split the header line into individual column names. @default header => header.split('\t') */
  splitHeaderCells: (input: string) => string[]
  /** Function to split each body line into individual cell values. @default input => input.split('\t') */
  splitBodyCells: (input: string) => string[]
  /** Function to validate and transform each parsed row object. Return `undefined` to skip invalid rows. Skipped rows will not appear in the result and will not produce error messages. */
  schema: (obj: unknown) => T | undefined
}

/**
 * Options for fixed-width column parsing mode.
 * 
 * In this mode, the table is parsed using fixed character positions to define column boundaries.
 * This is useful for parsing terminal output, formatted reports, or any text with consistent column alignment.
 * 
 * @template T - The type of objects in the resulting array, extending `Record<string, string>`.
 * 
 * @example
 * ```typescript
 * const options: ParseTableColumnModeOptions<MyRow> = {
 *   mode: 'column',
 *   splitLines: input => input.split('\n'),
 *   headerPos: 0,
 *   bodyBounds: [1, Infinity],
 *   columns: [0, 10, 25],  // Columns start at positions 0, 10, and 25
 *   headerCellRefine: header => header.trim().toLowerCase(),
 *   bodyCellRefine: value => value.trim(),
 *   schema: obj => validateMyRow(obj)
 * }
 * ```
 */
export type ParseTableColumnModeOptions<T extends Record<string, string>> = {
  /** Parsing mode identifier. Must be 'column' for fixed-width column parsing. */
  mode?: 'column'
  /** Function to split the input string into lines. @default input => input.split('\n') */
  splitLines: (input: string) => string[]
  /** Zero-based index of the header line within the split lines array. @default 0 */
  headerPos: number
  /** Tuple `[start, end]` indicating the range of line indices to parse as body rows (inclusive start, exclusive end). Use `Infinity` as the end value to parse until the last line. @default [1, Infinity] */
  bodyBounds: [number, number]
  /** Array of starting character positions for each column. Each column extends from its start position to the start of the next column. The last column extends to the end of the line. @example [0, 10, 25] defines three columns: chars 0-9, 10-24, and 25-end */
  columns: number[]
  /** Function to clean or normalize header names extracted from the header line. Applied to each column header after slicing. @default header => header */
  headerCellRefine: (header: string) => string
  /** Function to clean or normalize cell values extracted from body rows. Applied to each cell value after slicing. @default value => value */
  bodyCellRefine: (value: string) => string
  /** Function to validate and transform each parsed row object. Return `undefined` to skip invalid rows. Skipped rows will not appear in the result and will not produce error messages. */
  schema: (obj: unknown) => T | undefined
}

/**
 * Union type of all supported parsing mode options.
 * 
 * @template T - The type of objects in the resulting array, extending `Record<string, string>`.
 */
export type ParseTableOptions<T extends Record<string, string>> = 
  | ParseTableLineModeOptions<T> 
  | ParseTableColumnModeOptions<T>

const defaultLineModeOptions: ParseTableLineModeOptions<any> = {
  mode: 'line',
  splitLines: i => i.split('\n'),
  headerPos: 0,
  splitHeaderCells: h => h.split('\t'),
  bodyBounds: [1, Infinity],
  splitBodyCells: i => i.split('\t'),
  schema: i => i
}

const defaultColumnModeOptions: ParseTableColumnModeOptions<any> = {
  mode: 'column',
  splitLines: i => i.split('\n'),
  headerPos: 0,
  bodyBounds: [1, Infinity],
  columns: [],
  headerCellRefine: h => h,
  bodyCellRefine: v => v,
  schema: i => i
}

/**
 * Parses a tabular string input into an array of typed objects.
 *
 * Supports two parsing modes:
 * 1. **Delimiter-based** (`mode: 'line'` or when `columns` is not provided): Splits rows and cells using delimiter functions
 * 2. **Fixed-width columns** (`mode: 'column'` or when `columns` is provided): Slices text at fixed character positions
 *
 * @template T - The type of objects in the resulting array, extending `Record<string, string>`.
 * @param {string} table - The string representation of the table to parse.
 * @param {Partial<ParseTableOptions<T>> & { schema: (obj: unknown) => T | undefined }} options - Configuration options.
 * @param {function(unknown): T | undefined} options.schema - **Required.** Validates and transforms each row. Return `undefined` to skip invalid rows.
 * @param {'line' | 'column'} [options.mode] - Parsing mode. If omitted, inferred from presence of `columns` property.
 * @param {function(string): string[]} [options.splitLines] - How to split input into lines.
 * @param {number} [options.headerPos=0] - Index of the header line.
 * @param {[number, number]} [options.bodyBounds=[1, Infinity]] - Range of lines to parse as body rows `[start, end)`.
 * 
 * **Delimiter-based mode options:**
 * @param {function(string): string[]} [options.splitHeaderCells] - How to split header line into column names.
 * @param {function(string): string[]} [options.splitBodyCells] - How to split body lines into cell values.
 * 
 * **Fixed-width column mode options:**
 * @param {number[]} [options.columns] - Starting positions for each column.
 * @param {function(string): string} [options.headerCellRefine] - Clean/normalize header names.
 * @param {function(string): string} [options.bodyCellRefine] - Clean/normalize cell values.
 *
 * @returns {Outcome.Either<T[], string>} 
 * - On success: `{ success: true, payload: T[] }` containing parsed rows.
 * - On failure: `{ success: false, payload: string }` containing error message.
 *
 * @example
 * // Delimiter-based parsing (TSV)
 * const tsvTable = 'name\tage\nAlice\t30\nBob\t25';
 * const result = parseTable(tsvTable, { schema: row => row });
 * // result.payload = [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]
 *
 * @example
 * // Fixed-width column parsing
 * const fixedTable = 'Name      Age\nAlice     30 \nBob       25 ';
 * const result = parseTable(fixedTable, {
 *   mode: 'column',
 *   columns: [0, 10],
 *   headerCellRefine: h => h.trim().toLowerCase(),
 *   bodyCellRefine: v => v.trim(),
 *   schema: row => row
 * });
 * // result.payload = [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]
 * 
 * @example
 * // With schema validation
 * type Person = { name: string; age: string };
 * const validatePerson = (obj: unknown): Person | undefined => {
 *   if (typeof obj !== 'object' || obj === null) return undefined;
 *   const { name, age } = obj as any;
 *   if (typeof name !== 'string' || typeof age !== 'string') return undefined;
 *   return { name, age };
 * };
 * const result = parseTable(tsvTable, { schema: validatePerson });
 */
export function parseTable<T extends Record<string, string>> (
  table: string,
  _options: Partial<ParseTableOptions<T>> & { schema: (obj: unknown) => T | undefined }
): Outcome.Either<T[], string> {
  // Determine mode: explicit mode, presence of 'columns', or presence of 'splitHeaderCells'
  const inferredMode: 'line' | 'column' = 
    'mode' in _options && _options.mode !== undefined
      ? _options.mode
      : 'columns' in _options
        ? 'column'
        : 'splitHeaderCells' in _options
          ? 'line'
          : 'line' // default to line mode
  const options: ParseTableOptions<T> = inferredMode === 'column'
    ? { ...defaultColumnModeOptions, ..._options, mode: 'column' }
    : { ...defaultLineModeOptions, ..._options, mode: 'line' }
  const lines = options.splitLines(table)
  const headLine = lines.at(options.headerPos)
  if (headLine === undefined) return Outcome.makeFailure(`Header line not found at position ${options.headerPos}`)
  
  // Delimiter-based mode (line mode)
  if (options.mode === 'line' && 'splitHeaderCells' in options) {
    const headers = options.splitHeaderCells(headLine)
    const [bodyStart, bodyEnd] = options.bodyBounds
    const bodyLines = lines.slice(bodyStart, bodyEnd)
    const bodyLinesSplit = bodyLines.map(options.splitBodyCells)
    const rows: T[] = []
    bodyLinesSplit.forEach(lineCells => {
      const row: Record<string, string> = {}
      const cellCount = Math.min(lineCells.length, headers.length)
      for (let cellPos = 0; cellPos < cellCount; cellPos++) {
        const cellName = headers[cellPos]
        const cellValue = lineCells[cellPos]
        if (cellName !== undefined
          && cellValue !== undefined) { row[cellName] = cellValue }
      }
      const validated = options.schema(row)
      if (validated !== undefined) rows.push(validated)
    })
    return Outcome.makeSuccess(rows)
  }
  
  // Fixed-width column mode
  if (options.mode === 'column' && 'columns' in options) {
    const { columns, headerCellRefine, bodyCellRefine } = options
    if (columns.length === 0) return Outcome.makeFailure('Column mode requires at least one column position')
    
    // Build column boundaries: [start, end) for each column
    const colBounds: Array<[number, number]> = columns.map((colStartPos, colIndex) => {
      const nextColStartPos = columns[colIndex + 1]
      return [colStartPos, nextColStartPos ?? Infinity]
    })
    
    // Extract and refine headers
    const headers = colBounds.map(([start, end]) => {
      const rawHeader = headLine.slice(start, end)
      return headerCellRefine(rawHeader)
    })
    
    // Parse body rows
    const [bodyStart, bodyEnd] = options.bodyBounds
    const bodyLines = lines.slice(bodyStart, bodyEnd)
    const rows: T[] = []
    bodyLines.forEach(line => {
      const row: Record<string, string> = {}
      colBounds.forEach(([start, end], colIndex) => {
        const header = headers[colIndex]
        if (header !== undefined) {
          const rawValue = line.slice(start, end)
          const refinedValue = bodyCellRefine(rawValue)
          row[header] = refinedValue
        }
      })
      const validated = options.schema(row)
      if (validated !== undefined) rows.push(validated)
    })
    
    return Outcome.makeSuccess(rows)
  }
  
  // This should never happen due to type constraints, but provides safety
  return Outcome.makeFailure('Invalid parsing mode configuration')
}
