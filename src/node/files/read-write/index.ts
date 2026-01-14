import { promises as fs } from 'node:fs'

type Path = Parameters<typeof fs.writeFile>[0]
type ReadFileData = Awaited<ReturnType<typeof fs.readFile>>
type WriteFileData = Parameters<typeof fs.writeFile>[1]

export type Options = {
  /** Additional parameters forwarded to the underlying `fs.readFile`. */
  readOptions?: Parameters<typeof fs.readFile>[1]
  /** Additional parameters forwarded to the underlying `fs.writeFile`. */
  writeOptions?: Parameters<typeof fs.writeFile>[2]
  /** Output path for the edited file. If not provided, the file is written back to the original `path`. */
  output?: Path
  /** If `true`, the file is not written to disk, only the edited content is returned. @default false */
  dryRun?: boolean
}

/** Function that takes the current file content and returns the edited content. */
export type EditorFunc<T extends WriteFileData = WriteFileData> = (curr: ReadFileData) => T

/** Object mapping strings to replace (keys) with their replacements (values). */
export type Replacements = Record<string, string>

/**
 * Reads a file, applies edits, and optionally writes it back.
 *
 * The function supports two editing modes:
 * - **Replacements mode**: Pass an object with string replacements.
 * - **Function mode**: Pass a function that transforms the file content.
 *
 * @param {Path} path                    - The path to the file to read and edit.
 * @param {Replacements} editor          - Object mapping strings to replace with their replacements.
 * @param {Options} [opts]               - Optional configuration.
 * @param {Parameters<typeof fs.readFile>[1]} [opts.readOptions]  - Extra `readFile` params.
 * @param {Parameters<typeof fs.writeFile>[2]} [opts.writeOptions] - Extra `writeFile` params.
 * @param {Path} [opts.output]           - Output path (defaults to `path`).
 * @param {boolean} [opts.dryRun=false]  - If `true`, skip writing to disk.
 * @returns {Promise<string>} The edited file content as a string.
 */
export async function readWrite(path: Path, editor: Replacements, opts?: Options): Promise<string>
/**
 * Reads a file, applies edits, and optionally writes it back.
 *
 * The function supports two editing modes:
 * - **Replacements mode**: Pass an object with string replacements.
 * - **Function mode**: Pass a function that transforms the file content.
 *
 * @param {Path} path                    - The path to the file to read and edit.
 * @param {EditorFunc<T>} editor         - Function that transforms the file content.
 * @param {Options} [opts]               - Optional configuration.
 * @param {Parameters<typeof fs.readFile>[1]} [opts.readOptions]  - Extra `readFile` params.
 * @param {Parameters<typeof fs.writeFile>[2]} [opts.writeOptions] - Extra `writeFile` params.
 * @param {Path} [opts.output]           - Output path (defaults to `path`).
 * @param {boolean} [opts.dryRun=false]  - If `true`, skip writing to disk.
 * @returns {Promise<T>} The edited file content of type `T`.
 */
export async function readWrite<T extends WriteFileData>(
  path: Path,
  editor: EditorFunc<T>,
  opts?: Options
): Promise<T>
export async function readWrite (
  path: Path,
  editor: EditorFunc | Replacements,
  opts: Options = {}
): Promise<WriteFileData> {
  const readData = await fs.readFile(path, opts.readOptions)
  const edited = typeof editor === 'function'
    ? editor(readData)
    : Object.entries(editor).reduce(
      (acc, [from, to]) => acc.replaceAll(from, to),
      readData.toString()
    )
  const actualWriteOptions = opts.writeOptions ?? opts.readOptions
  const targetOutput = opts.output === undefined ? path : opts.output
  if (opts.dryRun !== true) await fs.writeFile(targetOutput, edited, actualWriteOptions)
  return edited
}
